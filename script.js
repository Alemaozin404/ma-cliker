const SAVE_KEY = "maca_clicker_ultra_v3_save";
const OLD_SAVE_KEYS = [
  "maca_clicker_black_white_save_v2",
  "maca_clicker_black_white_save_v1"
];

const EVENT_INTERVAL_MS = 30 * 60 * 1000;
const EVENT_DURATION_MS = 5 * 60 * 1000;
const RARE_EVENT_CHECK_MS = 60 * 1000;
const RARE_EVENT_DURATION_MS = 2 * 60 * 1000;
const WELISON_EVENT_DURATION_MS = 60 * 60 * 1000;
const WELISON_EVENT_DAY = 6;
const WELISON_EVENT_HOUR = 15;
const WELISON_EVENT_MINUTE = 30;

const fruits = [
  { prestige: 0, name: "Maçã Prata", shortName: "Prata", icon: "🍎", tier: "tier-silver", bonus: 1 },
  { prestige: 10, name: "Maçã Bronze", shortName: "Bronze", icon: "🍏", tier: "tier-bronze", bonus: 1.2 },
  { prestige: 20, name: "Maçã de Ouro", shortName: "Ouro", icon: "🍎", tier: "tier-gold", bonus: 1.5 },
  { prestige: 30, name: "Maçã de Rubi", shortName: "Rubi", icon: "🍒", tier: "tier-ruby", bonus: 1.85 },
  { prestige: 40, name: "Maçã de Cristal", shortName: "Cristal", icon: "💎", tier: "tier-crystal", bonus: 2.25 }
];

const themes = [
  { id: "theme-pure", name: "Preto Puro", desc: "Mais escuro, seco e direto." },
  { id: "theme-luxury", name: "Cinza Luxo", desc: "Contraste premium com bordas fortes." },
  { id: "theme-crystal", name: "Cristal", desc: "Mais brilho e efeito gelado." },
  { id: "theme-gold-bw", name: "Ouro B&W", desc: "Toque elegante sem sair do preto e branco." },
  { id: "theme-ruby-dark", name: "Rubi Escuro", desc: "Visual escuro com clima mais raro." }
];

const state = {
  apples: 0,
  clickPower: 1,
  autoCollector: 0,
  multiplier: 1,
  criticalChance: 0,
  criticalPower: 5,
  farm: 0,
  harvester: 0,
  fastHand: 0,
  supremeLuck: 0,
  rainBonus: 0,
  eventClock: 0,
  eventCaller: 0,
  prestige: 0,

  costs: {
    clickPower: 25,
    fastHand: 180,
    autoCollector: 75,
    farm: 600,
    harvester: 2500,
    multiplier: 200,
    criticalChance: 350,
    supremeLuck: 1800,
    criticalPower: 2400,
    rainBonus: 1000,
    eventClock: 3500,
    eventCaller: 7000,
    prestige: 5000
  },

  rainActive: false,
  rainTime: 0,

  eventActive: false,
  eventEndsAt: 0,
  nextEventAt: Date.now() + EVENT_INTERVAL_MS,

  rareEvent: null,
  rareEventEndsAt: 0,

  welisonEventActive: false,
  welisonEventEndsAt: 0,
  welisonEventLastKey: "",

  soundEnabled: false,
  theme: "theme-pure",

  stats: {
    totalClicks: 0,
    totalFruitsCollected: 0,
    totalPrestiges: 0,
    totalEventsUsed: 0,
    totalRareEvents: 0,
    totalPurchases: 0,
    bestClickGain: 0,
    bestAutoGain: 0,
    startedAt: Date.now(),
    playSeconds: 0,
    unlockedFruitPrestiges: [0]
  },

  achievements: {}
};

const rareEvents = [
  {
    id: "infiniteRain",
    name: "Chuva Infinita",
    desc: "Chuva ativada de graça por 1 minuto.",
    start() {
      state.rainActive = true;
      state.rainTime = Math.max(state.rainTime, 60);
      startVisualRain();
    }
  },
  {
    id: "doubleCrit",
    name: "Crítico Dobrado",
    desc: "Chance crítica dobrada temporariamente.",
    start() {}
  },
  {
    id: "auto3x",
    name: "Auto Farm 3x",
    desc: "Ganho automático triplicado temporariamente.",
    start() {}
  },
  {
    id: "legendaryFruit",
    name: "Fruta Lendária",
    desc: "Bônus extra de 4x temporário.",
    start() {}
  }
];

const achievements = [
  { id: "firstClick", icon: "👆", title: "Primeiro clique", desc: "Clique na fruta pela primeira vez.", reward: 25, check: () => state.stats.totalClicks >= 1 },
  { id: "hundredFruits", icon: "🍎", title: "100 frutas", desc: "Colete 100 frutas no total.", reward: 100, check: () => state.stats.totalFruitsCollected >= 100 },
  { id: "firstBuy", icon: "🛒", title: "Primeira compra", desc: "Compre uma melhoria.", reward: 150, check: () => state.stats.totalPurchases >= 1 },
  { id: "firstPrestige", icon: "⭐", title: "Primeiro prestígio", desc: "Faça seu primeiro prestígio.", reward: 500, check: () => state.prestige >= 1 },
  { id: "eventUsed", icon: "⚡", title: "Energia 2x", desc: "Participe de um evento 2x.", reward: 750, check: () => state.stats.totalEventsUsed >= 1 },
  { id: "goldFruit", icon: "🏆", title: "Maçã de Ouro", desc: "Desbloqueie a Maçã de Ouro.", reward: 2000, check: () => state.prestige >= 20 },
  { id: "crystalFruit", icon: "💎", title: "Cristal Supremo", desc: "Desbloqueie a Maçã de Cristal.", reward: 10000, check: () => state.prestige >= 40 },
  { id: "clickMaster", icon: "🔥", title: "Mestre dos cliques", desc: "Faça 1.000 cliques.", reward: 5000, check: () => state.stats.totalClicks >= 1000 },
  { id: "autoKing", icon: "⚙️", title: "Rei do automático", desc: "Chegue a 1.000 frutas por segundo.", reward: 8000, check: () => getAutoGain() >= 1000 },
  { id: "rareHunter", icon: "🌑", title: "Caçador de eventos", desc: "Participe de um evento raro.", reward: 3000, check: () => state.stats.totalRareEvents >= 1 }
];

