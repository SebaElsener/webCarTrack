FROM node:20-slim

# ─────────────────────────────────────
# Dependencias del sistema
# ─────────────────────────────────────
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    libreoffice-calc \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────────────
# App
# ─────────────────────────────────────
WORKDIR /app

# Node deps
COPY package*.json ./
RUN npm install

# Python deps
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Código
COPY . .

# ─────────────────────────────────────
# IMPORTANTE: el proceso principal es NODE
# ─────────────────────────────────────
EXPOSE 8080
CMD ["npm", "start"]
