FROM nginx:1.27-alpine

# Supprimer la config par défaut du système
RUN rm -f /etc/nginx/conf.d/default.conf

# Copier la configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
