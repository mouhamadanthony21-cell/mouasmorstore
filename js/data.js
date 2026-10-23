/* ============================================================
   Mouasmor Store — Catalogue produits
   Image de référence : vitrine « Mouasmor Store »
   ============================================================ */

const CATEGORIES = [
  { slug: "tissus", nom: "Tissus", icone: "tissus-1", image: "img/rayons/tissus.jpg" },
  { slug: "parfums", nom: "Parfums", icone: "parfums-1", image: "img/rayons/parfums.jpg" },
  { slug: "pommade", nom: "Pommade pour Cheveux", image: "img/rayons/pommade.jpg" },
  { slug: "divers", nom: "Divers", image: "img/rayons/divers.jpg" }
];

const PRODUITS = [
  /* ---------- TISSUS ---------- */
  {
    id: "avogan-wax",
    nom: "Avogan Wax",
    categorie: "tissus",
    prix: 10000,
    ancienPrix: null,
    note: 4.5,
    image: "img-tissus/avogan wax.jpg",
    badge: "Populaire",
    description:
      "Wax avogan célèbre pour ses motifs géométriques et ses couleurs éclatantes. Un tissage souple, d'un poids juste, qui en fait un tissu incontournable pour les boubous, les chemises et les tenues de fête.",
    details: ["100 % coton", "Motifs traditionnels", "Rouleau de 6 yards", "Couleurs grand teint"]
  },
  {
    id: "chigaviny-wax",
    nom: "Chigaviny Wax",
    categorie: "tissus",
    prix: 12500,
    ancienPrix: 14000,
    note: 4.6,
    image: "img-tissus/chigaviny wax.jpg",
    badge: "Nouveau",
    description:
      "Wax chigaviny à l'esprit raffiné, dont les motifs dégradés et les touches dorées captent la lumière. Le tissu des occasions où l'élégance se remarque de loin.",
    details: ["Tissage serré", "Fils dorés", "Rouleau de 6 yards", "Double face"]
  },
  {
    id: "popelin-perle",
    nom: "Popelin Perlé",
    categorie: "tissus",
    prix: 9500,
    ancienPrix: null,
    note: 4.4,
    image: "img-tissus/popelin perlé.jpg",
    badge: null,
    description:
      "Popelin perlé, un tissu fin, léger et brillant, reconnaissable à son grain nacré. Idéal pour les robes légères, les chemises et les doublures de haute couture.",
    details: ["Texture perlée", "Léger et fluide", "Largeur 110 cm", "3 yards"]
  },
  {
    id: "uniwax-top-gold",
    nom: "Uniwax Top Gold",
    categorie: "tissus",
    prix: 13500,
    ancienPrix: 15000,
    note: 4.7,
    image: "img-tissus/uniwax top gold.jpg",
    badge: "Premium",
    description:
      "Uniwax top gold, un wax premium aux reflets dorés et à la tenue impeccable. Le choix des couturières et des boutiques pour les tenues de cérémonie.",
    details: ["Reflets dorés", "Tenue impeccable", "Rouleau de 6 yards", "Qualité supérieure"]
  },
  {
    id: "wax-choco-gold",
    nom: "Wax Choco Gold",
    categorie: "tissus",
    prix: 11000,
    ancienPrix: null,
    note: 4.5,
    image: "img-tissus/wax choco gold.jpg",
    badge: "Cérémonie",
    description:
      "Wax choco gold aux tons chocolat et or, chaleureux et élégant. Un motif passe-partout qui convient aussi bien aux tenues du quotidien qu'aux occasions spéciales.",
    details: ["Tons chocolat et or", "Motif complet", "Rouleau de 6 yards", "Lavable à la main"]
  },
  {
    id: "wax-original-dogon",
    nom: "Wax Original Dogon",
    categorie: "tissus",
    prix: 12000,
    ancienPrix: 13500,
    note: 4.8,
    image: "img-tissus/wax original dogon.jpg",
    badge: "Best-seller",
    description:
      "Wax original dogon, inspiré des motifs dogon : figures géométriques symboliques et couleurs profondes. Un tissu d'héritage qui se transmet de génération en génération.",
    details: ["Motifs dogon", "Couleurs profondes", "Rouleau de 6 yards", "Tissage résistant"]
  },
  {
    id: "wax-satin-perlage",
    nom: "Wax Satin Perlage",
    categorie: "tissus",
    prix: 15000,
    ancienPrix: 17500,
    note: 4.9,
    image: "img-tissus/wax satin perlage.jpg",
    badge: "Premium",
    description:
      "Wax satin perlage, le plus demandé de notre sélection : un tissage satiné et un relief « perlage » qui attrape la lumière. Un rouleau de grande qualité pour vos tenues de grande occasion.",
    details: ["Tissage satiné perlage", "Rouleau de 6 yards", "Grands reflets dorés", "Qualité supérieure"]
  },
  {
    id: "wax-super-ankara",
    nom: "Wax Super Ankara",
    categorie: "tissus",
    prix: 13000,
    ancienPrix: null,
    note: 4.6,
    image: "img-tissus/wax super ankara.jpg",
    badge: "Best-seller",
    description:
      "Wax super ankara, dense et résistant, avec de grands motifs ankara qui claquent à la lumière. Le tissu idéal pour les tenues du quotidien comme pour les grands événements.",
    details: ["Tissage serré et résistant", "Grands motifs ankara", "Rouleau de 6 yards", "Belle tenue à la lumière"]
  },
  {
    id: "woodin-bleu-royal-eclat-sauvage",
    nom: "Woodin Bleu Royal - Eclat Sauvage",
    categorie: "tissus",
    prix: 14000,
    ancienPrix: 16000,
    note: 4.7,
    image: "img-tissus/woodin bleu royal - eclat sauvage.jpg",
    badge: "Premium",
    description:
      "Woodin bleu royal - éclat sauvage, un dégradé de bleu profond ponctué de touches vives. Un tissu moderne et raffiné qui met en valeur le port de la tenue.",
    details: ["Dégradé bleu royal", "Motifs éclat sauvage", "Rouleau de 6 yards", "Finition satinée"]
  },
  {
    id: "dentelles-et-voiles-brodes",
    nom: "Dentelles et Voiles Brodés",
    categorie: "tissus",
    prix: 13500,
    ancienPrix: null,
    note: 4.7,
    image: "img-tissus-2/dentelles et voiles brodés.jpg",
    badge: "Cérémonie",
    description:
      "Dentelles et voiles brodés, des pièces légères et délicates pour voiler une tenue, encadrer un visage ou signer une robe de soirée. Le lace travaillé à la main fait toute la différence.",
    details: ["Lace brodé main", "Très léger", "3 yards", "Idéal voile et tenue"]
  },
  {
    id: "eventails-de-wax-assortis",
    nom: "Eventails de Wax Assortis",
    categorie: "tissus",
    prix: 12000,
    ancienPrix: null,
    note: 4.5,
    image: "img-tissus-2/eventails de wax assortis.jpg",
    badge: "Nouveau",
    description:
      "Eventails de wax assortis, plusieurs modèles aux motifs coordonnés avec nos rouleaux de wax. L'accessoire qui finalise une tenue de fête.",
    details: ["Modèles assortis", "Manche en bois", "Grande ouverture", "Plusieurs coloris"]
  },
  {
    id: "pagne-gtp-authentic-ghana",
    nom: "Pagne GTP Authentic Ghana",
    categorie: "tissus",
    prix: 14000,
    ancienPrix: null,
    note: 4.8,
    image: "img-tissus-2/pagne gtp authentic ghana.jpg",
    badge: "Premium",
    description:
      "Pagne GTP Authentic Ghana, un pagne au tissage traditionnel ghanéen, épais et durable. La référence pour les boubous et les tenues traditionnelles d'exception.",
    details: ["Tissage traditionnel ghanéen", "Épais et durable", "Rouleau de 6 yards", "Couleurs résistantes"]
  },
  {
    id: "robes-batik-teints",
    nom: "Robes Batik Teints",
    categorie: "tissus",
    prix: 18500,
    ancienPrix: 22000,
    note: 4.9,
    image: "img-tissus-2/robes batik teints.jpg",
    badge: "Premium",
    description:
      "Robes Batik Teints, des robes déjà prêtes à porter, teintées au batik et cousues main. La solution pour être habillée sans attendre la confection.",
    details: ["Teinté au batik", "Cousu main", "Tailles M à XL", "Livraison en 48 h"]
  },
  {
    id: "super-wax-neerlandais",
    nom: "Super Wax Néerlandais",
    categorie: "tissus",
    prix: 12500,
    ancienPrix: 14000,
    note: 4.7,
    image: "img-tissus-2/super wax néerlandais.jpg",
    badge: "Best-seller",
    description:
      "Super Wax néerlandais, un wax aux motifs fins inspirés de la tradition néerlandaise, souple et facile à coudre. Très demandé pour les tenues chiques du quotidien.",
    details: ["Motifs fins", "Souple et facile à coudre", "Rouleau de 6 yards", "Tenue des couleurs"]
  },
  {
    id: "tissus-block-print-style",
    nom: "Tissus Block Print Style",
    categorie: "tissus",
    prix: 10500,
    ancienPrix: null,
    note: 4.5,
    image: "img-tissus-2/tissus block print style.jpg",
    badge: null,
    description:
      "Tissus Block Print Style, un imprimé obtenu par tampons de bois, artisanal et légèrement irrégulier. Un style naturel, très demandé pour les robes d'été.",
    details: ["Imprimé au tampon", "Artisanal", "Rouleau de 6 yards", "Légèrement irrégulier"]
  },
  {
    id: "wax-dentelle-haute-couture",
    nom: "Wax Dentelle Haute Couture",
    categorie: "tissus",
    prix: 16000,
    ancienPrix: 18000,
    note: 4.9,
    image: "img-tissus-2/wax dentelle haute couture.jpg",
    badge: "Premium",
    description:
      "Wax Dentelle Haute Couture, l'alliance du wax et de la dentelle, un tissu de podium pour les occasions qui doivent laisser une trace.",
    details: ["Wax et dentelle", "Tissage serré", "Rouleau de 6 yards", "Niveau couture"]
  },
  {
    id: "wax-golden-edition-limitee",
    nom: "Wax Golden Edition Limitée",
    categorie: "tissus",
    prix: 17000,
    ancienPrix: null,
    note: 4.8,
    image: "img-tissus-2/wax golden edition limitée.jpg",
    badge: "Best-seller",
    description:
      "Wax Golden Edition Limitée, une série limitée aux fils dorés, produite en petite quantité. Tant qu'il en reste, il n'y en aura pas deux pareils.",
    details: ["Série limitée", "Fils dorés", "Rouleau de 6 yards", "Quantités limitées"]
  },
  {
    id: "wax-haute-couture-graphique-et-abstrait",
    nom: "Wax Haute Couture Graphique et Abstrait",
    categorie: "tissus",
    prix: 15500,
    ancienPrix: 17500,
    note: 4.7,
    image: "img-tissus-2/wax haute couture graphique et abstrait.jpg",
    badge: "Cérémonie",
    description:
      "Wax Haute Couture Graphique et Abstrait, des formes graphiques fortes qui modernisent la coupe. Le choix des créatrices pour les tenues de soirée qui doivent marquer les esprits.",
    details: ["Motifs graphiques", "Tissage dense", "Rouleau de 6 yards", "Finition haut de gamme"]
  },
  {
    id: "wax-imperial-dentelle",
    nom: "Wax Imperial Dentelle",
    categorie: "tissus",
    prix: 15000,
    ancienPrix: null,
    note: 4.7,
    image: "img-tissus-2/wax imperial dentelle.jpg",
    badge: "Premium",
    description:
      "Wax Imperial Dentelle, un wax d'une densité rare orné de dentelle, lourd et somptueux. Un tissu de cérémonie, taillé pour les grands jours.",
    details: ["Densité rare", "Dentelle intégrée", "Rouleau de 6 yards", "Tissage lourd"]
  },
  {
    id: "wax-imprime-premium",
    nom: "Wax Imprimé Premium",
    categorie: "tissus",
    prix: 11500,
    ancienPrix: 13000,
    note: 4.6,
    image: "img-tissus-2/wax imprimé premium.jpg",
    badge: "Nouveau",
    description:
      "Wax Imprimé Premium, un wax aux motifs bien définis, aux couleurs franches et à la finition soignée. Un classique qui se porte toute l'année.",
    details: ["Impression nette", "Couleurs franches", "Rouleau de 6 yards", "Finition soignée"]
  },
  {
    id: "wax-prestige-floral",
    nom: "Wax Prestige Floral",
    categorie: "tissus",
    prix: 13000,
    ancienPrix: null,
    note: 4.8,
    image: "img-tissus-2/wax prestige floral.jpg",
    badge: "Best-seller",
    description:
      "Wax Prestige Floral, un imprimé floral raffiné où les fleurs s'enroulent sur un fond profond. Un tissu délicat qui met en valeur les tenues de cérémonie.",
    details: ["Imprimé floral", "Fleurs sur fond profond", "Rouleau de 6 yards", "Teintes tramées"]
  },
  {
    id: "wax-sika-imprimes-traditionnels",
    nom: "Wax Sika Imprimés Traditionnels",
    categorie: "tissus",
    prix: 13000,
    ancienPrix: 14500,
    note: 4.8,
    image: "img-tissus-2/wax sika imprimés traditionnels.jpg",
    badge: "Premium",
    description:
      "Wax Sika Imprimés Traditionnels, un wax aux motifs sika, symboliques et colorés, transmis de génération en génération. Un classique toujours très demandé.",
    details: ["Motifs sika traditionnels", "Couleurs symboliques", "Rouleau de 6 yards", "Tissage résistant"]
  },

  /* ---------- PARFUMS ---------- */
  {
    id: "parfum-exclusif",
    nom: "Nos parfums exclusifs pour homme et femme 100 ml",
    categorie: "parfums",
    prix: 3000,
    ancienPrix: null,
    note: 4.8,
    image: "img/produits/parfums-5.png",
    badge: "Nouveau",
    description:
      "Nos parfums exclusifs pour homme et femme, 100 ml. Des fragrances raffinées aux notes orientales et boisées, longue tenue, pour une allure inoubliable en toutes occasions.",
    details: ["100 ml", "Pour homme et femme", "Tenue longue durée", "Notes boisées et orientales"]
  },

  /* ---------- POMMADE ---------- */
  {
    id: "hair-growth-faster-baume-capillaire",
    nom: "Hair Growth Faster - Baume Capillaire Nourrissant & Anti-Pelliculaire",
    categorie: "pommade",
    prix: 4500,
    ancienPrix: 5500,
    note: 4.8,
    image: "img-capilaire/Hair Growth Faster - Baume Capillaire Nourrissant & Anti-Pelliculaire.jpg",
    badge: "Populaire",
    description:
      "Baume capillaire nourrissant et anti-pelliculaire qui favorise une pousse rapide et régulière. Enrichi en huiles natives et en actifs apaisants, il nourrit le cuir chevelu en profondeur, calme les irritations et redonne de l'éclat aux cheveux.",
    details: ["Nourrit et apaise le cuir chevelu", "Anti-pelliculaire", "Favorise la pousse", "Huiles natives et actifs apaisants"]
  },

  /* ---------- DIVERS ---------- */
  {
    id: "gamme-de-savons-naturels-en-gomme-en-pate-verte",
    nom: "Gamme de Savons Naturels - En Gomme & En Pâte Verte",
    categorie: "divers",
    prix: 3500,
    ancienPrix: null,
    note: 4.7,
    image: "img-divers/Gamme de Savons Naturels - En Gomme & En Pâte Verte.jpg",
    badge: "Nouveau",
    description:
      "Une gamme de savons 100 % naturels, disponible en gomme et en pâte, à la pâte verte. Formulés à l'huile végétale et à l'aloe vera, ils nettoient la peau en douceur, la protègent et respectent l'environnement.",
    details: ["100 % naturel", "En gomme et en pâte verte", "À l'huile végétale", "Convient à tous les peaux"]
  }
];

const BOUTIQUE = {
  nom: "Mouasmor Store",
  telephone: "+221 77 579 53 56",
  whatsapp: "221775795356",
  email: "mouasmorstore@gmail.com",
  adresse: "Ouest Foire, Dakar — Sénégal",
  horaires: "Lundi – Dimanche : 8h – 21h",
  slogan: "Tissus, Parfums, Pommade pour Cheveux & Divers"
};