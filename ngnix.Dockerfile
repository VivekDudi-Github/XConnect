FROM nginx:stable-alpine3.23

COPY ngnix.conf /etc/nginx/conf.d/default.conf
COPY ./Frontend/dist /usr/share/nginx/html
