# Correctifs v6.1 — 2 problèmes résolus

## Problèmes corrigés

### 1. Sur smartphone : grand vide noir sous l'image d'accueil
**Cause** : l'image d'accueil est presque carrée (1327×1185) mais l'écran smartphone est très haut (9:19) → l'image ne remplissait que la moitié supérieure, le reste était noir.
**Solution** : sur mobile (≤760px), suppression du `min-height:100vh` sur `.portal-page` → l'image s'enchaîne directement avec le footer minimal sans rupture noire.

### 2. Sur la page contact : image en pleine largeur, pas centrée
**Cause** : la classe `.vignette-cadre` n'avait pas de style dans cosmos.css → l'image s'étalait sur toute la largeur sans encadrement.
**Solution** : ajout d'un style élégant `.vignette-cadre` avec :
- Largeur limitée à 420 px
- Centrage automatique
- Cadre doré subtil
- Halo doré et ombre portée
- Filet doré en haut (touche chic)

## Fichiers à remplacer sur GitHub

Dans `Site-l-amagie.art/` :
1. `assets/css/cosmos.css`
2. `assets/css/index-cinematique-finale.css`

**Commit** : *« v6.1 : fix vide mobile + vignette image contact »*
