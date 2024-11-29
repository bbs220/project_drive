import Stats from "stats.js";
import { GUI } from "lil-gui";

// for monitoring entire scene stats and current fps
export const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// a gui for prototyping on the objects in the scene
export const gui = new GUI({ title: "⚙️ Settings", width: 250 });
gui.close();
