# Use NVIDIA CUDA base image with Ubuntu 22.04 (Runs Python 3.10)
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install Python 3.10
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Swap to headless OpenCV
RUN sed -i 's/opencv-python==/opencv-python-headless==/' requirements.txt

# Force pip to use Python 3.10
RUN python3.10 -m pip install --upgrade pip
RUN python3.10 -m pip install --no-cache-dir -r requirements.txt

RUN python3.10 -m pip install --no-deps retina-face==0.0.18
RUN python3.10 -m pip install gdown

COPY . .

EXPOSE 5001

# Run the app.py file directly
CMD ["python3.10", "app.py"]
