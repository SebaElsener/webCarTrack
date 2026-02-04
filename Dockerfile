FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# ─────────────────────────────
# Sistema
# ─────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    python3-pip \
    libreoffice \
    libreoffice-calc \
    fonts-dejavu \
    fonts-crosextra-carlito \
    && rm -rf /var/lib/apt/lists/*

# ─────────────────────────────
# Virtualenv
# ─────────────────────────────
RUN python3 -m venv $VIRTUAL_ENV

# ─────────────────────────────
# App
# ─────────────────────────────
WORKDIR /app

# Node
COPY package*.json ./
RUN npm install

# Python deps (AHORA SÍ)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["node", "src/server.js"]
