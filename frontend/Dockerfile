# Utiliser une image Node.js 20 (requis pour Angular 20)
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Exposer le port
EXPOSE 4200

# Commande de démarrage en mode développement
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
