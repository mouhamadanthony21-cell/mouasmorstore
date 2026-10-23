/* ============================================================
   Mouasmor Store — Utilitaires partagés, catalogue Supabase + panier
   ============================================================ */

const CLE_PANIER = "mouasmor_panier";
const IMAGE_FALLBACK = "ms-nobackground.png";

const CATALOGUE_LOCAL = PRODUITS.map((p) => ({
  ...p,
  images: Array.isArray(p.images) ? [...p.images] : undefined,
  details: Array.isArray(p.details) ? [...p.details] : undefined,
}));

let sourceCatalogue = "local";
let erreurCatalogue = "";

/* ---------- Utilitaires ---------- */

function formaterPrix(valeur) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(valeur) + " FCFA";
}

function echapperHtml(valeur) {
  return String(valeur ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]));
}

function normaliserProduit(p) {
  const images = Array.isArray(p.images)
    ? p.images.filter((src) => typeof src === "string" && src.trim() !== "")
    : [];
  if (!images.length && typeof p.image === "string" && p.image.trim() !== "") {
    images.push(p.image);
  }

  const nom = String(p.title ?? p.titre ?? p.nom ?? "Produit");
  const prix = p.price ?? p.prix;
  const ancienPrix = p.old_price ?? p.ancienPrix;
  const note = p.note;

  return {
    ...p,
    id: String(p.id ?? ""),
    nom,
    titre: nom,
    categorie: String(p.category ?? p.categorie ?? ""),
    badge: p.badge ? String(p.badge) : null,
    images: images.length ? images : [IMAGE_FALLBACK],
    image: images[0] || IMAGE_FALLBACK,
    prix: prix === null || prix === undefined || prix === "" ? null : Number(prix),
    ancienPrix:
      ancienPrix === null || ancienPrix === undefined || ancienPrix === ""
        ? null
        : Number(ancienPrix),
    note: note === null || note === undefined || note === "" ? null : Number(note),
    description: String(p.description ?? ""),
    details: Array.isArray(p.details) ? p.details.map(String) : [],
    date: p.created_at ?? p.date ?? null,
  };
}

/* ---------- Catalogue Supabase ---------- */

function messageErreurSupabase(error) {
  const message = String(error?.message || "");
  const code = String(error?.code || "");

  if (code === "42P01" || /schema cache|does not exist|introuvable/i.test(message)) {
    const local = !location.hostname || ["localhost", "127.0.0.1"].includes(location.hostname);
    return local
      ? "La table « products » n'existe pas encore. Exécutez supabase/setup.sql puis supabase/seed.sql dans Supabase."
      : "Le catalogue en ligne n'est pas encore configuré. Les produits locaux sont affichés.";
  }
  if (/invalid api key|apikey|jwt|invalid.*key/i.test(message)) {
    return "La clé Supabase est invalide. Vérifiez js/supabase-config.js.";
  }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return "Supabase est injoignable. Vérifiez votre connexion internet puis rechargez la page.";
  }
  return "Impossible de charger les produits depuis Supabase. Les produits locaux sont affichés.";
}

function afficherAlerteCatalogue(texte, type = "err") {
  const cible = document.getElementById("alerte-catalogue");
  if (!cible) {
    if (typeof notifier === "function") {
      notifier(texte, "fa-solid fa-triangle-exclamation");
    }
    return;
  }
  cible.className = "alerte " + type;
  cible.textContent = texte;
}

function masquerAlerteCatalogue() {
  const cible = document.getElementById("alerte-catalogue");
  if (!cible) return;
  cible.className = "alerte";
  cible.textContent = "";
}

function utiliserCatalogueLocal() {
  PRODUITS.splice(0, PRODUITS.length, ...CATALOGUE_LOCAL.map(normaliserProduit));
  sourceCatalogue = "local";
  window.CATALOGUE_SOURCE = "local";
}

function nettoyerPanierInvalide() {
  const panier = lirePanier();
  if (!panier.length) return;
  const ids = new Set(PRODUITS.map((p) => p.id));
  const propre = panier.filter((l) => ids.has(l.id));
  if (propre.length !== panier.length) ecrirePanier(propre);
}

async function chargerProduits() {
  erreurCatalogue = "";

  if (typeof supabaseDisponible !== "function" || !supabaseDisponible()) {
    erreurCatalogue =
      "La librairie Supabase n'a pas pu être chargée. Vérifiez votre connexion puis rechargez la page.";
    window.CATALOGUE_ERREUR = erreurCatalogue;
    utiliserCatalogueLocal();
    afficherAlerteCatalogue(erreurCatalogue);
    return PRODUITS;
  }

  try {
    const { data, error } = await window.supabaseClient
      .from("products")
      .select(
        "id,title,category,badge,price,images,description,details,old_price,note,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const produits = (data || [])
      .map(normaliserProduit)
      .filter((p) => p.id && p.nom);

    PRODUITS.splice(0, PRODUITS.length, ...produits);
    sourceCatalogue = "supabase";
    window.CATALOGUE_SOURCE = "supabase";
    window.CATALOGUE_ERREUR = "";
    masquerAlerteCatalogue();
    nettoyerPanierInvalide();
    return PRODUITS;
  } catch (e) {
    console.error("Catalogue Supabase indisponible.", e);
    erreurCatalogue = messageErreurSupabase(e);
    window.CATALOGUE_ERREUR = erreurCatalogue;
    utiliserCatalogueLocal();
    afficherAlerteCatalogue(erreurCatalogue);
    return PRODUITS;
  }
}

function trouverProduit(id) {
  return PRODUITS.find((p) => p.id === id);
}

function categorieProduit(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

function cleanSlug(texte) {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

/* ---------- Panier ---------- */

function lirePanier() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PANIER)) || [];
  } catch (e) {
    return [];
  }
}

