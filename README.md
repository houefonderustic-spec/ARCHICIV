# ARCHICIV INGÉNIERIE SARL — site vitrine

HTML5, CSS3 et JavaScript natif. Aucune bibliothèque, aucune installation.

## Arborescence
```
archiciv-site/
├── index.html          Accueil (complet)
├── realisations.html   Galerie avec filtres
├── services.html       Une section par service
├── contact.html        Coordonnées + formulaire
├── assets/css/style.css   Identité visuelle (tokens en haut du fichier)
├── assets/js/main.js      Menu mobile, animations, carrousel, filtres, formulaire
└── assets/images/         Visuels de démonstration (SVG)
```

## Lancer le site sur Windows 11
1. Clic droit sur le zip > **Extraire tout**.
2. Double-cliquer sur `index.html` : le site s'ouvre dans le navigateur.
3. Option recommandée : VS Code + extension **Live Server** (clic droit sur `index.html` > *Open with Live Server*).
4. Autre option : dans le dossier, ouvrir PowerShell et lancer `py -m http.server 8000`, puis aller sur http://localhost:8000.

Les polices (Google Fonts) demandent une connexion Internet. Sans connexion, le site utilise des polices de secours.

## À remplacer ou à valider avant la mise en ligne
- **Photos** : voir la section « Remplacer les photos » ci-dessous. Retirer les badges « Démo » (`<span class="demo">`) quand les vraies photos sont en place.
- **Services** : liste provisoire (badges « À valider »). Modifier dans `index.html` (attributs `data-*` des boutons) et `services.html`.
- **Textes** du héro et du bandeau contact : propositions à faire valider.
- **Logo** : identité textuelle provisoire, pas un logo officiel.
- **Avis** : seule la note Google fournie (5,0/5, 7 avis) est affichée. Pas de faux témoignage.
- **Carte** : plan schématique. Pour une vraie carte, remplacer le `<svg>` de `.map-box` par une `<iframe class="map-embed">` (Google Maps > Partager > Intégrer).

## Remplacer les photos (aucune modification du code)
Chaque image essaie trois sources, dans cet ordre :
1. **Votre fichier local** `assets/images/<nom>.jpg` (s'il existe, il est utilisé) ;
2. une photo de démonstration en ligne (nécessite Internet) ;
3. l'illustration `assets/images/<nom>.svg` (si tout le reste échoue).

Pour remplacer une photo : déposer votre fichier avec **exactement** ce nom dans `assets/images/` :

| Fichier | Emplacement |
|---|---|
| `villa-contemporaine.jpg` | Héro de l'accueil, comparateur « bâtiment » |
| `villa-plain-pied.jpg` | Service 1, réalisation |
| `residence-r4.jpg` | Service 3, réalisation |
| `axonometrie-3d.jpg` | Service 2, réalisation (maquette ou rendu 3D) |
| `plan-etage.jpg` | Comparateur « plan », réalisation |
| `interieur-sejour.jpg` | Service 5, réalisation |
| `detail-facade.jpg` | Service 4, réalisation |

Conseil : JPG, 1600 px de large, moins de 400 Ko. Après remplacement, corriger les textes `alt` et le titre des projets.

### Crédits des photos de démonstration (en ligne)
Photos Unsplash (licence Unsplash) et une photo Pexels (licence Pexels, auteur : jackson tee). Ce ne sont **pas** des réalisations d'ARCHICIV. À retirer avant la mise en production.

## Formulaire de contact
Aucun backend n'est branché. Le bouton valide les champs puis ouvre WhatsApp avec le message pré-rempli. Pour recevoir des e-mails, deux options :
- un service de formulaire (Formspree, Getform) : `action` du `<form>` + retirer le `preventDefault` dans `main.js` ;
- un script PHP sur l'hébergeur (`envoyer.php`) qui lit `$_POST` et appelle `mail()`.

## Ajouter un projet
Dans `realisations.html`, copier une balise `<a class="proj">`, changer image, titre, `data-cat` et `.tag`.

## Mise en ligne
Hébergement statique classique : envoyer le dossier tel quel. Les liens sont relatifs. Ensuite : ajouter `sitemap.xml`, un nom de domaine, et compresser les vraies photos (WebP, 1600 px max).
