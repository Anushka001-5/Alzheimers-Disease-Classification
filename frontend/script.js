const API_URL = "https://alzheimers-disease-classification.onrender.com/predict";

const SEVERITY_COLORS = {
  NonDemented: "#34D399",
  VeryMildDemented: "#2DD4BF",
  MildDemented: "#F5A623",
  ModerateDemented: "#F0563D",
};

const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");
const uploadPrompt = document.getElementById("uploadPrompt");
const preview = document.getElementById("preview");
const scanSweep = document.getElementById("scanSweep");
const predictBtn = document.getElementById("predictBtn");
const predictBtnLabel = document.getElementById("predictBtnLabel");
const resultEmpty = document.getElementById("resultEmpty");
const resultBox = document.getElementById("result");
const predictionDot = document.getElementById("predictionDot");
const predictionText = document.getElementById("predictionText");
const confidenceText = document.getElementById("confidenceText");
const probabilityBars = document.getElementById("probabilityBars");
const errorBox = document.getElementById("errorBox");
const historyStrip = document.getElementById("historyStrip");
const historyEmpty = document.getElementById("historyEmpty");

let selectedFile = null;
let sessionHistory = []; 


uploadBox.addEventListener("click", () => fileInput.click());
uploadBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragover");
});
uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragover"));
uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragover");
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showError("Please select an image file.");
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.hidden = false;
    uploadPrompt.hidden = true;
  };
  reader.readAsDataURL(file);
  predictBtn.disabled = false;
  hideError();
  resultBox.hidden = true;
  resultEmpty.hidden = false;
}


predictBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  predictBtn.disabled = true;
  predictBtnLabel.textContent = "Analyzing...";
  scanSweep.hidden = false;
  hideError();

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed (${response.status})`);
    }

    const data = await response.json();
    displayResult(data);
    addToHistory(preview.src, data);
  } catch (err) {
    showError(
      err.message.includes("Failed to fetch")
        ? "Could not reach the backend. Is the API_URL in script.js correct and is the server running?"
        : err.message
    );
  } finally {
    predictBtn.disabled = false;
    predictBtnLabel.textContent = "Analyze scan";
    scanSweep.hidden = true;
  }
});

function displayResult(data) {
  resultEmpty.hidden = true;
  resultBox.hidden = false;

  const color = SEVERITY_COLORS[data.prediction] || "#6C8EFF";

  predictionDot.style.background = color;
  predictionDot.style.color = color;
  predictionText.textContent = data.prediction;
  predictionText.style.color = color;
  confidenceText.textContent = `Confidence: ${data.confidence}%`;

  probabilityBars.innerHTML = "";
  const entries = Object.entries(data.all_probabilities || {}).sort((a, b) => b[1] - a[1]);
  for (const [label, value] of entries) {
    const barColor = SEVERITY_COLORS[label] || "#6C8EFF";
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span class="bar-label">${label}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${value}%; background:${barColor}"></span></span>
      <span class="bar-value" style="color:${barColor}">${value}%</span>
    `;
    probabilityBars.appendChild(row);
  }
}


function addToHistory(imageDataUrl, data) {
  sessionHistory.unshift({ imageDataUrl, prediction: data.prediction, confidence: data.confidence });
  renderHistory();
}

function renderHistory() {
  if (sessionHistory.length === 0) {
    historyStrip.innerHTML = '<p class="history-empty" id="historyEmpty">Analyzed scans from this session will appear here.</p>';
    return;
  }

  historyStrip.innerHTML = "";
  for (const entry of sessionHistory) {
    const color = SEVERITY_COLORS[entry.prediction] || "#6C8EFF";
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <img src="${entry.imageDataUrl}" alt="${entry.prediction} scan" />
      <div class="history-tag" style="background:${color}">${entry.prediction}</div>
    `;
    historyStrip.appendChild(item);
  }
}


function showError(msg) {
  errorBox.hidden = false;
  errorBox.textContent = msg;
}
function hideError() {
  errorBox.hidden = true;
}