function ecrirePanier(panier) {
  localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
  majBadgePanier();
}

function majBadgePanier() {
  let total = lirePanier().reduce((s, l) => s + l.qte, 0);
  document.querySelectorAll(".badge-panier").forEach((el) => {
    el.textContent = total;
    el.classList.toggle("visible", total > 0);
  });
}

function ajouterAuPanier(id, qte = 1) {
  let panier = lirePanier();
  const ligne = panier.find((l) => l.id === id);
  if (ligne) ligne.qte += qte;
  else panier.push({ id: id, qte: qte });
  ecrirePanier(panier);
}

function mettreAJourQte(id, qte) {
  let panier = lirePanier();
  if (qte <= 0) {
    panier = panier.filter((l) => l.id !== id);
  } else {
    const ligne = panier.find((l) => l.id === id);
    if (ligne) ligne.qte = qte;
  }
  ecrirePanier(panier);
}

function supprimerDuPanier(id) {
  ecrirePanier(lirePanier().filter((l) => l.id !== id));
}

function totalPanier() {
  return lirePanier().reduce((s, l) => {
    const p = trouverProduit(l.id);
    return p && p.prix !== null ? s + p.prix * l.qte : s;
  }, 0);
}

/* ---------- Composants réutilisables ---------- */

function carteProduit(p) {
  const produit = normaliserProduit(p);
  const nom = echapperHtml(produit.nom);
  const idUrl = encodeURIComponent(produit.id);
  const categorie = categorieProduit(produit.categorie);
  const nomCategorie = categorie ? categorie.nom : produit.categorie;
  const badge = produit.badge
    ? `<span class="badge badge-${cleanSlug(produit.badge)}">${echapperHtml(produit.badge)}</span>`
    : "";

  const images = produit.images.slice(0, 4);
  const imagesHtml = images
    .map((src, index) => `
      <img src="${echapperHtml(src)}" alt="${nom}${images.length > 1 ? " — image " + (index + 1) : ""}" loading="${index === 0 ? "eager" : "lazy"}" width="800" height="800">`)
    .join("");

  const adminActif =
    typeof window !== "undefined" &&
    window.ADMIN &&
    window.ADMIN.authentifie &&
    document.getElementById("admin-panneau");

  const actionsAdmin = adminActif
    ? `
    <div class="carte-admin-actions">
      <button type="button" class="carte-admin-btn" data-admin-modifier="${echapperHtml(produit.id)}" title="Modifier le titre" aria-label="Modifier le titre de ${nom}">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button type="button" class="carte-admin-btn danger" data-admin-supprimer="${echapperHtml(produit.id)}" title="Supprimer le produit" aria-label="Supprimer ${nom}">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>`
    : "";

  return `
  <article class="carte-produit" data-produit-id="${echapperHtml(produit.id)}">
    <a class="carte-image${images.length > 1 ? " carte-image-multi" : ""}" href="produit.html?id=${idUrl}" aria-label="${nom}">
      <div class="carte-images" data-count="${images.length}">${imagesHtml}</div>
      ${badge}
    </a>
    ${actionsAdmin}
    <div class="carte-body">
      <div class="carte-classe">${echapperHtml(nomCategorie)}</div>
      <h3 class="carte-titre"><a href="produit.html?id=${idUrl}">${nom}</a></h3>
      <div class="carte-footer">
        <span class="carte-ajout-txt">Ajoutez au panier <i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i></span>
        <button class="btn-ajout" data-ajout="${echapperHtml(produit.id)}" aria-label="Ajouter au panier">
          <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    </div>
  </article>`;
}

function renduGrille(liste, zone) {
  const container = document.querySelector(zone);
  if (!container) return;
  if (!liste.length) {
    container.innerHTML =
      '<div class="vide"><i class="fa-solid fa-magnifying-glass"></i><p>Aucun produit ne correspond à votre recherche.</p></div>';
    return;
  }
  container.innerHTML = liste.map(carteProduit).join("");
}

/* ---------- Boutons d'ajout (délégation) ---------- */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-ajout]");
  if (!btn) return;
  ajouterAuPanier(btn.dataset.ajout);
  notifier("Ajouté au panier", "fa-solid fa-check");
  const b = btn;
  b.classList.add("ajoute");
  setTimeout(() => b.classList.remove("ajoute"), 900);
});

function notifier(texte, icone = "fa-solid fa-check") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  const iconeElement = document.createElement("i");
  iconeElement.className = icone;
  iconeElement.setAttribute("aria-hidden", "true");

  const texteElement = document.createElement("span");
  texteElement.textContent = String(texte ?? "");

  toast.replaceChildren(iconeElement, texteElement);
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- Initialisation globale ---------- */

document.addEventListener("DOMContentLoaded", () => {
  majBadgePanier();
  initMenuMobile();
  initRecherche();
  initAnnee();
});

function initMenuMobile() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  if (!burger || !nav) return;
  burger.addEventListener("click", () => {
    nav.classList.toggle("ouvert");
    document.body.classList.toggle("nav-ouverte");
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("ouvert");
      document.body.classList.remove("nav-ouverte");
    }
  });
}

function initRecherche() {
  const input = document.getElementById("recherche");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = encodeURIComponent(input.value.trim());
      window.location.href = "catalogue.html?q=" + q;
    }
  });
}

function initAnnee() {
  document.querySelectorAll(".annee").forEach((el) => (el.textContent = new Date().getFullYear()));
}