const upgrades = [
  {
    id: "clickPower", category: "click", title: "Força do Clique", desc: "+1 fruta por clique.", level: () => `Nível: ${state.clickPower}`, max: null,
    buy() { state.apples -= state.costs.clickPower; state.clickPower += 1; state.costs.clickPower = Math.floor(state.costs.clickPower * 1.45); toast("Força do clique melhorada."); }
  },
  {
    id: "fastHand", category: "click", title: "Mão Rápida", desc: "+5 frutas por clique.", level: () => `Nível: ${state.fastHand}`, max: null,
    buy() { state.apples -= state.costs.fastHand; state.fastHand += 1; state.costs.fastHand = Math.floor(state.costs.fastHand * 1.62); toast("Mão rápida melhorada."); }
  },
  {
    id: "criticalChance", category: "click", title: "Clique Crítico", desc: "+5% chance de crítico. Máximo: 60%.", level: () => `Chance: ${getCriticalChance()}%`, max: 60,
    buy() { state.apples -= state.costs.criticalChance; state.criticalChance += 5; state.costs.criticalChance = Math.floor(state.costs.criticalChance * 1.8); toast("Chance crítica aumentada."); }
  },
  {
    id: "supremeLuck", category: "click", title: "Sorte Suprema", desc: "+2% de crítico extra. Máximo: 20 níveis.", level: () => `Nível: ${state.supremeLuck}/20`, max: 20,
    buy() { state.apples -= state.costs.supremeLuck; state.supremeLuck += 1; state.costs.supremeLuck = Math.floor(state.costs.supremeLuck * 1.85); toast("Sorte suprema comprada."); }
  },
  {
    id: "criticalPower", category: "click", title: "Crítico Supremo", desc: "+1x no poder do crítico.", level: () => `Crítico: x${state.criticalPower}`, max: null,
    buy() { state.apples -= state.costs.criticalPower; state.criticalPower += 1; state.costs.criticalPower = Math.floor(state.costs.criticalPower * 2.15); toast("Crítico supremo melhorado."); }
  },
  {
    id: "autoCollector", category: "auto", title: "Auto Coletor", desc: "+1 fruta por segundo.", level: () => `Nível: ${state.autoCollector}`, max: null,
    buy() { state.apples -= state.costs.autoCollector; state.autoCollector += 1; state.costs.autoCollector = Math.floor(state.costs.autoCollector * 1.55); toast("Auto coletor comprado."); }
  },
  {
    id: "farm", category: "auto", title: "Fazenda", desc: "+10 frutas por segundo.", level: () => `Nível: ${state.farm}`, max: null,
    buy() { state.apples -= state.costs.farm; state.farm += 1; state.costs.farm = Math.floor(state.costs.farm * 1.7); toast("Fazenda comprada."); }
  },
  {
    id: "harvester", category: "auto", title: "Colheitadeira", desc: "+75 frutas por segundo.", level: () => `Nível: ${state.harvester}`, max: null,
    buy() { state.apples -= state.costs.harvester; state.harvester += 1; state.costs.harvester = Math.floor(state.costs.harvester * 1.82); toast("Colheitadeira comprada."); }
  },
  {
    id: "multiplier", category: "prestige", title: "Multiplicador", desc: "+1x em todos os ganhos.", level: () => `Nível: x${state.multiplier}`, max: null,
    buy() { state.apples -= state.costs.multiplier; state.multiplier += 1; state.costs.multiplier = Math.floor(state.costs.multiplier * 2.1); toast("Multiplicador aumentado."); }
  },
  {
    id: "rainBonus", category: "event", title: "Chuva de Frutas", desc: "Ativa bônus temporário por 20 segundos.", level: () => state.rainActive ? `Ativa: ${state.rainTime}s` : `Bônus: ${state.rainBonus}`, max: null,
    buy() {
      if (state.rainActive) { toast("A chuva já está ativa."); return false; }
      state.apples -= state.costs.rainBonus; state.rainBonus += 1; state.costs.rainBonus = Math.floor(state.costs.rainBonus * 1.9); state.rainActive = true; state.rainTime = 20; startVisualRain(); toast("Chuva de frutas ativada.");
    }
  },
  {
    id: "eventClock", category: "event", title: "Relógio 2x", desc: "+30s na duração do evento 2x.", level: () => `Nível: ${state.eventClock}`, max: null,
    buy() { state.apples -= state.costs.eventClock; state.eventClock += 1; state.costs.eventClock = Math.floor(state.costs.eventClock * 1.95); toast("Relógio 2x melhorado."); }
  },
  {
    id: "eventCaller", category: "event", title: "Chamado do Evento", desc: "Reduz 1 minuto da espera do evento 2x. Máximo: 20.", level: () => `Nível: ${state.eventCaller}/20`, max: 20,
    buy() { state.apples -= state.costs.eventCaller; state.eventCaller += 1; state.costs.eventCaller = Math.floor(state.costs.eventCaller * 2.05); toast("Chamado do evento melhorado."); }
  },
  {
    id: "prestige", category: "prestige", title: "Prestígio", desc: "Reseta quase tudo, aumenta poder e desbloqueia frutas.", level: () => `Nível: ${state.prestige}`, max: null,
    buy() {
      state.apples = 0; state.clickPower = 1; state.autoCollector = 0; state.multiplier = 1; state.criticalChance = 0; state.criticalPower = 5; state.farm = 0; state.harvester = 0; state.fastHand = 0; state.supremeLuck = 0; state.rainBonus = 0; state.eventClock = 0; state.eventCaller = 0; state.rainActive = false; state.rainTime = 0;
      state.costs.clickPower = 25; state.costs.fastHand = 180; state.costs.autoCollector = 75; state.costs.farm = 600; state.costs.harvester = 2500; state.costs.multiplier = 200; state.costs.criticalChance = 350; state.costs.supremeLuck = 1800; state.costs.criticalPower = 2400; state.costs.rainBonus = 1000; state.costs.eventClock = 3500; state.costs.eventCaller = 7000;
      state.prestige += 1; state.stats.totalPrestiges += 1; state.costs.prestige = Math.floor(state.costs.prestige * 2.5);
      checkFruitUnlock();
      toast(`Prestígio concluído. Fruta atual: ${getCurrentFruit().name}.`);
    }
  }
];

const els = {
  appleCount: document.getElementById("appleCount"),
  clickPower: document.getElementById("clickPower"),
  autoPower: document.getElementById("autoPower"),
  multiPower: document.getElementById("multiPower"),
  prestigePower: document.getElementById("prestigePower"),
  appleButton: document.getElementById("appleButton"),
  floatingLayer: document.getElementById("floatingLayer"),
  upgrades: document.getElementById("upgrades"),
  toast: document.getElementById("toast"),
  saveText: document.getElementById("saveText"),
  saveDot: document.getElementById("saveDot"),
  manualSaveBtn: document.getElementById("manualSaveBtn"),
  resetBtn: document.getElementById("resetBtn"),
  eventTitle: document.getElementById("eventTitle"),
  eventTimer: document.getElementById("eventTimer"),
  fruitIconSmall: document.getElementById("fruitIconSmall"),
  fruitIconMain: document.getElementById("fruitIconMain"),
  fruitName: document.getElementById("fruitName"),
  fruitTier: document.getElementById("fruitTier"),
  nextFruitText: document.getElementById("nextFruitText"),
  fruitProgressText: document.getElementById("fruitProgressText"),
  fruitProgressBar: document.getElementById("fruitProgressBar"),
  fruitRoadmap: document.getElementById("fruitRoadmap"),
  tapHelp: document.getElementById("tapHelp"),
  formulaHelp: document.getElementById("formulaHelp"),
  achievements: document.getElementById("achievements"),
  achievementCount: document.getElementById("achievementCount"),
  statGrid: document.getElementById("statGrid"),
  rankingGrid: document.getElementById("rankingGrid"),
  themes: document.getElementById("themes"),
  soundToggle: document.getElementById("soundToggle"),
  unlockModal: document.getElementById("unlockModal"),
  unlockIcon: document.getElementById("unlockIcon"),
  unlockTitle: document.getElementById("unlockTitle"),
  unlockText: document.getElementById("unlockText"),
  unlockClose: document.getElementById("unlockClose")
};

let activeCategory = "click";
let twoXRainInterval = null;

function formatNumber(value) {
  const number = Math.floor(value);
  if (number < 1000) return String(number);
  return Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 2 }).format(number);
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getCurrentFruit() {
  let current = fruits[0];
  for (const fruit of fruits) if (state.prestige >= fruit.prestige) current = fruit;
  return current;
}

function getNextFruit() {
  return fruits.find((fruit) => fruit.prestige > state.prestige) || null;
}

function fruitBonus() { return getCurrentFruit().bonus; }
function prestigeBonus() { return 1 + state.prestige; }
function eventMultiplier() {
  let multiplier = state.eventActive ? 2 : 1;
  if (state.welisonEventActive) multiplier *= 5;
  return multiplier;
}

function rareMultiplier(type) {
  if (!state.rareEvent) return 1;
  if (state.rareEvent === "auto3x" && type === "auto") return 3;
  if (state.rareEvent === "legendaryFruit") return 4;
  return 1;
}

function getCriticalChance() {
  return Math.min(60, state.criticalChance + state.supremeLuck * 2);
}

