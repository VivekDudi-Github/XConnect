FROM node:22-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    make \
    g++ \
    nano \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
ENV NODE_ENV=PRODUCTION
RUN npm ci
COPY . .
EXPOSE 3000

CMD ["npm", "start"]
