/**
 * Frases de abordagem (variação por hash + segmento só para escolher tom / link estética).
 * Não mencionamos o negócio específico do destinatário: foco em impulsionar com site/software
 * sob medida e no diferencial de entregar do jeito que o cliente quer.
 */
const VENDEDOR = "Alessandro Silva Cardoso";
const VENDEDOR_INSTAGRAM = "@alessandrosilvaxz_";
/** Site de referência (estética automotiva) — só no bloco desse segmento. */
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
 * Para novas categorias: acrescenta ramos aqui (e, se precisares, novos `return` em `segmento()`).
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
 * @param {string} empresa — só serve para variar a frase e para o segmento (ex. link estética); não entra no texto.
 * @param {number} [rowIndex] — salt opcional; omitir = estável por nome (igual ao «Guardar»).
 */
function gerarFraseAbordagem(empresa, rowIndex) {
  const chave = String(empresa || "").trim();
  const seg = segmento(chave);
  const idx =
    typeof rowIndex === "number" && Number.isFinite(rowIndex) ? rowIndex : hashStr(chave.toLowerCase());
  const h = hashStr(chave) + idx * 17 + seg.length * 31;
  const intro = `Olá, meu nome é ${VENDEDOR} (${VENDEDOR_INSTAGRAM} no Instagram). Trabalho com sites e software sob medida para quem quer impulsionar o negócio com presença digital forte — sem solução “de prateleira”. O meu diferencial é alinhar tudo com o que vocês realmente precisam: ouço primeiro, desenho fluxos e ecrãs a partir da forma como trabalham, e entrego o site ou o software do jeito que imaginam — com espaço para ajustar até ficar confortável para a equipa.`;

  const corposGeral = [
    `Seria possível uma conversa curta, sem compromisso, só para ver se faz sentido falarmos em site ou software para dar mais fôlego ao negócio de vocês?`,
    `Estou a falar com equipas que queiram explorar se um site ou uma pequena ferramenta à medida podem trazer mais organização, credibilidade e vendas — topam 10 minutos sem obrigação?`,
    `Muita gente sente que está a perder tempo com processos manuais ou com ferramentas que não encaixam no dia a dia. Eu ajudo a traduzir o que vocês já fazem num site ou num software que acompanhe o ritmo de vocês — faz sentido ouvir uma ideia?`,
    `Se fizer sentido para vocês, posso sugerir caminhos simples: vitrine online, integração com WhatsApp, ou um fluxo interno leve — sempre desenhado em conjunto, para não impor um modelo que não cola com o negócio.`,
    `Não procuro “empurrar pacote”: o foco é perceber a prioridade de vocês e propor algo enxuto que realmente ajude a crescer ou a descomplicar — site, portal ou automação, conforme o que fizer mais sentido.`,
    `O que mais valorizo no projeto é a parceria na definição: vocês dizem o que é inegociável no fluxo, eu proponho a melhor forma técnica de chegar lá — e vamos refinando até bater certo com a operação.`,
    `Se estiverem abertos, posso mostrar como costumo trabalhar: protótipo cedo, feedback frequente, e entregas em etapas para não parar o negócio de vocês. Querem ver se encaixa numa chamada rápida?`,
    `Às vezes um site bem claro ou um software enxuto faz mais diferença do que várias ferramentas soltas. Posso ajudar a priorizar o que traria retorno mais rápido para vocês — sem falar do vosso ramo em concreto, só da lógica de crescer com digital sob medida.`,
    `Meu trabalho é dar autonomia depois da entrega: documentação clara, código organizado e flexibilidade para evoluir quando o negócio mudar — porque software e site têm de acompanhar vocês, não o contrário.`,
    `Se a ideia de “ter um sistema que finalmente obedece ao processo de vocês” faz sentido, posso esboçar uma linha de solução numa conversa curta — sem custo nem compromisso para ouvir.`,
    `Gosto de construir com transparência em prazos e escopo: vocês sabem o que vão receber em cada fase, e onde podem pedir ajustes. Isso costuma reduzir surpresa e acelerar adoção pela equipa.`,
    `Posso combinar uma chamada de voz ou vídeo só para alinhar expectativas: o que vocês querem ver no ar, que tarefas querem deixar de fazer à mão, e que resultado medem como sucesso — a partir daí digo se consigo ajudar e como.`,
    `Não dependo de templates engessados: partimos do zero funcional para o caso de vocês — identidade, textos, integrações e regras de negócio — para o resultado parecer “feito para nós”, não “mais um site igual”.`,
    `Se quiserem dar o próximo passo no digital com algo que reflita a forma única como vocês atendem ou produzem, estou disponível para uma primeira conversa e, se fizer sentido, um orçamento claro em seguida.`,
    `Resumo do que ofereço: escuta a sério, proposta alinhada à realidade de vocês, e entrega de site ou software com margem para afinar até ficar natural no dia a dia. Posso enviar disponibilidade para falarmos?`,
  ];

  const corposEstetica = [
    `Quem atua com estética automotiva costuma ganhar muito quando o digital mostra bem o trabalho e destrava orçamentos — posso partilhar um exemplo de site nesse espírito (feito por mim): ${SITE_PORTFOLIO_ESTETICA_AUTO}. Faz sentido ver se encaixa numa conversa curta?`,
    `Para impulsionar serviços de detalhe/polimento/vitrificação, um canal próprio costuma converter melhor que só redes sociais — tenho referência visual em ${SITE_PORTFOLIO_ESTETICA_AUTO}. Topam ouvir como adapto isso à forma de trabalhar de vocês?`,
    `O foco continua a ser sob medida: galeria, pacotes, WhatsApp e agendamento do jeito que a equipa quiser — sem copiar o vizinho. Um caso que ilustra o nível de acabamento: ${SITE_PORTFOLIO_ESTETICA_AUTO}. Vale explorar em 10 minutos?`,
    `Posso ajudar a traduzir a qualidade do serviço de vocês num site rápido no telemóvel, com linguagem clara para o cliente final — inspiração de layout e ritmo em ${SITE_PORTFOLIO_ESTETICA_AUTO}, sempre personalizável à marca de vocês.`,
    `Se quiserem mais pedidos qualificados, um fluxo simples (mostrar trabalho → explicar processo → falar com vocês) costuma funcionar; vejam o tom em ${SITE_PORTFOLIO_ESTETICA_AUTO} e digam se querem adaptar algo nesse sentido ao negócio de vocês.`,
  ];

  const pools = {
    geral: corposGeral,
    estetica_auto: corposEstetica.concat(corposGeral),
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
    out += " Exemplo de trabalho nesse tipo de projeto: " + SITE_PORTFOLIO_ESTETICA_AUTO;
  }
  return out;
}
