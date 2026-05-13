/**
 * Frases de abordagem (variação por hash; estética, automotiva e arquitetura incluem links de portfólio; escritório comercial tem tom B2B).
 * Tom: convite e valor: sem falar do negócio específico do destinatário nem supor dores
 * (“perdem tempo”, “não encaixa”, etc.). O nome da empresa só influencia hash/segmento, não o texto.
 */
const VENDEDOR = "Alessandro Silva Cardoso";
const VENDEDOR_INSTAGRAM = "@alessandrosilvaxz_";
const SITE_LINEA_MOTOR = "https://estetica-auto-xi.vercel.app/";
/** Site de referência (arquitetura / design), segmento arquitetura. */
const SITE_PORTFOLIO_ARQUITETURA = "https://marina-shaffman.vercel.app/";

/**
 * Linha típica do Maps após a avaliação: «Tipo do negócio · Morada».
 * Usada com o nome da empresa para classificar estética automotiva mesmo quando o razão social diz «Comércio».
 * @param {string} block
 * @returns {string}
 */
function extractTipoGoogleMaps(block) {
  const lines = String(block || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (/^(Nenhuma avaliação|\d+[,.]\d+)/.test(lines[i])) {
      const next = lines[i + 1];
      if (!next) return "";
      const sep = " · ";
      const dot = next.indexOf(sep);
      if (dot === -1) return "";
      return next.slice(0, dot).trim();
    }
  }
  return "";
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function segmento(empresa, tipoMaps) {
  const hint = String(tipoMaps || "").trim();
  const e = (String(empresa || "").trim() + " " + hint).toLowerCase();
  if (
    /estética automotiva|estetica automotiva|centro de estética|centro de estetica|detailing|detalhamento automot|vitrificação|vitrificacao|vitrifica|polimento automot|polimento de car|polimento de veícul|polimento de veicul|cerâmica automot|ceramica automot|nano.?ceramic|coating|\bppf\b|paint protection|envelopamento|auto spa|car care|estética auto\b|estetica auto\b|funilaria estét|funilaria estet|higieniza.*(carro|veícul|veicul|interior)|lavagem.*(premium|detalh)|lava[- ]?jato.*(carro|veícul|veicul|auto)/i.test(
      e
    )
  ) {
    return "estetica_auto";
  }
  if (
    /arquitet|arquiteto|arquiteta|escritório de arquitet|escritorio de arquitet|estúdio de arquitet|estudio de arquitet|urbanismo\b|paisagismo|projeto arquitet|design de interiores|decorador de interiores/i.test(
      e
    )
  ) {
    return "arquitetura";
  }
  if (
    /oficina\s+mec|oficina\s+automot|auto\s*mec|mec[aâ]nica\s+automot|borracharia|alinhamento|balanceamento|geometria|auto[- ]?pe[cç]as|autope[cç]as|pe[cç]as\s+automot|loja\s+de\s+autope[cç]|concession|revenda\s+de\s+ve[ií]cul|venda\s+de\s+ve[ií]cul|troca\s+de\s+[oó]leo|lubrifica[cç][aã]o\s+automot|inspe[cç][aã]o\s+veicular|vistoria\s+veicular|guincho|funilaria|lava[- ]?r[aá]pido|auto\s*center|centro\s+automot|reparo\s+automot|servi[cç]o\s+automot|som\s+automot|acess[oó]rios\s+para\s+ve[ií]cul|acess[oó]rios\s+automot|\bpneu|loja\s+de\s+pneu|blindagem|martelinho|ar\s+condicionado\s+automot/i.test(
      e
    )
  ) {
    return "automotiva";
  }
  if (/posto|combust|gasolina|diesel|abastec/i.test(e)) return "posto";
  if (/farmácia|farmacia|drogaria|medicament|perfum/i.test(e)) return "farmacia";
  if (/restaurante|lanchonete|pizz|bar |acougue|açougue|padaria/i.test(e)) return "food";
  if (/import|export|indústria|industria|fabric|metal|aço|aco/i.test(e)) return "industria";
  if (/informática|informatica|software|sistemas|digital|telefonia|ti\b|tech/i.test(e)) return "tech";
  if (/roupa|vestuário|vestuario|biju|acess[oó]ri|moda/i.test(e)) return "moda";
  if (/construção|construcao|materiais|ferrag|madeira|gesso|obra/i.test(e)) return "obra";
  if (/máquina|maquina|equipamento|industrial|peças|pecas/i.test(e)) return "maquinas";
  if (
    /escritório\s+comercial|escritorio\s+comercial|escritório\s+de\s+advoc|escritorio\s+de\s+advoc|escritório\s+contábil|escritorio\s+contabil|escritório\s+de\s+contab|contabilidade\b|\bcontadores?\b|\bcontadora\b|escritório\s+de\s+contadores|advocacia|\badvogad|escritório\s+jur[ií]dic|assessoria\s+empresarial|consultoria\s+empresarial|consultoria\s+em\s+gest(ão|ao)|consultoria\s+contábil|consultoria\s+contabil|corretora\s+de\s+seguros|corretor\s+de\s+seguros|\bdespachante\b/i.test(
      e
    )
  ) {
    return "escritorio_comercial";
  }
  if (/comércio|comercio|loja|varejo|mercado|bazar/i.test(e)) return "comercio";
  return "geral";
}

/**
 * Categoria grossa para filtros na UI (alinhado ao segmento interno).
 * @param {string} empresa
 * @param {string} [tipoMaps] texto do Maps após a avaliação (ex.: «Estética automotiva»).
 * @returns {"estetica"|"arquitetura"|"automotiva"|"escritorio"|"comercio"|"outros"}
 */
function filtroCategoriaCliente(empresa, tipoMaps) {
  const s = segmento(empresa, tipoMaps);
  if (s === "estetica_auto") return "estetica";
  if (s === "arquitetura") return "arquitetura";
  if (s === "automotiva") return "automotiva";
  if (s === "escritorio_comercial") return "escritorio";
  if (s === "comercio") return "comercio";
  return "outros";
}

/**
 * @param {{ empresa: string, tipoMaps?: string }[]} rows
 * @returns {{ estetica: number, arquitetura: number, automotiva: number, escritorio: number, comercio: number, outros: number }}
 */
function contarClientesPorCategoria(rows) {
  const o = { estetica: 0, arquitetura: 0, automotiva: 0, escritorio: 0, comercio: 0, outros: 0 };
  if (!rows || !rows.length) return o;
  for (const r of rows) {
    const c = filtroCategoriaCliente(r.empresa, r.tipoMaps);
    if (c === "estetica") o.estetica++;
    else if (c === "arquitetura") o.arquitetura++;
    else if (c === "automotiva") o.automotiva++;
    else if (c === "escritorio") o.escritorio++;
    else if (c === "comercio") o.comercio++;
    else o.outros++;
  }
  return o;
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

/**
 * @param {string} empresa Nome da linha; só influencia hash/segmento, não entra no texto gerado.
 * @param {number} [rowIndex] Salt opcional; omitir = estável por nome (igual ao «Guardar»).
 * @param {string} [tipoMaps] Categoria do Google Maps (ex.: «Estética automotiva»), ver `extractTipoGoogleMaps`.
 */
function gerarFraseAbordagem(empresa, rowIndex, tipoMaps) {
  const chave = String(empresa || "").trim();
  const seg = segmento(chave, tipoMaps);
  const idx =
    typeof rowIndex === "number" && Number.isFinite(rowIndex) ? rowIndex : hashStr(chave.toLowerCase());
  const h = hashStr(chave) + idx * 17 + seg.length * 31;
  const introGeral = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites e software sob medida: o foco é impulsionar resultados com digital feito à maneira de quem me contrata. Ouço a ideia, desenho em conjunto e entrego do jeito que combinarmos, com margem para ir afinando até ficar redondo.`;

  const introEstetica = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Trabalho com sites sob medida para estética automotiva e detailing. Há um exemplo online para verem o ritmo e o visual: ${SITE_LINEA_MOTOR} (projeto Linea Motor).`;

  const introArquitetura = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites sob medida para gabinetes de arquitetura, paisagismo e design de interiores. Há um exemplo publicado de um projeto que desenvolvi para uma arquiteta: ${SITE_PORTFOLIO_ARQUITETURA} (Marina Schaffman, São Paulo).`;

  const introAutomotiva = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites sob medida para oficinas, autopeças, pneus, mecânica e outros serviços ligados a veículos. Para verem ritmo e apresentação num caso publicado neste universo: ${SITE_LINEA_MOTOR} (Linea Motor). Horários, serviços, WhatsApp e contacto claros no telemóvel.`;

  const introEscritorioComercial = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites sob medida para escritórios e serviços B2B: contabilidade, advocacia, consultoria, corretagem e equipas pequenas que precisam de presença online séria — áreas de atuação, equipa, formulários e contacto claros, com leitura confortável no telemóvel.`;

  const intro =
    seg === "estetica_auto"
      ? introEstetica
      : seg === "arquitetura"
        ? introArquitetura
        : seg === "automotiva"
          ? introAutomotiva
          : seg === "escritorio_comercial"
            ? introEscritorioComercial
            : introGeral;

  const corposGeral = [
    `Seria possível marcarem uma conversa curta, sem compromisso, só para ver se faz sentido falarmos num site ou num software alinhado ao que imaginam?`,
    `Se estiverem abertos a explorar essa possibilidade, posso explicar em poucos minutos como costumo montar projetos à medida e que tipo de resultado costumo entregar.`,
    `Gosto de trabalhar em parceria: primeiro percebo a visão de vocês, depois proponho o caminho técnico (site, portal ou ferramenta), sempre com espaço para ajustes ao longo do projeto.`,
    `Posso combinar uma chamada rápida para alinharmos expectativas e, se fizer sentido para os dois lados, seguir com uma proposta clara em escopo e prazo.`,
    `O que me motiva é construir algo que vocês sintam “nosso”: identidade, textos e fluxos pensados em conjunto, em vez de um modelo genérico aplicado por cima.`,
    `Se quiserem dar o próximo passo no digital com algo pensado à medida, estou disponível para uma primeira conversa, sem custo para essa etapa inicial.`,
    `Trabalho com entregas em fases, com protótipo cedo e feedback frequente, para vocês irem vendo o material a tomar forma com calma.`,
    `Posso ajudar a pensar numa vitrine online, integrações (por exemplo com WhatsApp) ou pequenas automações, sempre com transparência sobre o que entra em cada fase.`,
    `Resumo do meu lado: escuta, proposta alinhada ao que combinarmos, e código/documentação organizados para vocês poderem evoluir com tranquilidade mais tarde.`,
    `Se fizer sentido, envio disponibilidade para uma chamada de voz ou vídeo. O objetivo é só perceber se há encaixe e como poderia contribuir com site ou software sob medida.`,
    `Valorizo flexibilidade: ajustamos prioridades e detalhes até o resultado ficar confortável para quem vai usar no dia a dia.`,
    `Fico à disposição para apresentar referências de trabalho e explicar como costumo estruturar um projeto à medida, se quiserem conhecer melhor o processo.`,
  ];

  const corposEstetica = [
    `Se fizer sentido, combino uns minutos por chamada para perceber o que imaginam para o site: galeria, serviços, WhatsApp e identidade visual adaptados ao projeto. O link acima (${SITE_LINEA_MOTOR}) mostra o tipo de navegação e apresentação que costumo montar.`,
    `Posso desenhar uma vitrine digital à medida (pacotes, antes/depois, marca) sem depender de template genérico. Para verem o resultado num caso real: ${SITE_LINEA_MOTOR}.`,
    `Para polimento, vitrificação, PPF ou envelopamento, um site rápido no telemóvel e bem organizado costuma ser um bom canal. O exemplo Linea Motor está em ${SITE_LINEA_MOTOR}. Topam uma conversa curta?`,
    `Entrego em fases com protótipo cedo, para irem validando textos e secções. Referência de layout e ritmo na mesma linha do que vos interessa: ${SITE_LINEA_MOTOR}.`,
    `Se quiserem explorar a ideia sem compromisso, envio disponibilidade ou respondo a dúvidas por aqui. O site de exemplo continua disponível em ${SITE_LINEA_MOTOR}.`,
    `Resumo: site sob medida para este segmento, com foco em clareza e imagem. Podem navegar em ${SITE_LINEA_MOTOR} e, se gostarem do tom, falamos no que mudaríamos para o vosso caso.`,
  ];

  const corposArquitetura = [
    `Posso estruturar um site com galeria de projetos, áreas de atuação e contacto direto (por exemplo WhatsApp), pensado para leitura rápida no telemóvel. Para verem o tipo de apresentação e ritmo que costumo entregar neste setor: ${SITE_PORTFOLIO_ARQUITETURA}.`,
    `Se fizer sentido, combino uma chamada curta para alinharmos que secções fariam mais diferença no ar: obras, concursos, equipa, publicações. O link acima (${SITE_PORTFOLIO_ARQUITETURA}) mostra um caso real.`,
    `Trabalho com entregas em fases e protótipo cedo, para irem validando textos e imagens à medida que o site ganha forma. Referência visual no mesmo espírito: ${SITE_PORTFOLIO_ARQUITETURA}.`,
    `Também consigo ajudar com formulários simples (contacto, candidaturas) ou integrações leves. Exemplo de site completo nesta linha: ${SITE_PORTFOLIO_ARQUITETURA}.`,
    `Fico à disposição para mostrar referências e explicar o processo. Podem navegar em ${SITE_PORTFOLIO_ARQUITETURA} e, se o tom servir de base, falamos no que adaptaríamos ao vosso gabinete.`,
  ];

  const corposAutomotiva = [
    `Posso montar uma página com lista de serviços, marca, morada e botão de WhatsApp, pensada para quem procura oficina ou peças no telemóvel. O link acima (${SITE_LINEA_MOTOR}) mostra o tipo de navegação e clareza que costumo buscar em projetos automotivos.`,
    `Também consigo organizar secções por tipo de serviço (mecânica, elétrica, pneus, revisão) e atualizar com calma. Referência visual publicada: ${SITE_LINEA_MOTOR}.`,
    `Trabalho em fases com protótipo cedo, para validarem textos e fotos antes de publicar. Podem ver o exemplo Linea Motor em ${SITE_LINEA_MOTOR} e imaginar a estrutura adaptada ao vosso negócio.`,
    `Se quiserem explorar sem compromisso, envio disponibilidade ou respondo por aqui. O site de exemplo continua em ${SITE_LINEA_MOTOR}.`,
    `Fico à disposição para explicar prazos e etapas. Para inspiração no tom do site: ${SITE_LINEA_MOTOR}.`,
  ];

  const corposEscritorioComercial = [
    `Se fizer sentido, combino uma chamada curta para perceber que secções fariam mais diferença no ar: serviços, equipa, publicações, formulário de contacto ou marcação. Entrego em fases, com protótipo cedo e revisões ao longo do projeto.`,
    `Posso estruturar páginas por área de prática ou por tipo de cliente, com textos claros e hierarquia fácil de ler no telemóvel — sem depender de template genérico que não reflete o tom do escritório.`,
    `Também consigo integrar WhatsApp, mapa e links úteis (OAB, CRC, redes) de forma organizada, para quem chega pelo Google ou por indicação encontrar logo o que precisa.`,
    `Trabalho com margem para afinar conteúdo e detalhes até o site ficar confortável para quem responde contactos no dia a dia. Se quiserem explorar sem compromisso, envio disponibilidade ou respondo por aqui.`,
    `Resumo do meu lado: escuta, proposta alinhada ao que combinarmos, e código organizado para poderem evoluir com calma. Fico à disposição para uma primeira conversa.`,
  ];

  const pools = {
    geral: corposGeral,
    estetica_auto: corposEstetica.concat(corposGeral),
    arquitetura: corposArquitetura.concat(corposGeral),
    automotiva: corposAutomotiva.concat(corposGeral),
    escritorio_comercial: corposEscritorioComercial.concat(corposGeral),
    comercio: corposGeral,
    industria: corposGeral,
    tech: corposGeral,
    obra: corposGeral,
    posto: corposGeral,
    farmacia: corposGeral,
    food: corposGeral,
    moda: corposGeral,
    maquinas: corposGeral,
  };

  const pool = pools[seg] || pools.geral;
  const corpo = pick(pool, h);
  let out = intro + " " + corpo;
  if (seg === "estetica_auto" && !out.includes("estetica-auto-xi.vercel.app")) {
    out += " Exemplo neste segmento: " + SITE_LINEA_MOTOR;
  }
  if (seg === "automotiva" && !out.includes("estetica-auto-xi.vercel.app")) {
    out += " Exemplo de site (universo automotivo): " + SITE_LINEA_MOTOR;
  }
  if (seg === "arquitetura" && !out.includes("marina-shaffman.vercel.app")) {
    out += " Referência de portfólio (arquitetura): " + SITE_PORTFOLIO_ARQUITETURA;
  }
  return out;
}

/** Rótulo curto para pills e filtros (UI). */
function labelCategoriaCliente(cat) {
  if (cat === "estetica") return "Estética";
  if (cat === "arquitetura") return "Arquitetura";
  if (cat === "automotiva") return "Automotiva";
  if (cat === "escritorio") return "Escritório comercial";
  if (cat === "comercio") return "Comércio";
  return "Outros";
}

/** Linha de resumo após `contarClientesPorCategoria`. */
function resumoContagemCategorias(c) {
  if (!c) return "";
  return (
    " · Categorias: estética " +
    (c.estetica ?? 0) +
    ", arquitetura " +
    (c.arquitetura ?? 0) +
    ", automotiva " +
    (c.automotiva ?? 0) +
    ", escritório comercial " +
    (c.escritorio ?? 0) +
    ", comércio " +
    (c.comercio ?? 0) +
    ", outros " +
    (c.outros ?? 0)
  );
}
