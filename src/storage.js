import { Project } from "./Project";
import { projectManager } from "./ProjectManager";

function saveToLocalStorage() {
    const data = projectManager.projectList.map(project => project.toJSON());
    localStorage.setItem('projectData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const rawData = localStorage.getItem('projectData');
    if (!rawData) return;
    const parsed = JSON.parse(rawData);
    parsed.forEach(projectData => {
        const project = Project.fromJSON(projectData);
        projectManager.addItem(project);
    });
}

export { saveToLocalStorage, loadFromLocalStorage };