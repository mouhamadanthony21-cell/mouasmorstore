/* ============================================================
   Mouasmor Store — Page panier
   ============================================================ */

(async function () {
  const zone = document.getElementById("zone-panier");
  const overlay = document.getElementById("overlay-commande");

  await chargerProduits();

  function rendu() {
    const panier = lirePanier();

    if (!panier.length) {
      zone.innerHTML = `
        <div class="panier-vide">
          <i class="fa-solid fa-bag-shopping"></i>
          <h2>Votre panier est vide</h2>
          <p>Découvrez nos tissus, parfums, pommades et articles divers.</p>
          <a href="catalogue.html" class="btn btn-primaire" style="margin-top:22px">
            <i class="fa-solid fa-bag-shopping"></i> Découvrir le catalogue
          </a>
        </div>`;
      return;
    }

    const lignes = panier
      .map((l) => trouverProduit(l.id))
      .filter(Boolean);

    zone.innerHTML = `
      <div class="panier-layout">
        <div class="panier-liste">
          <div class="panier-entete">
            <span>Votre sélection (<b id="nb-articles">0</b>)</span>
            <button type="button" id="btn-vider" class="btn-supprimer" aria-label="Vider le panier" title="Vider le panier">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
          <div id="lignes-panier"></div>
        </div>
        <aside class="panier-resume" aria-label="Résumé de la commande">
          <h3>Résumé</h3>
          <p class="resume-note"><i class="fa-solid fa-circle-info"></i> Les prix des produits et de la livraison vous seront communiqués par WhatsApp après votre commande.</p>
          <button class="btn btn-primaire" id="btn-commander">
            <i class="fa-solid fa-cart-shopping"></i> Passer la commande
          </button>
        </aside>
      </div>
      <div class="voir-plus">
        <a class="lien-tout" href="catalogue.html"><i class="fa-solid fa-plus"></i> Continuer mes achats</a>
      </div>`;

    document.getElementById("nb-articles").textContent = panier.reduce((s, l) => s + l.qte, 0);

    const conteneurLignes = document.getElementById("lignes-panier");
    conteneurLignes.innerHTML = lignes
      .map((p) => {
        const q = panier.find((l) => l.id === p.id).qte;
        const nom = echapperHtml(p.nom);
        const idUrl = encodeURIComponent(p.id);
        const cat = categorieProduit(p.categorie);
        const nomCat = cat ? cat.nom : p.categorie;
        return `
        <div class="panier-ligne" data-id="${echapperHtml(p.id)}">
          <a href="produit.html?id=${idUrl}"><img src="${echapperHtml(p.image)}" alt="${nom}" width="86" height="86"></a>
          <div class="panier-ligne-infos">
            <b><a href="produit.html?id=${idUrl}">${nom}</a></b>
            <span>${echapperHtml(nomCat)}</span>
          </div>
          <div class="quantite" aria-label="Quantité">
            <button type="button" data-qte-moins="${echapperHtml(p.id)}" aria-label="Diminuer"><i class="fa-solid fa-minus"></i></button>
            <output>${q}</output>
            <button type="button" data-qte-plus="${echapperHtml(p.id)}" aria-label="Augmenter"><i class="fa-solid fa-plus"></i></button>
          </div>
          <div class="col-prix">
            <button type="button" class="btn-supprimer" data-supprime="${echapperHtml(p.id)}" aria-label="Retirer ${nom}" title="Retirer">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>`;
      })
      .join("");

    /* Écouteurs */
    conteneurLignes.querySelectorAll("[data-qte-plus]").forEach((b) =>
      b.addEventListener("click", () => { mettreAJourQte(b.dataset.qtePlus, lirePanier().find((l) => l.id === b.dataset.qtePlus).qte + 1); rendu(); })
    );
    conteneurLignes.querySelectorAll("[data-qte-moins]").forEach((b) =>
      b.addEventListener("click", () => { mettreAJourQte(b.dataset.qteMoins, lirePanier().find((l) => l.id === b.dataset.qteMoins).qte - 1); rendu(); })
    );
    conteneurLignes.querySelectorAll("[data-supprime]").forEach((b) =>
      b.addEventListener("click", () => { supprimerDuPanier(b.dataset.supprime); notifier("Produit retiré du panier", "fa-solid fa-check"); rendu(); })
    );

    document.getElementById("btn-vider").addEventListener("click", () => {
      if (confirm("Vider tout le panier ?")) {
        ecrirePanier([]);
        rendu();
      }
    });

    document.getElementById("btn-commander").addEventListener("click", ouvrirCommande);
  }

  /* ---------- Formulaire de commande ---------- */

  function ouvrirCommande() {
    const panier = lirePanier();
    if (!panier.length) return;

    const lignes = panier.map((l) => trouverProduit(l.id)).filter(Boolean);

    document.getElementById("resume-commande").innerHTML =
      lignes
        .map((p) => {
          const q = panier.find((l) => l.id === p.id).qte;
          return `<div class="ligne"><span>${q} × ${echapperHtml(p.nom)}</span></div>`;
        })
        .join("") +
      `<div class="ligne total"><span>Les prix seront confirmés par la boutique.</span></div>`;

    document.getElementById("alerte-commande").className = "alerte";
    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function fermerCommande() {
    overlay.classList.remove("visible");
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fermerCommande();
  });
  document.getElementById("fermer-commande").addEventListener("click", fermerCommande);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fermerCommande();
  });

  document.getElementById("form-commande").addEventListener("submit", (e) => {
    e.preventDefault();
    const alerte = document.getElementById("alerte-commande");
    const nom = document.getElementById("cmd-nom").value.trim();
    const tel = document.getElementById("cmd-tel").value.trim();

    if (!nom || !tel) {
      alerte.className = "alerte err";
      alerte.textContent = "Veuillez renseigner au moins votre nom et votre téléphone.";
      return;
    }
    if (tel.replace(/\D/g, "").length < 9) {
      alerte.className = "alerte err";
      alerte.textContent = "Veuillez saisir un numéro de téléphone valide.";
      return;
    }

    const type = document.getElementById("cmd-type").value;
    const adresse = document.getElementById("cmd-adresse").value.trim();
    const geo = document.getElementById("cmd-geo").value.trim();
    const notes = document.getElementById("cmd-notes").value.trim();
    const panier = lirePanier();

    const articles = panier
      .map((l) => {
        const p = trouverProduit(l.id);
        return `- ${l.qte} × ${p.nom}`;
      })
      .join("\n");

    const resume =
      `Bonjour ! Je souhaite commander :\n${articles}\n\n` +
      `Nom : ${nom}\nTél : ${tel}\nRéception : ${type === "livraison" ? "Livraison" : "Retrait sur place"}` +
      `${adresse ? "\nAdresse : " + adresse : ""}${geo ? "\nLocalisation : " + geo : ""}` +
      `${notes ? "\nNotes : " + notes : ""}`;

    const urlWa = `https://wa.me/221775795356?text=${encodeURIComponent(resume)}`;
    window.open(urlWa, "_blank", "noopener");

    alerte.className = "alerte ok";
    alerte.innerHTML = `Merci ${echapperHtml(nom)} ! Votre commande a bien été envoyée. La boutique vous contactera au <b>${echapperHtml(tel)}</b> pour vous communiquer les prix et finaliser la commande.`;
    setTimeout(() => {
      ecrirePanier([]);
      fermerCommande();
      rendu();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 3200);
  });

  /* ---------- Géolocalisation (facultative) ---------- */

  const btnGeo = document.getElementById("btn-geo");
  const champGeo = document.getElementById("cmd-geo");
  if (btnGeo && champGeo) {
    champGeo.addEventListener("click", (e) => {
      if (!champGeo.value) e.preventDefault();
    });
    btnGeo.addEventListener("click", () => {
      if (!navigator.geolocation) {
        notifier("Géolocalisation non prise en charge par votre navigateur.", "fa-solid fa-triangle-exclamation");
        return;
      }
      btnGeo.disabled = true;
      btnGeo.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Localisation…';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          champGeo.value = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
          btnGeo.disabled = false;
          btnGeo.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Localiser';
          notifier("Position enregistrée", "fa-solid fa-check");
        },
        () => {
          btnGeo.disabled = false;
          btnGeo.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Localiser';
          notifier("Impossible d'obtenir votre position.", "fa-solid fa-triangle-exclamation");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /* ---------- Init ---------- */

  const footerCats = document.getElementById("footer-cats");
  if (footerCats) {
    footerCats.innerHTML = CATEGORIES.map((c) =>
      `<li><a href="catalogue.html?cat=${c.slug}"><i class="fa-solid fa-angle-right"></i> ${c.nom}</a></li>`
    ).join("");
  }

  window.toggleRecherche = function () {
    const q = prompt("Rechercher un produit…");
    if (q && q.trim()) window.location.href = "catalogue.html?q=" + encodeURIComponent(q.trim());
  };

  rendu();
})();
