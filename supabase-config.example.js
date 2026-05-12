/* Local: copia para supabase-config.js (Settings → API no Supabase).
   Vercel: nas Environment Variables usa SUPABASE_URL + SUPABASE_ANON_KEY
   (ou VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY — o build aceita os dois).
   O deploy corre "npm run vercel-build" e gera supabase-config.js; o HTML não lê VITE_ sozinho. */
window.SUPABASE_URL = "https://sb_publishable_DqKcKJirjlOrOpEFZo5xwQ_QRmNZNMj.supabase.co";window.SUPABASE_ANON_KEY = "COLOCA_AQUI_A_CHAVE_ANON_PUBLIC";
