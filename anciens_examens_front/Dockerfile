# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:1.27-alpine

# Copier le build React
COPY --from=builder /app/dist /usr/share/nginx/html
# OU si vous utilisez Create React App :
# COPY --from=builder /app/build /usr/share/nginx/html

# Copier la config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]