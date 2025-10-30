# Projet LDF – Pipeline de Données & Dashboard Immobilier

## Description Générale

Ce projet met en place un **pipeline de données automatisé** pour la collecte, le nettoyage, la validation et la visualisation d’annonces immobilières.  
Il a pour objectif d’**industrialiser le traitement de données** en combinant un backend Node.js et un frontend React.

Le pipeline est **automatisé via GitHub Actions** : il s’exécute chaque jour à 6h (UTC), met à jour le dataset (`data/dataset.csv`), puis le dashboard React consomme automatiquement ces nouvelles données pour générer les visualisations.

---

## Objectifs du Projet

- Automatiser la **collecte quotidienne** des annonces immobilières.  
- Nettoyer et formater les données pour obtenir un **CSV exploitable**.  
- Valider les données afin de garantir leur cohérence.  
- Alimenter un **dashboard React** pour visualiser les tendances du marché.  
- Mettre en place une **intégration continue (CI/CD)** via GitHub Actions.

---

## Architecture Globale

### Vue d’ensemble du pipeline

[ Scraping ] → [ Nettoyage / Transformation ] → [ Validation ] → [ Commit GitHub ]
↓
[ Dashboard React ]


- **Scraping :** extraction automatique d’annonces immobilières depuis une liste d’URLs.  
- **Nettoyage :** conversion, normalisation et enrichissement des données (prix/m², surface, etc.).  
- **Validation :** vérifie la structure et la cohérence du CSV généré.  
- **Commit automatique :** met à jour `data/dataset.csv` dans le dépôt GitHub.  
- **Dashboard React :** consomme le CSV ou l’API pour afficher les graphiques.

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

## Commandes utiles (local)

- Installer :
npm ci

- Lancer le scraper puis le nettoyeur (pipeline local) :
npm run pipeline

- Valider le CSV (local) :
node scripts/validate.js

- Tester l'API localement :
node scripts/preview_api.js

- Lancer l'application en mode développement (Vite) :
npm run dev
