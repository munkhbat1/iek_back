FROM nginx:1.21
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./public-certificate.pem /etc/nginx/ssl/public-certificate.pem
COPY ./private-key.pem /etc/nginx/ssl/private-key.pem

EXPOSE 80
EXPOSE 443