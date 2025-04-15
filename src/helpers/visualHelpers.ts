import Stats from "stats-gl";
import { Pane } from "tweakpane";

// for monitoring entire scene stats and current fps
export const stats = new Stats({
  trackGPU: true,
  trackHz: true,
  trackCPT: false,
  logsPerSecond: 4,
  graphsPerSecond: 30,
  samplesLog: 40,
  samplesGraph: 10,
  precision: 2,
  horizontal: true,
  minimal: false,
  mode: 2,
});

// append the stats container to the body of the document
document.body.appendChild(stats.dom);

// a gui for prototyping on the objects in the scene
export const pane = new Pane({ title: "⚙️ Settings" });
