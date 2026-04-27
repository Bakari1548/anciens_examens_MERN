# Étape 1: Build stage
FROM docker.io/node:22-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le dossier .env s'il n'existe pas
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Étape 2: Production stage
FROM docker.io/node:22-alpine AS production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les dépendances installées depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copier le code source depuis le builder
COPY --from=builder --chown=nodejs:nodejs /app .

# Changer le propriétaire des fichiers
RUN chown -R nodejs:nodejs /app

# Exposer le port
EXPOSE 5000

# Passer à l'utilisateur non-root
USER nodejs

# Commande de démarrage
CMD ["npm", "start"]
