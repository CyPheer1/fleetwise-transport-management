@echo off
echo ============================================
echo FleetWise - Setup rapide du projet
echo Assistant Strategique de Transport
echo ============================================
echo.

echo 1. Configuration de la base de donnees MySQL...
echo IMPORTANT: Assurez-vous d'avoir MySQL installe et en cours d'execution
echo Creez une base de donnees nommee 'fleetwise_db'
echo.
pause

echo 2. Configuration du Backend Django...
cd backend

echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo Installation des dependances Python...
pip install -r requirements.txt

echo Creation des migrations...
python manage.py makemigrations

echo Application des migrations...
python manage.py migrate

echo Creation du superutilisateur...
python manage.py createsuperuser

echo.
echo Backend configure avec succes!
echo.

echo 3. Configuration du Frontend React...
cd ..\frontend

echo Installation des dependances Node.js...
npm install

echo.
echo Frontend configure avec succes!
echo.

echo ============================================
echo Installation terminee!
echo ============================================
echo.
echo Pour demarrer l'application:
echo.
echo Terminal 1 - Backend Django:
echo   cd backend
echo   venv\Scripts\activate
echo   python manage.py runserver
echo.
echo Terminal 2 - Frontend React:
echo   cd frontend  
echo   npm start
echo.
echo L'application sera accessible sur:
echo - Frontend: http://localhost:3000
echo - Admin: http://localhost:8000/admin
echo - API: http://localhost:8000/api
echo.
pause
