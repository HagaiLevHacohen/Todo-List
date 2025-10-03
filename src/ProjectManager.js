class ProjectManager {
    static #instance;
    #projectList = [];

    constructor() { // Singelton implementation
        if (ProjectManager.#instance) {
        return ProjectManager.#instance;
        }
        ProjectManager.#instance = this;
    }

    get projectList() {
        return this.#projectList;
    }

    addItem(project) {
        if (!project || typeof project.id !== 'string') {
            throw new Error('Invalid project');
        }
        this.#projectList.push(project);
    }
    deleteById(projectId) {
        const index = this.#projectList.findIndex(project => project.id === projectId);
        if (index === -1) {
            throw new Error(`Project with id "${projectId}" not found`);
        }
        this.#projectList.splice(index, 1)
    }
    getById(projectId) {
        const project = this.#projectList.find(project => project.id === projectId);
        if (project === undefined) {
            throw new Error(`Project with id "${projectId}" not found`);
        }
        return project;
    }
}

// Create a Singleton and export it
const projectManager = new ProjectManager();
export {projectManager};