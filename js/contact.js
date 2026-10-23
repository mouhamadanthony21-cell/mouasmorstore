/* ============================================================
   Mouasmor Store — Page contact
   ============================================================ */

(function () {
  const footerCats = document.getElementById("footer-cats");
  if (footerCats) {
    footerCats.innerHTML = CATEGORIES.map((c) =>
      `<li><a href="catalogue.html?cat=${c.slug}"><i class="fa-solid fa-angle-right"></i> ${c.nom}</a></li>`
    ).join("");
  }

  const form = document.getElementById("form-contact");
  const alerte = document.getElementById("alerte-contact");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nom = document.getElementById("cf-nom").value.trim();
    const tel = document.getElementById("cf-tel").value.trim();
    const sujet = document.getElementById("cf-sujet").value;
    const message = document.getElementById("cf-message").value.trim();

    if (!nom || !tel || !message) {
      alerte.className = "alerte err";
      alerte.textContent = "Veuillez remplir votre nom, votre téléphone et votre message.";
      return;
    }
    if (tel.replace(/\D/g, "").length < 9) {
      alerte.className = "alerte err";
      alerte.textContent = "Veuillez saisir un numéro de téléphone valide.";
      return;
    }

    const contenu =
      `Bonjour,\n\nSujet : ${sujet}\n\n${message}\n\n— ${nom}\nTél : ${tel}`;

    const urlWa = `https://wa.me/221775795356?text=${encodeURIComponent(contenu)}`;
    window.open(urlWa, "_blank", "noopener");

    alerte.className = "alerte ok";
    alerte.innerHTML = `Merci <b>${echapperHtml(nom)}</b> ! Votre message a bien été préparé et s'ouvre dans WhatsApp pour envoi. Nous vous répondrons rapidement.`;
    form.reset();
  });

  window.toggleRecherche = function () {
    const q = prompt("Rechercher un produit…");
    if (q && q.trim()) window.location.href = "catalogue.html?q=" + encodeURIComponent(q.trim());
  };
})();