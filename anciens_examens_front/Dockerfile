# Étape 1: Build stage
FROM node:22-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Définir la variable d'environnement pour l'API
ENV VITE_API_URL=/api

# Construire l'application
RUN npm run build

# Étape 2: Production stage avec Nginx
FROM docker.io/nginx:alpine AS production

# Copier les fichiers de build depuis le builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
