#!/bin/bash

# Script d'initialisation du projet Movies Collection
echo "Initialisation du projet Movies Collection..."

# Créer le fichier .env s'il n'existe pas
if [ ! -f backend/.env ]; then
    echo "Création du fichier .env..."
    cp backend/.env.example backend/.env
    echo "Fichier .env créé"
else
    echo "Le fichier .env existe déjà"
fi

echo ""
echo "Tout est prêt ! Vous pouvez maintenant lancer le projet avec :"
echo ""
echo "   docker-compose up --build"
echo ""
echo "URLs utiles :"
echo "   • Frontend Angular : http://localhost:4200"
echo "   • Backend API : http://localhost:3000"
echo "   • Documentation API : http://localhost:3000/api-docs"
echo "   • Mongo Express : http://localhost:8081"
echo ""
