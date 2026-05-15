# Correctif v6.2 — image mobile plein écran

## Problème corrigé

Sur smartphone, l'image d'accueil restait petite en haut avec un grand vide noir en dessous.

## Solution

Sur écrans ≤ 760px :
- L'image fait maintenant **toute la hauteur de l'écran** (`height: 100vh`)
- Le ratio est préservé → l'image déborde légèrement à gauche et à droite
- Ces débordements sont masqués (`overflow: hidden`) → l'écran est entièrement rempli
- Les hotspots de navigation restent **parfaitement alignés** (positionnés en pourcentage de l'image)

Sur écrans très petits (≤ 380px) :
- Retour au mode largeur 100% pour ne pas trop couper

## Fichier à remplacer

Juste 1 fichier :
- `assets/css/index-cinematique-finale.css`

**Commit** : *« v6.2 : image accueil plein écran sur mobile »*
