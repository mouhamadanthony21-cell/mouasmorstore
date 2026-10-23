/* ============================================================
   Mouasmor Store — Configuration Supabase (navigateur)
   Seule la clé publishable est utilisée ici.
   Ne jamais ajouter de clé service_role dans ce fichier.
   ============================================================ */

const SUPABASE_URL = "https://iappoiabaaxuisegloim.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lQZmH4k7AaipseTxLwB9fg_Z9BHrrzL";
const ADMIN_EMAIL = "mouhamadanthony2.1@gmail.com";
const SUPABASE_BUCKET = "product-images";

window.supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === "function") {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );
} else {
  console.error(
    "La librairie Supabase n'a pas pu être chargée depuis le CDN. Vérifiez votre connexion."
  );
}

function supabaseDisponible() {
  return Boolean(window.supabaseClient);
}

function estEmailAdmin(email) {
  return String(email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
