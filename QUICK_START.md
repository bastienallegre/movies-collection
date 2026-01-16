# 🎬 Movies Collection - Guide de démarrage rapide

## 🚀 Lancement ultra-simplifié avec Docker

### Option 1 : Tout automatique (recommandé)

```bash
# 1. Initialiser le projet (créer le fichier .env)
./init.sh

# 2. Lancer tout le projet
docker-compose up --build
```

C'est tout ! 🎉

### Option 2 : Commandes manuelles

```bash
# 1. Créer le fichier .env
cp backend/.env.example backend/.env

# 2. Lancer avec Docker
docker-compose up --build
```

## 📌 URLs disponibles

Une fois le projet lancé, vous pouvez accéder à :

- **Frontend Angular** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Documentation API (Swagger)** : http://localhost:3000/api-docs
- **Mongo Express** (interface MongoDB) : http://localhost:8081

## 🛠️ Commandes utiles

### Arrêter le projet
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (base de données)
```bash
docker-compose down -v
```

### Voir les logs
```bash
docker-compose logs -f
```

### Voir les logs d'un service spécifique
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Reconstruire les images
```bash
docker-compose up --build
```

### Relancer la migration des données
```bash
docker-compose exec backend npm run migrate
```