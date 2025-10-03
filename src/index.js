import "./styles.css";
import { Renderer } from "./Renderer";
import {projectManager} from "./ProjectManager";

const renderer = new Renderer(projectManager);
renderer.initialRendering();