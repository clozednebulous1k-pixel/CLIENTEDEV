/**
 * Frases de abordagem distintas por cliente (hash + segmento).
 * Nome fixo: Alessandro Silva Cardoso — sites e softwares (@alessandrosilvaxz_ no Instagram).
 * O segundo argumento (rowIndex) é opcional: se omitido, usa hash do nome para a frase ser
 * estável na tabela e igual à que fica guardada após «Guardar».
 */
const VENDEDOR = "Alessandro Silva Cardoso";
const VENDEDOR_INSTAGRAM = "@alessandrosilvaxz_";
/** Site de referência (estética automotiva) — incluído nas mensagens desse segmento. */
const SITE_PORTFOLIO_ESTETICA_AUTO = "https://estetica-auto-xi.vercel.app/";

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function segmento(empresa) {
  const e = String(empresa || "").toLowerCase();
  if (
    /estética automotiva|estetica automotiva|detailing|vitrificação|vitrificacao|vitrifica|polimento automot|polimento de car|cerâmica automot|ceramica automot|nano.?ceramic|coating|ppf|paint protection|envelopamento|auto spa|car care|estética auto\b|estetica auto\b|funilaria estét|funilaria estet|higieniza.*(carro|interior)|lavagem.*(premium|detalh)/i.test(
      e
    )
  ) {
    return "estetica_auto";
  }
  if (/posto|combust|gasolina|diesel|abastec/i.test(e)) return "posto";
  if (/farmácia|farmacia|drogaria|medicament|perfum/i.test(e)) return "farmacia";
  if (/restaurante|lanchonete|pizz|bar |acougue|açougue|padaria/i.test(e)) return "food";
  if (/import|export|indústria|industria|fabric|metal|aço|aco/i.test(e)) return "industria";
  if (/informática|informatica|software|sistemas|digital|telefonia|ti\b|tech/i.test(e)) return "tech";
  if (/roupa|vestuário|vestuario|biju|acess[oó]ri|moda/i.test(e)) return "moda";
  if (/construção|construcao|materiais|ferrag|madeira|gesso|obra/i.test(e)) return "obra";
  if (/máquina|maquina|equipamento|industrial|peças|pecas/i.test(e)) return "maquinas";
  if (/comércio|comercio|loja|varejo|mercado|bazar/i.test(e)) return "comercio";
  return "geral";
}

/**
 * Categoria grossa para filtros na UI (alinhado ao segmento interno).
 * @param {string} empresa
 * @returns {"estetica"|"comercio"|"outros"}
 */
function filtroCategoriaCliente(empresa) {
  const s = segmento(empresa);
  if (s === "estetica_auto") return "estetica";
  if (s === "comercio") return "comercio";
  return "outros";
}

/**
 * @param {{ empresa: string }[]} rows
 * @returns {{ estetica: number, comercio: number, outros: number }}
 */