function getClickBase() {
  return state.clickPower + state.fastHand * 5;
}

function getActiveMultipliers(type = "click") {
  const list = [];

  const prestige = prestigeBonus();
  if (prestige !== 1) {
    list.push({ id: "prestige", label: "Prestígio", value: prestige });
  }

  const fruit = fruitBonus();
  if (fruit !== 1) {
    list.push({ id: "fruit", label: getCurrentFruit().shortName, value: fruit });
  }

  if (state.eventActive) {
    list.push({ id: "event2x", label: "Evento 2x", value: 2 });
  }

  if (state.welisonEventActive) {
    list.push({ id: "welison", label: "Welison 5x", value: 5 });
  }

  if (state.rareEvent === "auto3x" && type === "auto") {
    list.push({ id: "rareAuto", label: "Auto 3x", value: 3 });
  }

  if (state.rareEvent === "legendaryFruit") {
    list.push({ id: "rareFruit", label: "Fruta Lendária 4x", value: 4 });
  }

  return list;
}

function multiplyList(list) {
  return list.reduce((total, item) => total * item.value, 1);
}

function getClickBreakdown(isCritical = false) {
  const base = getClickBase();
  const multipliers = getActiveMultipliers("click");
  let criticalMultiplier = 1;

  if (isCritical) {
    criticalMultiplier = state.criticalPower;
    if (state.rareEvent === "doubleCrit") criticalMultiplier *= 2;
    multipliers.push({ id: "critical", label: "Crítico", value: criticalMultiplier });
  }

  const rainBonus = getRainClickBonus();
  const multiplierTotal = multiplyList(multipliers);
  const multiplied = base * multiplierTotal;
  const total = multiplied + rainBonus;

  return {
    base,
    multipliers,
    multiplierTotal,
    multiplied,
    rainBonus,
    total,
    isCritical
  };
}

function getAutoBreakdown() {
  const base = getAutoBase();
  const multipliers = getActiveMultipliers("auto");
  const multiplierTotal = multiplyList(multipliers);
  const total = base * multiplierTotal;

  return { base, multipliers, multiplierTotal, total };
}

function formatMultiplier(value) {
  if (Number.isInteger(value)) return `x${value}`;
  return `x${value.toFixed(2).replace(".", ",")}`;
}

function getMultiplierLabel(multipliers) {
  if (!multipliers.length) return "sem multiplicador ativo";
  return multipliers.map(item => `${item.label} ${formatMultiplier(item.value)}`).join(" · ");
}

function getEventLogicClass(multipliers) {
  if (multipliers.some(item => item.id === "welison")) return "welison";
  if (multipliers.some(item => item.id === "rareAuto" || item.id === "rareFruit")) return "rare";
  if (multipliers.some(item => item.id === "event2x")) return "event";
  return "";
}

function getClickGain() {
  return getClickBreakdown(false).total;
}

function getAutoBase() {
  return state.autoCollector + state.farm * 10 + state.harvester * 75;
}

function getAutoGain() {
  return getAutoBreakdown().total;
}

function getRainClickBonus() {
  if (!state.rainActive) return 0;
  return 10 * Math.max(1, state.rainBonus) * eventMultiplier();
}

function getEventInterval() {
  const reduction = Math.min(20, state.eventCaller) * 60 * 1000;
  return Math.max(10 * 60 * 1000, EVENT_INTERVAL_MS - reduction);
}

function getEventDuration() {
  return EVENT_DURATION_MS + state.eventClock * 30 * 1000;
}

function renderUpgrades() {
  els.upgrades.innerHTML = "";
  const list = upgrades.filter((upgrade) => upgrade.category === activeCategory);

  for (const upgrade of list) {
    const cost = state.costs[upgrade.id];
    const canBuy = state.apples >= cost;
    const isMaxed = upgrade.max !== null && getUpgradeValue(upgrade.id) >= upgrade.max;

    const button = document.createElement("button");
    button.className = `upgrade ${canBuy ? "" : "locked"} ${isMaxed ? "maxed" : ""}`;
    button.innerHTML = `
      <div class="upgrade-top">
        <h3>${upgrade.title}</h3>
        <span class="cost">${isMaxed ? "MAX" : `${formatNumber(cost)} 🍎`}</span>
      </div>
      <p>${upgrade.desc}</p>
      <span class="level">${upgrade.level()}</span>
    `;
    button.addEventListener("click", () => buyUpgrade(upgrade));
    els.upgrades.appendChild(button);
  }
}

function getUpgradeValue(id) {
  if (id === "criticalChance") return getCriticalChance();
  return state[id] ?? 0;
}

function renderFruitRoadmap() {
  els.fruitRoadmap.innerHTML = "";
  const current = getCurrentFruit();
  for (const fruit of fruits) {
    const item = document.createElement("div");
    item.className = `roadmap-item ${fruit.name === current.name ? "active" : ""}`;
    item.innerHTML = `<span class="roadmap-icon">${fruit.icon}</span><span>${fruit.prestige} prestígios · ${fruit.name} · bônus x${fruit.bonus}</span>`;
    els.fruitRoadmap.appendChild(item);
  }
}

function renderFruit() {
  const current = getCurrentFruit();
  const next = getNextFruit();
  els.fruitIconSmall.textContent = current.icon;
  els.fruitIconMain.textContent = current.icon;
  els.fruitName.textContent = current.name;
  els.fruitTier.textContent = `Bônus da fruta: x${current.bonus}`;
  els.tapHelp.textContent = `Clique na ${current.name} para coletar`;
  for (const fruit of fruits) els.appleButton.classList.remove(fruit.tier);
  els.appleButton.classList.add(current.tier);

  if (next) {
    const previousTierPrestige = current.prestige;
    const range = next.prestige - previousTierPrestige;
    const progress = Math.min(100, Math.max(0, ((state.prestige - previousTierPrestige) / range) * 100));
    els.nextFruitText.textContent = `Próxima fruta: ${next.name} no prestígio ${next.prestige}`;
    els.fruitProgressText.textContent = `${Math.floor(progress)}%`;
    els.fruitProgressBar.style.width = `${progress}%`;
  } else {
    els.nextFruitText.textContent = "Fruta máxima desbloqueada";
    els.fruitProgressText.textContent = "100%";
    els.fruitProgressBar.style.width = "100%";
  }
}


function getWelisonSaturdayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextWelisonSaturday(now = new Date()) {
  const next = new Date(now);
  next.setHours(WELISON_EVENT_HOUR, WELISON_EVENT_MINUTE, 0, 0);

  const day = next.getDay();
  let daysUntilSaturday = (WELISON_EVENT_DAY - day + 7) % 7;

  if (daysUntilSaturday === 0 && now.getTime() >= next.getTime() + WELISON_EVENT_DURATION_MS) {
    daysUntilSaturday = 7;
  }

  next.setDate(next.getDate() + daysUntilSaturday);
  return next;
}

function startWelisonEvent(now = new Date()) {
  const key = getWelisonSaturdayKey(now);
  const start = new Date(now);
  start.setHours(WELISON_EVENT_HOUR, WELISON_EVENT_MINUTE, 0, 0);
  const end = new Date(start.getTime() + WELISON_EVENT_DURATION_MS);

  state.welisonEventActive = true;
  state.welisonEventEndsAt = end.getTime();
  state.welisonEventLastKey = key;

  toast("Evento Welison 5x começou! Tema azul ativo até 16:30.");
  playSound("event");
  saveGame("Evento Welison 5x iniciado.");
}

