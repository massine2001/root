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

## Structure du Projet

root/
├── .github/
│ └── workflows/
│ └── data-pipeline.yml # Workflow GitHub Actions (pipeline automatisé)
├── api/
│ └── dataset.js # Endpoint Serverless (Vercel)
├── data/
│ ├── raw.json # Données brutes issues du scraping
│ ├── clean.json # Données nettoyées (intermédiaire)
│ └── dataset.csv # Données finales utilisées par le dashboard
├── scripts/
│ ├── scrape.js # Lance le scraping
│ ├── clean.js # Nettoie les données
│ ├── validate.js # Valide le CSV final
│ └── preview_api.js # Test API local
├── src/
│ ├── App.tsx # Tableau de bord React
│ ├── main.tsx # Point d’entrée React
│ └── lib/loadCsv.ts # Utilitaire de chargement CSV
├── package.json # Dépendances & commandes npm
├── vite.config.ts # Configuration du frontend
└── README.md
