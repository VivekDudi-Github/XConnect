
FROM nginx:stable-alpine3.23

# COPY ./nginx/nginx.dev.conf /etc/nginx/conf.d/default.conf

# COPY --from=builder /app/dist /usr/share/nginx/html