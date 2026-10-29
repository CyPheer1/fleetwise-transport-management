Voici la version la plus détaillée possible, reprenant la structure et la profondeur du document initial que vous avez fourni, mais entièrement adaptée à la pile technologique **Django/MySQL/React** et avec une interface **exclusivement en français**.

Ce document est le plan directeur final.

---

### **Document de Spécifications Techniques Détaillées**
## **Assistant Stratégique de Gestion des Tâches de Transport (FleetWise)**

**Version du Document :** 1.2  
**Date :** aout 2025  
**Langue de la Plateforme :** Français (exclusivement)


transport_project/
├── venv/                 # البيئة الافتراضية للـ Backend
├── FleetWise/              # مجلد إعدادات Django
├── fleetWiseApp/                  # مجلد تطبيق Django API
├── frontend/             # مجلد تطبيق React بالكامل
│   ├── node_modules/
│   ├── public/
│   └── src/
└── manage.py             # ملف إدارة Django

---

## **1. APERÇU DU PROJET**

### **1.1 Objectif du Système**
L'Assistant Stratégique est une application web complète conçue pour automatiser et optimiser le processus de calcul des coûts de transport, la planification d'itinéraires et l'assignation des tâches aux chauffeurs. L'objectif est de remplacer les estimations manuelles par des décisions précises, basées sur des données, afin d'augmenter la rentabilité et l'efficacité opérationnelle.

### **1.2 Architecture Technique Spécifique**
*   **Backend :** Framework Django (Python), servant une API REST.
*   **Frontend :** Application "Single Page Application" (SPA) développée avec React.
*   **Base de Données :** MySQL (Version 8.0+ recommandée).
*   **Communication :** Django REST Framework pour créer les ponts (endpoints) entre le backend et le frontend.
*   **Services Externes :** API OpenRouteService pour les calculs géographiques.
*   **Notifications :** Système d'envoi d'email via SMTP, géré par Django.

---

## **2. SPÉCIFICATION DE LA BASE DE DONNÉES (MySQL)**

### **2.1 Table : `camion`**

**Objectif :** Gérer l'inventaire des véhicules de la flotte.

| Nom du Champ | Type MySQL | Contraintes | Description |
|--------------|------------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant numérique unique. |
| `nom` | VARCHAR(100) | NOT NULL, UNIQUE | Nom ou identifiant du camion (ex: "Volvo FH"). |
| `consommation`| DECIMAL(5,2) | NOT NULL, UNSIGNED | Consommation en litres pour 100km (ex: 35.50). |

---

### **2.2 Table : `chauffeur`**

**Objectif :** Gérer la liste des chauffeurs et leurs informations de contact.

| Nom du Champ | Type MySQL | Contraintes | Description |
|--------------|------------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant numérique unique. |
| `nom` | VARCHAR(100) | NOT NULL | Nom complet du chauffeur. |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email utilisé pour l'envoi des missions. |

---

### **2.3 Table : `trajet_peage`**

**Objectif :** Servir de base de connaissance interne pour les tarifs de péage.

| Nom du Champ | Type MySQL | Contraintes | Description |
|--------------|------------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant numérique unique. |
| `ville_depart` | VARCHAR(100) | NOT NULL | Ville de départ du tronçon. |
| `ville_arrivee`| VARCHAR(100) | NOT NULL | Ville d'arrivée du tronçon. |
| `prix` | DECIMAL(10,2) | NOT NULL, UNSIGNED | Prix du péage en Dirhams (MAD). |

---

### **2.4 Table : `parametres_generaux`**

**Objectif :** Centraliser les variables économiques de l'application.
**Contrainte Critique :** Cette table doit être implémentée de manière à ne contenir qu'**une seule et unique ligne**.

| Nom du Champ | Type MySQL | Contraintes | Description |
|--------------|------------|-------------|-------------|
| `id` | INT | PRIMARY KEY, DEFAULT 1 | Identifiant fixe pour garantir une ligne unique. |
| `prix_carburant` | DECIMAL(6,2) | NOT NULL, UNSIGNED | Prix actuel d'un litre de carburant. |
| `tarif_horaire_chauffeur`| DECIMAL(6,2) | NOT NULL, UNSIGNED | Coût horaire d'un chauffeur. |
| `marge_benefice_par_defaut`| DECIMAL(4,3) | NOT NULL, UNSIGNED | Marge de bénéfice par défaut (ex: 0.20 pour 20%). |

