/* ============================================================
   Mouasmor Store — Fiche produit
   ============================================================ */

(async function () {
  const id = new URLSearchParams(location.search).get("id");
  let qte = 1;

  await chargerProduits();

  if (!id || !trouverProduit(id)) {
    document.getElementById("vue-produit").innerHTML = dedansVide();
    document.getElementById("grille-similaires").innerHTML = "";
    document.querySelector(".produits-similaires").hidden = true;
    return;
  }

  const p = trouverProduit(id);
  const cat = categorieProduit(p.categorie);
  const nomCat = cat ? cat.nom : p.categorie;
  const nomProduit = echapperHtml(p.nom);
  const images = p.images && p.images.length ? p.images : [p.image];
  const description =
    p.description ||
    `Découvrez ${p.nom}, disponible chez Mouasmor Store à Ouest Foire, Dakar.`;

  document.title = `${p.nom} — Mouasmor Store`;

  const fil = document.getElementById("fil-ariane");
  if (fil) {
    fil.innerHTML = `
      <a href="index.html" style="color:var(--gris)">Accueil</a>
      <i class="fa-solid fa-angle-right" style="margin:0 8px;font-size:.75rem"></i>
      <a href="catalogue.html" style="color:var(--gris)">Catalogue</a>
      <i class="fa-solid fa-angle-right" style="margin:0 8px;font-size:.75rem"></i>
      <a href="catalogue.html?cat=${encodeURIComponent(p.categorie)}" style="color:var(--gris)">${echapperHtml(nomCat)}</a>
      <i class="fa-solid fa-angle-right" style="margin:0 8px;font-size:.75rem"></i>
      <b style="color:var(--navy)">${nomProduit}</b>`;
  }

  document.getElementById("vue-produit").innerHTML = `
    <div class="produit-media">
      <div class="produit-images" data-count="${images.length}">
        ${images
          .map(
            (src, index) =>
              `<img src="${echapperHtml(src)}" alt="${nomProduit}${images.length > 1 ? " — image " + (index + 1) : ""}" width="800" height="800" loading="${index === 0 ? "eager" : "lazy"}">`
          )
          .join("")}
      </div>
    </div>
    <div class="produit-infos">
      <span class="carte-classe">${echapperHtml(nomCat)}</span>
      <h1>${nomProduit}</h1>
      <p class="produit-ajout-aide">Ajoutez au panier <i class="fa-solid fa-arrow-down-long" aria-hidden="true"></i></p>
      <p class="produit-desc">${echapperHtml(description)}</p>

      <div class="produit-cta">
        <div class="quantite" aria-label="Quantité">
          <button type="button" id="btn-moins" aria-label="Diminuer la quantité"><i class="fa-solid fa-minus"></i></button>
          <output id="champ-qte">1</output>
          <button type="button" id="btn-plus" aria-label="Augmenter la quantité"><i class="fa-solid fa-plus"></i></button>
        </div>
        <button class="btn btn-primaire" id="btn-ajouter" style="flex:1;min-width:200px">
          <i class="fa-solid fa-cart-plus"></i> Ajouter au panier
        </button>
      </div>

      <div class="produit-livraison">
        <i class="fa-solid fa-truck-fast"></i>
        <p><b>Livraison disponible</b> à Ouest Foire et dans tout Dakar. Retrait sur place possible.</p>
      </div>

      <div class="produit-meta">
        <div><i class="fa-solid fa-location-dot"></i><span>Disponible — <b>Ouest Foire, Dakar</b></span></div>
        <div><i class="fa-solid fa-phone-volume"></i><span>Commander ou réserver : <a href="tel:+221775795356">+221 77 579 53 56</a></span></div>
        <div><i class="fa-brands fa-whatsapp"></i><span><a href="https://wa.me/221775795356?text=${encodeURIComponent("Bonjour, je suis intéressé(e) par : " + p.nom)}" target="_blank" rel="noopener">Commander sur WhatsApp</a></span></div>
      </div>
    </div>`;

  /* Quantité */
  const champQte = document.getElementById("champ-qte");
  const btnPlus = document.getElementById("btn-plus");
  const btnMoins = document.getElementById("btn-moins");

  const majQte = () => (champQte.textContent = qte);
  btnPlus.addEventListener("click", () => { qte = Math.min(99, qte + 1); majQte(); });
  btnMoins.addEventListener("click", () => { qte = Math.max(1, qte - 1); majQte(); });

  document.getElementById("btn-ajouter").addEventListener("click", () => {
    ajouterAuPanier(p.id, qte);
    notifier(`${qte} × ${p.nom} au panier`, "fa-solid fa-check");
  });

  /* Caractéristiques */
  const details = document.getElementById("details-produit");
  const liste = document.getElementById("liste-details");
  if (p.details && p.details.length) {
    details.hidden = false;
    liste.innerHTML = p.details
      .map((d) => `<li><i class="fa-solid fa-check"></i> ${echapperHtml(d)}</li>`)
      .join("");
  }

  /* Produits similaires */
  const similaires = PRODUITS.filter((x) => x.categorie === p.categorie && x.id !== p.id).slice(0, 4);
  const grilleSim = document.getElementById("grille-similaires");
  if (similaires.length) grilleSim.innerHTML = similaires.map(carteProduit).join("");
  else grilleSim.innerHTML = PRODUITS.filter((x) => x.id !== p.id).slice(0, 4).map(carteProduit).join("");

  function dedansVide() {
    return `
      <div class="vide" style="grid-column:1/-1">
        <i class="fa-solid fa-box-open" style="display:block;font-size:3rem;color:var(--gris-2)"></i>
        <h2 style="margin:10px 0 6px">Produit introuvable</h2>
        <p>Ce produit n'existe pas ou n'est plus disponible.</p>
        <a href="catalogue.html" class="btn btn-primaire" style="margin-top:20px">Retour au catalogue</a>
      </div>`;
  }

  window.toggleRecherche = function () {
    const q = prompt("Rechercher un produit…");
    if (q && q.trim()) window.location.href = "catalogue.html?q=" + encodeURIComponent(q.trim());
  };
})();