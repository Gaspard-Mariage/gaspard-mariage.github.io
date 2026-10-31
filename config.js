// Paramètres Supabase — à remplir une seule fois (voir README).
// Supabase > Project Settings > API : "Project URL" et clé "anon public" (ou "publishable").
// Cette clé est faite pour être publique : la sécurité repose sur les règles RLS du fichier schema.sql.
window.MARIAGE_CONFIG = {
  supabaseUrl: "https://tytfzttshknbdwhkpbeu.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dGZ6dHRzaGtuYmR3aGtwYmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NTY0MzYsImV4cCI6MjEwOTAzMjQzNn0.urdXo7mQGe_mGAcCh31BoAlakoVE1Hx_Mo7rJWDgkjE"
};

window.getSupabase = function () {
  var c = window.MARIAGE_CONFIG || {};
  if (!window.supabase || !c.supabaseUrl || c.supabaseUrl.indexOf("VOTRE-PROJET") !== -1 || !c.supabaseAnonKey || c.supabaseAnonKey.indexOf("VOTRE-CLE") !== -1) {
    return null;
  }
  if (!window.__sb) window.__sb = window.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey);
  return window.__sb;
};
