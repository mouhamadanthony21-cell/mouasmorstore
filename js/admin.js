/* ============================================================
   Mouasmor Store — Espace administrateur (Supabase)
   Le code secret est le mot de passe du compte admin Supabase.
   Aucune clé service_role n'est utilisée côté navigateur.
   ============================================================ */

window.ADMIN = window.ADMIN || { authentifie: false, email: "" };

let resoudreAdminPret;
window.adminPret = new Promise((resolve) => {
  resoudreAdminPret = resolve;
});

(() => {
  let apercuUrls = [];
  let sessionCourante = null;

  const MAX_IMAGES = 8;
  const TAILLE_MAX = 5 * 1024 * 1024;
  const LARGEUR_MAX = 1200;
  const TYPES_AUTORISES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  function supabasePrete() {
    return typeof supabaseDisponible === "function" && supabaseDisponible();
  }

  function sessionEstAdmin(session) {
    const email = session && session.user ? session.user.email : "";
    if (typeof estEmailAdmin === "function") return estEmailAdmin(email);
    return Boolean(email) && email.toLowerCase() === String(ADMIN_EMAIL).toLowerCase();
  }

  function message(element, texte, type = "err") {
    if (!element) return;
    element.className = "alerte " + type;
    element.textContent = texte;
  }

  function effacerMessage(element) {
    if (!element) return;
    element.className = "alerte";
    element.textContent = "";
    element.style.display = "";
  }

  function traduireErreurAuth(error) {
    const texte = String(error?.message || "");
    const code = String(error?.code || "").toLowerCase();
    const complet = (texte + " " + code).toLowerCase();

    if (complet.includes("invalid login credentials")) {
      return "Code secret incorrect. Vérifiez votre code et réessayez.";
    }
    if (complet.includes("email not confirmed")) {
      return "Le compte administrateur n'est pas encore confirmé. Confirmez-le dans Supabase > Authentication.";
    }
    if (complet.includes("too many") || complet.includes("rate limit")) {
      return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
    }
    if (
      complet.includes("failed to fetch") ||
      complet.includes("network") ||
      complet.includes("load failed")
    ) {
      return "Impossible de contacter Supabase. Vérifiez votre connexion internet.";
    }
    if (complet.includes("invalid api key") || complet.includes("apikey")) {
      return "La configuration Supabase est invalide. Vérifiez js/supabase-config.js.";
    }
    return "Connexion impossible. Vérifiez votre code secret et votre connexion.";
  }

  function traduireErreurDb(error) {
    const texte = String(error?.message || "");
    const code = String(error?.code || "");
    const complet = (texte + " " + code).toLowerCase();

    if (complet.includes("row-level security") || complet.includes("rls") || complet.includes("policy")) {
      return "Action non autorisée. Connectez-vous avec le compte administrateur et vérifiez les policies SQL.";
    }
    if (complet.includes("schema cache") || complet.includes("does not exist")) {
      return "La table « products » est introuvable. Exécutez supabase/setup.sql dans Supabase.";
    }
    if (complet.includes("invalid input syntax for type uuid")) {
      return "Identifiant de produit invalide.";
    }
    return "L'opération n'a pas pu être terminée. Vérifiez la configuration Supabase et réessayez.";
  }

  function traduireErreurStorage(error) {
    const texte = String(error?.message || "").toLowerCase();
    if (texte.includes("bucket not found")) {
      return "Le bucket « product-images » est introuvable. Exécutez supabase/setup.sql.";
    }
    if (texte.includes("row-level security") || texte.includes("unauthorized") || texte.includes("policy")) {
      return "Envoi d'image non autorisé. Vérifiez votre session admin et les policies Storage.";
    }
    if (texte.includes("mime") || texte.includes("not supported")) {
      return "Format d'image non accepté par Supabase Storage.";
    }
    if (texte.includes("too large") || texte.includes("maximum")) {
      return "L'image est trop lourde pour Supabase Storage (5 Mo maximum).";
    }
    return "Impossible d'envoyer l'image. Vérifiez le bucket et les policies Storage.";
  }

  /* ---------- Modales ---------- */

  function creerModales() {
    const conteneur = document.createElement("div");
    conteneur.innerHTML = `
      <div class="overlay" id="overlay-admin-login" role="dialog" aria-modal="true" aria-labelledby="titre-admin-login">
        <div class="overlay-carte admin-modal">
          <button class="fermer" type="button" data-fermer-admin aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
          <h3 id="titre-admin-login">Espace administrateur</h3>
          <p>Saisissez le code secret pour gérer les produits.</p>
          <form id="form-admin-login">
            <div class="form-groupe">
              <label for="admin-code">Code secret</label>
              <input type="password" id="admin-code" name="code" autocomplete="current-password" required placeholder="Votre code secret">
            </div>
            <div class="alerte" id="alerte-admin-login" role="status"></div>
            <button type="submit" class="btn btn-marine" style="width:100%;margin-top:18px" id="btn-admin-connexion">
              <i class="fa-solid fa-right-to-bracket"></i> Se connecter
            </button>
          </form>
        </div>
      </div>

      <div class="overlay" id="overlay-admin-titre" role="dialog" aria-modal="true" aria-labelledby="titre-admin-edition">
        <div class="overlay-carte admin-modal">
          <button class="fermer" type="button" data-fermer-admin aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
          <h3 id="titre-admin-edition">Modifier le titre</h3>
          <p>Le nouveau titre sera affiché immédiatement dans le catalogue.</p>
          <form id="form-admin-titre">
            <div class="form-groupe">
              <label for="admin-nouveau-titre">Titre</label>
              <input type="text" id="admin-nouveau-titre" maxlength="200" required>
            </div>
            <div class="alerte" id="alerte-admin-titre" role="status"></div>
            <button type="submit" class="btn btn-marine" style="width:100%;margin-top:18px" id="btn-admin-enregistrer">
              <i class="fa-solid fa-check"></i> Enregistrer
            </button>
          </form>
        </div>
      </div>`;
    document.body.appendChild(conteneur);
  }

  function ouvrirModale(id) {
    const modale = document.getElementById(id);
    if (!modale) return;
    modale.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function fermerModales() {
    document.querySelectorAll("#overlay-admin-login.visible, #overlay-admin-titre.visible").forEach((modale) => {
      modale.classList.remove("visible");
    });
    document.body.style.overflow = "";
  }

  /* ---------- Session ---------- */

  function afficherPanneau(visible) {
    const panneau = document.getElementById("admin-panneau");
    if (panneau) panneau.hidden = !visible;

    const bouton = document.getElementById("btn-admin");
    if (bouton) {
      bouton.classList.toggle("admin-connecte", visible);
      bouton.title = visible ? "Gérer les produits" : "Espace administrateur";
    }
  }

  function majEtatSession(session) {
    sessionCourante = session;
    window.ADMIN.authentifie = sessionEstAdmin(session);
    window.ADMIN.email = session?.user?.email || "";
    afficherPanneau(window.ADMIN.authentifie);
    if (
      window.ADMIN.authentifie &&
      location.hash === "#admin-panneau" &&
      document.getElementById("admin-panneau")
    ) {
      setTimeout(() => {
        document.getElementById("admin-panneau")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
    if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
  }

  async function exigerSessionAdmin() {
    if (!supabasePrete()) {
      throw new Error("Supabase n'est pas disponible. Vérifiez votre connexion et rechargez la page.");
    }

    const { data, error } = await window.supabaseClient.auth.getSession();
    if (error || !sessionEstAdmin(data.session)) {
      majEtatSession(null);
      throw new Error("Votre session administrateur a expiré. Reconnectez-vous.");
    }
    return data.session;
  }

  async function initialiserSession() {
    if (!supabasePrete()) {
      majEtatSession(null);
      return null;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.getSession();
      if (error) throw error;
      majEtatSession(data.session);

      window.supabaseClient.auth.onAuthStateChange((evenement, session) => {
        majEtatSession(session);
        if (evenement === "SIGNED_OUT") {
          fermerModales();
          if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
        }
      });

      return data.session;
    } catch (e) {
      console.warn("Session Supabase indisponible.", e);
      majEtatSession(null);
      return null;
    }
  }

  /* ---------- Connexion / déconnexion ---------- */

  async function connecter(code) {
    if (!supabasePrete()) {
      throw new Error("Supabase n'est pas disponible. Vérifiez votre connexion et rechargez la page.");
    }

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: code,
    });

    if (error) throw new Error(traduireErreurAuth(error));

    if (!sessionEstAdmin(data.session)) {
      await window.supabaseClient.auth.signOut();
      throw new Error("Ce compte n'est pas autorisé à gérer la boutique.");
    }

    majEtatSession(data.session);
    return data.session;
  }

  async function deconnecter() {
    if (supabasePrete()) {
      try {
        await window.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn("Déconnexion Supabase incomplète.", e);
      }
    }

    majEtatSession(null);
    fermerModales();
    if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
    if (typeof notifier === "function") {
      notifier("Déconnecté de l'espace admin", "fa-solid fa-check");
    }
  }

  /* ---------- Aperçu et compression des images ---------- */

  function reinitialiserApercu() {
    apercuUrls.forEach((url) => URL.revokeObjectURL(url));
    apercuUrls = [];
    const zone = document.getElementById("apercu-images");
    if (zone) zone.replaceChildren();
  }

  function validerFichiers(fichiers) {
    if (!fichiers.length) return "Ajoutez au moins une image.";
    if (fichiers.length > MAX_IMAGES) {
      return "Vous pouvez sélectionner au maximum " + MAX_IMAGES + " images.";
    }

    for (const fichier of fichiers) {
      if (!TYPES_AUTORISES.includes(fichier.type)) {
        return "Format non autorisé : utilisez JPG, PNG ou WEBP.";
      }
      if (fichier.size > TAILLE_MAX) {
        return "L'image « " + fichier.name + " » dépasse 5 Mo.";
      }
    }
    return "";
  }

  function afficherApercu(input) {
    reinitialiserApercu();
    const zone = document.getElementById("apercu-images");
    const alerte = document.getElementById("alerte-admin");
    if (!zone || !input) return;

    const fichiers = Array.from(input.files || []);
    const erreur = validerFichiers(fichiers);
    if (erreur) message(alerte, erreur);
    else effacerMessage(alerte);

    fichiers.slice(0, MAX_IMAGES).forEach((fichier) => {
      if (!TYPES_AUTORISES.includes(fichier.type) || fichier.size > TAILLE_MAX) return;

      const url = URL.createObjectURL(fichier);
      apercuUrls.push(url);

      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const legende = document.createElement("figcaption");
      image.src = url;
      image.alt = fichier.name;
      legende.textContent = fichier.name;
      figure.appendChild(image);
      figure.appendChild(legende);
      zone.appendChild(figure);
    });
  }

  function chargerImage(fichier) {
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(fichier, { imageOrientation: "from-image" }).catch(() => {
        return chargerImageViaUrl(fichier);
      });
    }
    return chargerImageViaUrl(fichier);
  }

  function chargerImageViaUrl(fichier) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(fichier);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Impossible de lire cette image."));
      };
      image.src = url;
    });
  }

  async function compresserImage(fichier) {
    const image = await chargerImage(fichier);
    const largeurOriginale = image.width || 1;
    const hauteurOriginale = image.height || 1;
    const ratio = Math.min(1, LARGEUR_MAX / largeurOriginale);
    const largeur = Math.max(1, Math.round(largeurOriginale * ratio));
    const hauteur = Math.max(1, Math.round(hauteurOriginale * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const contexte = canvas.getContext("2d");
    if (!contexte) throw new Error("Impossible de préparer l'image.");
    contexte.drawImage(image, 0, 0, largeur, hauteur);
    if (typeof image.close === "function") image.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) throw new Error("Impossible de compresser cette image.");
    return blob;
  }

  function extensionImage(type) {
    if (type === "image/png") return "png";
    if (type === "image/webp") return "webp";
    return "jpg";
  }

  function identifiantUnique() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return Date.now() + "-" + Math.random().toString(36).slice(2, 12);
  }

  async function supprimerCheminsStorage(chemins) {
    if (!chemins.length || !supabasePrete()) return;
    const { error } = await window.supabaseClient.storage.from(SUPABASE_BUCKET).remove(chemins);
    if (error) {
      console.warn("Suppression Storage incomplète.", error);
    }
  }

  async function televerserImages(fichiers) {
    const dossier = identifiantUnique();
    const urls = [];
    const chemins = [];

    try {
      for (const fichier of fichiers) {
        const blob = await compresserImage(fichier);
        if (blob.size > TAILLE_MAX) {
          throw new Error("L'image compressée dépasse encore 5 Mo. Choisissez une image plus légère.");
        }

        const chemin = dossier + "/" + identifiantUnique() + "." + extensionImage(blob.type);
        const { error } = await window.supabaseClient.storage
          .from(SUPABASE_BUCKET)
          .upload(chemin, blob, {
            contentType: blob.type || "image/webp",
            cacheControl: "31536000",
            upsert: false,
          });

        if (error) throw new Error(traduireErreurStorage(error));

        chemins.push(chemin);
        const { data } = window.supabaseClient.storage.from(SUPABASE_BUCKET).getPublicUrl(chemin);
        urls.push(data.publicUrl);
      }
      return { urls, chemins };
    } catch (e) {
      await supprimerCheminsStorage(chemins);
      throw e;
    }
  }

  /* ---------- Formulaire d'ajout ---------- */

  function remplirCategories() {
    const select = document.getElementById("admin-categorie");
    if (!select || select.options.length) return;
    select.innerHTML = CATEGORIES.map(
      (c) => `<option value="${echapperHtml(c.slug)}">${echapperHtml(c.nom)}</option>`
    ).join("");
  }

  async function ajouterProduit(evenement) {
    evenement.preventDefault();

    const form = document.getElementById("form-admin-produit");
    const alerte = document.getElementById("alerte-admin");
    const bouton = document.getElementById("btn-ajouter-produit");
    const inputImages = document.getElementById("admin-images");
    if (!form || !bouton || !inputImages) return;

    const titre = document.getElementById("admin-titre").value.trim();
    const categorie = document.getElementById("admin-categorie").value;
    const badge = document.getElementById("admin-badge").value || null;
    const prixTexte = document.getElementById("admin-prix").value.trim();
    const fichiers = Array.from(inputImages.files || []);

    if (titre.length < 2) {
      message(alerte, "Le titre doit contenir au moins 2 caractères.");
      return;
    }
    if (!CATEGORIES.some((c) => c.slug === categorie)) {
      message(alerte, "Choisissez une catégorie valide.");
      return;
    }

    const erreurFichiers = validerFichiers(fichiers);
    if (erreurFichiers) {
      message(alerte, erreurFichiers);
      return;
    }

    let prix = null;
    if (prixTexte !== "") {
      prix = Number(prixTexte);
      if (!Number.isFinite(prix) || prix < 0) {
        message(alerte, "Le prix doit être un nombre positif ou vide.");
        return;
      }
    }

    bouton.disabled = true;
    const contenuBouton = bouton.innerHTML;
    bouton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ajout en cours…';
    message(alerte, "Envoi du produit et des images…", "ok");

    let insertionReussie = false;
    let uploads = { urls: [], chemins: [] };

    try {
      await exigerSessionAdmin();
      uploads = await televerserImages(fichiers);

      const { data, error } = await window.supabaseClient
        .from("products")
        .insert({
          title: titre,
          category: categorie,
          badge: badge,
          price: prix,
          images: uploads.urls,
        })
        .select(
          "id,title,category,badge,price,images,description,details,old_price,note,created_at"
        )
        .single();

      if (error) throw new Error(traduireErreurDb(error));
      insertionReussie = true;

      const produit = normaliserProduit(data);
      PRODUITS.unshift(produit);

      form.reset();
      remplirCategories();
      reinitialiserApercu();
      message(alerte, "Produit ajouté avec succès.", "ok");
      if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
      if (typeof notifier === "function") notifier("Produit ajouté au catalogue", "fa-solid fa-check");
    } catch (err) {
      if (!insertionReussie) await supprimerCheminsStorage(uploads.chemins);
      message(alerte, err.message || "Impossible d'ajouter le produit.");
    } finally {
      bouton.disabled = false;
      bouton.innerHTML = contenuBouton;
    }
  }

  /* ---------- Modification / suppression ---------- */

  function ouvrirEdition(id) {
    const produit = PRODUITS.find((p) => p.id === id);
    if (!produit) return;

    const input = document.getElementById("admin-nouveau-titre");
    input.value = produit.nom;
    input.dataset.id = id;
    effacerMessage(document.getElementById("alerte-admin-titre"));
    ouvrirModale("overlay-admin-titre");
    input.focus();
    input.select();
  }

  async function enregistrerTitre(evenement) {
    evenement.preventDefault();
    const input = document.getElementById("admin-nouveau-titre");
    const alerte = document.getElementById("alerte-admin-titre");
    const bouton = document.getElementById("btn-admin-enregistrer");
    const id = input.dataset.id || "";
    const titre = input.value.trim();

    if (!id) {
      message(alerte, "Produit introuvable.");
      return;
    }
    if (titre.length < 2) {
      message(alerte, "Le titre doit contenir au moins 2 caractères.");
      return;
    }

    bouton.disabled = true;
    try {
      await exigerSessionAdmin();
      const { data, error } = await window.supabaseClient
        .from("products")
        .update({ title: titre })
        .eq("id", id)
        .select(
          "id,title,category,badge,price,images,description,details,old_price,note,created_at"
        )
        .single();

      if (error) throw new Error(traduireErreurDb(error));

      const produit = PRODUITS.find((p) => p.id === id);
      if (produit) Object.assign(produit, normaliserProduit(data));
      else PRODUITS.unshift(normaliserProduit(data));

      fermerModales();
      if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
      if (typeof notifier === "function") notifier("Titre modifié", "fa-solid fa-check");
    } catch (err) {
      message(alerte, err.message || "Impossible de modifier le titre.");
    } finally {
      bouton.disabled = false;
    }
  }

  function cheminDepuisUrl(url) {
    const texte = String(url || "");
    const marqueur = "/storage/v1/object/public/" + SUPABASE_BUCKET + "/";
    const position = texte.indexOf(marqueur);
    if (position === -1) return null;

    let chemin = texte.slice(position + marqueur.length).split("?")[0].split("#")[0];
    try {
      chemin = decodeURIComponent(chemin);
    } catch (e) {
      // Garder le chemin brut si le décodage échoue.
    }
    return chemin || null;
  }

  async function supprimerProduit(id) {
    const produit = PRODUITS.find((p) => p.id === id);
    if (!produit) return;

    if (!confirm(`Supprimer « ${produit.nom} » ? Cette action retirera aussi ses images du Storage.`)) {
      return;
    }

    try {
      await exigerSessionAdmin();

      const { error } = await window.supabaseClient.from("products").delete().eq("id", id);
      if (error) throw new Error(traduireErreurDb(error));

      const chemins = (produit.images || []).map(cheminDepuisUrl).filter(Boolean);
      let erreurImages = false;

      if (chemins.length) {
        const { error: erreurStorage } = await window.supabaseClient.storage
          .from(SUPABASE_BUCKET)
          .remove(chemins);
        if (erreurStorage) {
          erreurImages = true;
          console.warn("Images Storage non supprimées.", erreurStorage);
          if (typeof notifier === "function") {
            notifier(
              "Produit supprimé, mais certaines images n'ont pas pu être retirées du Storage.",
              "fa-solid fa-triangle-exclamation"
            );
          }
        }
      }

      const index = PRODUITS.findIndex((p) => p.id === id);
      if (index !== -1) PRODUITS.splice(index, 1);

      if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
      if (typeof notifier === "function" && !erreurImages) {
        notifier("Produit supprimé", "fa-solid fa-trash-can");
      }
    } catch (err) {
      if (typeof notifier === "function") {
        notifier(err.message || "Impossible de supprimer le produit.", "fa-solid fa-triangle-exclamation");
      }
    }
  }

  /* ---------- Événements ---------- */

  function initialiser() {
    creerModales();
    remplirCategories();

    const boutonAdmin = document.getElementById("btn-admin");
    if (boutonAdmin) {
      boutonAdmin.addEventListener("click", () => {
        if (window.ADMIN.authentifie) {
          const panneau = document.getElementById("admin-panneau");
          if (panneau) {
            panneau.hidden = false;
            panneau.scrollIntoView({ behavior: "smooth", block: "start" });
            document.getElementById("admin-titre")?.focus();
          } else {
            window.location.href = "catalogue.html#admin-panneau";
          }
        } else {
          effacerMessage(document.getElementById("alerte-admin-login"));
          ouvrirModale("overlay-admin-login");
          document.getElementById("admin-code")?.focus();
        }
      });
    }

    document.getElementById("form-admin-login")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alerte = document.getElementById("alerte-admin-login");
      const bouton = document.getElementById("btn-admin-connexion");
      const code = document.getElementById("admin-code").value;

      if (!code) {
        message(alerte, "Saisissez le code secret.");
        return;
      }

      bouton.disabled = true;
      bouton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Vérification…';
      try {
        await connecter(code);
        document.getElementById("admin-code").value = "";
        fermerModales();
        afficherPanneau(true);

        if (document.getElementById("admin-panneau")) {
          if (typeof window.rafraichirCatalogue === "function") window.rafraichirCatalogue();
          if (typeof notifier === "function") notifier("Connecté à l'espace admin", "fa-solid fa-check");
        } else {
          window.location.href = "catalogue.html#admin-panneau";
        }
      } catch (err) {
        message(alerte, err.message || "Connexion impossible.");
      } finally {
        bouton.disabled = false;
        bouton.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Se connecter';
      }
    });

    document.getElementById("btn-deconnexion")?.addEventListener("click", async () => {
      try {
        await deconnecter();
      } catch (err) {
        if (typeof notifier === "function") {
          notifier(err.message || "Déconnexion impossible.", "fa-solid fa-triangle-exclamation");
        }
      }
    });

    document.getElementById("admin-images")?.addEventListener("change", (e) => afficherApercu(e.target));
    document.getElementById("form-admin-produit")?.addEventListener("submit", ajouterProduit);
    document.getElementById("form-admin-titre")?.addEventListener("submit", enregistrerTitre);

    document.addEventListener("click", (e) => {
      const modifier = e.target.closest("[data-admin-modifier]");
      if (modifier) {
        ouvrirEdition(modifier.dataset.adminModifier);
        return;
      }

      const supprimer = e.target.closest("[data-admin-supprimer]");
      if (supprimer) {
        supprimerProduit(supprimer.dataset.adminSupprimer);
        return;
      }

      if (e.target.closest("[data-fermer-admin]")) fermerModales();
      const overlay = e.target.closest("#overlay-admin-login, #overlay-admin-titre");
      if (overlay && e.target === overlay) fermerModales();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fermerModales();
    });

    initialiserSession().finally(() => resoudreAdminPret());
  }

  initialiser();
})();
