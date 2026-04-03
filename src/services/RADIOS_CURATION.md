# Gérer la sélection de radios FluxUP

Tout se passe dans un seul fichier : `src/services/radioCuration.js`

---

## Ajouter une radio

Ajouter un objet dans le tableau `CURATED_STATIONS` :

```js
{
  stationuuid: 'curated-monnom',   // identifiant unique, préfixer par "curated-"
  name:         'Nom de la radio',
  country:      'France',
  tags:         'electronic, ambient',
  bitrate:      128,
  url_resolved: 'https://url-du-flux-audio.mp3',
  favicon:      'https://site.com/favicon.ico',  // laisser '' si pas de logo
},
```

> Pour trouver l'URL d'un flux : chercher la radio sur [radio-browser.info](https://www.radio-browser.info),
> ouvrir la fiche et copier le champ **URL**.

---

## Retirer une radio curée

Supprimer (ou commenter) son objet dans `CURATED_STATIONS`.

---

## Blacklister une radio de l'API

Si une radio remonte dans les modes "France" ou "Top mondial" et qu'on ne veut plus la voir :

1. Trouver son UUID sur [radio-browser.info](https://www.radio-browser.info)
2. L'ajouter dans `EXCLUDED_UUIDS` :

```js
export const EXCLUDED_UUIDS = new Set([
  '96202f73-0601-11e8-ae97-52543be04c81', // nom de la radio (commentaire)
]);
```

---

## Ordre d'affichage

Les radios s'affichent dans l'ordre du tableau `CURATED_STATIONS`.
Réordonner les objets suffit à changer l'ordre d'affichage.

---

## Changer le mode affiché par défaut

Dans `src/pages/RadioFlux.svelte`, ligne ~8 :

```js
let mode = $state('curated'); // 'curated' | 'fr' | 'world'
```
