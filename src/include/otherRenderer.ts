import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

export function useCSS2DRenderer() {
  // css renderer
  const css2dRenderer = new CSS2DRenderer();
  css2dRenderer.setSize(window.innerWidth, window.innerHeight);
  css2dRenderer.domElement.style.position = "absolute";
  css2dRenderer.domElement.style.top = "0%";
  css2dRenderer.domElement.style.left = "0%";
  css2dRenderer.domElement.style.pointerEvents = "none";
  document.body.appendChild(css2dRenderer.domElement);
  return css2dRenderer;
}
