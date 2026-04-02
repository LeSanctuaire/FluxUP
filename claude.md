# Projet FluxUP - Guide pour Claude Code

## Objectif global
Créer un **site web / WebApp SPA performant et fluide** pour Sanctum Music, avec un design **dark mode futuriste et minimaliste**, qui intègre :
- Lecteur audio global (player)
- Pages pour clips vidéo et audio
- Composants UI modernes (cards, boutons, sliders)
- Effets légers (loop vidéo courte, transitions douces)
- Navigation SPA fluide

---

## Contraintes importantes
1. **Performance avant tout**  
   - Éviter les animations lourdes ou autoplay multiple
   - Une seule instance du player global
   - Lazy loading pour les médias et assets

2. **Architecture claire**
   - `/src/core` → logique globale (player, utils)
   - `/src/components` → composants réutilisables UI
   - `/src/pages` → pages SPA (Accueil, Top Clips, Explorer)
   - `/src/services` → appels API, gestion des données
   - `/src/styles` → CSS global et variables

3. **Design**
   - Dark mode, couleurs accent orange / vert bleuté néon
   - UI futuriste minimaliste
   - Boutons, cards, sliders simples et réutilisables

4. **Claude Code**
   - Ne jamais modifier directement la structure du projet
   - Toujours créer ou modifier des composants isolés
   - Optimiser le code pour lisibilité et performance
   - Générer du Svelte (JS), pas React ni TypeScript

---

## Composants clés à créer
- **PlayerAudio.svelte** → contrôle global audio / pause / play / stop
- **Button.svelte** → bouton réutilisable avec styles moderne
- **CardClip.svelte** → carte pour clips vidéo ou audio
- **Navbar.svelte** → barre de navigation SPA
- **Footer.svelte** → pied de page minimaliste

---

## Pages SPA
- **Home.svelte** → accueil avec mise en avant clips / Slider Bar
- **LesClips.svelte** → classement des clips
- **Explorer.svelte** → navigation par catégories, genres, artistes
- **ClipDetail.svelte** → page modal d’un clip Youtube (page dynamique et indexable avec url unique)
- **RadioFlux** → mise en avant de quelques webradios selectionnées (cards) + mode de recherche complet webradio via API Browser Radio.
---

## Règles supplémentaires
- Toujours optimiser pour **chargement rapide** et **fluidité SPA**
- Éviter code dupliqué
- Toujours commenter les sections complexes
- Utiliser CSS variables pour les couleurs et typographies
- Prévoir l’ajout futur de fonctionnalités IA (suggestions clips, playlists)

---

## Notes pour Claude
- Chaque composant doit être indépendant
- Proposer des effets UI légers mais modernes
- Respecter la structure `/src` strictement
- Tout changement majeur doit être validé avant

---

**Résumé :**  
FluxUP = SPA Svelte, dark mode futuriste, player global, clips audio/vidéo, UI moderne, performant et facilement extensible.