function tickWelisonEvent() {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(WELISON_EVENT_HOUR, WELISON_EVENT_MINUTE, 0, 0);
  const endToday = new Date(startToday.getTime() + WELISON_EVENT_DURATION_MS);
  const todayKey = getWelisonSaturdayKey(now);

  const isSaturday = now.getDay() === WELISON_EVENT_DAY;
  const insideWindow = isSaturday && now >= startToday && now < endToday;

  if (insideWindow && !state.welisonEventActive && state.welisonEventLastKey !== todayKey) {
    startWelisonEvent(now);
  }

  if (state.welisonEventActive && now.getTime() >= state.welisonEventEndsAt) {
    state.welisonEventActive = false;
    state.welisonEventEndsAt = 0;
    toast("Evento Welison 5x terminou.");
    saveGame("Evento Welison 5x finalizado.");
  }

  if (state.welisonEventActive) {
    document.body.classList.add("welison-event-active");
  } else {
    document.body.classList.remove("welison-event-active");
  }
}

function renderEvent() {
  const now = Date.now();

  if (state.welisonEventActive) {
    els.eventTitle.textContent = "Welison 5x ativo";
    els.eventTimer.textContent = `tema azul · termina em ${formatTime(state.welisonEventEndsAt - now)}`;
    document.body.classList.add("welison-event-active");
    document.body.classList.remove("rare-event-active");
    document.body.classList.remove("event-active");
    stopTwoXAppleRain();
    return;
  }

  document.body.classList.remove("welison-event-active");

  if (state.rareEvent) {
    const rare = rareEvents.find(e => e.id === state.rareEvent);
    els.eventTitle.textContent = rare ? rare.name : "Evento raro";
    els.eventTimer.textContent = `raro termina em ${formatTime(state.rareEventEndsAt - now)}`;
    document.body.classList.add("rare-event-active");
    document.body.classList.remove("event-active");
    return;
  }

  document.body.classList.remove("rare-event-active");

  if (state.eventActive) {
    els.eventTitle.textContent = "Evento 2x ativo";
    els.eventTimer.textContent = `termina em ${formatTime(state.eventEndsAt - now)}`;
    document.body.classList.add("event-active");
    startTwoXAppleRain();
  } else {
    const nextWelison = getNextWelisonSaturday(new Date());
    const welisonRemaining = nextWelison.getTime() - now;
    const normalRemaining = state.nextEventAt - now;

    if (welisonRemaining < normalRemaining || welisonRemaining < 24 * 60 * 60 * 1000) {
      els.eventTitle.textContent = "Welison 5x";
      els.eventTimer.textContent = `sábado 15:30 · começa em ${formatTime(welisonRemaining)}`;
    } else {
      els.eventTitle.textContent = "Evento 2x";
      els.eventTimer.textContent = `começa em ${formatTime(normalRemaining)}`;
    }

    document.body.classList.remove("event-active");
    stopTwoXAppleRain();
  }
}

