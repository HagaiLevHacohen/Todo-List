import { Todo } from "./Todo";

class Project {
    #id = crypto.randomUUID();
    #title = 'Untitled';
    #todoList = [];
    
    constructor(title) {
        this.#title = title;
    }
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }
    
    get title() {
        return this.#title;
    }

    set title(value) {
        this.#title = value;
    }

    get todoList() {
        return this.#todoList;
    }

    set todoList(value) {
        this.#todoList = value;
    }

    addItem(todo) {
        if (!todo || typeof todo.id !== 'string') {
            throw new Error('Invalid todo');
        }
        this.#todoList.push(todo);
    }

    deleteById(todoId) {
        const index = this.#todoList.findIndex(todo => todo.id === todoId);
        if (index === -1) {
            throw new Error(`Todo with id "${todoId}" not found`);
        }
        this.#todoList.splice(index, 1)
    }

    getById(todoId) {
        const todo = this.#todoList.find(todo => todo.id === todoId);
        if (todo === undefined) {
            throw new Error(`Todo with id "${todoId}" not found`);
        }
        return todo;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            todoList: this.todoList.map(todo => todo.toJSON())
        };
    }

    static fromJSON(obj) {
        const project = new Project(obj.title);
        project.id = obj.id;
        project.todoList = obj.todoList.map(todoData => Todo.fromJSON(todoData));
        return project;
    }
}

export {Project};