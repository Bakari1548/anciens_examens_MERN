FROM nginx:1.27-alpine

# Copier la configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Supprimer la config par défaut pour éviter les conflits
RUN rm /etc/nginx/conf.d/default.conf 2>/dev/null || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]