function renderAchievements() {
  els.achievements.innerHTML = "";
  const unlocked = achievements.filter(a => state.achievements[a.id]).length;
  els.achievementCount.textContent = `${unlocked}/${achievements.length}`;

  for (const achievement of achievements) {
    const done = !!state.achievements[achievement.id];
    const item = document.createElement("div");
    item.className = `achievement ${done ? "done" : ""}`;
    item.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <div>
        <strong>${achievement.title}</strong>
        <span>${achievement.desc}</span>
      </div>
      <span class="reward">${done ? "OK" : `+${formatNumber(achievement.reward)} 🍎`}</span>
    `;
    els.achievements.appendChild(item);
  }
}

function renderStats() {
  const playSeconds = state.stats.playSeconds + Math.floor((Date.now() - state.stats.startedAt) / 1000);
  const stats = [
    ["Cliques", formatNumber(state.stats.totalClicks)],
    ["Frutas totais", formatNumber(state.stats.totalFruitsCollected)],
    ["Tempo jogado", formatReadableTime(playSeconds)],
    ["Prestígios", formatNumber(state.prestige)],
    ["Maior clique", formatNumber(state.stats.bestClickGain)],
    ["Auto atual", `${formatNumber(getAutoGain())}/s`],
    ["Eventos 2x", formatNumber(state.stats.totalEventsUsed)],
    ["Eventos raros", formatNumber(state.stats.totalRareEvents)]
  ];

  els.statGrid.innerHTML = stats.map(([label, value]) => `
    <div class="stat-item">
      <strong>${value}</strong>
      <span>${label}</span>
    </div>
  `).join("");

  els.rankingGrid.innerHTML = `
    <div class="ranking-item"><strong>${formatNumber(Math.max(state.apples, Number(localStorage.getItem("best_apples") || 0)))}</strong><span>Melhor pontuação</span></div>
    <div class="ranking-item"><strong>${formatNumber(Math.max(state.prestige, Number(localStorage.getItem("best_prestige") || 0)))}</strong><span>Maior prestígio</span></div>
    <div class="ranking-item"><strong>${formatNumber(Math.max(state.stats.bestClickGain, Number(localStorage.getItem("best_click") || 0)))}</strong><span>Maior clique</span></div>
    <div class="ranking-item"><strong>${formatNumber(Math.max(getAutoGain(), Number(localStorage.getItem("best_auto") || 0)))}/s</strong><span>Maior auto</span></div>
  `;
}

function formatReadableTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function renderThemes() {
  els.themes.innerHTML = "";
  for (const theme of themes) {
    const item = document.createElement("button");
    item.className = `theme-card ${state.theme === theme.id ? "active" : ""}`;
    item.innerHTML = `<strong>${theme.name}</strong><span>${theme.desc}</span>`;
    item.addEventListener("click", () => setTheme(theme.id));
    els.themes.appendChild(item);
  }
}

function render() {
  els.appleCount.textContent = formatNumber(state.apples);
  els.clickPower.textContent = `Clique: +${formatNumber(getClickGain() + getRainClickBonus())}`;
  els.autoPower.textContent = `Auto: ${formatNumber(getAutoGain())}/s`;
  els.multiPower.textContent = `Multi: x${state.multiplier}`;
  els.prestigePower.textContent = `Prestígio: ${state.prestige}`;
  if (els.formulaHelp) {
    const clickBreakdown = getClickBreakdown(false);
    els.formulaHelp.textContent = `Clique lógico: ${formatNumber(clickBreakdown.base)} base × ${formatMultiplier(clickBreakdown.multiplierTotal)} = ${formatNumber(clickBreakdown.multiplied)}${clickBreakdown.rainBonus > 0 ? ` + chuva ${formatNumber(clickBreakdown.rainBonus)}` : ""}`;
  }
  els.soundToggle.textContent = state.soundEnabled ? "🔊 Sons" : "🔇 Sons";

  renderFruit();
  renderEvent();
  renderUpgrades();
  renderFruitRoadmap();
  renderAchievements();
  renderStats();
  renderThemes();
  updateBestRanking();
}

function buyUpgrade(upgrade) {
  const cost = state.costs[upgrade.id];
  const isMaxed = upgrade.max !== null && getUpgradeValue(upgrade.id) >= upgrade.max;

  if (isMaxed) {
    toast("Essa melhoria já está no máximo.");
    playSound("error");
    return;
  }

  if (state.apples < cost) {
    toast("Frutas insuficientes.");
    shakeElement(els.upgrades);
    playSound("error");
    return;
  }

  const result = upgrade.buy();
  if (result === false) return;

  state.stats.totalPurchases += 1;
  playSound("buy");
  saveGame("Salvo após compra.");
  checkAchievements();
  render();
}

function clickFruit(event) {
  const criticalHappened = getCriticalChance() > 0 && Math.random() * 100 <= getCriticalChance();
  const breakdown = getClickBreakdown(criticalHappened);
  const gain = breakdown.total;

  state.apples += gain;
  state.stats.totalClicks += 1;
  state.stats.totalFruitsCollected += gain;
  state.stats.bestClickGain = Math.max(state.stats.bestClickGain, gain);

  const rect = els.floatingLayer.getBoundingClientRect();
  const label = getMultiplierLabel(breakdown.multipliers);
  const logicClass = getEventLogicClass(breakdown.multipliers);

  let detail = `${formatNumber(breakdown.base)} × ${formatMultiplier(breakdown.multiplierTotal)} = ${formatNumber(breakdown.multiplied)}`;

  if (breakdown.rainBonus > 0) {
    detail += ` + chuva ${formatNumber(breakdown.rainBonus)}`;
  }

  createLogicFloatText(
    event.clientX - rect.left,
    event.clientY - rect.top,
    `+${formatNumber(gain)} 🍎`,
    `${detail} · ${label}`,
    logicClass,
    criticalHappened
  );

  burstParticles(event.clientX, event.clientY);

  playSound(criticalHappened ? "critical" : "click");
  checkAchievements();
  render();
}

function createFloatText(x, y, text, critical = false) {
  const floatText = document.createElement("span");
  floatText.className = `float-text ${critical ? "critical" : ""}`;
  floatText.textContent = text;
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;
  els.floatingLayer.appendChild(floatText);
  setTimeout(() => floatText.remove(), 950);
}

function createLogicFloatText(x, y, mainText, detailText, eventClass = "", critical = false) {
  const floatText = document.createElement("span");
  floatText.className = `float-text logic ${eventClass} ${critical ? "critical" : ""}`;
  floatText.innerHTML = `<strong>${mainText}</strong><span>${detailText}</span>`;
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;
  els.floatingLayer.appendChild(floatText);
  setTimeout(() => floatText.remove(), 1150);
}

function burstParticles(x, y) {
  const current = getCurrentFruit();
  for (let i = 0; i < 9; i++) {
    const p = document.createElement("span");
    p.className = "rain-apple";
    p.textContent = current.icon;
    p.style.left = `${x + (Math.random() * 90 - 45)}px`;
    p.style.top = `${y + (Math.random() * 44 - 22)}px`;
    p.style.animationDuration = `${0.6 + Math.random() * 0.4}s`;
    p.style.fontSize = `${14 + Math.random() * 12}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

function startVisualRain() {
  let created = 0;
  const current = getCurrentFruit();
  const interval = setInterval(() => {
    if (!state.rainActive || created >= 90) { clearInterval(interval); return; }
    const fruit = document.createElement("span");
    fruit.className = "rain-apple";
    fruit.textContent = current.icon;
    fruit.style.left = `${Math.random() * 100}vw`;
    fruit.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    fruit.style.fontSize = `${15 + Math.random() * 18}px`;
    document.body.appendChild(fruit);
    setTimeout(() => fruit.remove(), 4700);
    created++;
  }, 180);
}

function tickAuto() {
  const gain = getAutoGain();
  if (gain > 0) {
    state.apples += gain;
    state.stats.totalFruitsCollected += gain;
    state.stats.bestAutoGain = Math.max(state.stats.bestAutoGain, gain);
    const autoBreakdown = getAutoBreakdown();
    createLogicFloatText(
      200 + Math.random() * 260,
      180 + Math.random() * 110,
      `+${formatNumber(gain)} auto 🍎`,
      `${formatNumber(autoBreakdown.base)} × ${formatMultiplier(autoBreakdown.multiplierTotal)} = ${formatNumber(autoBreakdown.total)} · ${getMultiplierLabel(autoBreakdown.multipliers)}`,
      getEventLogicClass(autoBreakdown.multipliers),
      false
    );
    checkAchievements();
    render();
  }
}

function tickRain() {
  if (!state.rainActive) return;
  state.rainTime -= 1;
  if (state.rainTime <= 0) {
    state.rainActive = false;
    state.rainTime = 0;
    toast("Chuva de frutas terminou.");
    saveGame("Chuva finalizada.");
  }
  render();
}


function startTwoXAppleRain() {
  if (twoXRainInterval) return;

  twoXRainInterval = setInterval(() => {
    if (!state.eventActive || state.welisonEventActive) {
      stopTwoXAppleRain();
      return;
    }

    for (let i = 0; i < 3; i++) {
      const apple = document.createElement("span");
      apple.className = "two-x-apple-rain";
      apple.textContent = "🍎";
      apple.style.left = `${Math.random() * 100}vw`;
      apple.style.animationDuration = `${3.2 + Math.random() * 2.4}s`;
      apple.style.fontSize = `${17 + Math.random() * 18}px`;
      apple.style.animationDelay = `${Math.random() * .35}s`;
      document.body.appendChild(apple);

      setTimeout(() => apple.remove(), 6500);
    }
  }, 280);
}

function stopTwoXAppleRain() {
  if (twoXRainInterval) {
    clearInterval(twoXRainInterval);
    twoXRainInterval = null;
  }
}

function tickEvent() {
  const now = Date.now();

  if (state.rareEvent && now >= state.rareEventEndsAt) {
    const rare = rareEvents.find(e => e.id === state.rareEvent);
    state.rareEvent = null;
    state.rareEventEndsAt = 0;
    toast(`${rare ? rare.name : "Evento raro"} terminou.`);
    saveGame("Evento raro finalizado.");
  }

  if (state.eventActive && now >= state.eventEndsAt) {
    state.eventActive = false;
    state.eventEndsAt = 0;
    state.nextEventAt = now + getEventInterval();
    stopTwoXAppleRain();
    toast("Evento 2x terminou.");
    saveGame("Evento 2x finalizado.");
  }

  if (!state.eventActive && now >= state.nextEventAt) {
    state.eventActive = true;
    state.eventEndsAt = now + getEventDuration();
    state.nextEventAt = state.eventEndsAt + getEventInterval();
    state.stats.totalEventsUsed += 1;
    startTwoXAppleRain();
    toast("Evento 2x começou! Ganhos dobrados. Maçãs douradas ativadas.");
    playSound("event");
    saveGame("Evento 2x iniciado.");
  }

  renderEvent();
  checkAchievements();
}

function maybeStartRareEvent() {
  if (state.rareEvent) return;
  if (Math.random() > 0.18) return;

  const rare = rareEvents[Math.floor(Math.random() * rareEvents.length)];
  state.rareEvent = rare.id;
  state.rareEventEndsAt = Date.now() + RARE_EVENT_DURATION_MS;
  state.stats.totalRareEvents += 1;
  rare.start();
  toast(`Evento raro: ${rare.name}! ${rare.desc}`);
  playSound("event");
  saveGame("Evento raro iniciado.");
  render();
}

function checkFruitUnlock() {
  const current = getCurrentFruit();
  const unlocked = state.stats.unlockedFruitPrestiges || [0];
  if (!unlocked.includes(current.prestige)) {
    unlocked.push(current.prestige);
    state.stats.unlockedFruitPrestiges = unlocked;
    showUnlockModal(current);
    playSound("unlock");
  }
}

function showUnlockModal(fruit) {
  els.unlockIcon.textContent = fruit.icon;
  els.unlockTitle.textContent = fruit.name;
  els.unlockText.textContent = `Você chegou ao prestígio ${fruit.prestige} e desbloqueou bônus x${fruit.bonus}.`;
  els.unlockModal.classList.add("show");
}

function checkAchievements() {
  let changed = false;
  for (const achievement of achievements) {
    if (!state.achievements[achievement.id] && achievement.check()) {
      state.achievements[achievement.id] = true;
      state.apples += achievement.reward;
      state.stats.totalFruitsCollected += achievement.reward;
      toast(`Conquista desbloqueada: ${achievement.title} +${formatNumber(achievement.reward)} 🍎`);
      playSound("unlock");
      changed = true;
    }
  }
  if (changed) saveGame("Conquista salva.");
}

function updateBestRanking() {
  localStorage.setItem("best_apples", Math.max(state.apples, Number(localStorage.getItem("best_apples") || 0)));
  localStorage.setItem("best_prestige", Math.max(state.prestige, Number(localStorage.getItem("best_prestige") || 0)));
  localStorage.setItem("best_click", Math.max(state.stats.bestClickGain, Number(localStorage.getItem("best_click") || 0)));
  localStorage.setItem("best_auto", Math.max(getAutoGain(), Number(localStorage.getItem("best_auto") || 0)));
}

function setTheme(themeId) {
  for (const theme of themes) document.body.classList.remove(theme.id);
  state.theme = themeId;
  document.body.classList.add(themeId);
  saveGame("Tema salvo.");
  renderThemes();
  toast("Tema aplicado.");
}

function saveGame(message = "Salvo automaticamente.") {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    els.saveText.textContent = message;
    setTimeout(() => els.saveText.textContent = "Salvamento automático ativo", 1300);
  } catch (error) {
    els.saveText.textContent = "Erro ao salvar.";
    console.error(error);
  }
}

function loadGame() {
  let rawSave = localStorage.getItem(SAVE_KEY);
  if (!rawSave) {
    for (const key of OLD_SAVE_KEYS) {
      rawSave = localStorage.getItem(key);
      if (rawSave) break;
    }
  }

  if (!rawSave) return;

  try {
    const saved = JSON.parse(rawSave);
    Object.assign(state, {
      ...state,
      ...saved,
      costs: { ...state.costs, ...(saved.costs || {}) },
      stats: { ...state.stats, ...(saved.stats || {}) },
      achievements: { ...state.achievements, ...(saved.achievements || {}) }
    });

    if (!Array.isArray(state.stats.unlockedFruitPrestiges)) state.stats.unlockedFruitPrestiges = [0];
    if (!state.nextEventAt || state.nextEventAt < Date.now() - EVENT_INTERVAL_MS * 3) state.nextEventAt = Date.now() + getEventInterval();
    if (state.eventActive && (!state.eventEndsAt || state.eventEndsAt < Date.now())) {
      state.eventActive = false; state.eventEndsAt = 0; state.nextEventAt = Date.now() + getEventInterval();
    }
    if (state.rareEvent && (!state.rareEventEndsAt || state.rareEventEndsAt < Date.now())) {
      state.rareEvent = null; state.rareEventEndsAt = 0;
    }
    if (state.welisonEventActive && (!state.welisonEventEndsAt || state.welisonEventEndsAt < Date.now())) {
      state.welisonEventActive = false; state.welisonEventEndsAt = 0;
    }
    state.rainActive = false;
    state.rainTime = 0;
    state.stats.startedAt = Date.now();
  } catch (error) {
    console.error("Erro ao carregar save:", error);
  }
}

function resetGame() {
  const confirmReset = confirm("Tem certeza que deseja resetar todo o progresso?");
  if (!confirmReset) return;
  localStorage.removeItem(SAVE_KEY);
  for (const key of OLD_SAVE_KEYS) localStorage.removeItem(key);
  location.reload();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => els.toast.classList.remove("show"), 2100);
}

