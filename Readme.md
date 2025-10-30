# Projet LDF – Pipeline de Données & Dashboard Immobilier

## Description
Ce projet a pour objectif de concevoir une chaîne complète de traitement et d’analyse de données immobilières (“pipeline de données”), et de les visualiser à travers un **dashboard interactif en React**.

Le pipeline collecte les données, les nettoie et calcule différents indicateurs (prix au m², répartition des surfaces, évolution temporelle, etc.), puis expose ces informations à travers une API REST consultée par le frontend.

---

## Fonctionnalités
- Extraction automatique des données immobilières (API ou CSV)
- Calcul de statistiques : médiane, histogrammes, séries temporelles
- API REST (`/api/dataset`, `/api/summary`)
- Dashboard React interactif (graphiques et tableau)
- Visualisation avec **Recharts**
- Mise en page moderne et responsive

---

## Stack technique

### Backend
- Node.js / Express
- Papaparse / csv-parser
- Math.js
- Axios / fetch
- (Optionnel) PostgreSQL

### Frontend
- React + Vite

---

## Installation & Exécution

### Prérequis
- Node.js ≥ 20
- npm ≥ 10

### Étapes
```bash
# 1. Cloner le dépôt
git clone https://github.com/ton-utilisateur/ldf-dashboard.git
cd ldf-dashboard

# 2. Installer les dépendances
npm install

# 3. Lancer le mode développement
npm run dev

