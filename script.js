const SAVE_KEY = "maca_clicker_black_white_save_v1";

const state = {
  apples: 0,
  clickPower: 1,
  autoCollector: 0,
  multiplier: 1,
  criticalChance: 0,
  farm: 0,
  rainBonus: 0,
  prestige: 0,

  costs: {
    clickPower: 25,
    autoCollector: 75,
    multiplier: 200,
    criticalChance: 350,
    farm: 600,
    rainBonus: 1000,
    prestige: 5000
  },

  rainActive: false,
  rainTime: 0
};

const upgrades = [
  {
    id: "clickPower",
    title: "Força do Clique",
    desc: "+1 maçã por clique.",
    level: () => `Nível: ${state.clickPower}`,
    max: null,
    buy() {
      state.apples -= state.costs.clickPower;
      state.clickPower += 1;
      state.costs.clickPower = Math.floor(state.costs.clickPower * 1.45);
      toast("Força do clique melhorada.");
    }
  },
  {
    id: "autoCollector",
    title: "Auto Coletor",
    desc: "+1 maçã por segundo.",
    level: () => `Nível: ${state.autoCollector}`,
    max: null,
    buy() {
      state.apples -= state.costs.autoCollector;
      state.autoCollector += 1;
      state.costs.autoCollector = Math.floor(state.costs.autoCollector * 1.55);
      toast("Auto coletor comprado.");
    }
  },
  {
    id: "multiplier",
    title: "Multiplicador",
    desc: "+1x em todos os ganhos.",
    level: () => `Nível: x${state.multiplier}`,
    max: null,
    buy() {
      state.apples -= state.costs.multiplier;
      state.multiplier += 1;
      state.costs.multiplier = Math.floor(state.costs.multiplier * 2.1);
      toast("Multiplicador aumentado.");
    }
  },
  {
    id: "criticalChance",
    title: "Clique Crítico",
    desc: "+5% chance de clique 5x. Máximo: 60%.",
    level: () => `Chance: ${state.criticalChance}%`,
    max: 60,
    buy() {
      state.apples -= state.costs.criticalChance;
      state.criticalChance += 5;
      state.costs.criticalChance = Math.floor(state.costs.criticalChance * 1.8);
      toast("Chance crítica aumentada.");
    }
  },
  {
    id: "farm",
    title: "Fazenda",
    desc: "+10 maçãs por segundo.",
    level: () => `Nível: ${state.farm}`,
    max: null,
    buy() {
      state.apples -= state.costs.farm;
      state.farm += 1;
      state.costs.farm = Math.floor(state.costs.farm * 1.7);
      toast("Fazenda comprada.");
    }
  },
  {
    id: "rainBonus",
    title: "Chuva de Maçãs",
    desc: "Ativa bônus temporário por 20 segundos.",
    level: () => state.rainActive ? `Ativa: ${state.rainTime}s` : `Bônus: ${state.rainBonus}`,
    max: null,
    buy() {
      if (state.rainActive) {
        toast("A chuva já está ativa.");
        return false;
      }

      state.apples -= state.costs.rainBonus;
      state.rainBonus += 1;
      state.costs.rainBonus = Math.floor(state.costs.rainBonus * 1.9);
      state.rainActive = true;
      state.rainTime = 20;
      toast("Chuva de maçãs ativada.");
      startVisualRain();
    }
  },
  {
    id: "prestige",
    title: "Prestígio",
    desc: "Reseta quase tudo e aumenta poder permanente.",
    level: () => `Nível: ${state.prestige}`,
    max: null,
    buy() {
      state.apples = 0;
      state.clickPower = 1;
      state.autoCollector = 0;
      state.multiplier = 1;
      state.criticalChance = 0;
      state.farm = 0;
      state.rainBonus = 0;
      state.rainActive = false;
      state.rainTime = 0;

      state.costs.clickPower = 25;
      state.costs.autoCollector = 75;
      state.costs.multiplier = 200;
      state.costs.criticalChance = 350;
      state.costs.farm = 600;
      state.costs.rainBonus = 1000;

      state.prestige += 1;
      state.costs.prestige = Math.floor(state.costs.prestige * 2.5);
      toast("Prestígio concluído. Poder permanente aumentado.");
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
  appleZone: document.getElementById("appleZone"),
  floatingLayer: document.getElementById("floatingLayer"),
  upgrades: document.getElementById("upgrades"),
  toast: document.getElementById("toast"),
  saveText: document.getElementById("saveText"),
  saveDot: document.getElementById("saveDot"),
  manualSaveBtn: document.getElementById("manualSaveBtn"),
  resetBtn: document.getElementById("resetBtn")
};

function formatNumber(value) {
  const number = Math.floor(value);

  if (number < 1000) return String(number);

  return Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(number);
}

function prestigeBonus() {
  return 1 + state.prestige;
}

function getClickGain() {
  return state.clickPower * state.multiplier * prestigeBonus();
}

function getAutoGain() {
  return (state.autoCollector + state.farm * 10) * state.multiplier * prestigeBonus();
}

function getRainClickBonus() {
  if (!state.rainActive) return 0;
  return 10 * Math.max(1, state.rainBonus);
}

function renderUpgrades() {
  els.upgrades.innerHTML = "";

  for (const upgrade of upgrades) {
    const cost = state.costs[upgrade.id];
    const canBuy = state.apples >= cost;
    const isMaxed = upgrade.max !== null && state[upgrade.id] >= upgrade.max;

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

function render() {
  els.appleCount.textContent = formatNumber(state.apples);
  els.clickPower.textContent = `Clique: +${formatNumber(getClickGain() + getRainClickBonus())}`;
  els.autoPower.textContent = `Auto: ${formatNumber(getAutoGain())}/s`;
  els.multiPower.textContent = `Multi: x${state.multiplier}`;
  els.prestigePower.textContent = `Prestígio: ${state.prestige}`;

  renderUpgrades();
}

function buyUpgrade(upgrade) {
  const cost = state.costs[upgrade.id];
  const isMaxed = upgrade.max !== null && state[upgrade.id] >= upgrade.max;

  if (isMaxed) {
    toast("Essa melhoria já está no máximo.");
    return;
  }

  if (state.apples < cost) {
    toast("Maçãs insuficientes.");
    shakeElement(els.upgrades);
    return;
  }

  const result = upgrade.buy();

  if (result === false) return;

  saveGame("Salvo após compra.");
  render();
}

function clickApple(event) {
  let gain = getClickGain();
  let critical = false;

  if (state.criticalChance > 0 && Math.random() * 100 <= state.criticalChance) {
    gain *= 5;
    critical = true;
  }

  gain += getRainClickBonus();
  state.apples += gain;

  const rect = els.floatingLayer.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  createFloatText(x, y, `${critical ? "CRÍTICO " : ""}+${formatNumber(gain)} 🍎`, critical);
  burstParticles(event.clientX, event.clientY);

  render();
}

function createFloatText(x, y, text, critical = false) {
  const floatText = document.createElement("span");
  floatText.className = `float-text ${critical ? "critical" : ""}`;
  floatText.textContent = text;
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;

  els.floatingLayer.appendChild(floatText);

  setTimeout(() => {
    floatText.remove();
  }, 950);
}

function burstParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("span");
    p.className = "rain-apple";
    p.textContent = "🍎";
    p.style.left = `${x + (Math.random() * 80 - 40)}px`;
    p.style.top = `${y + (Math.random() * 40 - 20)}px`;
    p.style.animationDuration = `${0.6 + Math.random() * 0.4}s`;
    p.style.fontSize = `${14 + Math.random() * 12}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

function startVisualRain() {
  let created = 0;

  const interval = setInterval(() => {
    if (!state.rainActive || created >= 90) {
      clearInterval(interval);
      return;
    }

    const apple = document.createElement("span");
    apple.className = "rain-apple";
    apple.textContent = "🍎";
    apple.style.left = `${Math.random() * 100}vw`;
    apple.style.animationDuration = `${2.2 + Math.random() * 2.2}s`;
    apple.style.fontSize = `${15 + Math.random() * 18}px`;

    document.body.appendChild(apple);

    setTimeout(() => apple.remove(), 4700);
    created++;
  }, 180);
}

function tickAuto() {
  const gain = getAutoGain();

  if (gain > 0) {
    state.apples += gain;
    createFloatText(
      200 + Math.random() * 260,
      180 + Math.random() * 110,
      `+${formatNumber(gain)} auto 🍎`,
      false
    );
    render();
  }
}

function tickRain() {
  if (!state.rainActive) return;

  state.rainTime -= 1;

  if (state.rainTime <= 0) {
    state.rainActive = false;
    state.rainTime = 0;
    toast("Chuva de maçãs terminou.");
    saveGame("Chuva finalizada.");
  }

  render();
}

function saveGame(message = "Salvo automaticamente.") {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    els.saveText.textContent = message;
    els.saveDot.style.background = "#fff";

    setTimeout(() => {
      els.saveText.textContent = "Salvamento automático ativo";
    }, 1300);
  } catch (error) {
    els.saveText.textContent = "Erro ao salvar.";
    console.error(error);
  }
}

function loadGame() {
  const rawSave = localStorage.getItem(SAVE_KEY);

  if (!rawSave) return;

  try {
    const saved = JSON.parse(rawSave);

    Object.assign(state, {
      ...state,
      ...saved,
      costs: {
        ...state.costs,
        ...(saved.costs || {})
      }
    });

    state.rainActive = false;
    state.rainTime = 0;
  } catch (error) {
    console.error("Erro ao carregar save:", error);
  }
}

function resetGame() {
  const confirmReset = confirm("Tem certeza que deseja resetar todo o progresso?");

  if (!confirmReset) return;

  localStorage.removeItem(SAVE_KEY);

  state.apples = 0;
  state.clickPower = 1;
  state.autoCollector = 0;
  state.multiplier = 1;
  state.criticalChance = 0;
  state.farm = 0;
  state.rainBonus = 0;
  state.prestige = 0;
  state.rainActive = false;
  state.rainTime = 0;

  state.costs = {
    clickPower: 25,
    autoCollector: 75,
    multiplier: 200,
    criticalChance: 350,
    farm: 600,
    rainBonus: 1000,
    prestige: 5000
  };

  saveGame("Save resetado.");
  toast("Save resetado.");
  render();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");

  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}

function shakeElement(element) {
  element.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(0)" }
    ],
    { duration: 220, easing: "ease-out" }
  );
}

els.appleButton.addEventListener("click", clickApple);
els.manualSaveBtn.addEventListener("click", () => {
  saveGame("Salvo manualmente.");
  toast("Jogo salvo.");
});
els.resetBtn.addEventListener("click", resetGame);

window.addEventListener("beforeunload", () => {
  saveGame("Salvo ao fechar.");
});

loadGame();
render();

setInterval(tickAuto, 1000);
setInterval(tickRain, 1000);
setInterval(() => saveGame("Salvo automaticamente."), 5000);
