# Build stage
FROM node:lts-alpine AS builder

WORKDIR /app

COPY ./Frontend/package*.json ./

RUN npm ci

COPY ./Frontend .

RUN npm run build

# Production stage
FROM nginx:stable-alpine3.23

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html