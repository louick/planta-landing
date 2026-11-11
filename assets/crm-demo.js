/* Demonstração do CRM de leads da Planta.
   Tudo roda no navegador com dados de exemplo: funil arrastável, ficha do
   lead, lembretes de retorno, perfil de interesse com imóveis que combinam,
   mensagens prontas no WhatsApp, arquivados e números da equipe. */
(() => {
  const win = document.getElementById('crmWin');
  if (!win) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = win) => el.querySelector(s);
  const $$ = (s, el = win) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR;
  const now = () => Date.now();

  // ---------- catálogo ----------
  const STAGES = [
    { k: 'novo', l: 'Novo', c: '#2563eb' },
    { k: 'atend', l: 'Em atendimento', c: '#c2410c' },
    { k: 'visita', l: 'Visita marcada', c: '#7c3aed' },
    { k: 'proposta', l: 'Proposta', c: '#db2777' },
    { k: 'fechado', l: 'Fechado', c: '#15803d' },
    { k: 'perdido', l: 'Perdido', c: '#6b7280' },
  ];
  const ST = Object.fromEntries(STAGES.map((s) => [s.k, s]));
  const CHANNEL = { whatsapp: 'WhatsApp', form: 'Formulário', phone: 'Telefone' };
  const LOST = ['Achou mais barato em outro lugar', 'Fechou com outra imobiliária', 'Não conseguiu financiamento', 'Desistiu da mudança', 'Não respondeu mais', 'Imóvel não atendia'];
  const TYPES = ['Apartamento', 'Casa', 'Cobertura', 'Studio', 'Sala comercial'];
  const HOODS = ['Batista Campos', 'Nazaré', 'Umarizal', 'Marco', 'Reduto', 'Pedreira', 'Marambaia', 'Guamá'];

  const IMG = {
    sala: 'modern-living-room-with-stylish-furniture-and.jpg', casa: 'modern-house-exterior-with-red-roof-and.jpg',
    fach: 'apartment-building-facade-with-window-air-conditioners.jpg', torre: 'brickell-miami-highrise-condominium-pool-deck-aerial.jpg',
    rosa: 'pink-apartment-building-facade-rio-de-janeiro.jpg', belem: 'belem-brazil-belem-para-38103129825.jpg',
  };
  const PROPS = {
    cob: { t: 'Cobertura duplex', h: 'Batista Campos', type: 'Cobertura', deal: 'sale', price: 1200000, rooms: 4, img: IMG.torre, ref: 'IMV-K2W7', sp: '4 suítes · 240 m²' },
    casaMarco: { t: 'Casa com quintal', h: 'Marco', type: 'Casa', deal: 'sale', price: 640000, rooms: 4, img: IMG.casa, ref: 'IMV-H8Q3', sp: '4 quartos · 180 m²' },
    aptNaz: { t: 'Apartamento mobiliado', h: 'Nazaré', type: 'Apartamento', deal: 'rent', price: 2800, rooms: 3, img: IMG.sala, ref: 'IMV-N4R2', sp: '3 quartos · 112 m²' },
    aptUma: { t: 'Apartamento', h: 'Umarizal', type: 'Apartamento', deal: 'rent', price: 1900, rooms: 2, img: IMG.fach, ref: 'IMV-U7T5', sp: '2 quartos · 68 m²' },
    aptRed: { t: 'Apartamento varandado', h: 'Reduto', type: 'Apartamento', deal: 'rent', price: 3200, rooms: 3, img: IMG.rosa, ref: 'IMV-R2M9', sp: '3 quartos · 95 m²' },
    aptPed: { t: 'Apartamento', h: 'Pedreira', type: 'Apartamento', deal: 'sale', price: 410000, rooms: 2, img: IMG.belem, ref: 'IMV-P6B1', sp: '2 quartos · 72 m²' },
    studio: { t: 'Studio', h: 'Guamá', type: 'Studio', deal: 'rent', price: 1500, rooms: 1, img: IMG.sala, ref: 'IMV-G3S8', sp: '1 quarto · 34 m²' },
    casaMar: { t: 'Casa térrea', h: 'Marambaia', type: 'Casa', deal: 'sale', price: 890000, rooms: 3, img: IMG.casa, ref: 'IMV-M5C4', sp: '3 quartos · 210 m²' },
    sala: { t: 'Sala comercial', h: 'Umarizal', type: 'Sala comercial', deal: 'rent', price: 2400, rooms: 0, img: IMG.fach, ref: 'IMV-C9L2', sp: '42 m² · 1 vaga' },
    aptBat: { t: 'Apartamento alto padrão', h: 'Batista Campos', type: 'Apartamento', deal: 'sale', price: 980000, rooms: 3, img: IMG.torre, ref: 'IMV-B1V6', sp: '3 suítes · 150 m²' },
    aptMarco: { t: 'Apartamento', h: 'Marco', type: 'Apartamento', deal: 'sale', price: 520000, rooms: 2, img: IMG.fach, ref: 'IMV-A4K8', sp: '2 quartos · 64 m²' },
    aptPed2: { t: 'Apartamento com varanda', h: 'Pedreira', type: 'Apartamento', deal: 'sale', price: 460000, rooms: 3, img: IMG.rosa, ref: 'IMV-P2W5', sp: '3 quartos · 81 m²' },
    aptNaz2: { t: 'Apartamento', h: 'Nazaré', type: 'Apartamento', deal: 'sale', price: 720000, rooms: 3, img: IMG.rosa, ref: 'IMV-N8E2', sp: '3 quartos · 120 m²' },
  };
  const BROKERS = {
    jf: { n: 'Juliana Ferreira', i: 'JF', bg: '#cdeedd', fg: '#0f5132' },
    pr: { n: 'Paulo Rodrigues', i: 'PR', bg: '#dbe6ff', fg: '#1e3a8a' },
    lc: { n: 'Larissa Costa', i: 'LC', bg: '#ffe2c7', fg: '#7c2d12' },
    ma: { n: 'Marcos Andrade', i: 'MA', bg: '#e4f0c4', fg: '#33420a' },
  };

  const priceLabel = (p) => p.deal === 'rent' ? `R$ ${p.price.toLocaleString('pt-BR')}/mês`
    : p.price >= 1e6 ? `R$ ${(p.price / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi` : `R$ ${Math.round(p.price / 1000)} mil`;
  const propTitle = (p) => `${p.t} · ${p.h}`;
  const domain = () => (document.getElementById('url')?.textContent || 'suaimobiliaria.com.br/imoveis').split('/')[0];
  const propLink = (p) => `${domain()}/imoveis/${p.ref.toLowerCase()}`;

  // ---------- tempo ----------
  const atHour = (dayOffset, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.getTime(); };
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const hhmm = (t) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dmHm = (t) => new Date(t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const ago = (t) => {
    const d = now() - t;
    if (d < MIN) return 'agora';
    if (d < HOUR) return `há ${Math.round(d / MIN)} min`;
    if (d < DAY) return `há ${Math.round(d / HOUR)} h`;
    const n = Math.round(d / DAY); return n === 1 ? 'há 1 dia' : `há ${n} dias`;
  };
  const inStage = (t) => { const s = ago(t); return s === 'agora' ? 'agora nesta etapa' : `${s} nesta etapa`; };
  // retorno "hoje" mais tarde: daqui a pouco, sem passar da meia-noite
  const laterToday = (mins) => { const t = now() + mins * MIN; const end = atHour(0, 23, 45); return Math.min(t - (t % (15 * MIN)) + 15 * MIN, end); };
  const fuState = (t) => (t == null ? null : t < now() ? 'late' : sameDay(t, now()) ? 'today' : 'later');

  // ---------- leads de exemplo ----------
  const NOTES = {
    'Carla Mendes': 'Quer mudar até o fim do mês. Tem um gato.',
    'Fábio Gomes': 'Prefere andar alto. Pediu o valor do condomínio.',
    'Bernardo Sá': 'Vai trazer a esposa na visita.',
    'Lucas Pinheiro': 'Financiamento pela Caixa, já com carta de crédito.',
    'Olívia Prado': 'Proposta de R$ 1,12 mi à vista. Aguardando o proprietário.',
    'Nelson Viana': 'Pediu contrato de 30 meses.',
    'Mariana Souto': '“Aceita pet?”',
  };
  const seed = [
    ['Ana Beatriz Lobato', '98112-4407', 'whatsapp', 'novo', 'cob', 'jf', 12 * MIN, null, { deal: 'sale', types: ['Cobertura', 'Apartamento'], hoods: ['Batista Campos', 'Nazaré'], max: 1500000, rooms: 3 }],
    ['Rafael Monteiro', '99231-0815', 'whatsapp', 'novo', 'casaMarco', 'pr', 2 * HOUR, ['Primeiro contato', laterToday(70)], { deal: 'sale', types: ['Casa'], hoods: ['Marco', 'Marambaia'], max: 900000, rooms: 3 }],
    ['Cláudia Pinheiro', '98810-3342', 'form', 'novo', 'sala', 'lc', 26 * HOUR, null, { deal: 'rent', types: ['Sala comercial'], hoods: ['Umarizal'], max: 3000, rooms: 0 }],
    ['Carla Mendes', '98450-7720', 'whatsapp', 'atend', 'aptNaz', 'jf', 2 * DAY, ['Retornar contato', atHour(-1, 17)], { deal: 'rent', types: ['Apartamento'], hoods: ['Nazaré', 'Umarizal'], max: 3000, rooms: 2 }],
    ['Fábio Gomes', '99104-6631', 'phone', 'atend', 'aptRed', 'pr', 6 * DAY, ['Enviar valor do condomínio', atHour(-2, 10)], { deal: 'rent', types: ['Apartamento'], hoods: ['Reduto', 'Umarizal'], max: 3500, rooms: 3 }],
    ['Mariana Souto', '98322-1904', 'whatsapp', 'atend', 'aptUma', 'lc', 1 * DAY, ['Retornar contato', laterToday(150)], { deal: 'rent', types: ['Apartamento', 'Studio'], hoods: ['Umarizal', 'Guamá'], max: 2000, rooms: 1 }],
    ['Diego Rocha', '98877-5310', 'whatsapp', 'atend', 'studio', 'ma', 3 * DAY, null, { deal: 'rent', types: ['Studio', 'Apartamento'], hoods: ['Guamá', 'Umarizal'], max: 2000, rooms: 1 }],
    ['Bernardo Sá', '98788-1055', 'whatsapp', 'visita', 'aptPed', 'jf', 3 * DAY, ['Confirmar visita', laterToday(40)], { deal: 'sale', types: ['Apartamento'], hoods: ['Pedreira', 'Nazaré'], max: 750000, rooms: 2 }],
    ['Lucas Pinheiro', '99650-2287', 'form', 'visita', 'casaMar', 'pr', 5 * DAY, ['Confirmar visita', atHour(-1, 9)], { deal: 'sale', types: ['Casa'], hoods: ['Marambaia', 'Marco'], max: 950000, rooms: 3 }],
    ['Olívia Prado', '98234-9076', 'whatsapp', 'proposta', 'cob', 'ma', 4 * DAY, ['Cobrar resposta do proprietário', atHour(0, 9)], { deal: 'sale', types: ['Cobertura', 'Apartamento'], hoods: ['Batista Campos'], max: 1300000, rooms: 3 }],
    ['Nelson Viana', '99417-6603', 'phone', 'proposta', 'aptRed', 'lc', 2 * DAY, null, { deal: 'rent', types: ['Apartamento'], hoods: ['Reduto', 'Nazaré'], max: 3500, rooms: 3 }],
    ['Úrsula Alves', '98561-3318', 'whatsapp', 'fechado', 'aptNaz', 'jf', 6 * DAY, null, { deal: 'rent', types: ['Apartamento'], hoods: ['Nazaré'], max: 3000, rooms: 3 }],
    ['Paulo Ramos', '99020-4471', 'whatsapp', 'fechado', 'casaMarco', 'pr', 9 * DAY, null, { deal: 'sale', types: ['Casa'], hoods: ['Marco'], max: 700000, rooms: 3 }],
    ['Wanda Freitas', '98703-2259', 'whatsapp', 'perdido', 'aptUma', 'lc', 3 * DAY, null, { deal: 'rent', types: ['Apartamento'], hoods: ['Umarizal'], max: 2000, rooms: 2 }, 'Fechou com outra imobiliária'],
    ['Xavier Nunes', '99388-0142', 'form', 'perdido', 'casaMar', 'ma', 7 * DAY, null, { deal: 'sale', types: ['Casa'], hoods: ['Marambaia'], max: 800000, rooms: 3 }, 'Não conseguiu financiamento'],
    ['Yasmin Rocha', '98190-6624', 'whatsapp', 'perdido', 'aptNaz2', 'jf', 12 * DAY, null, { deal: 'sale', types: ['Apartamento'], hoods: ['Nazaré'], max: 700000, rooms: 2 }, 'Não respondeu mais', 4 * DAY],
    ['João Victor Reis', '98655-7713', 'whatsapp', 'atend', 'studio', 'pr', 15 * DAY, null, { deal: 'rent', types: ['Studio'], hoods: ['Guamá'], max: 1600, rooms: 1 }, null, 6 * DAY],
  ];

  let nextId = 1;
  const PATH = ['novo', 'atend', 'visita', 'proposta'];
  const leads = seed.map(([name, tel, channel, stage, prop, broker, since, task, interest, lost, archivedAgo]) => {
    const id = nextId++;
    const stageAt = now() - since;
    const steps = stage === 'fechado' || stage === 'perdido' ? 3 : Math.max(0, PATH.indexOf(stage));
    const created = steps ? stageAt - steps * (14 + id * 3) * HOUR - 30 * MIN : stageAt;
    const tl = [{ k: 'created', at: created, title: 'Lead criado', sub: channel === 'form' ? 'Formulário do site' : channel === 'phone' ? 'Cadastrado no painel' : 'Contato pelo site' }];
    if (stage !== 'novo') tl.push({ k: 'whatsapp', at: created + 25 * MIN, title: 'WhatsApp enviado', sub: 'Modelo “Primeiro contato”' });
    let prev = 'novo', t = created + 40 * MIN;
    const route = stage === 'fechado' ? ['atend', 'visita', 'proposta', 'fechado'] : stage === 'perdido' ? ['atend', 'perdido'] : PATH.slice(1, PATH.indexOf(stage) + 1);
    route.forEach((s, i) => { const at = i === route.length - 1 ? stageAt : t + i * 14 * HOUR; tl.push({ k: 'stage', at, title: 'Mudou de etapa', sub: `${ST[prev].l} → ${ST[s].l}`, c: ST[s].c }); prev = s; });
    if (NOTES[name]) tl.push({ k: 'note', at: stageAt + Math.min(since / 2, 5 * HOUR), title: 'Anotação', body: NOTES[name] });
    const tasks = task ? [{ id: id * 10, title: task[0], at: task[1], done: false }] : [];
    const L = {
      id, name, phone: `(91) ${tel}`, email: id % 3 === 0 ? name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@gmail.com' : '',
      channel, stage, prop, broker, stageAt, created, tasks, tl: tl.sort((a, b) => b.at - a.at), interest: { ...interest },
      lost: lost || null, archivedAt: archivedAgo ? now() - archivedAgo : null,
    };
    if (L.archivedAt) L.tl.unshift({ k: 'archived', at: L.archivedAt, title: 'Lead arquivado' });
    return L;
  });
  const byId = (id) => leads.find((l) => l.id === +id);
  const nextFu = (l) => { const open = l.tasks.filter((t) => !t.done).map((t) => t.at); return open.length ? Math.min(...open) : null; };

  // ---------- mensagens prontas ----------
  const FIELDS = [
    { code: '{, nome}', label: 'Vírgula + nome' }, { code: '{nome}', label: 'Nome do cliente' },
    { code: '{imovel}', label: 'Imóvel' }, { code: '{link}', label: 'Link do imóvel' }, { code: '{corretor}', label: 'Seu nome' },
  ];
  const FIELD_RE = /(\{,\s*nome\}|\{nome\}|\{imovel\}|\{link\}|\{corretor\})/g;
  const templates = [
    { id: 1, team: true, name: 'Primeiro contato', body: 'Olá{, nome}! Aqui é {corretor}. Vi seu interesse no imóvel {imovel} e estou à disposição para tirar dúvidas ou agendar uma visita. {link}' },
    { id: 2, team: true, name: 'Agendar visita', body: 'Olá{, nome}! Podemos marcar uma visita ao {imovel}? Tenho horários disponíveis esta semana. Qual dia fica melhor para você?' },
    { id: 3, team: true, name: 'Enviar opções', body: 'Olá{, nome}! Separei este imóvel que combina com o que você procura: {imovel} {link}' },
    { id: 4, team: true, name: 'Retomar contato', body: 'Olá{, nome}, tudo bem? Aqui é {corretor}. Passando para saber se você ainda procura imóvel. Separei algumas opções que combinam com o que você pediu.' },
    { id: 5, team: false, name: 'Pós-visita', body: 'Olá{, nome}! Obrigado pela visita ao {imovel}. O que achou? Se quiser, separo outras opções parecidas.' },
  ];
  let tplNext = 6;
  const fill = (body, v) => {
    const first = (v.nome || '').trim().split(/\s+/)[0] || '';
    return body.replace(/\{,\s*nome\}/g, first ? `, ${first}` : '').replace(/\{nome\}/g, first)
      .replace(/\{imovel\}/g, v.imovel || '').replace(/\{link\}/g, v.link || '').replace(/\{corretor\}/g, v.corretor || '')
      .replace(/[ \t]{2,}/g, ' ').replace(/\s+([?.!,])/g, '$1').trim();
  };
  const varsFor = (l, p = PROPS[l.prop]) => ({ nome: l.name, imovel: `${p.t} em ${p.h} (ref. ${p.ref})`, link: propLink(p), corretor: BROKERS[l.broker].n.split(' ')[0] });
  const tokenHtml = (body) => esc(body).replace(/(\{,\s*nome\}|\{nome\}|\{imovel\}|\{link\}|\{corretor\})/g, (m) => `<span class="var">${esc(FIELDS.find((f) => f.code.replace(/\s/g, '') === m.replace(/\s/g, ''))?.label || m)}</span>`);
  const bubbleHtml = (txt) => esc(txt).replace(/([a-z0-9-]+\.com\.br\/imoveis\/[a-z0-9-]+)/gi, '<a>$1</a>');

  // ---------- estado da tela ----------
  const S = { tab: 'funil', view: 'board', q: '', late: false, today: false, archived: false, open: null, draft: '', taskTitle: 'Retornar contato', taskAt: null, tpl: 1 };

  // ---------- utilidades de UI ----------
  let toastT;
  const toast = (msg) => {
    const t = $('#toast'); t.querySelector('span').textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 3200);
  };
  const avatar = (k) => { const b = BROKERS[k]; return `<i class="av" style="background:${b.bg};color:${b.fg}">${b.i}</i>`; };
  const stageSelect = (l, f) => `<span class="stage-sel" style="--c:${ST[l.stage].c}"><select data-f="${f}" data-stage="${l.id}" aria-label="Etapa de ${esc(l.name)}">${STAGES.map((s) => `<option value="${s.k}"${s.k === l.stage ? ' selected' : ''}>${s.l}</option>`).join('')}</select></span>`;
  const keepFocus = (fn) => {
    const a = document.activeElement; const key = a && win.contains(a) ? a.dataset.f : null;
    fn();
    if (key) { const el = win.querySelector(`[data-f="${CSS.escape(key)}"]`); if (el) el.focus({ preventScroll: true }); }
  };

  // ---------- funil ----------
  const board = $('#board'), listWrap = $('#listWrap');
  const visible = () => leads.filter((l) => {
    if (!!l.archivedAt !== S.archived) return false;
    if (S.q) { const q = S.q.toLowerCase(); const p = PROPS[l.prop]; if (![l.name, l.phone, p.t, p.h, p.ref].join(' ').toLowerCase().includes(q)) return false; }
    if (!S.archived && (S.late || S.today)) { const st = fuState(nextFu(l)); if (!((S.late && st === 'late') || (S.today && st === 'today'))) return false; }
    return true;
  });

  const cardHtml = (l) => {
    const p = PROPS[l.prop], fu = nextFu(l), st = fuState(fu);
    return `<button type="button" class="card" data-id="${l.id}" data-f="card-${l.id}" style="--c:${ST[l.stage].c}" aria-roledescription="cartão arrastável" aria-label="${esc(l.name)}, ${ST[l.stage].l}. Enter abre a ficha; setas mudam a etapa.">
      <b>${esc(l.name)}</b><span class="p">${esc(propTitle(p))}</span>
      ${l.stage === 'perdido' && l.lost ? `<span class="why">Motivo: ${esc(l.lost)}</span>` : ''}
      <span class="m"><span>${CHANNEL[l.channel]}</span><span>${inStage(l.stageAt)}</span></span>
      ${st === 'late' ? `<span class="fu late" title="Retorno atrasado">Atrasado · ${sameDay(fu, now()) ? hhmm(fu) : fmtD(fu)}</span>` : st === 'today' ? `<span class="fu today" title="Retorno hoje">Hoje · ${hhmm(fu)}</span>` : ''}
      <span class="br">${avatar(l.broker)}${BROKERS[l.broker].n}</span></button>`;
  };

  let arrivedId = null;
  const renderBoard = () => {
    const vis = visible();
    // FLIP: guarda onde cada cartão estava para animar até o lugar novo
    const before = new Map($$('.card', board).map((c) => [c.dataset.id, c.getBoundingClientRect()]));
    const scrolls = $$('.cards', board).map((c) => c.scrollTop);
    if (!vis.length && (S.q || S.late || S.today)) board.innerHTML = '<p class="board-empty">Nenhum lead com esses filtros.</p>';
    else board.innerHTML = STAGES.map((s) => {
      const ls = vis.filter((l) => l.stage === s.k).sort((a, b) => b.stageAt - a.stageAt);
      return `<section class="col" data-stage="${s.k}" style="--c:${s.c}" aria-label="${s.l}"><header><h4>${s.l}</h4><span>${ls.length}</span></header><div class="cards">${ls.map(cardHtml).join('')}</div></section>`;
    }).join('');
    $$('.cards', board).forEach((c, i) => (c.scrollTop = scrolls[i] || 0));
    if (!reduce) $$('.card', board).forEach((c) => {
      const b = before.get(c.dataset.id); if (!b) return;
      const a = c.getBoundingClientRect(); const dx = b.left - a.left, dy = b.top - a.top;
      if (Math.abs(dx) + Math.abs(dy) < 2) return;
      c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    });
    if (arrivedId) { const c = board.querySelector(`.card[data-id="${arrivedId}"]`); if (c) c.classList.add('arrived'); arrivedId = null; }
  };

  const renderList = () => {
    const vis = visible().sort((a, b) => (S.archived ? b.archivedAt - a.archivedAt : STAGES.findIndex((s) => s.k === a.stage) - STAGES.findIndex((s) => s.k === b.stage)));
    if (!vis.length) { listWrap.innerHTML = `<p class="board-empty">${S.archived ? 'Nenhum lead arquivado.' : 'Nenhum lead com esses filtros.'}</p>`; return; }
    listWrap.innerHTML = `<table><thead><tr><th>Cliente</th><th>Imóvel</th><th>Etapa</th><th>${S.archived ? 'Arquivado' : 'Próximo retorno'}</th><th>Corretor</th><th>Chegou</th><th><span class="sr" style="position:absolute;left:-9999px">Ações</span></th></tr></thead><tbody>${vis.map((l) => {
      const fu = nextFu(l), st = fuState(fu);
      return `<tr style="--c:${ST[l.stage].c}"><td><button type="button" class="nm" data-open="${l.id}" data-f="nm-${l.id}">${esc(l.name)}</button><small>${l.phone}</small></td>
        <td>${esc(propTitle(PROPS[l.prop]))}</td>
        <td style="width:170px">${S.archived ? `<span class="ui-tag" style="background:${ST[l.stage].c};color:#fff;box-shadow:none">${ST[l.stage].l}</span>` : stageSelect(l, 'ls-' + l.id)}</td>
        <td class="${S.archived ? '' : st === 'late' ? 'late' : st === 'today' ? 'today' : ''}">${S.archived ? dmHm(l.archivedAt) : fu ? dmHm(fu) : '—'}</td>
        <td><span style="display:inline-flex;gap:6px;align-items:center">${avatar(l.broker)}${BROKERS[l.broker].n.split(' ')[0]}</span></td>
        <td>${ago(l.created)}</td>
        <td style="text-align:right">${S.archived ? `<button type="button" class="act" data-unarch="${l.id}">Desarquivar</button>` : `<button type="button" class="act" data-arch="${l.id}">Arquivar</button>`}</td></tr>`;
    }).join('')}</tbody></table>`;
  };

  const renderFunnel = () => {
    const active = leads.filter((l) => !l.archivedAt);
    const late = active.filter((l) => fuState(nextFu(l)) === 'late').length;
    const today = active.filter((l) => fuState(nextFu(l)) === 'today').length;
    const arch = leads.filter((l) => l.archivedAt).length;
    const n = (el, v, hide) => { const s = el.querySelector('.n'); s.textContent = v; s.style.display = !v || hide ? 'none' : ''; };
    const lateB = $('#flLate'), todayB = $('#flToday'), archB = $('#flArch');
    n(lateB, late, S.late); n(todayB, today, S.today); n(archB, arch, false);
    lateB.setAttribute('aria-pressed', S.late); todayB.setAttribute('aria-pressed', S.today); archB.setAttribute('aria-pressed', S.archived);
    lateB.hidden = todayB.hidden = S.archived;
    $('#flView').hidden = S.archived;
    $$('#flView button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === S.view));
    $('#archNote').hidden = !S.archived;
    $('#flClear').hidden = !(S.q || S.late || S.today || S.archived);
    const showList = S.archived || S.view === 'list';
    board.hidden = showList; listWrap.hidden = !showList;
    keepFocus(() => (showList ? renderList() : renderBoard()));
    $('#cwSub').textContent = S.tab === 'funil'
      ? (S.archived ? 'Leads arquivados: fora do funil, com histórico e etapa guardados.' : 'Arraste os cartões entre as etapas. Clique num lead para abrir a ficha.')
      : S.tab === 'numeros' ? 'Como os contatos estão chegando e virando negócio.' : 'Textos prontos para responder no WhatsApp em um clique.';
  };

  const renderAll = () => { renderFunnel(); if (S.open) renderDrawer(); if (S.tab === 'numeros') renderNums(); };

  // mudar de etapa (com motivo quando for "Perdido")
  const moveLead = (l, to, reason) => {
    if (!l || l.stage === to) return;
    if (to === 'perdido' && !reason) return askLost(l);
    l.tl.unshift({ k: 'stage', at: now(), title: 'Mudou de etapa', sub: `${ST[l.stage].l} → ${ST[to].l}`, c: ST[to].c, fresh: true });
    l.stage = to; l.stageAt = now(); l.lost = to === 'perdido' ? reason : null;
    if (to === 'fechado') toast(`Negócio fechado com ${l.name.split(' ')[0]}. Já conta nos números da equipe.`);
    else if (to === 'perdido') toast(`Marcado como perdido: ${reason}.`);
    else toast(`${l.name.split(' ')[0]} agora está em “${ST[to].l}”.`);
    renderAll();
  };

  // ---------- arrastar (mouse, toque e teclado) ----------
  let drag = null, lastDrop = 0;
  const colAt = (x, y) => document.elementFromPoint(x, y)?.closest?.('#board .col');
  const startDrag = (card, x, y) => {
    const r = card.getBoundingClientRect();
    const ghost = card.cloneNode(true); ghost.classList.add('drag-ghost'); ghost.removeAttribute('data-f');
    Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
    win.appendChild(ghost); card.classList.add('ghosted');
    drag.on = true; drag.ghost = ghost; drag.dx = x - r.left; drag.dy = y - r.top;
    document.body.style.cursor = 'grabbing';
  };
  const moveDrag = (x, y) => {
    drag.ghost.style.left = x - drag.dx + 'px'; drag.ghost.style.top = y - drag.dy + 'px';
    const col = colAt(x, y); $$('.col.over', board).forEach((c) => c !== col && c.classList.remove('over')); col?.classList.add('over');
    const br = board.getBoundingClientRect();
    if (board.scrollWidth > board.clientWidth) { if (x < br.left + 40) board.scrollLeft -= 14; else if (x > br.right - 40) board.scrollLeft += 14; }
  };
  const endDrag = (x, y, cancel) => {
    const d = drag; drag = null; clearTimeout(d?.hold);
    document.body.style.cursor = '';
    if (!d || !d.on) return;
    lastDrop = now();
    const col = cancel ? null : colAt(x, y);
    d.ghost.remove(); $$('.col.over', board).forEach((c) => c.classList.remove('over'));
    d.card.classList.remove('ghosted');
    if (col) moveLead(byId(d.card.dataset.id), col.dataset.stage);
  };
  board.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.card'); if (!card || e.button > 0) return;
    drag = { card, x: e.clientX, y: e.clientY, on: false, touch: e.pointerType !== 'mouse', id: e.pointerId };
    if (drag.touch) drag.hold = setTimeout(() => { if (drag && !drag.on) { startDrag(card, drag.x, drag.y); navigator.vibrate?.(12); } }, 230);
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      const dist = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      if (drag.touch) { if (dist > 8) { clearTimeout(drag.hold); drag = null; } return; }
      if (dist > 6) startDrag(drag.card, e.clientX, e.clientY); else return;
    }
    moveDrag(e.clientX, e.clientY);
  });
  addEventListener('pointerup', (e) => { if (drag && e.pointerId === drag.id) endDrag(e.clientX, e.clientY); });
  addEventListener('pointercancel', (e) => { if (drag && e.pointerId === drag.id) endDrag(0, 0, true); });
  // no toque, segurar o cartão trava a rolagem enquanto ele é arrastado
  board.addEventListener('touchmove', (e) => { if (drag?.on) e.preventDefault(); }, { passive: false });
  board.addEventListener('contextmenu', (e) => { if (e.target.closest('.card')) e.preventDefault(); });
  board.addEventListener('click', (e) => {
    const card = e.target.closest('.card'); if (!card || now() - lastDrop < 300) return;
    openLead(card.dataset.id);
  });
  board.addEventListener('keydown', (e) => {
    const card = e.target.closest('.card'); if (!card) return;
    const l = byId(card.dataset.id), i = STAGES.findIndex((s) => s.k === l.stage);
    if (e.key === 'ArrowRight' && i < STAGES.length - 1) { e.preventDefault(); moveLead(l, STAGES[i + 1].k); }
    if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); moveLead(l, STAGES[i - 1].k); }
  });

  // ---------- filtros ----------
  $('#flQ').addEventListener('input', (e) => { S.q = e.target.value.trim(); renderFunnel(); });
  $('#flLate').addEventListener('click', () => { S.late = !S.late; S.today = false; renderFunnel(); });
  $('#flToday').addEventListener('click', () => { S.today = !S.today; S.late = false; renderFunnel(); });
  $('#flArch').addEventListener('click', () => { S.archived = !S.archived; renderFunnel(); });
  $('#archBack').addEventListener('click', () => { S.archived = false; renderFunnel(); });
  $('#flClear').addEventListener('click', () => { S.q = ''; $('#flQ').value = ''; S.late = S.today = S.archived = false; renderFunnel(); });
  $('#flView').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { S.view = b.dataset.v; renderFunnel(); } });
  listWrap.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open]'); if (o) return openLead(o.dataset.open);
    const a = e.target.closest('[data-arch]'); if (a) return confirmArchive(byId(a.dataset.arch));
    const u = e.target.closest('[data-unarch]'); if (u) return setArchived(byId(u.dataset.unarch), false);
  });
  win.addEventListener('change', (e) => {
    const s = e.target.closest('select[data-stage]'); if (!s) return;
    const l = byId(s.dataset.stage); const to = s.value; s.value = l.stage; moveLead(l, to);
  });

  // ---------- abas ----------
  const setTab = (tab) => {
    S.tab = tab;
    $$('.cw-tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
    $$('.cw-pane').forEach((p) => p.classList.toggle('on', p.dataset.pane === tab));
    const nb = $('#cwNew'); nb.hidden = tab === 'numeros';
    nb.querySelector('.t').textContent = tab === 'mensagens' ? 'Nova mensagem' : 'Novo lead';
    if (tab === 'numeros') renderNums();
    if (tab === 'mensagens') renderMsgs();
    renderFunnel();
  };
  $('.cw-tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setTab(b.dataset.tab); });

  // ---------- ficha ----------
  const drawer = $('#drawer'), drBg = $('#drBg');
  const openLead = (id) => {
    S.open = +id; S.draft = ''; S.taskTitle = 'Retornar contato'; S.taskAt = null;
    renderDrawer(); drawer.classList.add('on'); drBg.classList.add('on'); drawer.setAttribute('aria-hidden', 'false');
    $('.dr-scroll', drawer).scrollTop = 0;
    setTimeout(() => $('.dr-close', drawer)?.focus({ preventScroll: true }), 50);
  };
  const closeLead = () => {
    const id = S.open; S.open = null; drawer.classList.remove('on'); drBg.classList.remove('on'); drawer.setAttribute('aria-hidden', 'true');
    pressTour(null);
    const c = board.querySelector(`.card[data-id="${id}"]`); c?.focus({ preventScroll: true });
  };
  drBg.addEventListener('click', closeLead);

  const tlHtml = (e) => {
    const dot = { created: '#17201b', whatsapp: '#1fa855', note: '#a16207', call: '#2563eb', task_done: '#15803d', archived: '#6b7280', unarchived: '#17201b', interest: '#7c3aed', assigned: '#0f766e' }[e.k] || e.c || '#17201b';
    return `<li class="${e.fresh ? 'fresh' : ''}" style="--dot:${e.c || dot}"><div><p><b>${esc(e.title)}</b>${e.sub ? ` <span>· ${esc(e.sub)}</span>` : ''}</p>${e.body ? `<p>${esc(e.body)}</p>` : ''}<small>${ago(e.at)}${e.by ? ' · ' + esc(e.by) : ''}</small></div></li>`;
  };
  const matchesFor = (l) => {
    const i = l.interest;
    return Object.entries(PROPS).filter(([k, p]) => k !== l.prop && (i.deal === 'any' || p.deal === i.deal) && (!i.types.length || i.types.includes(p.type))
      && (!i.hoods.length || i.hoods.includes(p.h)) && (i.deal === 'any' || !i.max || p.price <= i.max) && p.rooms >= i.rooms).slice(0, 3);
  };
  const matchesHtml = (l) => {
    const m = matchesFor(l);
    return m.length ? `<div class="matches">${m.map(([k, p]) => `<article class="mt"><img src="assets/${p.img}" alt="" loading="lazy"><div><b>${priceLabel(p)}</b><span>${esc(p.t)} · ${p.h}</span><span>${p.sp}</span><button type="button" data-send="${k}" data-f="send-${k}"><svg><use href="#i-wa"/></svg>Enviar</button></div></article>`).join('')}</div>`
      : '<p class="empty-s">Nenhum imóvel disponível com esse perfil agora. Tente ampliar bairros ou faixa de preço.</p>';
  };
  const priceRange = (deal) => deal === 'rent' ? { min: 800, max: 8000, step: 100 } : { min: 200000, max: 2000000, step: 10000 };
  const maxLabel = (l) => l.interest.deal === 'any' ? '—' : l.interest.max ? 'até ' + priceLabel({ deal: l.interest.deal, price: l.interest.max }) : 'sem limite';
  const toLocalInput = (t) => { const d = new Date(t); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
  const quick = { h2: () => now() + 2 * HOUR, tomorrow: () => atHour(1, 9), d2: () => atHour(2, 9), monday: () => { const d = new Date(); const add = ((8 - d.getDay()) % 7) || 7; return atHour(add, 9); } };

  const renderDrawer = () => {
    const l = byId(S.open); if (!l) return;
    const p = PROPS[l.prop], i = l.interest, rg = priceRange(i.deal === 'any' ? 'sale' : i.deal);
    const sc = $('.dr-scroll', drawer)?.scrollTop || 0;
    if (S.taskAt == null) S.taskAt = quick.tomorrow();
    const tasks = l.tasks.slice().sort((a, b) => a.done - b.done || a.at - b.at);
    keepFocus(() => {
      drawer.innerHTML = `
      <div class="dr-head">
        <button type="button" class="dr-close" data-close data-f="close" aria-label="Fechar ficha">×</button>
        <div class="who"><button type="button" class="back" data-close>← Leads</button>
          <h4>${esc(l.name)}</h4>
          <p class="src">Chegou ${ago(l.created)} por ${CHANNEL[l.channel]} · <u>${esc(p.t)} em ${p.h}</u></p>
          ${l.stage === 'perdido' && l.lost ? `<p class="lost">Perdido: ${esc(l.lost)}</p>` : ''}
        </div>
        <div class="acts">
          <label>Etapa${l.archivedAt ? `<span class="ui-tag" style="background:${ST[l.stage].c};color:#fff;box-shadow:none;height:32px">${ST[l.stage].l}</span>` : stageSelect(l, 'dr-stage')}</label>
          <button type="button" class="ui-btn wa" data-wa data-f="wa"><svg><use href="#i-wa"/></svg>WhatsApp</button>
          <button type="button" class="ui-btn ghost" data-call data-f="call">Ligar</button>
        </div>
      </div>
      <div class="dr-scroll">
        ${l.archivedAt ? `<div class="arch-banner"><span><b>Lead arquivado</b> em ${dmHm(l.archivedAt)}. Ele não aparece no funil nem nos retornos.</span><button type="button" class="ui-btn ghost" data-unarch-dr data-f="unarch">Desarquivar</button></div>` : ''}
        <div class="dr-main">
          <section class="pn"><h5>Histórico <small>${l.tl.length} registros</small></h5>
            <div class="note-row"><textarea class="ui-in" rows="2" data-f="note" placeholder="Escreva uma anotação: o que o cliente disse, combinados, objeções…" aria-label="Nova anotação">${esc(S.draft)}</textarea>
              <div class="btns"><button type="button" class="ui-btn" data-note data-f="save-note"${S.draft.trim() ? '' : ' disabled'}>Salvar anotação</button><button type="button" class="ui-btn ghost" data-call data-f="call2">Registrar ligação</button></div></div>
            <ul class="tl">${l.tl.map(tlHtml).join('')}</ul>
          </section>
          <section class="pn"><h5>Imóveis que combinam <small>pelo perfil de interesse</small></h5><div id="mtBox">${matchesHtml(l)}</div></section>
        </div>
        <div class="dr-side">
          <section class="pn"><h5>Lembretes de retorno</h5>
            <div class="tasks">${tasks.length ? tasks.map((t) => { const st = fuState(t.at); return `<div class="task${t.done ? ' done' : ''}"><input type="checkbox" data-done="${t.id}" data-f="done-${t.id}"${t.done ? ' checked disabled' : ''} aria-label="Concluir: ${esc(t.title)}"><div>${esc(t.title)}<small class="${t.done ? '' : st}">${dmHm(t.at)}${!t.done && st === 'late' ? ' · atrasado' : !t.done && st === 'today' ? ' · hoje' : ''}</small></div>${t.done ? '' : `<button type="button" class="x" data-del="${t.id}" data-f="del-${t.id}">Excluir</button>`}</div>`; }).join('') : '<p class="empty-s">Nenhum retorno agendado.</p>'}</div>
            ${l.archivedAt ? '' : `<div class="new-task"><span class="lbl" style="margin:0">Novo lembrete</span>
              <input class="ui-in" data-f="task-title" value="${esc(S.taskTitle)}" maxlength="80" aria-label="O que fazer">
              <input class="ui-in" type="datetime-local" data-f="task-at" value="${toLocalInput(S.taskAt)}" aria-label="Quando">
              <div class="tags">${[['h2', 'Em 2 horas'], ['tomorrow', 'Amanhã 9h'], ['d2', 'Em 2 dias'], ['monday', 'Segunda 9h']].map(([k, t]) => `<button type="button" class="ui-tag" data-quick="${k}" data-f="q-${k}" aria-pressed="${Math.abs(quick[k]() - S.taskAt) < MIN}">${t}</button>`).join('')}</div>
              <button type="button" class="ui-btn" data-addtask data-f="addtask">Agendar retorno</button></div>`}
          </section>
          <section class="pn"><h5>Dados do cliente</h5>
            <dl class="kv"><dt>Nome</dt><dd>${esc(l.name)}</dd><dt>Telefone</dt><dd>${l.phone}</dd><dt>E-mail</dt><dd>${l.email || '—'}</dd><dt>Canal</dt><dd>${CHANNEL[l.channel]}</dd><dt>1º contato</dt><dd>${dmHm(l.created)}</dd></dl>
          </section>
          <section class="pn"><h5>Perfil de interesse</h5>
            <div class="ui-seg" style="width:100%;display:grid;grid-template-columns:repeat(3,1fr)">${[['any', 'Tanto faz'], ['sale', 'Comprar'], ['rent', 'Alugar']].map(([k, t]) => `<button type="button" data-deal="${k}" data-f="deal-${k}" aria-pressed="${i.deal === k}">${t}</button>`).join('')}</div>
            <span class="lbl">Tipo de imóvel</span><div class="tags">${TYPES.map((t) => `<button type="button" class="ui-tag" data-type="${t}" data-f="type-${t}" aria-pressed="${i.types.includes(t)}">${t}</button>`).join('')}</div>
            <span class="lbl">Bairros</span><div class="tags">${HOODS.map((t) => `<button type="button" class="ui-tag" data-hood="${t}" data-f="hood-${t}" aria-pressed="${i.hoods.includes(t)}">${t}</button>`).join('')}</div>
            ${i.deal === 'any' ? '' : `<span class="lbl">Preço máximo</span><div class="range-row"><input type="range" data-f="max" min="${rg.min}" max="${rg.max}" step="${rg.step}" value="${Math.min(rg.max, Math.max(rg.min, i.max || rg.max))}" aria-label="Preço máximo"><output id="maxOut">${maxLabel(l)}</output></div>`}
            <span class="lbl">Quartos (mínimo)</span><div class="rooms">${[1, 2, 3, 4].map((n) => `<button type="button" class="ui-tag" data-rooms="${n}" data-f="rooms-${n}" aria-pressed="${i.rooms === n}">${n}+</button>`).join('')}</div>
            <button type="button" class="ui-btn" style="width:100%;margin-top:12px" data-saveint data-f="saveint">Salvar perfil</button>
          </section>
          <section class="pn"><h5>Corretor responsável</h5>
            <select class="ui-in" style="width:100%;cursor:pointer" data-broker data-f="broker" aria-label="Corretor responsável">${Object.entries(BROKERS).map(([k, b]) => `<option value="${k}"${k === l.broker ? ' selected' : ''}>${b.n}</option>`).join('')}</select>
          </section>
        </div>
        ${l.archivedAt ? '' : `<div class="archive-row"><span>Não vai mais trabalhar este lead? Arquive: ele sai do funil, e o histórico fica guardado.</span><button type="button" class="ui-btn ghost" data-arch-dr data-f="arch">Arquivar lead</button></div>`}
      </div>`;
    });
    $('.dr-scroll', drawer).scrollTop = sc;
    l.tl.forEach((e) => (e.fresh = false));
  };

  const log = (l, e) => l.tl.unshift({ at: now(), fresh: true, by: 'Marcos Andrade', ...e });
  drawer.addEventListener('click', (e) => {
    const l = byId(S.open); if (!l) return;
    const t = e.target.closest('button'); if (!t) return;
    const d = t.dataset;
    if ('close' in d) return closeLead();
    if ('wa' in d) return openComposer(l, l.stage === 'novo' ? 1 : 4);
    if ('send' in d) return openComposer(l, 3, d.send);
    if ('call' in d) { log(l, { k: 'call', title: 'Ligação', sub: 'para o cliente' }); toast('Ligação registrada no histórico.'); return renderAll(); }
    if ('note' in d) { if (!S.draft.trim()) return; log(l, { k: 'note', title: 'Anotação', body: S.draft.trim() }); S.draft = ''; toast('Anotação salva.'); return renderAll(); }
    if ('del' in d) { const tk = l.tasks.find((x) => x.id === +d.del); return confirmBox('Excluir lembrete?', `“${tk.title}” sai da lista de retornos.`, 'Excluir', () => { l.tasks = l.tasks.filter((x) => x !== tk); renderAll(); }); }
    if ('quick' in d) { S.taskAt = quick[d.quick](); return renderDrawer(); }
    if ('addtask' in d) {
      const title = S.taskTitle.trim() || 'Retornar contato';
      l.tasks.push({ id: Date.now(), title, at: S.taskAt, done: false });
      toast(`Lembrete criado para ${dmHm(S.taskAt)}.`); S.taskTitle = 'Retornar contato'; S.taskAt = null; return renderAll();
    }
    if ('deal' in d) { l.interest.deal = d.deal; const rg = priceRange(d.deal); l.interest.max = d.deal === 'any' ? null : d.deal === 'rent' ? 3000 : 900000; void rg; return renderDrawer(); }
    if ('type' in d) { const a = l.interest.types; a.includes(d.type) ? a.splice(a.indexOf(d.type), 1) : a.push(d.type); return renderDrawer(); }
    if ('hood' in d) { const a = l.interest.hoods; a.includes(d.hood) ? a.splice(a.indexOf(d.hood), 1) : a.push(d.hood); return renderDrawer(); }
    if ('rooms' in d) { l.interest.rooms = l.interest.rooms === +d.rooms ? 0 : +d.rooms; return renderDrawer(); }
    if ('saveint' in d) { log(l, { k: 'interest', title: 'Perfil de interesse atualizado' }); toast('Perfil de interesse salvo.'); return renderDrawer(); }
    if ('archDr' in d) return confirmArchive(l);
    if ('unarchDr' in d) return setArchived(l, false);
  });
  drawer.addEventListener('input', (e) => {
    const l = byId(S.open); const f = e.target.dataset.f;
    if (f === 'note') { S.draft = e.target.value; $('[data-note]', drawer).disabled = !S.draft.trim(); }
    if (f === 'task-title') S.taskTitle = e.target.value;
    if (f === 'max') { l.interest.max = +e.target.value; $('#maxOut', drawer).textContent = maxLabel(l); $('#mtBox', drawer).innerHTML = matchesHtml(l); }
  });
  drawer.addEventListener('change', (e) => {
    const l = byId(S.open); const el = e.target;
    if (el.dataset.f === 'task-at' && el.value) { S.taskAt = new Date(el.value).getTime(); renderDrawer(); }
    if ('done' in el.dataset) { const tk = l.tasks.find((x) => x.id === +el.dataset.done); tk.done = true; log(l, { k: 'task_done', title: 'Retorno concluído', sub: tk.title }); toast('Retorno concluído.'); renderAll(); }
    if ('broker' in el.dataset) { const from = BROKERS[l.broker].n; l.broker = el.value; log(l, { k: 'assigned', title: 'Repassado', sub: `${from} → ${BROKERS[l.broker].n}` }); toast(`Lead repassado para ${BROKERS[l.broker].n}.`); renderAll(); }
  });

  // ---------- arquivar ----------
  const setArchived = (l, v) => {
    l.archivedAt = v ? now() : null;
    log(l, { k: v ? 'archived' : 'unarchived', title: v ? 'Lead arquivado' : 'Lead desarquivado' });
    toast(v ? 'Lead arquivado. Ele fica em “Arquivados”.' : 'Lead desarquivado. Ele voltou ao funil.');
    if (v && S.open === l.id) closeLead();
    renderAll();
  };
  const confirmArchive = (l) => confirmBox('Arquivar este lead?', `${l.name} sai do funil e dos retornos. O histórico e a etapa ficam guardados, e você pode desarquivar quando quiser em “Arquivados”.`, 'Arquivar lead', () => setArchived(l, true));

  // ---------- janelas (modal) ----------
  const modalBg = $('#modalBg'), modal = $('#modal');
  let onModalClose = null;
  const openModal = (html, label) => { modal.innerHTML = html; modal.setAttribute('aria-label', label); modalBg.classList.add('on'); setTimeout(() => (modal.querySelector('[data-first]') || modal.querySelector('button, select, textarea, input'))?.focus({ preventScroll: true }), 60); };
  const closeModal = () => { modalBg.classList.remove('on'); const f = onModalClose; onModalClose = null; f?.(); };
  modalBg.addEventListener('click', (e) => { if (e.target === modalBg || e.target.closest('[data-mclose]')) closeModal(); });
  win.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (modalBg.classList.contains('on')) closeModal(); else if (S.open) closeLead();
  });
  const confirmBox = (title, text, ok, fn) => {
    openModal(`<h5>${esc(title)}</h5><p class="sub" style="margin-top:6px;font-size:13.5px">${esc(text)}</p><div class="foot"><button type="button" class="ui-btn ghost" data-mclose>Cancelar</button><button type="button" class="ui-btn" data-ok data-first>${esc(ok)}</button></div>`, title);
    modal.querySelector('[data-ok]').onclick = () => { closeModal(); fn(); };
  };
  const askLost = (l) => {
    let pick = null;
    openModal(`<h5>Por que este lead foi perdido?</h5><p class="sub">${esc(l.name)} vai para “Perdido”. O motivo aparece nos números.</p><div class="lost-opts">${LOST.map((r) => `<button type="button" aria-pressed="false" data-r="${esc(r)}">${esc(r)}</button>`).join('')}</div><div class="foot"><button type="button" class="ui-btn ghost" data-mclose>Cancelar</button><button type="button" class="ui-btn" data-ok disabled style="background:#6b7280">Marcar como perdido</button></div>`, 'Motivo da perda');
    modal.querySelector('.lost-opts').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; pick = b.dataset.r; $$('.lost-opts button', modal).forEach((x) => x.setAttribute('aria-pressed', x === b)); modal.querySelector('[data-ok]').disabled = false; };
    modal.querySelector('[data-ok]').onclick = () => { closeModal(); moveLead(l, 'perdido', pick); };
  };

  // WhatsApp com mensagem pronta
  const openComposer = (l, tplId, propKey) => {
    const p = PROPS[propKey || l.prop]; const v = varsFor(l, p);
    let tpl = templates.find((t) => t.id === tplId) || templates[0];
    let text = fill(tpl.body, v);
    const b = BROKERS[l.broker];
    openModal(`<h5>Enviar pelo WhatsApp</h5><p class="sub">Para ${esc(l.name)} · ${l.phone}</p>
      <div class="wa-grid"><div class="ed">
        <select class="ui-in" data-first aria-label="Mensagem pronta">${templates.map((t) => `<option value="${t.id}"${t.id === tpl.id ? ' selected' : ''}>${esc(t.name)}${t.team ? '' : ' (minha)'}</option>`).join('')}</select>
        <textarea class="ui-in" aria-label="Texto da mensagem">${esc(text)}</textarea>
        <p class="hint">Nome, imóvel e link já vêm preenchidos. Ajuste o texto se quiser.</p>
      </div>
      <div class="wa-phone" aria-label="Prévia da conversa"><div class="wh"><i>${l.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</i><div>${esc(l.name)}<small>${l.phone}</small></div></div><div class="wa-bub"></div></div></div>
      <div class="foot"><button type="button" class="ui-btn ghost" data-mclose>Cancelar</button><button type="button" class="ui-btn wa" data-ok><svg><use href="#i-wa"/></svg>Abrir no WhatsApp</button></div>`, 'Enviar pelo WhatsApp');
    const ta = modal.querySelector('textarea'), bub = modal.querySelector('.wa-bub');
    const paint = () => (bub.innerHTML = bubbleHtml(ta.value));
    paint();
    ta.oninput = paint;
    modal.querySelector('select').onchange = (e) => { tpl = templates.find((t) => t.id === +e.target.value); ta.value = fill(tpl.body, v); paint(); };
    modal.querySelector('[data-ok]').onclick = () => {
      log(l, { k: 'whatsapp', title: 'WhatsApp enviado', sub: `Modelo “${tpl.name}”`, body: ta.value.length > 120 ? ta.value.slice(0, 118) + '…' : ta.value, by: b.n });
      closeModal(); toast(`Conversa aberta no WhatsApp de ${b.n.split(' ')[0]}. Ficou registrado no histórico.`); renderAll();
    };
  };

  // novo lead
  const newLead = () => {
    openModal(`<h5>Novo lead</h5><p class="sub">Para quem chamou por telefone ou chegou pela vitrine.</p>
      <div style="display:grid;gap:8px;margin-top:12px">
        <input class="ui-in" data-first data-n="name" placeholder="Nome do cliente" aria-label="Nome">
        <input class="ui-in" data-n="phone" inputmode="tel" placeholder="Telefone" aria-label="Telefone">
        <select class="ui-in" data-n="prop" aria-label="Imóvel de interesse">${Object.entries(PROPS).map(([k, p]) => `<option value="${k}">${esc(propTitle(p))} · ${p.ref}</option>`).join('')}</select>
        <div class="ui-seg" data-n="ch" style="display:grid;grid-template-columns:repeat(3,1fr)">${Object.entries(CHANNEL).map(([k, t], i) => `<button type="button" data-ch="${k}" aria-pressed="${i === 2}">${t}</button>`).join('')}</div>
      </div><div class="foot"><button type="button" class="ui-btn ghost" data-mclose>Cancelar</button><button type="button" class="ui-btn" data-ok>Cadastrar lead</button></div>`, 'Novo lead');
    let ch = 'phone';
    modal.querySelector('[data-n="ch"]').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; ch = b.dataset.ch; $$('[data-ch]', modal).forEach((x) => x.setAttribute('aria-pressed', x === b)); };
    modal.querySelector('[data-ok]').onclick = () => {
      const name = modal.querySelector('[data-n="name"]').value.trim() || 'Interessado sem nome';
      const phone = modal.querySelector('[data-n="phone"]').value.trim() || '(91) 98000-0000';
      const prop = modal.querySelector('[data-n="prop"]').value;
      addLead({ name, phone, prop, channel: ch, broker: 'ma', source: 'Cadastrado no painel' });
      closeModal(); toast(`${name} entrou no funil em “Novo”.`);
    };
  };
  const addLead = ({ name, phone, prop, channel, broker, source }) => {
    const p = PROPS[prop];
    const l = { id: nextId++, name, phone, email: '', channel, stage: 'novo', prop, broker, stageAt: now(), created: now(), tasks: [],
      tl: [{ k: 'created', at: now(), title: 'Lead criado', sub: source }], interest: { deal: p.deal, types: [p.type], hoods: [p.h], max: p.deal === 'rent' ? 3000 : 900000, rooms: Math.min(p.rooms, 2) }, lost: null, archivedAt: null };
    leads.push(l); arrivedId = l.id;
    if (S.archived) S.archived = false;
    S.late = S.today = false;
    renderAll();
    return l;
  };
  $('#cwNew').addEventListener('click', () => (S.tab === 'mensagens' ? newTemplate() : newLead()));

  // ---------- números ----------
  const PERIODS = {
    7: { leads: 12, won: 2, lost: 1, first: '38 min', fast: [9, 12] },
    30: { leads: 47, won: 6, lost: 5, first: '1 h 12 min', fast: [29, 47] },
    90: { leads: 138, won: 17, lost: 19, first: '1 h 40 min', fast: [80, 138] },
    365: { leads: 512, won: 61, lost: 74, first: '2 h 05 min', fast: [276, 512] },
  };
  let period = '30', nBroker = '';
  const rnd = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const series = (days, total) => {
    const r = rnd(days * 7 + 3), buckets = days > 62 ? Math.ceil(days / 7) : days;
    const w = Array.from({ length: buckets }, (_, i) => { const d = new Date(now() - (buckets - 1 - i) * (days > 62 ? 7 : 1) * DAY).getDay(); return (days > 62 ? 1 : d === 0 ? .25 : d === 6 ? .55 : 1) * (.35 + r() * 1.1); });
    const sum = w.reduce((a, b) => a + b, 0); let left = total;
    const out = w.map((x, i) => { const v = i === w.length - 1 ? left : Math.max(0, Math.round((x / sum) * total)); left -= v; return v; });
    return out.map((v) => Math.max(0, v));
  };
  const fmtD = (t) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const renderNums = () => {
    const P = PERIODS[period], days = +period;
    const share = { jf: .34, pr: .27, lc: .22, ma: .17 };
    const k = nBroker ? share[nBroker] : 1;
    const sc = (v) => Math.round(v * k);
    const active = leads.filter((l) => !l.archivedAt && (!nBroker || l.broker === nBroker));
    const late = active.filter((l) => fuState(nextFu(l)) === 'late').length, today = active.filter((l) => fuState(nextFu(l)) === 'today').length;
    const total = sc(P.leads), won = sc(P.won), lost = sc(P.lost), waiting = active.filter((l) => l.stage === 'novo').length;
    const s = series(days, total), max = Math.max(...s, 1), weekly = days > 62;
    const funnel = STAGES.slice(0, 4).map((st) => ({ ...st, v: active.filter((l) => l.stage === st.k).length }));
    const fmax = Math.max(...funnel.map((f) => f.v), 1);
    const result = [['novo', .16], ['visita', .2], ['proposta', .14]].map(([kk, f]) => ({ ...ST[kk], v: Math.round(total * f) }));
    result.splice(1, 0, { ...ST.atend, v: Math.max(0, total - won - lost - result.reduce((a, r) => a + r.v, 0)) });
    result.push({ ...ST.fechado, v: won }, { ...ST.perdido, v: lost });
    const rmax = Math.max(...result.map((r) => r.v), 1);
    const ch = [['WhatsApp', .64], ['Formulário', .24], ['Telefone', .12]].map(([l, f]) => ({ l, v: Math.round(total * f) }));
    const reasons = [['Não respondeu mais', .3], ['Fechou com outra imobiliária', .24], ['Não conseguiu financiamento', .18], ['Achou mais barato em outro lugar', .14], ['Desistiu da mudança', .08], ['Imóvel não atendia', .06]].map(([l, f]) => ({ l, v: Math.round(lost * f) })).filter((r) => r.v > 0);
    const lmax = Math.max(...reasons.map((r) => r.v), 1);
    const hb = (rows, m) => `<ul class="hb">${rows.map((r) => `<li style="--c:${r.c || 'var(--ink)'}"><span title="${esc(r.l)}">${esc(r.l)}</span><span class="tr"><i style="width:${(r.v / m) * 100}%"></i></span><b>${r.v}</b></li>`).join('')}</ul>`;
    const pct = (a, b) => (b ? ((a / b) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '0%');
    const fastA = sc(P.fast[0]), fastB = sc(P.fast[1]);
    keepFocus(() => {
      $('#nums').innerHTML = `
      <div class="nm-bar"><div class="ui-seg">${[['7', '7 dias'], ['30', '30 dias'], ['90', '90 dias'], ['365', '12 meses']].map(([v, t]) => `<button type="button" data-per="${v}" data-f="per-${v}" aria-pressed="${period === v}">${t}</button>`).join('')}</div>
        <select class="ui-in" data-nb data-f="nb" aria-label="Corretor" style="width:200px;cursor:pointer"><option value="">Toda a equipe</option>${Object.entries(BROKERS).map(([kk, b]) => `<option value="${kk}"${nBroker === kk ? ' selected' : ''}>${b.n}</option>`).join('')}</select></div>
      <div class="kpis">
        <div class="kpi"><p>Leads no período</p><b>${total}</b><small>${waiting} aguardando 1º contato</small></div>
        <div class="kpi"><p>Viraram negócio</p><b>${pct(won, total)}</b><small>${won} fechados · ${lost} perdidos</small></div>
        <div class="kpi"><p>Tempo até o 1º contato</p><b>${P.first}</b><small>média do período</small></div>
        <div class="kpi"><p>Respondidos em até 1 h</p><b>${pct(fastA, fastB)}</b><small>${fastA} de ${fastB}</small></div>
        <div class="kpi"><p>Retornos atrasados</p><b class="${late ? 'red' : ''}">${late}</b><small>${today} para hoje</small></div>
      </div>
      <div class="nm-grid">
        <section class="pn wide"><h5>${weekly ? 'Leads por semana' : 'Leads por dia'} <small>${total} no total</small></h5>
          <div class="bars" role="img" aria-label="${weekly ? 'Leads por semana' : 'Leads por dia'}">${s.map((v, i) => `<i class="${v ? '' : 'z'}" style="height:${Math.max(2, (v / max) * 100)}%;animation-delay:${reduce ? 0 : i * (300 / s.length)}ms" title="${v} lead${v === 1 ? '' : 's'}"></i>`).join('')}</div>
          <div class="bars-x"><span>${fmtD(now() - (days - 1) * DAY)}</span><span>${fmtD(now() - Math.round(days / 2) * DAY)}</span><span>hoje</span></div></section>
        <section class="pn"><h5>Funil agora <small>leads em aberto, hoje</small></h5>${hb(funnel.map((f) => ({ l: f.l, v: f.v, c: f.c })), fmax)}</section>
        <section class="pn"><h5>Resultado dos leads <small>onde estão os que chegaram</small></h5>${hb(result.map((r) => ({ l: r.l, v: r.v, c: r.c })), rmax)}</section>
        <section class="pn"><h5>Por onde chegaram</h5>${hb(ch.map((c) => ({ ...c, c: c.l === 'WhatsApp' ? '#1fa855' : 'var(--ink)' })), Math.max(...ch.map((c) => c.v), 1))}</section>
        <section class="pn"><h5>Motivos de perda</h5>${reasons.length ? hb(reasons.map((r) => ({ ...r, c: '#6b7280' })), lmax) : '<p class="empty-s">Nenhum lead perdido no período.</p>'}</section>
        ${nBroker ? '' : `<section class="pn wide"><h5>Por corretor</h5><table class="tbl"><thead><tr><th>Corretor</th><th>Leads</th><th>Em aberto</th><th>Fechados</th><th>Conversão</th><th>1º contato</th></tr></thead><tbody>${Object.entries(BROKERS).map(([kk, b], i) => {
          const lv = Math.round(P.leads * share[kk]), wv = Math.round(P.won * share[kk] * [1.15, .95, .9, .95][i]);
          const open = leads.filter((l) => !l.archivedAt && l.broker === kk && !['fechado', 'perdido'].includes(l.stage)).length;
          return `<tr><td>${avatar(kk)}${b.n}</td><td>${lv}</td><td>${open}</td><td>${wv}</td><td>${pct(wv, lv)}</td><td>${['48 min', '1 h 05 min', '1 h 31 min', '1 h 50 min'][i]}</td></tr>`;
        }).join('')}</tbody></table></section>`}
      </div>`;
    });
  };
  $('#nums').addEventListener('click', (e) => { const b = e.target.closest('[data-per]'); if (b) { period = b.dataset.per; renderNums(); } });
  $('#nums').addEventListener('change', (e) => { if ('nb' in e.target.dataset) { nBroker = e.target.value; renderNums(); } });

  // ---------- mensagens prontas ----------
  const sample = () => leads[0];
  const renderMsgs = () => {
    const t = templates.find((x) => x.id === S.tpl) || templates[0];
    const group = (team) => templates.filter((x) => x.team === team).map((x) => `<button type="button" class="tpl" data-tpl="${x.id}" data-f="tpl-${x.id}" aria-pressed="${x.id === t.id}"><b>${esc(x.name)}<small>${x.team ? 'equipe' : 'só você'}</small></b><p>${tokenHtml(x.body)}</p></button>`).join('');
    const mine = templates.filter((x) => !x.team).length;
    keepFocus(() => {
      $('#msgs').innerHTML = `
      <div class="ms-list"><h5>Da equipe</h5><p class="note">Todos os corretores usam. Só administradores editam.</p>${group(true)}
        <h5 style="margin-top:8px">Minhas mensagens</h5><p class="note">Só você vê.</p>${mine ? group(false) : '<p class="empty-s">Você ainda não criou mensagens próprias.</p>'}</div>
      <div class="ms-ed"><section class="pn"><h5>Editar mensagem <small>${t.team ? 'da equipe' : 'pessoal'}</small></h5>
        <input class="ui-in" data-tname data-f="tname" value="${esc(t.name)}" aria-label="Nome da mensagem" maxlength="40">
        <textarea class="ui-in" data-tbody data-f="tbody" aria-label="Texto da mensagem">${esc(t.body)}</textarea>
        <div><span class="lbl" style="margin-top:0">Toque para inserir no texto</span><div class="vars">${FIELDS.map((f) => `<button type="button" data-ins="${f.code}" data-f="ins-${f.label}">${f.label}</button>`).join('')}</div></div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="ui-btn ghost" data-tdel data-f="tdel">Excluir</button><button type="button" class="ui-btn" data-tsave data-f="tsave">Salvar</button></div></section>
        <section class="pn"><h5>Como o cliente recebe <small>exemplo com ${esc(sample().name.split(' ')[0])}</small></h5>
          <div class="wa-phone"><div class="wh"><i>AB</i><div>${esc(sample().name)}<small>${sample().phone}</small></div></div><div class="wa-bub" id="tplPrev"></div></div></section></div>`;
    });
    paintPrev();
  };
  const paintPrev = () => { const ta = $('[data-tbody]', $('#msgs')); const pv = $('#tplPrev'); if (ta && pv) pv.innerHTML = bubbleHtml(fill(ta.value, varsFor(sample()))); };
  const newTemplate = () => { const t = { id: tplNext++, team: false, name: 'Nova mensagem', body: 'Olá{, nome}! ' }; templates.push(t); S.tpl = t.id; renderMsgs(); const ta = $('[data-tbody]', $('#msgs')); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); };
  $('#msgs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tpl) { S.tpl = +b.dataset.tpl; return renderMsgs(); }
    const ta = $('[data-tbody]', $('#msgs'));
    if (b.dataset.ins) { const s = ta.selectionStart ?? ta.value.length, en = ta.selectionEnd ?? s; ta.value = ta.value.slice(0, s) + b.dataset.ins + ta.value.slice(en); ta.focus(); ta.setSelectionRange(s + b.dataset.ins.length, s + b.dataset.ins.length); return paintPrev(); }
    const t = templates.find((x) => x.id === S.tpl);
    if ('tsave' in b.dataset) { t.name = $('[data-tname]', $('#msgs')).value.trim() || t.name; t.body = ta.value; toast(`Mensagem “${t.name}” salva. Já aparece no WhatsApp da ficha.`); return renderMsgs(); }
    if ('tdel' in b.dataset) return confirmBox('Excluir mensagem?', `“${t.name}” deixa de aparecer na hora de enviar pelo WhatsApp.`, 'Excluir', () => { templates.splice(templates.indexOf(t), 1); S.tpl = templates[0].id; renderMsgs(); toast('Mensagem excluída.'); });
  });
  $('#msgs').addEventListener('input', (e) => { if ('tbody' in e.target.dataset) paintPrev(); });

  // ---------- roteiro ----------
  const tour = document.getElementById('tour');
  const pressTour = (k) => tour && [...tour.children].forEach((b) => b.setAttribute('aria-pressed', b.dataset.t === k));
  const resetView = () => { if (modalBg.classList.contains('on')) closeModal(); if (S.open) closeLead(); S.q = ''; $('#flQ').value = ''; S.late = S.today = S.archived = false; S.view = 'board'; setTab('funil'); };
  const ensureVisible = () => { const r = win.getBoundingClientRect(); if (r.top < 0 || r.top > innerHeight * .5) win.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); };
  let tourBusy = false;
  const demoDrag = () => {
    const l = leads.filter((x) => !x.archivedAt && x.stage === 'atend').sort((a, b) => b.stageAt - a.stageAt)[0];
    if (!l) return toast('Arraste qualquer cartão para outra coluna.');
    const card = board.querySelector(`.card[data-id="${l.id}"]`), col = board.querySelector('.col[data-stage="visita"] .cards');
    if (!card || !col || reduce) return moveLead(l, 'visita');
    col.closest('.col').scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' });
    const a = card.getBoundingClientRect(), b = col.getBoundingClientRect();
    const ghost = card.cloneNode(true); ghost.classList.add('drag-ghost'); Object.assign(ghost.style, { width: a.width + 'px', left: a.left + 'px', top: a.top + 'px' });
    win.appendChild(ghost); card.classList.add('ghosted'); tourBusy = true;
    const target = col.closest('.col');
    const anim = ghost.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: `translate(${(b.left - a.left) * .5}px, -30px) rotate(3deg)`, offset: .45 }, { transform: `translate(${b.left + 7 - a.left}px, ${b.top + 7 - a.top}px) rotate(2deg)` }], { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    setTimeout(() => target.classList.add('over'), 600);
    anim.onfinish = () => { ghost.remove(); target.classList.remove('over'); card.classList.remove('ghosted'); tourBusy = false; moveLead(l, 'visita'); };
  };
  tour?.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || tourBusy) return;
    const k = b.dataset.t; pressTour(k); resetView(); pressTour(k); ensureVisible();
    const go = () => {
      if (k === 'drag') demoDrag();
      if (k === 'lead') openLead(leads.find((l) => l.name === 'Bernardo Sá').id);
      if (k === 'wa') { const l = leads.find((x) => x.name.startsWith('Ana Beatriz')); openLead(l.id); setTimeout(() => openComposer(l, 1), reduce ? 0 : 450); }
      if (k === 'nums') setTab('numeros');
    };
    setTimeout(go, reduce ? 0 : 380);
  });

  // ---------- marca do cliente (vem do bloco "Sua marca") ----------
  document.querySelectorAll('#swatches button').forEach((b) => b.addEventListener('click', () => win.style.setProperty('--brand', b.dataset.c)));

  // ---------- um lead novo chega quando a janela aparece ----------
  let arrived = false;
  const arrive = () => {
    if (arrived) return; arrived = true;
    setTimeout(() => {
      if (S.tab !== 'funil' || S.archived || S.open) return;
      const l = addLead({ name: 'Sofia Martins', phone: '(91) 98247-3390', prop: 'aptUma', channel: 'whatsapp', broker: 'lc', source: 'Contato pelo site' });
      toast(`Novo lead pelo WhatsApp: ${l.name} · ${PROPS.aptUma.t} no ${PROPS.aptUma.h}`);
    }, reduce ? 600 : 2200);
  };
  if ('IntersectionObserver' in window) new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { arrive(); io.disconnect(); } }), { threshold: .45 }).observe(win);

  // relógio: "há X min" e retornos de hoje que viram atrasados
  setInterval(() => { if (!drag && document.visibilityState === 'visible') renderAll(); }, 60e3);

  renderFunnel();
})();