function shakeElement(element) {
  element.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(0)" }
  ], { duration: 220, easing: "ease-out" });
}

function playSound(type) {
  if (!state.soundEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freqs = { click: 420, critical: 180, buy: 620, error: 120, event: 760, unlock: 920 };
    osc.frequency.value = freqs[type] || 440;
    osc.type = type === "error" ? "sawtooth" : "sine";
    gain.gain.setValueAtTime(0.045, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {}
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    render();
  });
});

document.querySelectorAll(".shop-category").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".shop-category").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderUpgrades();
  });
});

els.appleButton.addEventListener("click", clickFruit);
els.manualSaveBtn.addEventListener("click", () => { saveGame("Salvo manualmente."); toast("Jogo salvo."); });
els.resetBtn.addEventListener("click", resetGame);
els.soundToggle.addEventListener("click", () => { state.soundEnabled = !state.soundEnabled; saveGame("Preferência de som salva."); render(); playSound("click"); });
els.unlockClose.addEventListener("click", () => els.unlockModal.classList.remove("show"));

window.addEventListener("beforeunload", () => {
  state.stats.playSeconds += Math.floor((Date.now() - state.stats.startedAt) / 1000);
  state.stats.startedAt = Date.now();
  saveGame("Salvo ao fechar.");
});

loadGame();
setTheme(state.theme || "theme-pure");
checkAchievements();
tickWelisonEvent();
render();

setInterval(tickAuto, 1000);
setInterval(tickRain, 1000);
setInterval(tickEvent, 1000);
setInterval(tickWelisonEvent, 1000);
setInterval(maybeStartRareEvent, RARE_EVENT_CHECK_MS);
setInterval(() => {
  state.stats.playSeconds += Math.floor((Date.now() - state.stats.startedAt) / 1000);
  state.stats.startedAt = Date.now();
  saveGame("Salvo automaticamente.");
}, 5000);


