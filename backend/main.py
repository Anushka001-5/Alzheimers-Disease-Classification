"""
Alzheimer's MRI Detection - Backend API
FastAPI service that loads a PyTorch model and serves predictions on uploaded MRI images.
"""

import io
import os

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms


MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "model.pt")

CLASS_NAMES = [
    "NonDemented",
    "VeryMildDemented",
    "MildDemented",
    "ModerateDemented",
]

from PIL import ImageOps


def equalize_transform(img):
    return ImageOps.equalize(img)


IMAGE_SIZE = 224
transform = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.Grayscale(num_output_channels=3),
        transforms.Lambda(equalize_transform),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None


def build_resnet50_architecture():
    """
    Recreates a ResNet50 with a fine-tuned final layer for 4 classes.

    Standard transfer-learning pattern: torchvision ResNet50, final fc Linear
    layer swapped from 2048->1000 (ImageNet) to 2048->len(CLASS_NAMES).

    If your notebook customized the head differently (e.g. added dropout, extra
    Linear layers, or froze/unfroze different layers), edit this function to
    match exactly — the layer shapes must line up with your state_dict or
    load_state_dict will fail with a clear shape-mismatch error.
    """
    from torchvision.models import resnet50

    net = resnet50(weights=None)

    in_features = net.fc.in_features
    net.fc = nn.Linear(in_features, len(CLASS_NAMES))
    return net


def load_model():
    """
    Loads the model once at startup.

    Tries, in order:
      1. torch.load gives back a full nn.Module (torch.save(model, path)) -> use directly
      2. torch.load gives back a state_dict (torch.save(model.state_dict(), path)) ->
         rebuild ResNet50 architecture and load weights into it
    """
    global model

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. Place your .pt file there."
        )

    loaded = torch.load(MODEL_PATH, map_location=device, weights_only=False)

    if isinstance(loaded, nn.Module):
        model = loaded
    elif isinstance(loaded, dict):
        net = build_resnet50_architecture()

        state_dict = loaded.get("model_state_dict", loaded)
        net.load_state_dict(state_dict)
        model = net
    else:
        raise RuntimeError(f"Unrecognized checkpoint format: {type(loaded)}")

    model.to(device)
    model.eval()


app = FastAPI(title="Alzheimer's MRI Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    load_model()


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Alzheimer's detection API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)[0]
        confidence, predicted_idx = torch.max(probabilities, dim=0)

    return {
        "prediction": CLASS_NAMES[predicted_idx.item()],
        "confidence": round(confidence.item() * 100, 2),
        "all_probabilities": {
            CLASS_NAMES[i]: round(probabilities[i].item() * 100, 2)
            for i in range(len(CLASS_NAMES))
        },
    }