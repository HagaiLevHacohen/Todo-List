import { Priority } from './Priority.js';

class Todo {
    #id = crypto.randomUUID();
    #title = 'Untitled';
    #description = '';
    #dueDate = new Date(); // Today's date
    #priority = Priority.LOW;
    #completed = false;
    #projectId = '';


    constructor(title, description, dueDate, priority, projectId) {
        this.#title = title;
        this.#description = description;
        this.#dueDate = new Date(dueDate);
        this.#priority = priority;
        this.#projectId = projectId;
    }

    // Getter and Setter for id
    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value;
    }

    // Getter and Setter for title
    get title() {
        return this.#title;
    }

    set title(value) {
        if (typeof value !== 'string') throw new Error('Title must be a string.');
        this.#title = value;
    }

    // Getter and Setter for description
    get description() {
        return this.#description;
    }


    set description(value) {
        if (typeof value !== 'string') throw new Error('Description must be a string.');
        this.#description = value;
    }

    // Getter and Setter for dueDate
    get dueDate() {
        return this.#dueDate;
    }

    set dueDate(value) {
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error('Invalid date.');
        this.#dueDate = date;
    }

    // Getter and Setter for priority
    get priority() {
        return this.#priority;
    }

    set priority(value) {
        if (!Object.values(Priority).includes(value)) {
            throw new Error(`Priority must be one of: ${Object.values(Priority).join(', ')}`);
        }
        this.#priority = value;
    }

    // Getter and Setter for completed
    get completed() {
        return this.#completed;
    }

    set completed(value) {
        this.#completed = Boolean(value);
    }

    get projectId() {
        return this.#projectId;
    }

    set projectId(value) {
        this.#projectId = value;
    }

    toJSON() {
        return {
                id: this.id,
                title: this.title,
                description: this.description,
                dueDate: this.dueDate.toISOString(), // Serialize as ISO string
                priority: this.priority,
                completed: this.completed,
                projectId: this.projectId
            };
    }

    static fromJSON(obj) {
        const todo = new Todo(
            obj.title,
            obj.description,
            new Date(obj.dueDate),
            obj.priority,
            obj.projectId
        );
        todo.completed = obj.completed;
        todo.id = obj.id;
        return todo;
    }
}

export {Todo};