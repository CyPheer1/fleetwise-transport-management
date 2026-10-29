#!/bin/bash

echo "============================================"
echo "FleetWise - Setup rapide du projet"
echo "Assistant Stratégique de Transport"
echo "============================================"
echo

echo "1. Configuration de la base de données MySQL..."
echo "IMPORTANT: Assurez-vous d'avoir MySQL installé et en cours d'exécution"
echo "Créez une base de données nommée 'fleetwise_db'"
echo
read -p "Appuyez sur Entrée pour continuer..."

echo "2. Configuration du Backend Django..."
cd backend

echo "Activation de l'environnement virtuel..."
source venv/bin/activate

echo "Installation des dépendances Python..."
pip install -r requirements.txt

echo "Création des migrations..."
python manage.py makemigrations

echo "Application des migrations..."
python manage.py migrate

echo "Création du superutilisateur..."
python manage.py createsuperuser

echo
echo "Backend configuré avec succès!"
echo

echo "3. Configuration du Frontend React..."
cd ../frontend

echo "Installation des dépendances Node.js..."
npm install

echo
echo "Frontend configuré avec succès!"
echo

echo "============================================"
echo "Installation terminée!"
echo "============================================"
echo
echo "Pour démarrer l'application:"
echo
echo "Terminal 1 - Backend Django:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo
echo "Terminal 2 - Frontend React:"
echo "  cd frontend"  
echo "  npm start"
echo
echo "L'application sera accessible sur:"
echo "- Frontend: http://localhost:3000"
echo "- Admin: http://localhost:8000/admin"
echo "- API: http://localhost:8000/api"
echo
