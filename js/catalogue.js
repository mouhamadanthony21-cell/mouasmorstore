/* ============================================================
   Mouasmor Store — Logique du catalogue (filtres, tri, recherche)
   ============================================================ */

(async function () {
  const etat = {
    cat: "tous",
    q: "",
    tri: "populaire",
  };

  /* Filtres catégories (générés depuis CATEGORIES) */
  const listeCats = document.querySelector(".filtre-liste");
  if (listeCats) {
    listeCats.innerHTML =
      `<button data-filtre-cat="tous" class="actif">Tous les produits <i class="fa-solid fa-angles-right"></i></button>` +
      CATEGORIES.map(
        (c) =>
          `<button data-filtre-cat="${c.slug}">${c.nom} <i class="fa-solid fa-angles-right"></i></button>`
      ).join("");
  }

  const grille = document.getElementById("grille-catalogue");
  const compte = document.getElementById("compte");
  const selectTri = document.getElementById("tri");
  const recherche = document.getElementById("recherche-catalogue");
  const boutonsCats = document.querySelectorAll("[data-filtre-cat]");
  const reinit = document.getElementById("btn-reinitialiser");

  function lireParams() {
    const p = new URLSearchParams(location.search);
    if (p.get("cat") && CATEGORIES.some((c) => c.slug === p.get("cat"))) etat.cat = p.get("cat");
    if (p.has("q")) {
      etat.q = p.get("q").trim();
      if (recherche) recherche.value = etat.q;
    }
    synchroBoutons();
  }

  function synchroBoutons() {
    boutonsCats.forEach((b) => {
      b.classList.toggle("actif", b.dataset.filtreCat === etat.cat);
    });
  }

  function filtrerEtTrier() {
    let liste = PRODUITS.filter((p) => {
      if (etat.cat !== "tous" && p.categorie !== etat.cat) return false;
      if (etat.q) {
        const q = cleanSlug(etat.q.toLowerCase());
        const cat = categorieProduit(p.categorie);
        const hay = cleanSlug(
          (p.nom + " " + (p.description || "") + " " + (cat ? cat.nom : "")).toLowerCase()
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    switch (etat.tri) {
      case "nom": liste.sort((a, b) => a.nom.localeCompare(b.nom, "fr")); break;
      default:
        liste.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || a.nom.localeCompare(b.nom, "fr"));
    }

    compte.innerHTML = liste.length
      ? `<b>${liste.length}</b> produit${liste.length > 1 ? "s" : ""} trouvé${liste.length > 1 ? "s" : ""}`
      : "";
    renduGrille(liste, "#grille-catalogue");
  }

  window.rafraichirCatalogue = filtrerEtTrier;

  /* ---- Écouteurs ---- */
  boutonsCats.forEach((b) =>
    b.addEventListener("click", () => {
      etat.cat = b.dataset.filtreCat;
      synchroBoutons();
      filtrerEtTrier();
    })
  );

  if (selectTri)
    selectTri.addEventListener("change", () => {
      etat.tri = selectTri.value;
      filtrerEtTrier();
    });

  let timer;
  if (recherche)
    recherche.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        etat.q = recherche.value.trim();
        filtrerEtTrier();
      }, 220);
    });

  if (reinit)
    reinit.addEventListener("click", () => {
      etat.cat = "tous";
      etat.q = "";
      etat.tri = "populaire";
      if (recherche) recherche.value = "";
      if (selectTri) selectTri.value = "populaire";
      synchroBoutons();
      filtrerEtTrier();
      histoire(true);
    });

  /* URL propre */
  function histoire(force) {
    const params = new URLSearchParams();
    if (etat.cat !== "tous") params.set("cat", etat.cat);
    if (etat.q) params.set("q", etat.q);
    const url = location.pathname + (params.toString() ? "?" + params.toString() : "");
    history.replaceState(null, "", url);
    void force;
  }

  /* Pied de page : catégories */
  const footerCats = document.getElementById("footer-cats");
  if (footerCats) {
    footerCats.innerHTML = CATEGORIES.map((c) =>
      `<li><a href="catalogue.html?cat=${c.slug}"><i class="fa-solid fa-angle-right"></i> ${c.nom}</a></li>`
    ).join("");
  }

  window.toggleRecherche = function () {
    if (recherche) recherche.focus();
  };

  if (grille) {
    grille.innerHTML =
      '<div class="vide"><i class="fa-solid fa-spinner fa-spin"></i><p>Chargement du catalogue…</p></div>';
  }

  await chargerProduits();
  if (window.adminPret) {
    try {
      await window.adminPret;
    } catch (e) {
      console.warn("Statut administrateur indisponible.", e);
    }
  }

  lireParams();
  filtrerEtTrier();
  histoire();
})();