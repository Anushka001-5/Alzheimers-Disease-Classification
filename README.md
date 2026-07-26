# 🧠 Alzheimer's Disease Classification using CNN

A deep learning project that classifies Alzheimer's disease severity from MRI brain scans into 4 stages using a fine-tuned CNN model — built with TensorFlow and PyTorch.

> 🚧 **Deployment in Progress** — Web app coming soon!

---

## 📌 Overview

Taking inspiration from the research paper **"A Fine-Tuned CNN Model for Accurate Alzheimer's Disease Classification"**, this project addresses the accuracy, speed, and computational inefficiencies of the models proposed in the paper (AlexNet, GoogLeNet) by switching to **ResNet50** — a lightweight yet powerful architecture that achieves **96.25% validation accuracy** on a test set of ~1,300 MRI images while being significantly more efficient.

---

## ✨ Features

- 4-class Alzheimer's severity classification from MRI scans
- Inspired by a published research paper; improved on AlexNet/GoogLeNet by switching to MobileNetV3 for better accuracy, speed, and computational efficiency
- Trained on 6,400 MRI images across 4 classes
- 96.25% validation accuracy on ~1,300 test images
- Full deep learning pipeline — preprocessing, training, evaluation

---

## 🏷️ Classes

| Class | Description |
|-------|-------------|
| `NonDemented` | No signs of Alzheimer's |
| `VeryMildDemented` | Very early stage |
| `MildDemented` | Mild stage |
| `ModerateDemented` | Moderate stage |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python |
| Deep Learning | TensorFlow, PyTorch |
| Model | Fine-tuned CNN |
| Environment | Google Colab |
| Dataset | [Alzheimer's Dataset - Four Classes (Kaggle)](https://www.kaggle.com/datasets/drsaeedmohsen/alzheimer-dataset-four-classes-2025) |

---

## 🧠 How It Works

1. **Preprocessing** — MRI images are resized, normalized, and augmented for training
2. **Model Architecture** — Fine-tuned CNN based on published research paper
3. **Training** — Model trained on 6,400 MRI images across 4 classes
4. **Evaluation** — 96.25% validation accuracy achieved on ~1,300 test images
5. **Deployment** — Interactive web app for real-time predictions *(in progress)*

---

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| Validation Accuracy | 96.25% |
| Training Images | 6,400 |
| Test Images | ~1,300 |
| Number of Classes | 4 |

---

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/Anushka001-5/alzheimers-disease-classification.git
cd alzheimers-disease-classification
```

Then open `Alzheimers_model.ipynb` in Jupyter Notebook or upload it directly to [Google Colab](https://colab.research.google.com/).

Download the dataset from Kaggle:
```bash
kaggle datasets download -d drsaeedmohsen/alzheimer-dataset-four-classes-2025
```

---

## 📁 Project Structure

```
alzheimers-disease-classification/
├── Alzheimers_model.ipynb   # Model training and evaluation notebook
├── requirements.txt         # Dependencies
└── README.md
```

---

## 📄 Reference

This project is based on the research paper:
> *"A Fine-Tuned CNN Model for Accurate Alzheimer's Disease Classification"*

---

## 👩‍💻 Author

**Anushka Sharma**  
B.Tech AI & Data Engineering — IIIT Kota  
[LinkedIn](https://linkedin.com/in/anushka-sharma) • [GitHub](https://github.com/Anushka001-5)