---

## **3. SPÉCIFICATIONS FONCTIONNELLES - BACKEND (DJANGO & DRF)**

### **3.1 API REST : Endpoints**

Le backend Django exposera une API REST. La sécurité (authentification) sera requise pour tous les endpoints sauf éventuellement pour une consultation de base.

#### **Endpoint 1 : `/api/calculer-itineraire/`**
*   **Rôle :** Le cœur du calculateur.
*   **Méthode :** `POST`
*   **Requête (Corps JSON) :** `{ "ville_depart": "String", "ville_arrivee": "String", "camion_id": "Integer" }`
*   **Réponse (Succès - 200 OK) :** `[ { route_1_details }, { route_2_details }, ... ]`
*   **Réponse (Erreur - 400 Bad Request) :** `{ "erreur": "Message d'erreur détaillé" }`

#### **Endpoint 2 : `/api/envoyer-mission/`**
*   **Rôle :** Déclencher l'envoi de l'email de mission.
*   **Méthode :** `POST`
*   **Requête (Corps JSON) :** `{ "chauffeur_id": "Integer", "details_route": { ... }, "notes": "String" }`
*   **Réponse (Succès - 200 OK) :** `{ "message": "Mission envoyée avec succès." }`
*   **Réponse (Erreur - 500 Server Error) :** `{ "erreur": "Échec de l'envoi de l'email." }`

#### **Endpoint 3 : `/api/parametres/`**
*   **Rôle :** Gérer la ligne unique des paramètres.
*   **Méthode GET :** Récupérer l'objet des paramètres.
*   **Méthode PUT/PATCH :** Mettre à jour l'objet des paramètres.

#### **Endpoint 4 : Endpoints CRUD Standards**
Des endpoints RESTful classiques seront créés pour la gestion des trois autres tables :
*   `/api/camions/` (GET, POST) et `/api/camions/<int:pk>/` (GET, PUT, DELETE)
*   `/api/chauffeurs/` (GET, POST) et `/api/chauffeurs/<int:pk>/` (GET, PUT, DELETE)
*   `/api/peages/` (GET, POST) et `/api/peages/<int:pk>/` (GET, PUT, DELETE)

### **3.2 Logique Métier Détaillée**

#### **3.2.1 Fonction : `CalculateurDeCout`**
Cette fonction sera le service appelé par l'endpoint `/api/calculer-itineraire/`.
1.  **Validation des Entrées :** Vérifier que les villes ne sont pas vides et que le `camion_id` est valide.
2.  **Appel à OpenRouteService :**
    *   **Profil :** `driving-hgv` (essentiel pour les calculs poids lourds).
    *   **Paramètres :** Demander explicitement les `alternative_routes`.
    *   **Gestion d'Erreur :** Gérer les cas où l'API ne répond pas ou ne trouve pas les villes.
