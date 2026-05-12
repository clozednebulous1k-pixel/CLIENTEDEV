/**
 * Na Vercel: gera supabase-config.js a partir das Environment Variables.
 * Aceita SUPABASE_URL / SUPABASE_ANON_KEY ou VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "supabase-config.js");

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const onVercel = process.env.VERCEL === "1";

if (url && key) {
  const content =
    "/* Gerado no deploy (Vercel) — não editar no servidor */\n" +
    "window.SUPABASE_URL = " +
    JSON.stringify(url) +
    ";\n" +
    "window.SUPABASE_ANON_KEY = " +
    JSON.stringify(key) +
    ";\n";
  fs.writeFileSync(out, content, "utf8");
  console.log("supabase-config.js gerado a partir das variáveis de ambiente.");
} else if (onVercel) {
  console.warn(
    "[Vercel] Falta SUPABASE_URL e SUPABASE_ANON_KEY (ou os equivalentes VITE_*). O login não vai funcionar até configurares."
  );
  fs.writeFileSync(
    out,
    "window.SUPABASE_URL = '';\nwindow.SUPABASE_ANON_KEY = '';\n",
    "utf8"
  );
} else {
  console.log("Sem URL+key nas env: mantém-se o supabase-config.js do disco (desenvolvimento local).");
}
