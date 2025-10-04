import { Priority } from './Priority.js';
import { format, isToday, isThisWeek } from 'date-fns';
import { Project } from './Project.js';
import { Todo } from './Todo.js';
import { loadFromLocalStorage, saveToLocalStorage } from './storage.js';


class Renderer {
    #projectManager;
    #projectListContainer;
    #tasksContainer;

    constructor(projectManager) {
        this.#projectManager = projectManager;
        this.#projectListContainer = document.querySelector('.projects ul');
        this.#tasksContainer = document.querySelector('.tasks');

        if (!this.#projectListContainer || !this.#tasksContainer) {
            throw new Error("Renderer: Missing essential DOM elements.");
        }
    }

    initialRendering(){
        const allTasksBtn = document.querySelector(".all-tasks");
        allTasksBtn.addEventListener('click', () => this.renderAllTasks());

        const todayBtn = document.querySelector(".today");
        todayBtn.addEventListener('click', () => this.renderToday());

        const weekBtn = document.querySelector(".this-week");
        weekBtn.addEventListener('click', () => this.renderThisWeek());

        const completedTasksBtn = document.querySelector(".completedTasks");
        completedTasksBtn.addEventListener('click', () => this.renderCompletedTasks());


        // Task Dialog
        const addTaskBtn = document.querySelector(".add-task");
        addTaskBtn.addEventListener('click', () => this.openNewTaskDialog());

        const dialog = document.querySelector('#task-dialog');
        dialog.addEventListener('close', () => this.handleCloseDialog());

        const formCancelBtn = document.querySelector("#cancel-form-button");
        formCancelBtn.addEventListener('click', () => this.handleCancelDialog(true));

        // Project Dialog
        const addProjectBtn = document.querySelector(".add-project");
        addProjectBtn.addEventListener('click', () => this.openNewProjectDialog());

        const Projectdialog = document.querySelector('#project-dialog');
        Projectdialog.addEventListener('close', () => this.handleProjectCloseDialog());

        const ProjectCancelBtn = document.querySelector("#cancel-project-button");
        ProjectCancelBtn.addEventListener('click', () => this.handleCancelDialog(false));

        loadFromLocalStorage();
        this.renderAllTasks();
        this.renderProjectList();

    }

    openNewProjectDialog() {
        // Open dialog
        const dialog = document.querySelector("#project-dialog");
        dialog.showModal();
    }

    openNewTaskDialog() {
        document.querySelector('#dialog-title').textContent = 'New Task';
        
        // Add dynamically the projects as options
        const projectSelect = document.querySelector("#project-select-form");

        // Keep the first option
        const defaultOption = projectSelect.querySelector('option[value=""]');

        // Clear all existing options *except* the default
        projectSelect.innerHTML = ''; // remove all
        projectSelect.appendChild(defaultOption); // re-add default manually

        // Add projects
        for (const project of this.#projectManager.projectList) {
            const projectOption = document.createElement('option');
            projectOption.value = project.id;
            projectOption.textContent = project.title;
            projectSelect.appendChild(projectOption);
        }

        // Open dialog
        const dialog = document.querySelector("#task-dialog");
        dialog.showModal();
    }

    handleProjectCloseDialog() { // for projects
        const dialog = document.querySelector('#project-dialog');
        const form = document.querySelector('#project-form');

        // Only act if user submitted the form (not canceled)
        if (dialog.returnValue === 'save') {
            const formData = new FormData(form);

            // Extract values
            const title = formData.get('title');

            const newProject = new Project(title);
            this.#projectManager.addItem(newProject);

            saveToLocalStorage();

            // Clear form for next use
            form.reset();
            dialog.returnValue = "";

            this.renderProjectList();
            this.renderAllTasks();
        }
    }



    handleCloseDialog() { // for tasks
        const dialog = document.querySelector('#task-dialog');
        const form = document.querySelector('#task-form');

        // Only act if user submitted the form (not canceled)
        if (dialog.returnValue === 'save') {
            const formData = new FormData(form);

            // Extract values
            const title = formData.get('title');
            const description = formData.get('description');
            const dueDate = formData.get('dueDate');
            const priority = formData.get('priority');
            const projectId = formData.get('projectId');

            const currentTaskId = formData.get('currentTaskId'); // might be empty string if it's a new task
            const currentProjectId = formData.get('currentProjectId'); // might be empty string if it's a new task


            if (currentTaskId) {
                // retrieve the todo to be edited
                const currentProject = this.#projectManager.getById(currentProjectId);
                const todo = currentProject.getById(currentTaskId);

                // Edit everything
                todo.title = title;
                todo.description = description;
                todo.dueDate = dueDate;
                if (priority === "low") {
                    todo.priority = Priority.LOW;
                }
                else if (priority === "medium") {
                    todo.priority = Priority.MEDIUM;
                }
                else {
                    todo.priority = Priority.HIGH;
                }

                if (projectId !== currentProjectId) {
                    currentProject.deleteById(currentTaskId);
                    const newProject = this.#projectManager.getById(projectId);
                    todo.projectId = projectId;
                    newProject.addItem(todo);
                }

            } else {
                const newTodo = new Todo(title, description, dueDate, priority, projectId);
                const project = this.#projectManager.getById(projectId);
                project.addItem(newTodo);

            }
            saveToLocalStorage();
        }
        // Clear form for next use
        form.reset();
        form.currentTaskId.value = '';
        form.currentProjectId.value = '';
        dialog.returnValue = "";

        this.renderAllTasks();
    }

