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
  const introGeral = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites e software sob medida, com foco em resultado no digital do jeito de quem contrata. Ouço a ideia, monto junto com vocês e entrego como combinado, com espaço pra ir afinando até ficar redondo.`;

  const introEstetica = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Trabalho com sites sob medida pra estética automotiva e detailing. Tem um exemplo online pra vocês verem o ritmo e o visual: ${SITE_LINEA_MOTOR} (projeto Linea Motor).`;

  const introArquitetura = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites sob medida pra escritórios de arquitetura, paisagismo e design de interiores. Tem exemplo publicado de um projeto que fiz pra uma arquiteta: ${SITE_PORTFOLIO_ARQUITETURA} (Marina Schaffman, São Paulo).`;

  const introAutomotiva = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites sob medida pra oficinas, autopeças, pneus, mecânica e o que for ligado a carro. Pra vocês verem ritmo e apresentação num caso publicado nessa linha: ${SITE_LINEA_MOTOR} (Linea Motor). Horário, serviço, WhatsApp e contato bem claros no celular.`;

  const introEscritorioComercial = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Faço sites sob medida pra escritório e serviço B2B: contabilidade, advocacia, consultoria, corretagem e equipe pequena que precisa de presença online séria, com área de atuação, quem é a equipe, formulário e contato fácil de achar, tudo legível no celular.`;

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
    `Dá pra marcar uma conversa curta, sem compromisso, só pra ver se faz sentido a gente falar de site ou de software no ritmo de vocês?`,
    `Se vocês estiverem abertos a explorar a ideia, explico em poucos minutos como costumo montar projeto sob medida e que tipo de resultado costumo entregar.`,
    `Gosto de trabalhar junto: primeiro entendo a linha de vocês, depois proponho o caminho técnico (site, portal ou ferramenta), sempre com espaço pra ajuste ao longo do projeto.`,
    `Posso combinar uma ligação rápida pra alinhar expectativa e, se fizer sentido pros dois lados, seguir com proposta clara de escopo e prazo.`,
    `O que me move é entregar algo que vocês sintam de vocês: identidade, texto e fluxo pensados junto, não modelo genérico jogado em cima.`,
    `Se quiserem dar o próximo passo no digital com algo sob medida, estou disponível pra uma primeira conversa, sem custo nessa etapa inicial.`,
    `Trabalho com entrega em fases, protótipo cedo e retorno frequente, pra vocês irem vendo o material tomando forma com calma.`,
    `Posso ajudar a pensar vitrine online, integração (tipo WhatsApp) ou automação pequena, sempre dizendo o que entra em cada fase.`,
    `Resumo: escuto, proponho alinhado ao que a gente combinar, e deixo código e documentação organizados pra vocês evoluírem com tranquilidade depois.`,
    `Se fizer sentido, mando horário pra chamada de voz ou vídeo. É só pra ver se tem encaixe e como posso ajudar com site ou software sob medida.`,
    `Prezo flexibilidade: a gente vai ajustando prioridade e detalhe até ficar confortável pra quem usa no dia a dia.`,
    `Estou à disposição pra mostrar referência de trabalho e explicar como costumo estruturar projeto sob medida, se vocês quiserem conhecer o processo.`,
  ];

  const corposEstetica = [
    `Se fizer sentido, combino uns minutos por chamada pra entender o que vocês imaginam pro site: galeria, serviço, WhatsApp e identidade visual no projeto. O link acima (${SITE_LINEA_MOTOR}) mostra o tipo de navegação e apresentação que costumo montar.`,
    `Posso desenhar vitrine digital sob medida (pacote, antes/depois, marca) sem depender de template genérico. Pra ver o resultado num caso real: ${SITE_LINEA_MOTOR}.`,
    `Pra polimento, vitrificação, PPF ou envelopamento, um site rápido no celular e bem organizado costuma ajudar. O exemplo Linea Motor tá em ${SITE_LINEA_MOTOR}. Topam uma conversa curta?`,
    `Entrego em fases com protótipo cedo, pra vocês irem validando texto e seção. Referência de layout e ritmo na mesma linha do que interessa pra vocês: ${SITE_LINEA_MOTOR}.`,
    `Se quiserem explorar a ideia sem compromisso, mando horário ou respondo dúvida por aqui. O site de exemplo continua em ${SITE_LINEA_MOTOR}.`,
    `Resumo: site sob medida pra esse segmento, com foco em clareza e imagem. Vocês podem navegar em ${SITE_LINEA_MOTOR} e, se curtirem o tom, falamos no que mudar pro caso de vocês.`,
  ];

  const corposArquitetura = [
    `Posso estruturar site com galeria de projeto, área de atuação e contato direto (tipo WhatsApp), pensado pra leitura rápida no celular. Pra vocês verem o tipo de apresentação e ritmo que costumo entregar nesse setor: ${SITE_PORTFOLIO_ARQUITETURA}.`,
    `Se fizer sentido, combino chamada curta pra alinhar que seção faria mais diferença no ar: obra, concurso, equipe, publicação. O link acima (${SITE_PORTFOLIO_ARQUITETURA}) mostra um caso real.`,
    `Trabalho com entrega em fases e protótipo cedo, pra vocês irem validando texto e imagem enquanto o site ganha forma. Referência visual no mesmo espírito: ${SITE_PORTFOLIO_ARQUITETURA}.`,
    `Também consigo formulário simples (contato, candidatura) ou integração leve. Exemplo de site completo nessa linha: ${SITE_PORTFOLIO_ARQUITETURA}.`,
    `Estou à disposição pra mostrar referência e explicar o processo. Vocês podem navegar em ${SITE_PORTFOLIO_ARQUITETURA} e, se o tom servir de base, falamos no que adaptar pro escritório de vocês.`,
  ];

  const corposAutomotiva = [
    `Posso montar página com lista de serviço, marca, endereço e botão de WhatsApp, pensada pra quem busca oficina ou peça no celular. O link acima (${SITE_LINEA_MOTOR}) mostra o tipo de navegação e clareza que costumo buscar em projeto automotivo.`,
    `Também consigo organizar seção por tipo de serviço (mecânica, elétrica, pneu, revisão) e ir atualizando com calma. Referência visual publicada: ${SITE_LINEA_MOTOR}.`,
    `Trabalho em fases com protótipo cedo, pra vocês validarem texto e foto antes de publicar. Vocês podem ver o exemplo Linea Motor em ${SITE_LINEA_MOTOR} e imaginar a estrutura adaptada ao negócio de vocês.`,
    `Se quiserem explorar sem compromisso, mando horário ou respondo por aqui. O site de exemplo continua em ${SITE_LINEA_MOTOR}.`,
    `Estou à disposição pra explicar prazo e etapa. Pra inspiração no tom do site: ${SITE_LINEA_MOTOR}.`,
  ];

  const corposEscritorioComercial = [
    `Se fizer sentido, combino chamada curta pra entender que seção faria mais diferença no ar: serviço, equipe, publicação, formulário de contato ou agendamento. Entrego em fases, com protótipo cedo e revisão ao longo do projeto.`,
    `Posso estruturar página por área de prática ou por tipo de cliente, com texto claro e hierarquia fácil de ler no celular, sem depender de template genérico que não reflete o tom do escritório.`,
    `Também consigo integrar WhatsApp, mapa e link útil (OAB, CRC, rede social) de forma organizada, pra quem chega pelo Google ou por indicação achar logo o que precisa.`,
    `Trabalho com margem pra afinar conteúdo e detalhe até o site ficar confortável pra quem responde contato no dia a dia. Se quiserem explorar sem compromisso, mando horário ou respondo por aqui.`,
    `Resumo: escuto, proponho alinhado ao que a gente combinar, e deixo código organizado pra vocês evoluírem com calma. Estou à disposição pra uma primeira conversa.`,
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
