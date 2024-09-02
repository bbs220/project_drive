// this file is just for creating container div and elements for css2d renderer
// seperate cause i dont wanna create big bundles

const xPara = document.createElement("p");
xPara.textContent = "X+";

const yPara = document.createElement("p");
yPara.textContent = "Y+";

const zPara = document.createElement("p");
zPara.textContent = "Z+";

const xDiv = document.createElement("div");
xDiv.className = "label";
xDiv.appendChild(xPara);

const yDiv = document.createElement("div");
yDiv.className = "label";
yDiv.appendChild(yPara);

const zDiv = document.createElement("div");
zDiv.className = "label";
zDiv.appendChild(zPara);

export { xDiv, yDiv, zDiv };
