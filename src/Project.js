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
    get title() {
        return this.#title;
    }
    get todoList() {
        return this.#todoList;
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
}

export {Project};