    handleCancelDialog(isTaskDialog) {
        let dialog;
        if (isTaskDialog) {
            dialog = document.querySelector('#task-dialog');
        }
        else {
            dialog = document.querySelector('#project-dialog');
        }
        dialog.close();
    }

    renderAllTasks() {
        this.#tasksContainer.innerHTML = '';
        for (const project of this.#projectManager.projectList) {
            for (const todo of project.todoList) {
                const item = this.createTaskItem(todo);
                this.#tasksContainer.appendChild(item);
            }
        }

        const projectHeader = document.querySelector(".main-content > h2");
        projectHeader.textContent = "All Tasks";
    }

    renderToday() {
        this.#tasksContainer.innerHTML = '';
        for (const project of this.#projectManager.projectList) {
            for (const todo of project.todoList) {
                if (isToday(todo.dueDate)) {
                    const item = this.createTaskItem(todo);
                    this.#tasksContainer.appendChild(item);
                }
            }
        }

        const projectHeader = document.querySelector(".main-content > h2");
        projectHeader.textContent = "Today";
    }

    renderThisWeek() {
        this.#tasksContainer.innerHTML = '';
        for (const project of this.#projectManager.projectList) {
            for (const todo of project.todoList) {
                if (isThisWeek(todo.dueDate)) {
                    const item = this.createTaskItem(todo);
                    this.#tasksContainer.appendChild(item);
                }
            }
        }

        const projectHeader = document.querySelector(".main-content > h2");
        projectHeader.textContent = "This Week";
    }

    renderCompletedTasks() {
        this.#tasksContainer.innerHTML = '';
        for (const project of this.#projectManager.projectList) {
            for (const todo of project.todoList) {
                if (todo.completed) {
                    const item = this.createTaskItem(todo);
                    this.#tasksContainer.appendChild(item);
                }
            }
        }

        const projectHeader = document.querySelector(".main-content > h2");
        projectHeader.textContent = "Completed Tasks";
    }

    renderProjectList() {
        this.#projectListContainer.innerHTML = '';
        for (const project of this.#projectManager.projectList) {
            const item = this.createProjectItem(project);
            this.#projectListContainer.appendChild(item);
        }
    }

    createProjectItem(project) {
        const item = document.createElement('li');
        item.classList.add("project-item");

        const projectBtn = document.createElement('button');
        projectBtn.setAttribute("type", "button"); 
        projectBtn.classList.add("project-btn");
        projectBtn.textContent = project.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute("type", "button"); 
        deleteBtn.classList.add("delete-project-btn");
        deleteBtn.textContent = "X";

        // Event listeners
        projectBtn.addEventListener('click', () => {
            this.handleProjectClick(project.id);
        });

        deleteBtn.addEventListener('click', () => {
            this.handleDelete(project.id);
        });

        item.appendChild(projectBtn);
        item.appendChild(deleteBtn);
        return item;
    }

    handleDelete(projectId) {
        this.#projectManager.deleteById(projectId);
        this.renderProjectList(); // re-render list
        this.renderAllTasks();
        saveToLocalStorage();
    }

    handleProjectClick(projectId) {
        // Render the tasks for that project
        this.renderTodoList(projectId);
    }

    renderTodoList(projectId){
        this.#tasksContainer.innerHTML = '';
        const project = this.#projectManager.getById(projectId);
        for (const todo of project.todoList) {
            const item = this.createTaskItem(todo);
            this.#tasksContainer.appendChild(item);
        }

        const projectHeader = document.querySelector(".main-content > h2");
        projectHeader.textContent = project.title;        
    }

