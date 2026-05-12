/**
 * Login: email + senha (signInWithPassword) ou link mágico.
 * Push/pull da tabela map_clientes. Rows: { empresa, phones }.
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
  const passIn = root.querySelector('[data-sb="password"]');
  const btnSignin = root.querySelector('[data-sb="signin"]');
  const btnMagic = root.querySelector('[data-sb="magic"]');
  const btnOut = root.querySelector('[data-sb="out"]');
  const btnPush = root.querySelector('[data-sb="push"]');
  const btnPull = root.querySelector('[data-sb="pull"]');

  if (!url || !key || /SEU-PROJETO|COLOCA_AQUI/i.test(url + key)) {
    root.hidden = false;
    setCloudMsg("Configura supabase-config.js (URL + anon key). Vê supabase/schema.sql.");
    ;[btnSignin, btnMagic, btnOut, btnPush, btnPull].forEach((b) => {
      if (b) b.disabled = true;
    });
    if (emailIn) emailIn.disabled = true;
    if (passIn) passIn.disabled = true;
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

  function dbToRows(list) {
    return (list || []).map((row) => {
      const t = (row.telefone || "").trim();
      const phones =
        !t || t === "—" ? [] : t.split(/\s*;\s*/).map((x) => x.trim()).filter(Boolean);
      return { empresa: row.empresa, phones };
    });
  }

  /**
   * O PostgreSQL recusa um único upsert que toca na mesma linha duas vezes (constraint user_id+empresa).
   * Agrupa por nome normalizado e junta telefones.
   */
  function rowsToUpsertPayload(rows, uid, preserve) {
    const byKey = new Map();
    for (const r of rows) {
      const empresa = String(r.empresa || "").trim();
      if (!empresa) continue;
      const k = empresa.toLowerCase();
      const telParts =
        r.phones && r.phones.length
          ? r.phones.map((x) => String(x).trim()).filter(Boolean)
          : [];
      if (!byKey.has(k)) {
        byKey.set(k, { empresa, telSet: new Set(telParts) });
      } else {
        const ent = byKey.get(k);
        if (empresa.length > ent.empresa.length) ent.empresa = empresa;
        telParts.forEach((t) => ent.telSet.add(t));
      }
    }
    const out = [];
    for (const [k, ent] of byKey) {
      const tels = [...ent.telSet];
      out.push({
        user_id: uid,
        empresa: ent.empresa,
        telefone: tels.length ? tels.join("; ") : "—",
        updated_at: new Date().toISOString(),
        contatado_em: preserve[k] !== undefined ? preserve[k] : null,
      });
    }
    return out;
  }

  function refreshAuthUi(session) {
    const inAuth = !!session;
    if (btnOut) btnOut.hidden = !inAuth;
    if (btnPush) btnPush.hidden = !inAuth;
    if (btnPull) btnPull.hidden = !inAuth;
    /* Email/senha/Entrar ficam sempre clicáveis (evita sessão antiga ou extensão a “bloquear” o login). */
    if (btnMagic) btnMagic.disabled = false;
  }

  sb.auth.onAuthStateChange((_ev, session) => {
    refreshAuthUi(session);
    if (session) setCloudMsg("Sessão ativa.");
    else setCloudMsg("Sem sessão. Entra com email e senha ou pede o link no email.");
  });

  const { data: sess0 } = await sb.auth.getSession();
  refreshAuthUi(sess0 && sess0.session);

  if (btnSignin && emailIn && passIn) {
    btnSignin.addEventListener("click", async () => {
      const email = emailIn.value.trim();
      const password = passIn.value;
      if (!email || !password) {
        setCloudMsg("Preenche email e senha (utilizador criado no Supabase → Authentication).");
        return;
      }
      setCloudMsg("A entrar…");
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setCloudMsg(error.message || "Falha no login. Confirma o email e a senha no dashboard.");
        return;
      }
      setCloudMsg("Sessão iniciada.");
    });
    passIn.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") btnSignin.click();
    });
  }

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
        setCloudMsg("Entra primeiro (email e senha ou link mágico).");
        return;
      }
      const uid = sess.session.user.id;
      const rows = getRows() || [];
      if (!rows.length) {
        setCloudMsg("Não há linhas na tabela para enviar.");
        return;
      }
      setCloudMsg("A mesclar na nuvem (sem duplicar por nome)…");
      const { data: existing, error: exErr } = await sb
        .from("map_clientes")
        .select("empresa, contatado_em")
        .eq("user_id", uid);
      if (exErr) {
        setCloudMsg(exErr.message || "Erro ao ler estado de contacto.");
        return;
      }
      const preserve = {};
      (existing || []).forEach((r) => {
        preserve[(r.empresa || "").trim().toLowerCase()] = r.contatado_em;
      });
      const payload = rowsToUpsertPayload(rows, uid, preserve);
      if (!payload.length) {
        setCloudMsg("Não há linhas com nome de empresa para enviar.");
        return;
      }
      const { error: upErr } = await sb.from("map_clientes").upsert(payload, {
        onConflict: "user_id,empresa",
      });
      if (upErr) {
        setCloudMsg(
          upErr.message ||
            "Erro ao guardar. Corre o SQL completo em supabase/schema.sql (coluna contatado_em e políticas)."
        );
        return;
      }
      let msg =
        "Lista mesclada na nuvem (" +
        payload.length +
        " linha(s)). Quem já tinhas marcado como contactado mantém-se.";
      if (payload.length < rows.length) {
        msg +=
          " Agrupámos " +
          (rows.length - payload.length) +
          " entrada(s) com o mesmo nome (evita erro do PostgreSQL no upsert).";
      }
      setCloudMsg(msg);
    });
  }

  if (btnPull) {
    btnPull.addEventListener("click", async () => {
      const { data: sess, error: e1 } = await sb.auth.getSession();
      if (e1 || !sess || !sess.session) {
        setCloudMsg("Entra primeiro (email e senha ou link mágico).");
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
