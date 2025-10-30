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

## Versions 
    - *NodeJs :* 18
    - *React :* 19.2.0
