/**
 * Painel mínimo: magic link + push/pull da tabela map_clientes.
 * Espera rows no formato { empresa: string, phones: string[] }.
 */
export async function bindSupabaseMapClientes(opts) {
  const url = opts.url && String(opts.url).trim();
  const key = opts.key && String(opts.key).trim();
  const root = opts.rootEl;
  const getRows = opts.getRows;
  const applyRows = opts.applyRows;
  const setCloudMsg = opts.setCloudMsg || (() => {});

  if (!root || typeof getRows !== "function" || typeof applyRows !== "function") return;

  const emailIn = root.querySelector('[data-sb="email"]');
  const btnMagic = root.querySelector('[data-sb="magic"]');
  const btnOut = root.querySelector('[data-sb="out"]');
  const btnPush = root.querySelector('[data-sb="push"]');
  const btnPull = root.querySelector('[data-sb="pull"]');

  if (!url || !key || /SEU-PROJETO|COLOCA_AQUI/i.test(url + key)) {
    root.hidden = false;
    setCloudMsg("Configura supabase-config.js (URL + anon key). Vê supabase/schema.sql.");
    ;[btnMagic, btnOut, btnPush, btnPull].forEach((b) => {
      if (b) b.disabled = true;
    });
    return;
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const sb = createClient(url, key, {
    auth: {
      persistSession: true,
      storage: localStorage,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  function rowsToDb(userId, rows) {
    return rows.map((r) => ({
      user_id: userId,
      empresa: r.empresa,
      telefone: r.phones && r.phones.length ? r.phones.join("; ") : "—",
      updated_at: new Date().toISOString(),
    }));
  }

  function dbToRows(list) {
    return (list || []).map((row) => {
      const t = (row.telefone || "").trim();
      const phones =
        !t || t === "—" ? [] : t.split(/\s*;\s*/).map((x) => x.trim()).filter(Boolean);
      return { empresa: row.empresa, phones };
    });
  }

  function refreshAuthUi(session) {
    const inAuth = !!session;
    if (btnOut) btnOut.hidden = !inAuth;
    if (btnPush) btnPush.hidden = !inAuth;
    if (btnPull) btnPull.hidden = !inAuth;
    if (emailIn) emailIn.disabled = inAuth;
    if (btnMagic) btnMagic.disabled = inAuth;
  }

  sb.auth.onAuthStateChange((_ev, session) => {
    refreshAuthUi(session);
    if (session) setCloudMsg("Sessão ativa.");
    else setCloudMsg("Sem sessão. Pede o link mágico no email.");
  });

  const { data: sess0 } = await sb.auth.getSession();
  refreshAuthUi(sess0 && sess0.session);

  if (btnMagic && emailIn) {
    btnMagic.addEventListener("click", async () => {
      const email = emailIn.value.trim();
      if (!email) {
        setCloudMsg("Escreve o email.");
        return;
      }
      setCloudMsg("A enviar…");
      const redirect = window.location.href.split("#")[0];
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      if (error) {
        setCloudMsg(error.message || "Erro ao enviar email.");
        return;
      }
      setCloudMsg("Abre o link que te enviámos por email (e confirma o redirect no dashboard Supabase).");
    });
  }

  if (btnOut) {
    btnOut.addEventListener("click", async () => {
      await sb.auth.signOut();
      setCloudMsg("Saíste.");
    });
  }

  if (btnPush) {
    btnPush.addEventListener("click", async () => {
      const { data: sess, error: e1 } = await sb.auth.getSession();
      if (e1 || !sess || !sess.session) {
        setCloudMsg("Entra primeiro (link mágico).");
        return;
      }
      const uid = sess.session.user.id;
      const rows = getRows() || [];
      if (!rows.length) {
        setCloudMsg("Não há linhas na tabela para enviar.");
        return;
      }
      setCloudMsg("A substituir lista na nuvem…");
      const { error: delErr } = await sb.from("map_clientes").delete().eq("user_id", uid);
      if (delErr) {
        setCloudMsg(delErr.message || "Erro ao limpar nuvem.");
        return;
      }
      const payload = rowsToDb(uid, rows);
      const { error: insErr } = await sb.from("map_clientes").insert(payload);
      if (insErr) {
        setCloudMsg(insErr.message || "Erro ao inserir.");
        return;
      }
      setCloudMsg("Lista guardada na nuvem (" + rows.length + " linhas).");
    });
  }

  if (btnPull) {
    btnPull.addEventListener("click", async () => {
      const { data: sess, error: e1 } = await sb.auth.getSession();
      if (e1 || !sess || !sess.session) {
        setCloudMsg("Entra primeiro (link mágico).");
        return;
      }
      const uid = sess.session.user.id;
      setCloudMsg("A carregar…");
      const { data, error } = await sb
        .from("map_clientes")
        .select("empresa, telefone")
        .eq("user_id", uid)
        .order("empresa", { ascending: true });
      if (error) {
        setCloudMsg(error.message || "Erro ao ler.");
        return;
      }
      const rows = dbToRows(data);
      applyRows(rows);
      setCloudMsg("Lista trazida da nuvem (" + rows.length + " linhas).");
    });
  }
}
