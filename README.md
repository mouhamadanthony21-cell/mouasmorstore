# Mouasmor Store

Site vitrine statique pour Mouasmor Store : catalogue, fiches produits, panier et espace administrateur.

Le site n'utilise plus PHP. Les produits et les images sont gérés avec Supabase, ce qui permet un hébergement direct sur GitHub Pages.

## Fonctionnement

- `index.html`, `catalogue.html`, `produit.html`, `panier.html`, `contact.html` : pages du site.
- `js/supabase-config.js` : connexion Supabase (clé publique uniquement).
- `js/store.js` : chargement du catalogue, panier, composants communs.
- `js/admin.js` : connexion admin, ajout de produit, modification du titre, suppression, upload des images.
- `supabase/setup.sql` : table `products`, sécurité RLS, bucket `product-images`.
- `supabase/seed.sql` : migration des 25 produits actuels.

## 1. Configurer Supabase

1. Ouvrir le projet Supabase.
2. Aller dans **SQL Editor**.
3. Coller tout le contenu de `supabase/setup.sql`, puis cliquer sur **Run**.
4. Coller ensuite tout le contenu de `supabase/seed.sql`, puis cliquer sur **Run**.

Le second script ajoute les 25 produits existants. Il peut être relancé sans créer de doublons.

## 2. Créer le compte administrateur

Dans Supabase : **Authentication > Users > Add user**.

- Email : `mouhamadanthony2.1@gmail.com`
- Mot de passe : le code secret que vous utiliserez sur le site (6 caractères minimum).
- Cocher l'auto-confirmation de l'email (ou confirmer l'email depuis le dashboard).

Le site se connecte ensuite avec ce mot de passe. Il n'y a pas de second champ « code secret ».

### Paramètres d'authentification recommandés

Dans **Authentication > Providers > Email** :

- garder l'authentification par email/mot de passe activée ;
- désactiver les inscriptions publiques (**Disable signups**) ;
- garder la confirmation d'email activée si vous créez les comptes depuis le dashboard.

Les policies SQL limitent déjà l'écriture à l'email administrateur, mais désactiver les inscriptions est une sécurité supplémentaire.

## 3. Configuration du site

Le fichier `js/supabase-config.js` contient :

```js
const SUPABASE_URL = "https://iappoiabaaxuisegloim.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_...";
const ADMIN_EMAIL = "mouhamadanthony2.1@gmail.com";
const SUPABASE_BUCKET = "product-images";
```

La clé publishable peut être présente dans le navigateur. En revanche, **ne jamais mettre la clé `service_role` ou le mot de passe de la base dans le site**.

## 4. Tester en local

Le site est statique. Il ne faut pas de serveur PHP.

Avec Python :

```powershell
python -m http.server 5500
```

Puis ouvrir `http://localhost:5500`.

Il est aussi possible d'utiliser l'extension **Live Server** de VS Code. Un simple double-clic sur `index.html` fonctionne pour le catalogue, mais un serveur local est préférable pour les tests.

## 5. Utiliser l'espace admin

1. Cliquer sur l'icône clé dans la barre de navigation.
2. Saisir le mot de passe du compte admin Supabase.
3. Sur le catalogue, le panneau d'ajout apparaît.
4. Chaque carte produit propose deux boutons lorsque la session admin est active :
   - crayon : modifier le titre ;
   - corbeille : supprimer le produit et ses images Storage.

Les images sont acceptées en JPG, PNG ou WEBP, jusqu'à 5 Mo chacune. Elles sont redimensionnées à 1200 px de large maximum et envoyées dans le bucket public `product-images`.

## 6. Mettre en ligne sur GitHub Pages

1. Pousser les fichiers statiques dans le dépôt GitHub.
2. Dans **Settings > Pages**, choisir la branche et le dossier racine.
3. Ouvrir l'URL GitHub Pages.

Aucun build, aucune fonction serveur et aucun PHP ne sont nécessaires.

## 7. Notes sur la migration

- Les 25 produits du seed utilisent encore les images locales déjà présentes dans le dépôt (`img-tissus/`, `img-tissus-2/`, `img/`, `img-capilaire/`, `img-divers/`). Elles restent donc visibles sans être copiées dans Storage.
- Les nouvelles images ajoutées depuis l'admin sont envoyées dans Supabase Storage.
- La suppression d'un produit supprime uniquement les images présentes dans Storage. Les anciennes images locales ne sont pas supprimées.
- Les anciens identifiants de panier basés sur les slugs sont nettoyés automatiquement après un chargement réussi depuis Supabase.

## Dépannage

| Message | Solution |
| --- | --- |
| La table `products` n'existe pas | Exécuter `supabase/setup.sql` dans le SQL Editor. |
| Le bucket `product-images` est introuvable | Exécuter `supabase/setup.sql` et vérifier Storage. |
| Code secret incorrect | Vérifier l'utilisateur et le mot de passe dans Authentication > Users. |
| Action non autorisée | Se reconnecter avec l'email admin et vérifier les policies RLS. |
| Supabase injoignable | Vérifier la connexion internet et que le CDN supabase-js est accessible. |
| Les images ne s'affichent pas | Vérifier les chemins locaux ou que le bucket est public. |
| Page blanche après déploiement | Vérifier que GitHub Pages sert bien la racine du site et que les chemins sont relatifs. |
