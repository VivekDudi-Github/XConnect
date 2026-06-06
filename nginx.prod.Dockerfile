# Build stage
FROM node:lts-alpine AS builder

WORKDIR /app

COPY ./Frontend/package*.json ./

RUN npm ci
COPY ./Frontend .

ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_PRODUCTION_URL
ARG VITE_DEVELOPMENT_URL

ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_PRODUCTION_URL=$VITE_PRODUCTION_URL
ENV VITE_DEVELOPMENT_URL=$VITE_DEVELOPMENT_URL

ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM nginx:stable-alpine3.23

COPY ./nginx/nginx.prod.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html