    createTaskItem(todo){
        // Main task container
        const taskContainer = document.createElement('div');
        taskContainer.classList.add('task');
        taskContainer.classList.add('collapsed');
        taskContainer.addEventListener('click', (e) => this.handleExpansion(e));

        // Checkbox
        const checkboxElem = document.createElement('input');
        checkboxElem.setAttribute('type', 'checkbox');
        checkboxElem.addEventListener('click', (e) => e.stopPropagation()); // 🔥 Stop the click from bubbling
        checkboxElem.addEventListener('change', (e) => this.handleCheckbox(e, todo));
        if (todo.completed) {
            checkboxElem.checked = true;
        }

        // Priority
        const priorityElem = document.createElement('div');
        priorityElem.classList.add('task-priority');
        if (todo.priority === Priority.HIGH) {
            priorityElem.classList.add('priority-high');
        } else if (todo.priority === Priority.MEDIUM) {
            priorityElem.classList.add('priority-medium');
        } else {
            priorityElem.classList.add('priority-low');
        }
        
        // Heading
        const headingContainer = document.createElement('div');
        headingContainer.classList.add('heading');

        const title = document.createElement('h3');
        title.classList.add('task-title');
        title.textContent = todo.title;

        const date = document.createElement('div');
        date.classList.add('task-date');
        date.textContent = `[${format(todo.dueDate, 'MMM d, yyyy')}]`;

        if (todo.completed) {
            title.classList.add('completed');
            date.classList.add('completed');
        }

        headingContainer.appendChild(title);
        headingContainer.appendChild(date);
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.classList.add('task-edit'); 
        editBtn.setAttribute("type", "button");
        editBtn.innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>square-edit-outline</title><path d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z" /></svg>`;
        editBtn.addEventListener('click', (event) => {
            this.handleEditTask(event, todo.projectId, todo.id);
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('task-delete'); 
        deleteBtn.setAttribute("type", "button");
        deleteBtn.innerHTML = `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>trash-can-outline</title><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>`;
        deleteBtn.addEventListener('click', (event) => {
            this.handleDeleteTask(event, todo.projectId, todo.id);
        });

        // Description
        const descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('description-div');

        const paragraphElem = document.createElement('p');
        paragraphElem.classList.add('task-description');
        paragraphElem.classList.add('collapsed');
        paragraphElem.textContent = todo.description;
        if (todo.completed) {
            paragraphElem.classList.add('completed');
        }

        descriptionContainer.appendChild(paragraphElem);


        // Adding all children
        taskContainer.appendChild(checkboxElem);
        taskContainer.appendChild(priorityElem);
        taskContainer.appendChild(headingContainer);
        taskContainer.appendChild(editBtn);
        taskContainer.appendChild(deleteBtn);
        taskContainer.appendChild(descriptionContainer);

        return taskContainer;
    }

    handleExpansion(event){
        const taskContainer = event.currentTarget;
        taskContainer.classList.toggle('collapsed');
        taskContainer.classList.toggle('expanded');

        const description = taskContainer.querySelector('.task-description');
        description.classList.toggle('collapsed');
        description.classList.toggle('expanded');
    }

    handleDeleteTask(event, projectId, todoId) {
        event.stopPropagation();
        const project = this.#projectManager.getById(projectId);
        project.deleteById(todoId);
        this.renderAllTasks();
        saveToLocalStorage();
    }

    handleEditTask(event, projectId, todoId) {
        event.stopPropagation();
        // Add dynamically the projects as options
        const projectSelect = document.querySelector("#project-select-form");

        // Keep the first option
        const defaultOption = projectSelect.querySelector('option[value=""]');

        // Clear all existing options *except* the default
        projectSelect.innerHTML = ''; // remove all
        projectSelect.appendChild(defaultOption); // re-add default manually

        // Add projects
        for (const project of this.#projectManager.projectList) {
            const projectOption = document.createElement('option');
            projectOption.value = project.id;
            projectOption.textContent = project.title;
            projectSelect.appendChild(projectOption);
        }

        // Getting todo
        const project = this.#projectManager.getById(projectId);
        const todo = project.getById(todoId);

        // Getting form
        const form = document.querySelector("#task-form");
        
        // Populating fields
        const titleInput = form.querySelector('input[name="title"]');
        titleInput.value = todo.title;

        const descriptionInput = form.querySelector('textarea[name="description"]');
        descriptionInput.value = todo.description;

        const dueDateInput = form.querySelector('input[name="dueDate"]');
        dueDateInput.value = format(todo.dueDate, 'yyyy-MM-dd');

        const prioritySelect = form.querySelector('select[name="priority"]');
        if (todo.priority === Priority.LOW) {
            prioritySelect.value = 'low';
        }
        else if (todo.priority === Priority.MEDIUM) {
            prioritySelect.value = 'medium';
        }
        else {
            prioritySelect.value = 'high';
        }

        projectSelect.value = projectId;

        const currentTaskIdInput = form.querySelector('input[name="currentTaskId"]');
        currentTaskIdInput.value = todoId;

        const currentProjectIdInput = form.querySelector('input[name="currentProjectId"]');
        currentProjectIdInput.value = projectId;

        document.querySelector('#dialog-title').textContent = 'Edit Task';

        // Open dialog
        const dialog = document.querySelector("#task-dialog");
        dialog.showModal();
    }

    handleCheckbox(event, todo) {
        event.stopPropagation();
        const checkbox = event.target;
        const taskElem = checkbox.closest('.task'); // find the .task container
        const titleElem = taskElem.querySelector('.task-title'); // searches within taskElem descendants.
        const dateElem = taskElem.querySelector('.task-date');
        const descriptionElem = taskElem.querySelector('.task-description')

        if (checkbox.checked) {
            titleElem.classList.add('completed');
            dateElem.classList.add('completed');
            descriptionElem.classList.add('completed');
            todo.completed = true;
            
        } else {
            titleElem.classList.remove('completed');
            dateElem.classList.remove('completed');
            descriptionElem.classList.remove('completed');
            todo.completed = false;
        }

        saveToLocalStorage();
    }
}

export {Renderer};