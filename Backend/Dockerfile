FROM node:lts-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci
COPY . .
EXPOSE 3000

CMD ["npm", "start"]

