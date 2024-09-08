import { allSounds } from "../utils/assetPaths";

const makeCanvas = document.createElement("canvas");
makeCanvas.id = "visualizer";
document.body.appendChild(makeCanvas);

const makeAudio = document.createElement("audio");
makeAudio.id = "mySong";
makeAudio.src = allSounds.lofi;
makeAudio.controls = true;
document.body.appendChild(makeAudio);

const audioContext = new window.AudioContext();
const audioElement = document.getElementById("mySong") as HTMLAudioElement;
const source = audioContext.createMediaElementSource(audioElement);
export const analyser = audioContext.createAnalyser();
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

export function drawVisualizer() {
  const canvas = document.getElementById("visualizer") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Visualizer canvas not found");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Failed to get 2D context from canvas");
    return;
  }

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw the background
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Calculate bar width
  const barWidth = Math.floor(canvasWidth / analyser.frequencyBinCount);

  // Draw each bar
  for (let i = 0; i < analyser.frequencyBinCount; i++) {
    const barHeight = dataArray[i];
    const x = i * barWidth;
    const y = canvasHeight - barHeight;

    ctx.beginPath();
    ctx.moveTo(x, canvasHeight);
    ctx.lineTo(x, y);
    ctx.strokeStyle = `hsl(${Math.floor(
      (i / analyser.frequencyBinCount) * 360
    )}, 100%, 50%)`;
    ctx.stroke();
  }

  analyser.getByteFrequencyData(dataArray);
}