3.  3.  **Analyse de Chaque Itinéraire :**
    *   **Coût Carburant :** Le calcul doit être précis, en utilisant les données de `consommation` du camion et `prix_carburant` des paramètres.
    *   **Coût Chauffeur :** La durée retournée par l'API (en secondes) doit être convertie en heures décimales pour le calcul.
    *   **Coût Péage (Toll Cost) - Detailed Logic:** The calculation of the toll cost must be dynamic and intelligent. The process for each analyzed route is as follows:
        1.  **Detection:** The backend must first inspect the `segments` list provided by the OpenRouteService API response for that specific route. It needs to check if the `way_type` for any significant portion of the route is classified as `'motorway'`.
        2.  **Decision:**
            *   **If `'motorway'` segments are detected:** The system must then proceed to query our internal `trajet_peage` database table. The query should look for a record where `ville_depart` and `ville_arrivee` match the overall trip's start and end cities. This search must be **case-insensitive** to avoid mismatches (e.g., 'Casablanca' should match 'casablanca'). If a matching record is found, its `prix` is added to the total cost.
            *   **If no `'motorway'` segments are detected:** The toll cost for this route is automatically and definitively set to **zero (0)**. The system should not query the database in this case.
        3.  **Handling Multi-Segment Trips:** For longer trips (e.g., Casablanca to Tangier), the system should first look for a direct entry. If not found, it should be capable of identifying major intermediate cities in the route summary and summing the costs of smaller, known segments (e.g., Casablanca-Rabat + Rabat-Tangier). *[Developer's Note: Initial implementation can focus on direct routes, with multi-segment logic as a potential enhancement.]*
    *   **Calcul du Bénéfice :** `Prix_Client - Cout_Total` pour un affichage clair à l'utilisateur.
4.  4.  **Logique de Recommandation :**
    *   Définir un score pour chaque route, par exemple : `Score = (Coût * Poids_Coût) + (Durée * Poids_Durée)`.
    *   **Initial Weights:** For the first implementation, the weights should be hard-coded to prioritize cost slightly over duration. Use the following values: `Poids_Coût = 0.6` and `Poids_Durée = 0.4`.
    *   L'itinéraire avec le score le plus bas sera marqué comme "recommandé".
5.  **Formatage de la Sortie :** Les données doivent être formatées (arrondis, unités) avant d'être envoyées au frontend.

#### **3.2.2 Fonction : `EnvoyeurEmailChauffeur`**
1.  **Validation :** Vérifier que le `chauffeur_id` existe et que son email est valide.
2.  **Composition du Contenu :**
    *   Le contenu de l'email doit être entièrement en **français**.
    *   La date et l'heure de l'assignation doivent être incluses.
    *   Le lien Google Maps doit être généré dynamiquement et correctement encodé.
3.  **Utilisation des Templates Django :** Utiliser le système de templating de Django pour créer un email HTML propre et un fallback en texte simple.
4.  **Gestion des Erreurs SMTP :** La fonction doit pouvoir gérer les échecs de connexion au serveur SMTP et retourner une erreur significative à l'API.

---

## **4. SPÉCIFICATIONS DE L'INTERFACE UTILISATEUR - FRONTEND (REACT)**

### **4.1 Structure des Composants**

```
/src
|-- /components
|   |-- /dashboard
|   |   |-- FormulaireRecherche.js
|   |   |-- AffichageResultats.js
|   |   |-- CarteItineraire.js
|   |   |-- ModalAssignation.js
|   |-- /admin
|   |   |-- GestionParametres.js
|   |   |-- GestionTableau.js (Composant réutilisable pour Camions, Chauffeurs, Péages)
|-- /pages
|   |-- DashboardPage.js
|   |-- AdminPage.js
|-- /services
|   |-- api.js (Module pour la communication avec l'API Django)
|-- App.js
|-- index.js
```

### **4.2 Gestion de l'État (State Management)**
*   L'état de l'application (données des formulaires, résultats des calculs, état de chargement) sera géré localement dans les composants React (ex: `useState`, `useEffect`). Pour une application de cette taille, une librairie externe comme Redux n'est pas nécessaire initialement.

### **4.3 Description Détaillée des Composants**

#### **4.3.1 `FormulaireRecherche.js`**
*   **État local :** `villeDepart`, `villeArrivee`, `camionId`, `camionsList`, `isLoading`, `erreur`.
*   **Au chargement (`useEffect`) :** Fait un appel GET à `/api/camions/` pour peupler la liste déroulante.
*   **Soumission :** Appelle une fonction du service `api.js` qui envoie la requête POST à `/api/calculer-itineraire/`. Gère les états `isLoading` et `erreur`.

#### **4.3.2 `CarteItineraire.js`**
*   **Props :** Reçoit un objet `itineraire` complet.
*   **Affichage :** Doit afficher toutes les données formatées :
    *   Coûts et prix avec le symbole de la devise (MAD).
    *   Durée dans un format lisible (ex: "2h 45min").
    *   Distance en "km".
    *   Bénéfice clairement indiqué.
    *   Un badge visuel pour l'itinéraire recommandé.
*   **Action :** Le clic sur le bouton "Assigner" passe l'objet `itineraire` au composant parent pour ouvrir la modale.

#### **4.3.3 `ModalAssignation.js`**
*   **État local :** `chauffeurId`, `chauffeursList`, `notes`.
*   **Au chargement (`useEffect`) :** Fait un appel GET à `/api/chauffeurs/`.
*   **Action :** Le bouton "Confirmer" appelle la fonction d'envoi de mission dans `api.js` avec toutes les données requises.

#### **4.3.4 `GestionTableau.js`**
*   **Props :** `endpoint`, `colonnes`.
*   **Logique :** Un composant générique qui prend en entrée le nom de l'endpoint API et la configuration des colonnes. Il gère l'affichage, l'ajout, la modification et la suppression pour n'importe quelle ressource (Camion, Chauffeur, Péage).




## **5. External API Integration: OpenRouteService**

MY API KEY TO USE IN PROJECT :eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjRlZmVkMDBkM2M1MzRmNjNiNDI4NWUyMDMwOGQ5OGY5IiwiaCI6Im11cm11cjY0In0=

### **5.1 Role and Purpose**

The OpenRouteService (ORS) API is the geographic brain of the "FleetWise" application. It is the sole external dependency for all route and distance calculations. Its integration is critical and must be implemented with precision. The API serves two distinct and sequential functions:

1.  **Geocoding:** Converting user-provided city names (e.g., "Casablanca") into geographic coordinates (longitude, latitude) that the routing engine can understand.
2.  **Directions:** Taking two sets of coordinates and calculating detailed route options between them, optimized for heavy vehicles.

### **5.2 API Key Management**

An API key is required to use the ORS API. This key must be obtained from the official OpenRouteService developer dashboard. For security, the key **must not be hard-coded** into the application's source code. It should be stored securely as an environment variable or within Django's `settings.py` file.

### **5.3 Implementation Workflow**

The backend logic must follow a strict two-step process for every calculation request:

**Step 1: Geocoding Request**
Before any route can be calculated, the system must make two separate calls to the ORS Geocoding endpoint (`/geocode/search`): one for the `ville_depart` and one for the `ville_arrivee`. The purpose is to retrieve the `[longitude, latitude]` coordinates for each city name.

**Step 2: Directions Request**
Once both sets of coordinates have been successfully retrieved, a single, more complex request must be sent to the ORS Directions endpoint.

### **5.4 Critical Directions API Parameters**

To ensure the application provides accurate and relevant data for a logistics company, the Directions API request **must** be configured with the following mandatory parameters:

*   **Profile:** The request must be sent to the `/v2/directions/driving-hgv` endpoint. The use of the **`driving-hgv`** (Heavy Goods Vehicle) profile is **non-negotiable**. This profile accounts for truck-specific road restrictions, weight limits, and speed profiles, making it essential for the accuracy of our calculations. Using any other profile (e.g., `driving-car`) will lead to incorrect and unusable results.

*   **Alternative Routes:** The request body must include the `alternative_routes` parameter to ask the API to return multiple route options. This is fundamental to our application's feature of presenting the user with different choices (e.g., cheapest, fastest).

*   **Extra Information:** The request must include the `extra_info` parameter and specify `tollways`. This provides metadata on which segments of a route are motorways, which is the trigger for our internal backend logic to query the `TrajetPeage` table and apply the correct toll costs.

### **5.5 Response Data Handling**

The Directions API will return a JSON object containing a list of route objects. The backend code is responsible for parsing this response and extracting the following key data points for **each** route:

*   **`distance`:** The API provides this value in **meters**. It must be converted to **kilometers** (divide by 1000) before being used in any calculations or displayed to the user.
*   **`duration`:** The API provides this value in **seconds**. It must be converted to decimal **hours** (divide by 3600) for our driver cost calculations.
*   **Segments & Road Types:** The backend must analyze the segments of each route to detect the presence of `motorway` way types. This detection is the key that links the external API data to our internal toll cost database.

---

## **5. EXIGENCES NON-FONCTIONNELLES**

### **5.1 Performance**
*   Le calcul de l'itinéraire et l'affichage des résultats ne doivent pas dépasser 10 secondes.
*   Le chargement initial de l'application React doit être optimisé.

### **5.2 Sécurité**
*   La communication entre le frontend et le backend doit se faire via HTTPS.
*   Le backend Django doit être protégé contre les attaques courantes (CSRF, XSS, SQL Injection).
*   La page d'administration (`AdminPage`) doit être protégée par une authentification.

### **5.3 Interface et Langue**
*   L'intégralité de l'interface utilisateur vue par l'utilisateur final doit être en **français**. Cela inclut les labels, les placeholders, les boutons et les messages d'alerte.
*   Le design doit être simple, clair et entièrement responsive pour une utilisation sur mobile et tablette.



--------------------------------------------------------------------------------------------------------------------------

**Complete & Final Technical Specifications for the "Strategic Transport Task Assistant"**

**To the Developer,**

This document outlines the complete architectural and functional blueprint for the application you are tasked with building. Your objective is to adhere strictly to these specifications to ensure the final product aligns perfectly with the project's strategic goals. This is not just a calculator; it is a decision-support system. Every component must be built with this philosophy in mind: efficiency, accuracy, and intelligent automation.

#### **Chapter 1: The Foundation - Database Schema**

The database is the bedrock of this entire system. It must be structured precisely as described below. There are exactly four required models (tables).

**1. `Truck` Model:**
*   **Purpose:** This table serves as the digital garage for the company's fleet. It stores every vehicle that can be assigned to a mission. The `fuel_consumption` field is critical as it's a primary driver of cost calculation.
*   **Required Fields:**
    *   `name`: A `CharField` (or `String`). A user-friendly identifier for the vehicle (e.g., "Volvo FH-16", "Refrigerated Unit #3").
    *   `fuel_consumption`: A `DecimalField` (or `FloatField`). This must store the precise fuel consumption rate in **Liters per 100 Kilometers** (e.g., 35.8).

**2. `Driver` Model:**
*   **Purpose:** This is the company's employee roster. The integrity of the `email` field is paramount, as it is the channel for the mission dispatch functionality.
*   **Required Fields:**
    *   `name`: A `CharField` for the driver's full name.
    *   `email`: An `EmailField`. This field must be enforced as **unique** and must pass validation to ensure it is a properly formatted email address.

**3. `TollRoute` Model (for Tolls/Péage):**
*   **Purpose:** This table acts as our internal knowledge base for fixed toll costs, as no reliable public API exists for this data. The system will query this table whenever a calculated route utilizes a motorway.
*   **Required Fields:**
    *   `start_city`: A `CharField`.
    *   `end_city`: A `CharField`.
    *   `price`: A `DecimalField`. The cost for this specific highway segment in the local currency.

**4. `GeneralSettings` Model:**
*   **Purpose:** This is the central control panel for all economic variables in the system. It allows the manager to adjust financial data without requiring code changes.
*   **CRITICAL NOTE:** This table must be implemented as a **Singleton**. It should only ever contain **one single row** of data.
*   **Required Fields:**
    *   `fuel_price`: A `DecimalField` for the current price of one liter of fuel.
    *   `driver_hourly_rate`: A `DecimalField` for the cost of a driver per hour.
    *   `default_profit_margin`: A `DecimalField`. This should store the desired profit as a decimal value (e.g., `0.20` represents a 20% profit margin).

---

#### **Chapter 2: The Brain - Core System Logic & Functionalities**

This is where the application's intelligence resides. These functionalities must be implemented with precision.

**1. `RouteCalculationEngine` Functionality:**
This is the central processing unit of the application. It is not a simple function but a multi-step analytical process.
*   **Inputs:** `start_city` (string), `end_city` (string), `truck_id` (integer).
*   **Process Steps:**
    1.  **API Call:** It must make an API request to **OpenRouteService**. The request must be configured for the `heavyvehicle` profile and must explicitly ask for `alternative_routes`.
    2.  **Iterative Analysis:** The API will return a JSON object containing a list of possible routes. The function must loop through each route in this list.
    3.  **In-Loop Route Analysis (for each route):**
        *   **Extract Raw Data:** From the API response for the current route, extract the total `distance` (in meters) and `duration` (in seconds). Also, extract the list of `segments` to identify the road types (`way_type`).
        *   **Calculate Fuel Cost:** `(distance_in_km / 100) * truck.fuel_consumption * settings.fuel_price`.
        *   **Calculate Driver Cost:** `(duration_in_seconds / 3600) * settings.driver_hourly_rate`.
        *   **Calculate Toll Cost:** Analyze the `segments` list. If any segment has a `way_type` of `motorway`, query the `TollRoute` table to find the matching price and add it to the cost. If no motorway segments exist, this cost is 0.
        *   **Calculate Total Cost:** Sum the `Fuel Cost`, `Driver Cost`, and `Toll Cost`.
        *   **Assess Risk Level:** Implement a simple logic: If the route consists predominantly of `motorway` segments, the risk is "Low". If it consists predominantly of `primary` or `secondary` road types, the risk is "Medium".
        *   **Calculate Client Price:** `Total Cost * (1 + settings.default_profit_margin)`.
        *   **Calculate Profit Amount:** `Client Price - Total Cost`.
    4.  **Output:** The function must return a structured list of objects. Each object represents one fully analyzed route and contains all calculated data: total cost, client price, profit, duration, distance, risk level, and a descriptive name (e.g., "Route via A7 Motorway").

**2. `DispatchMissionEmail` Functionality:**
This function bridges the gap between planning and execution. It must be robust and reliable.
*   **Inputs:** The chosen `route_object` (containing all its calculated data), the selected `driver_id`, and an optional `manager_notes` string.
*   **Process Steps:**
    1.  **Fetch Driver Data:** Use the `driver_id` to query the `Driver` table and retrieve the driver's name and email address.
    2.  **Generate Dynamic Map Link:** Construct a URL for a mapping service (e.g., Google Maps) that shows the direction from the start city to the end city. The format is typically: `https://www.google.com/maps/dir/StartCity/EndCity`.
    3.  **Compose Email Body:** Create a well-formatted HTML email. The content must include a personalized greeting (e.g., "Hello [Driver Name]"), the mission details (origin, destination, designated route, estimated duration), any notes from the manager, and the dynamic map link.
    4.  **CRITICAL REMINDER:** This email **must not contain any financial information** (costs, prices, or profits). It is for operational purposes only.
    5.  **Dispatch:** Use the framework's built-in mailer service to send the composed email to the driver's email address.

---

#### **Chapter 3: The Face - User Interface (UI) and User Experience (UX)**

This is what the user will see and interact with. It must be intuitive and efficient.

**1. Main Dashboard Page:**
*   **Input Form:** A clean form at the top of the page containing:
    *   A text input for "Start City".
    *   A text input for "End City".
    *   A dropdown (`<select>`) menu labeled "Select Truck", populated dynamically from the `Truck` database table.
    *   A primary button labeled "Analyze Routes".
*   **Results Display Area:** An area below the form that is initially empty. After the analysis is complete, this area will be populated with the results, displayed as a series of "Cards".
    *   Each card represents one route option.
    *   The "Recommended" route card must be visually distinct (e.g., a green border, a "Recommended" badge, or a star icon).
    *   Each card must clearly display all relevant information: Route Name, Total Cost, Client Price, Profit, Duration, Distance, and Risk Level.
    *   Each card must contain a **"Dispatch this Mission"** button. Clicking this button should trigger a modal (pop-up) window.
*   **Dispatch Modal Window:** This pop-up should contain:
    *   A dropdown menu to select a `Driver`.
    *   A text area for optional `Manager Notes`.
    *   A final "Confirm and Send Mission" button that triggers the `DispatchMissionEmail` functionality.

**2. Settings Page:**
*   This page **must be protected** and accessible only to an authenticated manager/administrator.
*   It must provide a full CRUD (Create, Read, Update, Delete) interface for all four database tables:
    *   A section for **General Settings** to update the single row in that table.
    *   A section to manage the **Truck** fleet.
    *   A section to manage the **Driver** roster.
    *   A section to manage the **Toll Route** prices.

This document represents the complete and final specifications. Your task is to translate this blueprint into clean, efficient, and robust code.



--------------------------------------------------------------------------------------------------------------------------

Here’s the **exact English translation** of your text without changing anything in meaning or structure:

---

I completely understand! Let me show you how this tool actually works from the end-user’s point of view.

## **The Complete Practical Scenario**

### **🎬 A Real Scene from a Working Day in a Transport Company**

**9:00 AM – A call from a client:**

> "Hello, I want to transport goods from Casablanca to Marrakech, how much does it cost?"

**In the traditional way, the company owner would say:**

> "Wait a minute, I’ll calculate for you..."
>
> Then he starts guessing or doing complicated manual calculations.

**With this tool, it becomes:**

1. **Opens the tool (10 seconds)**
2. **Types: "Casablanca" and "Marrakech"**
3. **Chooses the available truck**
4. **Clicks "Calculate"**

**Result within 15 seconds:**

---

### **📊 What the company owner sees on the screen**

**🥇 Smart Recommendation (Highlighted in Green):**

```
✅ Recommended Route
📍 Highway (A7) – Safe and Fast
📏 Distance: 241 km
⏱️ Estimated Time: 2h 45m
💰 Total Cost: 847 MAD
🎯 Suggested Price for Client: 1,016 MAD
💹 Your Profit: 169 MAD (20%)
⚠️ Risk Level: Low
```

**🥈 Economic Alternative:**

```
💰 Cheapest Route
📍 National Road (N8) – Economic Alternative
📏 Distance: 267 km
⏱️ Estimated Time: 3h 20m
💰 Total Cost: 763 MAD
🎯 Suggested Price for Client: 916 MAD
💹 Your Profit: 153 MAD (20%)
⚠️ Risk Level: Medium
```

**🥉 Fastest Alternative:**

```
⚡ Fastest Route
📍 Mixed Roads – Balanced
📏 Distance: 235 km
⏱️ Estimated Time: 2h 30m
💰 Total Cost: 892 MAD
🎯 Suggested Price for Client: 1,070 MAD
💹 Your Profit: 178 MAD (20%)
⚠️ Risk Level: Low
```

---

### **💼 Conversation between Company Owner and Client**

**Company Owner (Confident and Professional):**

> "Yes sir, after accurate calculation of distance and costs:
>
> – Price for safe and fast transport: **1,016 MAD**
> – Time: about 2h 45m
> – We use the secure highway
>
> If you prefer to save costs and you’re not in a hurry, we can offer **916 MAD** but it will take 3h 20m."

**Client:** "Excellent, that’s reasonable. When can it be done?"

**Company Owner:** "We can start today. I’ll assign the best driver and send him the details now."

---

### **📧 Assigning the Driver (Automatically)**

**Company Owner:**

1. **Chooses the route** (Smart Recommendation)
2. **Chooses the driver** from the list (e.g., Ahmed El-Morabet)
3. **Adds a note** (optional): "Client prefers a call upon arrival"
4. **Clicks "Send Task"**

---

### **📱 What the Driver Receives in His Email**

```
Subject: New Transport Task: Casablanca → Marrakech

Hello Ahmed,

You have a new transport task:

📍 From: Casablanca
📍 To: Marrakech
📏 Distance: 241 km
⏱️ Estimated Time: 2h 45m
🛣️ Route: Highway (A7) – Safe and Comfortable

🗺️ Map Link:
https://www.google.com/maps/dir/Casablanca/Marrakech

📝 Special Notes:
Client prefers a call upon arrival

This task was sent on: 2024-12-09 09:05

Wishing you safety and success in your trip.  
Company Management
```

---

### **🎯 Final Result**

**In less than 5 minutes:**

* ✅ Client received an accurate and convincing price offer
* ✅ Company owner secured his profit (169 MAD)
* ✅ Driver received clear and detailed instructions
* ✅ Task is ready for execution

**Compared to the traditional way:**

* ❌ Price guessing (could lead to loss or losing the client)
* ❌ Complicated manual calculations prone to error
* ❌ Many calls with drivers
* ❌ Unclear instructions

---

### **🔄 Other Scenarios**

**Scenario 2: Client wants express delivery**

> The tool shows him the fastest route even if slightly more expensive.

**Scenario 3: Client with limited budget**

> The tool shows him the economic route and explains the time difference.

**Scenario 4: Urgent request**

> Company owner selects the nearest driver and sends the task immediately.

---

### **📈 Long-Term Benefits**

**After one month of use:**

* 🎯 **Pricing accuracy:** No unprofitable trips
* 📊 **Improved service:** Clients trust accurate prices
* ⏰ **Time saving:** 90% less time to calculate offers
* 💼 **Professional image:** Clients feel confidence in the company
* 🚛 **Better fleet management:** Accurate knowledge of each truck’s cost

This is the practical reality of the tool – **transforming the transport company from traditional work into smart and profitable business!**

---
