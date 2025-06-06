# L'Épicerie du Marais

Site web de l'Épicerie du Marais à Quiévrain, une épicerie de proximité proposant une large gamme de produits alimentaires à prix abordables.

## Fonctionnalités

- Présentation de l'épicerie et de ses services
- Catalogue de produits avec catégories
- Section recettes de cuisine
- Interface d'administration sécurisée
- Gestion des promotions
- Galerie photos
- Design responsive

## Technologies utilisées

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage pour la persistance des données
- Google Maps pour la localisation

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/lepiceriedumarais.git
```

2. Ouvrez le fichier `index.html` dans votre navigateur

## Configuration

Pour configurer le projet, suivez ces étapes :

1. Copiez le fichier `config.example.js` en `config.js` :
   ```bash
   cp config.example.js config.js
   ```

2. Modifiez le fichier `config.js` avec vos clés API :
   - Remplacez `VOTRE_CLE_API_ICI` par votre clé API JSONBin.io

⚠️ **Important** :
- Ne committez jamais le fichier `config.js` dans le dépôt Git
- Gardez vos clés API secrètes
- Si vous exposez accidentellement une clé API, régénérez-la immédiatement

Pour l'interface d'administration :
- Accédez à `/gestion-lemarais-2024.html`
- Identifiants par défaut :
  - Utilisateur : admin
  - Mot de passe : lemarais2024

## Structure du projet

```
lepiceriedumarais/
├── images/          # Images du site
├── fonts/           # Polices personnalisées
├── index.html       # Page d'accueil
├── produits.html    # Page des produits
├── recettes.html    # Page des recettes
├── styles.css       # Styles globaux
├── script.js        # Scripts principaux
├── products.js      # Gestion des produits
├── recipes.js       # Gestion des recettes
└── admin.js         # Interface d'administration
```

## Licence

Tous droits réservés © 2024 L'Épicerie du Marais 