function contarClientesPorCategoria(rows) {
  const o = { estetica: 0, comercio: 0, outros: 0 };
  if (!rows || !rows.length) return o;
  for (const r of rows) {
    const c = filtroCategoriaCliente(r.empresa);
    if (c === "estetica") o.estetica++;
    else if (c === "comercio") o.comercio++;
    else o.outros++;
  }
  return o;
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

/**
 * @param {string} empresa
 * @param {number} [rowIndex] — salt para variar; omitir = estável por nome (recomendado na UI).
 */
function gerarFraseAbordagem(empresa, rowIndex) {
  const nome = String(empresa || "a empresa").trim();
  const seg = segmento(nome);
  const idx =
    typeof rowIndex === "number" && Number.isFinite(rowIndex) ? rowIndex : hashStr(nome.toLowerCase());
  const h = hashStr(nome) + idx * 17 + seg.length * 31;
  const intro = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram), desenvolvo sites e softwares.`;

  const doresGeral = [
    `Gostaria de saber se você não tem interesse numa conversa curta, sem compromisso, sobre como fortalecer a imagem da ${nome} online?`,
    `Vi a ${nome} no Google Maps e imaginei que atrair mais contactos qualificados pode ser um desafio hoje — faz sentido falarmos uns minutos?`,
    `Muitos negócios como o da ${nome} perdem tempo a responder o mesmo tipo de pedido; um site ou um pequeno sistema costuma organizar isso. Teria interesse em ouvir uma ideia sem compromisso?`,
    `Se a ${nome} depende só do balcão ou do Instagram para vender, um canal próprio (site + WhatsApp bem integrados) costuma dar mais previsibilidade. Gostaria de saber se não tem interesse numa conversa rápida?`,
    `A presença digital da ${nome} pode estar a deixar passar clientes que procuram à noite ou ao fim-de-semana. Posso sugerir algo enxuto e ajustado ao vosso perfil — topa um bate-papo?`,
    `Trabalho com sites e software sob medida; para a ${nome}, o foco seria clareza (o que oferecem, como contactar, prova social). Faz sentido eu enviar uma proposta de escopo?`,
    `Se hoje a equipa da ${nome} faz follow-up manual ou planilhas “no improviso”, dá para ganhar horas com automações simples. Tem interesse em explorar isso?`,
    `Clientes do ramo da ${nome} costumam dizer que o gargalo é aparecer bem no Maps e depois converter a visita em mensagem. Posso mostrar exemplos — combinamos uma chamada curta?`,
    `Para a ${nome}, um site não é “só cartão”: é vitrine 24h, confiança e menos dependência de algoritmos. Gostaria de saber se não tem interesse num diagnóstico gratuito?`,
  ];

  const doresEsteticaAuto = [
    `A ${nome} vende confiança e resultado visual: um site com antes/depois, pacotes (polimento, vitrificação, PPF) e botão direto para WhatsApp costuma encher agenda. Posso sugerir um esboço inspirado no que já fiz em ${SITE_PORTFOLIO_ESTETICA_AUTO}?`,
    `Quem procura estética automotiva compara no telefone de madrugada; se a ${nome} aparecer com fotos nítidas, horário e local no Maps bem amarrados, reduz dúvida. Vale uma conversa curta? O tipo de página que monto está exemplificado em ${SITE_PORTFOLIO_ESTETICA_AUTO}.`,
    `Para a ${nome}, repetir preço e serviço só no Instagram cansa; um site próprio (portfólio + depoimentos + agendar) dá credibilidade. Quer ver referência? ${SITE_PORTFOLIO_ESTETICA_AUTO} é um projeto meu nesse ramo — combinamos 10 minutos?`,
    `Se a ${nome} quer mais orçamentos qualificados, um fluxo simples (serviços → galeria → WhatsApp) costuma funcionar melhor que só DM. Tenho caso parecido em ${SITE_PORTFOLIO_ESTETICA_AUTO}; faz sentido falarmos sem compromisso?`,
    `A impressão da ${nome} no digital precisa ser tão caprichada quanto o carro na saída do box; posso ajudar a traduzir isso num site rápido e bonito no telemóvel. Referência: ${SITE_PORTFOLIO_ESTETICA_AUTO}. Topa ouvir uma ideia?`,
  ];

  const doresComercio = [
    `A ${nome} move muita gente no dia a dia; quando o estoque ou as promoções mudam, atualizar tudo em vários canais cansa. Um site central ajuda — quer ver um esboço?`,
    `No varejo, a ${nome} compete com preço e proximidade; um site bem feito ajuda a contar a história da marca e justificar valor. Faz sentido conversarmos?`,
    `Se a ${nome} recebe perguntas repetidas no WhatsApp, dá para colocar respostas e catálogo no site e liberar a equipa. Tem interesse em ver como ficaria?`,
  ];

  const doresIndustria = [
    `Negócios como a ${nome} muitas vezes precisam de credibilidade técnica na hora de fechar B2B — site e materiais digitais ajudam nisso. Posso sugerir uma linha editorial simples?`,
    `Se a ${nome} depende de orçamentos por email, um formulário inteligente ou um portal leve costuma reduzir idas e vindas. Gostaria de saber se não tem interesse numa demo rápida?`,
    `Para a ${nome}, mostrar certificações, prazos e portfólio num só lugar costuma acelerar confiança. Topa uma conversa de 15 minutos?`,
  ];

  const doresTech = [
    `A ${nome} já vive de tecnologia; mesmo assim um site atualizado e um fluxo comercial mais “produto” ajudam a fechar projetos maiores. Faz sentido alinharmos?`,
    `Se a ${nome} quer escalar suporte ou onboarding, às vezes um software enxuto resolve mais que mais uma ferramenta genérica. Tem interesse em explorar o problema comigo?`,
  ];

  const doresObra = [
    `No ramo da ${nome}, o cliente compara muito por fotos e referências; um site com obras e áreas de atuação reduz dúvidas. Gostaria de ver um exemplo aplicado a vocês?`,
    `Orçamentos e prazos costumam ser a dor da ${nome}; um site com FAQs e formulário guiado diminui ligações repetidas. Posso mostrar uma ideia?`,
  ];

  const doresPosto = [
    `Para a ${nome}, diferenciar serviços, loja de conveniência e fidelização no digital ajuda a não competir só por preço do litro. Faz sentido falarmos?`,
  ];

  const doresFarmacia = [
    `A ${nome} lida com urgência e confiança; um site claro com horários, serviços e contacto reduz stress para o cliente. Tem interesse numa proposta enxuta?`,
  ];

  const doresFood = [
    `No setor da ${nome}, cardápio e reservas no telefone geram erro e fila; site + WhatsApp bem amarrados costumam subir avaliações. Gostaria de saber se não tem interesse numa conversa?`,
  ];

  const doresModa = [
    `Para a ${nome}, coleções mudam rápido; um site que seja fácil de atualizar (fotos, tamanhos, WhatsApp) ajuda a não perder temporada. Topa ouvir uma sugestão?`,
  ];

  const doresMaquinas = [
    `A ${nome} vende solução técnica: um site com fichas, vídeos curtos e pedido de orçamento costuma qualificar melhor o lead. Faz sentido eu montar um rascunho?`,
  ];

  const pools = {
    geral: doresGeral,
    estetica_auto: doresEsteticaAuto.concat(doresGeral),
    comercio: doresComercio.concat(doresGeral),
    industria: doresIndustria.concat(doresGeral),
    tech: doresTech.concat(doresGeral),
    obra: doresObra.concat(doresGeral),
    posto: doresPosto.concat(doresGeral),
    farmacia: doresFarmacia.concat(doresGeral),
    food: doresFood.concat(doresGeral),
    moda: doresModa.concat(doresGeral),
    maquinas: doresMaquinas.concat(doresGeral),
  };

  const pool = pools[seg] || pools.geral;
  const corpo = pick(pool, h);
  let out = intro + " " + corpo;
  if (seg === "estetica_auto" && !out.includes("estetica-auto-xi.vercel.app")) {
    out += " Referência: " + SITE_PORTFOLIO_ESTETICA_AUTO;
  }
  return out;
}
