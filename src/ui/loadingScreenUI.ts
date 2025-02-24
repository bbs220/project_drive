import * as THREE from "three";

// creates a screen covering loading screen
const createLoadingScreen = document.createElement("div");
createLoadingScreen.id = "loadingScreen";
createLoadingScreen.style.cssText = `
	position: fixed;
	z-index: 10005; 
	top: 0px;
	left: 0px;
	width: 100vw;
	height: 100vh;
  display: grid;
  place-items: center;
	background-color: #404040;
	opacity: 1;
 	transition: 0.7s opacity ease-in;
  `;
document.body.appendChild(createLoadingScreen);

// adds a progress bar to the above loading screen
const createProgressBar = document.createElement("progress");
createProgressBar.id = "progressBar";
createProgressBar.value = 0;
createProgressBar.max = 100;
createLoadingScreen.appendChild(createProgressBar);

// creates a button to remove the loading screen
const createBtn = document.createElement("div");
createBtn.id = "enterBtn";
createBtn.style.cssText = `
  position: absolute;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 170px;
  height: 40px;
  top: 55%;
  color: white;
  background-color: black;
  font-family: monospace;
  font-size: 16px;
  border: 1px solid white;
  border-radius: 5px;
  opacity: 0;
  -webkit-transition: 1s opacity ease-out;
  -o-transition: 1s opacity ease-out;
  transition: 1s opacity ease-out;
`;
createBtn.textContent = "Enter the Scene";
createBtn.onmouseover = () => {
  createBtn.style.backgroundColor = "white";
  createBtn.style.color = "black";
};
createBtn.onmouseout = () => {
  createBtn.style.backgroundColor = "black";
  createBtn.style.color = "white";
};
createLoadingScreen.appendChild(createBtn);

// grabs the loading screen to remove it from dom when items are fully loaded
const grabLoadingScreen = document.getElementById(
  "loadingScreen"
) as HTMLDivElement;

// grabs the button for removing the loading screen
const grabBtn = document.getElementById("enterBtn") as HTMLDivElement;

// grabs progress bar to change its value according to the number and size of resources
const grabProgressBar = document.getElementById(
  "progressBar"
) as HTMLProgressElement;

// exporting a reusable loading manager for other projects
export const progressManager = new THREE.LoadingManager();
progressManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  grabProgressBar.value = (itemsLoaded / itemsTotal) * 100;

  console.log(
    `Loading file: ${url} \nLoaded ${itemsLoaded} of ${itemsTotal} files`
  );
  progressManager.onLoad = () => {
    grabBtn.style.opacity = "1";

    grabBtn.style.cursor = "pointer";

    grabBtn.addEventListener("click", () => {
      grabLoadingScreen.style.opacity = "0";
      setTimeout(() => {
        grabLoadingScreen.style.display = "none";
      }, 1200);
    });

    console.log("Loading complete!");
  };
  progressManager.onError = function (url) {
    console.log(`There was an error loading ${url}`);
  };
};
