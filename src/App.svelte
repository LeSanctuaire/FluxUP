<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import Footer from './components/Footer.svelte';
  import PlayerAudio from './components/PlayerAudio.svelte';
  import Home from './pages/Home.svelte';
  import LesClips from './pages/LesClips.svelte';
  import Explorer from './pages/Explorer.svelte';
  import ClipDetail from './pages/ClipDetail.svelte';
  import RadioFlux from './pages/RadioFlux.svelte';

  // ----- Routeur hash simple -----
  let currentRoute = $state(window.location.hash || '#/');
  let clipId = $state(null);

  function parseHash(hash) {
    // Supporte : #/ #/clips #/explorer #/radio #/clip/:id
    const match = hash.match(/^#\/clip\/(.+)$/);
    if (match) {
      clipId = match[1];
      return '#/clip';
    }
    clipId = null;
    return hash || '#/';
  }

  onMount(() => {
    const onHashChange = () => {
      currentRoute = parseHash(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);
    // Initialisation
    currentRoute = parseHash(window.location.hash);
    return () => window.removeEventListener('hashchange', onHashChange);
  });
</script>

<Navbar {currentRoute} />

<main id="main-content">
  {#if currentRoute === '#/' || currentRoute === '#/home'}
    <Home />
  {:else if currentRoute === '#/clips'}
    <LesClips />
  {:else if currentRoute === '#/explorer'}
    <Explorer />
  {:else if currentRoute === '#/clip'}
    <ClipDetail id={clipId} />
  {:else if currentRoute === '#/radio'}
    <RadioFlux />
  {:else}
    <!-- 404 minimal -->
    <div class="page container fade-in" style="text-align:center; padding-top:5rem;">
      <h2 style="font-size:var(--text-3xl); color:var(--accent-orange);">404</h2>
      <p style="color:var(--text-secondary); margin-top:1rem;">Page introuvable</p>
      <a href="#/" style="margin-top:2rem; display:inline-block;" class="badge">Retour à l'accueil</a>
    </div>
  {/if}
</main>

<PlayerAudio />
<Footer />