/* =========================
   ULTRA V4 ADD-ON
   Não remove o sistema antigo.
========================= */
(() => {
  const V4_KEY = "maca_clicker_ultra_v4_addon";

  const v4 = {
    missionsDate: "",
    missionBase: {},
    claimed: {},
    codes: {},
    inventory: {
      boost2x: 0,
      clickBoost: 0,
      autoBoost: 0,
      eventTicket: 0,
      rainTicket: 0,
      crystalFragment: 0,
      bossTicket: 1
    },
    boosts: {
      clickUntil: 0,
      autoUntil: 0
    },
    visual: {
      whiteAura: false,
      blueAura: false,
      goldAura: false,
      extraRing: false,
      rareBg: false
    },
    boss: {
      active: false,
      hp: 0,
      maxHp: 0,
      endsAt: 0
    }
  };

  const itemNames = {
    boost2x: "Boost 2x",
    clickBoost: "Boost de Clique",
    autoBoost: "Boost Automático",
    eventTicket: "Ticket de Evento",
    rainTicket: "Ticket de Chuva",
    crystalFragment: "Fragmento de Cristal",
    bossTicket: "Ticket de Boss"
  };

  const codes = {
    WELISON5X: { apples: 5000, item: "eventTicket", amount: 1, desc: "5.000 frutas + 1 ticket de evento" },
    SABADO1530: { apples: 1530, item: "rainTicket", amount: 1, desc: "1.530 frutas + 1 ticket de chuva" },
    ULTRA: { apples: 10000, item: "boost2x", amount: 1, desc: "10.000 frutas + boost 2x" },
    FREEBOOST: { item: "clickBoost", amount: 2, desc: "2 boosts de clique" },
    CRISTAL: { item: "crystalFragment", amount: 5, desc: "5 fragmentos de cristal" }
  };

  const visualItems = [
    ["whiteAura", "Aura Branca", 2500],
    ["blueAura", "Aura Azul", 7500],
    ["goldAura", "Aura Dourada", 15000],
    ["extraRing", "Anel Extra", 22000],
    ["rareBg", "Fundo Raro", 40000]
  ];

  function loadV4() {
    try {
      Object.assign(v4, JSON.parse(localStorage.getItem(V4_KEY) || "{}"));
      v4.inventory = { boost2x:0, clickBoost:0, autoBoost:0, eventTicket:0, rainTicket:0, crystalFragment:0, bossTicket:1, ...(v4.inventory || {}) };
      v4.boosts = { clickUntil:0, autoUntil:0, ...(v4.boosts || {}) };
      v4.visual = { whiteAura:false, blueAura:false, goldAura:false, extraRing:false, rareBg:false, ...(v4.visual || {}) };
      v4.boss = { active:false, hp:0, maxHp:0, endsAt:0, ...(v4.boss || {}) };
    } catch {}
  }

  function saveV4() {
    localStorage.setItem(V4_KEY, JSON.stringify(v4));
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function fmt(n) {
    if (typeof formatNumber === "function") return formatNumber(n);
    return Math.floor(n).toLocaleString("pt-BR");
  }

  function pop(msg) {
    if (typeof toast === "function") toast(msg);
    else alert(msg);
  }

  function ensureMissions() {
    const key = todayKey();
    if (v4.missionsDate !== key) {
      v4.missionsDate = key;
      v4.claimed = {};
      v4.missionBase = {
        clicks: state?.stats?.totalClicks || 0,
        fruits: state?.stats?.totalFruitsCollected || 0,
        buys: state?.stats?.totalPurchases || 0,
        events: state?.stats?.totalEventsUsed || 0,
        prestiges: state?.stats?.totalPrestiges || 0
      };
      saveV4();
    }
  }

  function missionData() {
    ensureMissions();
    const s = state.stats;
    return [
      { id:"click500", title:"Clique 500 vezes hoje", now:(s.totalClicks||0)-(v4.missionBase.clicks||0), goal:500, reward:{ apples:2500 } },
      { id:"gain10k", title:"Ganhe 10.000 frutas hoje", now:(s.totalFruitsCollected||0)-(v4.missionBase.fruits||0), goal:10000, reward:{ apples:5000 } },
      { id:"buy5", title:"Compre 5 melhorias", now:(s.totalPurchases||0)-(v4.missionBase.buys||0), goal:5, reward:{ item:"boost2x", amount:1 } },
      { id:"event1", title:"Use 1 evento", now:(s.totalEventsUsed||0)-(v4.missionBase.events||0), goal:1, reward:{ item:"eventTicket", amount:1 } },
      { id:"prestige1", title:"Faça 1 prestígio", now:(s.totalPrestiges||0)-(v4.missionBase.prestiges||0), goal:1, reward:{ item:"crystalFragment", amount:2 } }
    ];
  }

  function rewardText(r) {
    const arr = [];
    if (r.apples) arr.push(`${fmt(r.apples)} frutas`);
    if (r.item) arr.push(`${r.amount || 1}x ${itemNames[r.item] || r.item}`);
    return arr.join(" + ");
  }

  function giveReward(r) {
    if (r.apples) {
      state.apples += r.apples;
      state.stats.totalFruitsCollected += r.apples;
    }
    if (r.item) v4.inventory[r.item] = (v4.inventory[r.item] || 0) + (r.amount || 1);
    saveV4();
    if (typeof saveGame === "function") saveGame("Ultra V4 salvo.");
  }

  function renderMissions() {
    const box = document.getElementById("v4-missions");
    if (!box) return;
    box.innerHTML = `<p class="eyebrow">missões diárias · ${v4.missionsDate || todayKey()}</p>`;
    for (const m of missionData()) {
      const done = m.now >= m.goal;
      const claimed = !!v4.claimed[m.id];
      const pct = Math.max(0, Math.min(100, (m.now / m.goal) * 100));
      const card = document.createElement("div");
      card.className = `v4-card ${claimed ? "done" : ""}`;
      card.innerHTML = `
        <h3>${m.title}</h3>
        <p>${fmt(Math.max(0,m.now))}/${fmt(m.goal)} · Recompensa: ${rewardText(m.reward)}</p>
        <div class="v4-progress"><div style="width:${pct}%"></div></div>
        <button ${done && !claimed ? "" : "disabled"}>${claimed ? "Coletado" : done ? "Coletar" : "Em progresso"}</button>
      `;
      card.querySelector("button").onclick = () => {
        if (!done || claimed) return;
        v4.claimed[m.id] = true;
        giveReward(m.reward);
        pop(`Missão concluída: ${m.title}`);
        renderAllV4();
      };
      box.appendChild(card);
    }
  }

  function renderCodes() {
    const box = document.getElementById("v4-codes");
    if (!box) return;
    box.innerHTML = `
      <div class="v4-card">
        <h3>Códigos secretos</h3>
        <p>Use: WELISON5X, SABADO1530, ULTRA, FREEBOOST, CRISTAL</p>
        <div class="v4-code-row">
          <input id="v4CodeInput" placeholder="Digite o código aqui" />
          <button id="v4Redeem">Resgatar</button>
        </div>
      </div>
    `;
    box.querySelector("#v4Redeem").onclick = () => {
      const input = box.querySelector("#v4CodeInput");
      const code = (input.value || "").trim().toUpperCase();
      if (!codes[code]) return pop("Código inválido.");
      if (v4.codes[code]) return pop("Esse código já foi usado.");
      v4.codes[code] = true;
      giveReward(codes[code]);
      input.value = "";
      pop(`Código resgatado: ${codes[code].desc}`);
      renderAllV4();
    };
  }

  function renderCalendar() {
    const box = document.getElementById("v4-calendar");
    if (!box) return;
    const now = Date.now();
    const welison = typeof getNextWelisonSaturday === "function" ? getNextWelisonSaturday(new Date()).getTime() : now;
    const rows = [
      ["Evento 2x", state.eventActive ? `Ativo · termina em ${formatTime(state.eventEndsAt - now)}` : `Começa em ${formatTime(state.nextEventAt - now)}`, state.eventActive],
      ["Welison 5x", state.welisonEventActive ? `Ativo · termina em ${formatTime(state.welisonEventEndsAt - now)}` : `Sábado 15:30 · começa em ${formatTime(welison - now)}`, state.welisonEventActive],
      ["Evento raro", state.rareEvent ? `Ativo · termina em ${formatTime(state.rareEventEndsAt - now)}` : "Aleatório, verificado a cada minuto", !!state.rareEvent],
      ["Fruta Gigante", v4.boss.active ? `Ativa · HP ${fmt(v4.boss.hp)} / ${fmt(v4.boss.maxHp)}` : "Use Ticket de Boss para invocar", v4.boss.active]
    ];
    box.innerHTML = rows.map(r => `<div class="v4-card ${r[2] ? "active" : ""}"><h3>${r[0]}</h3><p>${r[1]}</p></div>`).join("");
    const boss = document.createElement("div");
    boss.className = "v4-card";
    const hpPct = v4.boss.maxHp ? Math.max(0, Math.min(100, (v4.boss.hp/v4.boss.maxHp)*100)) : 0;
    boss.innerHTML = `
      <h3>Boss / Fruta Gigante</h3>
      <p>${v4.boss.active ? "Clique na fruta para derrotar antes do tempo acabar." : `Tickets: ${v4.inventory.bossTicket || 0}`}</p>
      <div class="v4-progress"><div style="width:${hpPct}%"></div></div>
      <button id="v4SpawnBoss">${v4.boss.active ? "Boss ativo" : "Invocar Boss"}</button>
    `;
    box.appendChild(boss);
    boss.querySelector("#v4SpawnBoss").onclick = spawnBoss;
  }

  function renderInventory() {
    const box = document.getElementById("v4-inventory");
    if (!box) return;
    box.innerHTML = "";
    for (const [id, name] of Object.entries(itemNames)) {
      const amount = v4.inventory[id] || 0;
      const card = document.createElement("div");
      card.className = "v4-card v4-inventory-card";
      card.innerHTML = `
        <div><h3>${name} x${amount}</h3><p>${itemDescription(id)}</p></div>
        <button ${amount > 0 && canUseItem(id) ? "" : "disabled"}>${canUseItem(id) ? "Usar" : "Guardar"}</button>
      `;
      card.querySelector("button").onclick = () => useItem(id);
      box.appendChild(card);
    }
  }

  function itemDescription(id) {
    return {
      boost2x:"Ativa 2x geral por 5 minutos.",
      clickBoost:"Dobra o clique por 5 minutos.",
      autoBoost:"Dobra o automático por 5 minutos.",
      eventTicket:"Ativa evento 2x agora.",
      rainTicket:"Ativa chuva de frutas.",
      crystalFragment:"Material raro para futuras evoluções.",
      bossTicket:"Invoca a Fruta Gigante."
    }[id] || "";
  }

  function canUseItem(id) {
    return !["crystalFragment"].includes(id);
  }

  function useItem(id) {
    if ((v4.inventory[id] || 0) <= 0) return;
    let ok = true;
    const now = Date.now();
    if (id === "boost2x" || id === "clickBoost") v4.boosts.clickUntil = Math.max(now, v4.boosts.clickUntil || 0) + 5*60*1000;
    else if (id === "autoBoost") v4.boosts.autoUntil = Math.max(now, v4.boosts.autoUntil || 0) + 5*60*1000;
    else if (id === "eventTicket") {
      if (state.eventActive) ok = false;
      else {
        state.eventActive = true;
        state.eventEndsAt = now + (typeof getEventDuration === "function" ? getEventDuration() : 5*60*1000);
        state.nextEventAt = state.eventEndsAt + (typeof getEventInterval === "function" ? getEventInterval() : 30*60*1000);
        state.stats.totalEventsUsed += 1;
        if (typeof startTwoXAppleRain === "function") startTwoXAppleRain();
      }
    }
    else if (id === "rainTicket") {
      if (state.rainActive) ok = false;
      else {
        state.rainActive = true;
        state.rainTime = 40;
        if (typeof startVisualRain === "function") startVisualRain();
      }
    }
    else if (id === "bossTicket") ok = spawnBoss(false) !== false;
    if (!ok) return pop("Não dá para usar agora.");
    v4.inventory[id] -= 1;
    saveV4();
    if (typeof saveGame === "function") saveGame("Item usado.");
    pop(`${itemNames[id]} usado.`);
    renderAllV4();
  }

  function renderVisual() {
    const box = document.getElementById("v4-visual");
    if (!box) return;
    box.innerHTML = "";
    for (const [id, name, cost] of visualItems) {
      const bought = !!v4.visual[id];
      const card = document.createElement("div");
      card.className = `v4-card ${bought ? "done" : ""}`;
      card.innerHTML = `<h3>${name}</h3><p>Custo: ${fmt(cost)} frutas</p><button ${bought ? "disabled" : ""}>${bought ? "Comprado" : "Comprar"}</button>`;
      card.querySelector("button").onclick = () => {
        if (bought) return;
        if (state.apples < cost) return pop("Frutas insuficientes.");
        state.apples -= cost;
        v4.visual[id] = true;
        saveV4();
        pop(`${name} comprado.`);
        renderAllV4();
      };
      box.appendChild(card);
    }
  }

  function renderSaveTools() {
    const box = document.getElementById("v4-save");
    if (!box) return;
    box.innerHTML = `
      <div class="v4-tools">
        <button id="v4Export">Exportar Save</button>
        <button id="v4Copy">Copiar Código</button>
        <button id="v4Import">Importar Save</button>
        <textarea id="v4SaveBox" placeholder="Cole o código do save aqui..."></textarea>
      </div>
    `;
    const area = box.querySelector("#v4SaveBox");
    const exportNow = () => {
      const payload = { core: state, addon: v4 };
      area.value = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      pop("Save exportado.");
    };
    box.querySelector("#v4Export").onclick = exportNow;
    box.querySelector("#v4Copy").onclick = () => {
      exportNow();
      navigator.clipboard?.writeText(area.value);
      pop("Código copiado.");
    };
    box.querySelector("#v4Import").onclick = () => {
      try {
        const payload = JSON.parse(decodeURIComponent(escape(atob(area.value.trim()))));
        if (payload.core) localStorage.setItem(SAVE_KEY, JSON.stringify(payload.core));
        if (payload.addon) localStorage.setItem(V4_KEY, JSON.stringify(payload.addon));
        pop("Save importado. Recarregando...");
        setTimeout(() => location.reload(), 700);
      } catch {
        pop("Save inválido.");
      }
    };
  }

  function spawnBoss(useTicket = true) {
    if (v4.boss.active) return false;
    if (useTicket !== false) {
      if ((v4.inventory.bossTicket || 0) <= 0) return pop("Você precisa de Ticket de Boss."), false;
      v4.inventory.bossTicket -= 1;
    }
    const power = typeof getClickGain === "function" ? getClickGain() : 100;
    v4.boss.active = true;
    v4.boss.maxHp = Math.max(5000, power * 80);
    v4.boss.hp = v4.boss.maxHp;
    v4.boss.endsAt = Date.now() + 60*1000;
    pop("Fruta Gigante apareceu por 60 segundos!");
    saveV4();
    return true;
  }

  function bossTick() {
    if (!v4.boss.active) return;
    if (Date.now() > v4.boss.endsAt) {
      v4.boss.active = false;
      pop("A Fruta Gigante fugiu.");
      saveV4();
    }
  }

  function damageBoss(amount) {
    if (!v4.boss.active) return;
    v4.boss.hp -= amount;
    if (v4.boss.hp <= 0) {
      const reward = Math.max(10000, v4.boss.maxHp * .35);
      state.apples += reward;
      state.stats.totalFruitsCollected += reward;
      v4.inventory.crystalFragment = (v4.inventory.crystalFragment || 0) + 3;
      v4.boss.active = false;
      pop(`Boss derrotado! +${fmt(reward)} frutas + 3 cristais.`);
      saveV4();
      if (typeof saveGame === "function") saveGame("Boss derrotado.");
    }
  }

  function applyVisual() {
    document.body.classList.toggle("v4-white-aura", !!v4.visual.whiteAura);
    document.body.classList.toggle("v4-blue-aura", !!v4.visual.blueAura);
    document.body.classList.toggle("v4-gold-aura", !!v4.visual.goldAura);
    document.body.classList.toggle("v4-extra-ring", !!v4.visual.extraRing);
    document.body.classList.toggle("v4-rare-bg", !!v4.visual.rareBg);
    document.body.classList.toggle("v4-boss-active", !!v4.boss.active);
  }

  function renderAllV4() {
    ensureMissions();
    renderMissions();
    renderCodes();
    renderCalendar();
    renderInventory();
    renderVisual();
    renderSaveTools();
    applyVisual();
  }

  function setupTabs() {
    document.querySelectorAll(".v4-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".v4-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".v4-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(`v4-${btn.dataset.v4}`)?.classList.add("active");
        renderAllV4();
      });
    });

    document.querySelectorAll(".mobile-nav-v4 button").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.go;
        if (["missions","calendar","inventory"].includes(tab)) {
          document.querySelector(`.v4-tab[data-v4="${tab}"]`)?.click();
          document.getElementById("v4Panel")?.scrollIntoView({behavior:"smooth", block:"start"});
        } else {
          document.querySelector(`.tab[data-tab="${tab}"]`)?.click();
          document.querySelector(".side-panel")?.scrollIntoView({behavior:"smooth", block:"start"});
        }
      });
    });
  }

  function patchCore() {
    if (window.__v4Patched) return;
    window.__v4Patched = true;

    const oldClick = window.clickFruit;
    if (typeof oldClick === "function") {
      window.clickFruit = function(event) {
        const before = state.apples;
        oldClick(event);
        const gain = Math.max(0, state.apples - before);
        damageBoss(gain || (typeof getClickGain === "function" ? getClickGain() : 1));
        renderAllV4();
      };
      const btn = document.getElementById("appleButton");
      if (btn) {
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById("appleButton");
        newBtn.addEventListener("click", window.clickFruit);
      }
    }

    const oldGetActive = window.getActiveMultipliers;
    if (typeof oldGetActive === "function") {
      window.getActiveMultipliers = function(type = "click") {
        const list = oldGetActive(type);
        if (type === "click" && Date.now() < v4.boosts.clickUntil) list.push({ id:"v4Click", label:"Boost Clique", value:2 });
        if (type === "auto" && Date.now() < v4.boosts.autoUntil) list.push({ id:"v4Auto", label:"Boost Auto", value:2 });
        return list;
      };
    }
  }

  loadV4();
  setupTabs();
  patchCore();
  renderAllV4();

  setInterval(() => {
    bossTick();
    renderAllV4();
  }, 1000);

  setInterval(saveV4, 5000);
})();
