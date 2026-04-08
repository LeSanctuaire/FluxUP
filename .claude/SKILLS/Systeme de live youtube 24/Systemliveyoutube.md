# 🎧 FLUXUP — Système de Live 24/7 (YouTube)

## 🎯 Objectif
Créer une nouvelle page "Streams Youtube 24/7" basée sur des lives YouTube peu connus (underground), avec une expérience fluide malgré l’instabilité des streams.

---

## ⚠️ Problématique

Les lives YouTube ne sont pas de vraies radios :

- Coupures fréquentes
- Redémarrage du stream
- Player bloqué (buffer / pause)
- Vidéo supprimée ou remplacée

👉 Résultat : mauvaise expérience utilisateur si non géré

---

## 🧠 Solution globale

Créer un système intelligent avec :

- Détection d’état du player
- Auto-reload
- Fallback (optionnel)
- UI claire (reconnexion + statut)

---

## ⚙️ Méthode technique

### 1. Utiliser YouTube IFrame API
⚠️ Ne pas utiliser iframe simple

Permet de :
- contrôler le player
- détecter erreurs
- recharger dynamiquement

---

### 2. Détection d’état

États à surveiller :

- PLAYING → OK
- BUFFERING → normal
- ENDED → stream OFF
- PAUSED → suspect
- UNSTARTED → problème

---

### 3. Auto-refresh

Vérifier toutes les 25-30 secondes :

- si état bloqué → reload
- si vidéo ne progresse pas → reload

---

### 4. Reload intelligent

Soft reload :
```js
player.loadVideoById("VIDEO_ID");

--- 

### 5. AUTRE ? 

Hard reload :

player.destroy();
initPlayer();
5. Détection freeze

Comparer le temps de lecture :

if (currentTime === lastTime) {
  reload();
}
6. Anti-spam reload

Ajouter délai :

setTimeout(reload, 3000);