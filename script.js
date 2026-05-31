const SAVE_KEY = "maca_clicker_evolution_v2";
const OLD_SAVE_KEY = "maca_clicker_black_white_save_v1";
const EVENT_INTERVAL = 30 * 60 * 1000;
const EVENT_DURATION = 5 * 60 * 1000;

const fruits = [
  { prestige: 0, name: "Maçã Prata", icon: "🍎", tier: "tier-silver", bonus: 1 },
  { prestige: 10, name: "Maçã Bronze", icon: "🍏", tier: "tier-bronze", bonus: 1.2 },
  { prestige: 20, name: "Maçã de Ouro", icon: "🍎", tier: "tier-gold", bonus: 1.5 },
  { prestige: 30, name: "Maçã de Rubi", icon: "🍒", tier: "tier-ruby", bonus: 1.85 },
  { prestige: 40, name: "Maçã de Cristal", icon: "💎", tier: "tier-crystal", bonus: 2.25 }
];

const state = {
  apples: 0, clickPower: 1, autoCollector: 0, multiplier: 1, criticalChance: 0, farm: 0, rainBonus: 0, prestige: 0,
  costs: { clickPower: 25, autoCollector: 75, multiplier: 200, criticalChance: 350, farm: 600, rainBonus: 1000, prestige: 5000 },
  rainActive: false, rainTime: 0, eventActive: false, eventEndsAt: 0, nextEventAt: Date.now() + EVENT_INTERVAL
};

const $ = (id) => document.getElementById(id);
const els = {
  appleCount: $("appleCount"), clickPower: $("clickPower"), autoPower: $("autoPower"), multiPower: $("multiPower"), prestigePower: $("prestigePower"),
  fruitButton: $("fruitButton"), floatLayer: $("floatLayer"), upgrades: $("upgrades"), toast: $("toast"), saveText: $("saveText"), saveBtn: $("saveBtn"), resetBtn: $("resetBtn"),
  eventPill: $("eventPill"), eventTimer: $("eventTimer"), fruitIconSmall: $("fruitIconSmall"), fruitIconMain: $("fruitIconMain"), fruitName: $("fruitName"), fruitBonus: $("fruitBonus"), nextFruitText: $("nextFruitText"), fruitProgressText: $("fruitProgressText"), fruitProgressBar: $("fruitProgressBar"), roadmap: $("roadmap"), tapHelp: $("tapHelp")
};

const upgrades = [
  { id: "clickPower", title: "Força do Clique", desc: "+1 fruta por clique.", level: () => `Nível: ${state.clickPower}`, max: null, buy(){ state.apples -= state.costs.clickPower; state.clickPower++; state.costs.clickPower = Math.floor(state.costs.clickPower * 1.45); toast("Força do clique melhorada."); } },
  { id: "autoCollector", title: "Auto Coletor", desc: "+1 fruta por segundo.", level: () => `Nível: ${state.autoCollector}`, max: null, buy(){ state.apples -= state.costs.autoCollector; state.autoCollector++; state.costs.autoCollector = Math.floor(state.costs.autoCollector * 1.55); toast("Auto coletor comprado."); } },
  { id: "multiplier", title: "Multiplicador", desc: "+1x em todos os ganhos.", level: () => `Nível: x${state.multiplier}`, max: null, buy(){ state.apples -= state.costs.multiplier; state.multiplier++; state.costs.multiplier = Math.floor(state.costs.multiplier * 2.1); toast("Multiplicador aumentado."); } },
  { id: "criticalChance", title: "Clique Crítico", desc: "+5% chance de clique 5x. Máximo: 60%.", level: () => `Chance: ${state.criticalChance}%`, max: 60, buy(){ state.apples -= state.costs.criticalChance; state.criticalChance += 5; state.costs.criticalChance = Math.floor(state.costs.criticalChance * 1.8); toast("Chance crítica aumentada."); } },
  { id: "farm", title: "Fazenda", desc: "+10 frutas por segundo.", level: () => `Nível: ${state.farm}`, max: null, buy(){ state.apples -= state.costs.farm; state.farm++; state.costs.farm = Math.floor(state.costs.farm * 1.7); toast("Fazenda comprada."); } },
  { id: "rainBonus", title: "Chuva de Frutas", desc: "Bônus temporário por 20 segundos.", level: () => state.rainActive ? `Ativa: ${state.rainTime}s` : `Bônus: ${state.rainBonus}`, max: null, buy(){ if(state.rainActive){ toast("A chuva já está ativa."); return false; } state.apples -= state.costs.rainBonus; state.rainBonus++; state.costs.rainBonus = Math.floor(state.costs.rainBonus * 1.9); state.rainActive = true; state.rainTime = 20; visualRain(); toast("Chuva de frutas ativada."); } },
  { id: "prestige", title: "Prestígio", desc: "Reseta quase tudo, aumenta poder e libera frutas.", level: () => `Nível: ${state.prestige}`, max: null, buy(){ state.apples = 0; state.clickPower = 1; state.autoCollector = 0; state.multiplier = 1; state.criticalChance = 0; state.farm = 0; state.rainBonus = 0; state.rainActive = false; state.rainTime = 0; state.costs.clickPower = 25; state.costs.autoCollector = 75; state.costs.multiplier = 200; state.costs.criticalChance = 350; state.costs.farm = 600; state.costs.rainBonus = 1000; state.prestige++; state.costs.prestige = Math.floor(state.costs.prestige * 2.5); toast(`Prestígio concluído. Fruta atual: ${currentFruit().name}.`); } }
];

function compact(n){ n = Math.floor(n); return n < 1000 ? String(n) : Intl.NumberFormat("pt-BR", {notation:"compact", maximumFractionDigits:2}).format(n); }
function time(ms){ const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }
function currentFruit(){ return fruits.reduce((a, f) => state.prestige >= f.prestige ? f : a, fruits[0]); }
function nextFruit(){ return fruits.find(f => f.prestige > state.prestige) || null; }
function fruitBonus(){ return currentFruit().bonus; }
function prestigeBonus(){ return 1 + state.prestige; }
function eventMulti(){ return state.eventActive ? 2 : 1; }
function clickGain(){ return state.clickPower * state.multiplier * prestigeBonus() * fruitBonus() * eventMulti(); }
function autoGain(){ return (state.autoCollector + state.farm * 10) * state.multiplier * prestigeBonus() * fruitBonus() * eventMulti(); }
function rainBonus(){ return state.rainActive ? 10 * Math.max(1, state.rainBonus) * eventMulti() : 0; }

function render(){
  const f = currentFruit(), next = nextFruit();
  els.appleCount.textContent = compact(state.apples);
  els.clickPower.textContent = `Clique: +${compact(clickGain() + rainBonus())}`;
  els.autoPower.textContent = `Auto: ${compact(autoGain())}/s`;
  els.multiPower.textContent = `Multi: x${state.multiplier}`;
  els.prestigePower.textContent = `Prestígio: ${state.prestige}`;
  els.fruitIconSmall.textContent = f.icon; els.fruitIconMain.textContent = f.icon; els.fruitName.textContent = f.name; els.fruitBonus.textContent = `Bônus da fruta x${f.bonus}`; els.tapHelp.textContent = `Clique na ${f.name} para coletar`;
  fruits.forEach(fr => els.fruitButton.classList.remove(fr.tier)); els.fruitButton.classList.add(f.tier);
  if(next){ const start = f.prestige, pct = Math.min(100, Math.max(0, ((state.prestige - start) / (next.prestige - start)) * 100)); els.nextFruitText.textContent = `Próxima: ${next.name} no prestígio ${next.prestige}`; els.fruitProgressText.textContent = `${Math.floor(pct)}%`; els.fruitProgressBar.style.width = `${pct}%`; } else { els.nextFruitText.textContent = "Fruta máxima desbloqueada"; els.fruitProgressText.textContent = "100%"; els.fruitProgressBar.style.width = "100%"; }
  renderEvent(); renderUpgrades(); renderRoadmap();
}

function renderEvent(){ const now = Date.now(); if(state.eventActive){ els.eventPill.classList.add("active"); document.body.classList.add("event-on"); els.eventTimer.textContent = `termina em ${time(state.eventEndsAt - now)}`; } else { els.eventPill.classList.remove("active"); document.body.classList.remove("event-on"); els.eventTimer.textContent = `começa em ${time(state.nextEventAt - now)}`; } }
function renderRoadmap(){ els.roadmap.innerHTML = fruits.map(f => `<div class="road-item ${f.name === currentFruit().name ? "active" : ""}"><span class="road-icon">${f.icon}</span><span>${f.prestige} prestígios · ${f.name} · bônus x${f.bonus}</span></div>`).join(""); }
function renderUpgrades(){ els.upgrades.innerHTML = upgrades.map(u => { const maxed = u.max !== null && state[u.id] >= u.max, can = state.apples >= state.costs[u.id]; return `<button class="upgrade ${can ? "" : "locked"} ${maxed ? "maxed" : ""}" data-id="${u.id}"><div class="upgrade-top"><h3>${u.title}</h3><span class="cost">${maxed ? "MAX" : compact(state.costs[u.id]) + " 🍎"}</span></div><p>${u.desc}</p><span class="level">${u.level()}</span></button>`; }).join(""); document.querySelectorAll(".upgrade").forEach(btn => btn.onclick = () => buy(upgrades.find(u => u.id === btn.dataset.id))); }

function buy(u){ const maxed = u.max !== null && state[u.id] >= u.max; if(maxed) return toast("Essa melhoria já está no máximo."); if(state.apples < state.costs[u.id]){ shake(els.upgrades); return toast("Frutas insuficientes."); } const ok = u.buy(); if(ok === false) return; save("Salvo após compra."); render(); }
function clickFruit(e){ let gain = clickGain(), crit = false; if(state.criticalChance > 0 && Math.random()*100 <= state.criticalChance){ gain *= 5; crit = true; } gain += rainBonus(); state.apples += gain; const r = els.floatLayer.getBoundingClientRect(); floatText(e.clientX - r.left, e.clientY - r.top, `${crit ? "CRÍTICO " : ""}+${compact(gain)} 🍎`, crit); burst(e.clientX, e.clientY); render(); }
function floatText(x,y,text,crit=false){ const s=document.createElement("span"); s.className=`float ${crit?"crit":""}`; s.textContent=text; s.style.left=x+"px"; s.style.top=y+"px"; els.floatLayer.appendChild(s); setTimeout(()=>s.remove(),950); }
function burst(x,y){ const f=currentFruit(); for(let i=0;i<9;i++){ const p=document.createElement("span"); p.className="rain"; p.textContent=f.icon; p.style.left=(x+Math.random()*90-45)+"px"; p.style.top=(y+Math.random()*44-22)+"px"; p.style.animationDuration=(.6+Math.random()*.4)+"s"; p.style.fontSize=(14+Math.random()*12)+"px"; document.body.appendChild(p); setTimeout(()=>p.remove(),900); } }
function visualRain(){ let c=0; const f=currentFruit(); const it=setInterval(()=>{ if(!state.rainActive || c>=90){clearInterval(it); return;} const p=document.createElement("span"); p.className="rain"; p.textContent=f.icon; p.style.left=Math.random()*100+"vw"; p.style.animationDuration=(2.2+Math.random()*2.2)+"s"; p.style.fontSize=(15+Math.random()*18)+"px"; document.body.appendChild(p); setTimeout(()=>p.remove(),4700); c++; },180); }
function tickAuto(){ const gain=autoGain(); if(gain>0){ state.apples += gain; floatText(190+Math.random()*280,180+Math.random()*110,`+${compact(gain)} auto 🍎`); render(); } }
function tickRain(){ if(!state.rainActive) return; state.rainTime--; if(state.rainTime<=0){ state.rainActive=false; state.rainTime=0; toast("Chuva de frutas terminou."); save("Chuva finalizada."); } render(); }
function tickEvent(){ const now=Date.now(); if(state.eventActive && now >= state.eventEndsAt){ state.eventActive=false; state.eventEndsAt=0; state.nextEventAt=now+EVENT_INTERVAL; toast("Evento 2x terminou."); save("Evento finalizado."); } if(!state.eventActive && now >= state.nextEventAt){ state.eventActive=true; state.eventEndsAt=now+EVENT_DURATION; state.nextEventAt=state.eventEndsAt+EVENT_INTERVAL; toast("Evento 2x começou! Ganhos dobrados por 5 minutos."); save("Evento iniciado."); } renderEvent(); }
function save(msg="Salvo automaticamente."){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); els.saveText.textContent=msg; setTimeout(()=>els.saveText.textContent="Salvamento automático ativo",1300); }catch(e){ els.saveText.textContent="Erro ao salvar."; console.error(e); } }
function load(){ let raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(OLD_SAVE_KEY); if(!raw) return; try{ const s=JSON.parse(raw); Object.assign(state,{...state,...s,costs:{...state.costs,...(s.costs||{})}}); state.rainActive=false; state.rainTime=0; if(!state.nextEventAt || state.nextEventAt < Date.now() - EVENT_INTERVAL*3) state.nextEventAt = Date.now() + EVENT_INTERVAL; if(state.eventActive && (!state.eventEndsAt || state.eventEndsAt < Date.now())){ state.eventActive=false; state.eventEndsAt=0; state.nextEventAt=Date.now()+EVENT_INTERVAL; } }catch(e){ console.error("Save corrompido", e); } }
function reset(){ if(!confirm("Tem certeza que deseja resetar todo o progresso?")) return; localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_SAVE_KEY); Object.assign(state,{apples:0,clickPower:1,autoCollector:0,multiplier:1,criticalChance:0,farm:0,rainBonus:0,prestige:0,rainActive:false,rainTime:0,eventActive:false,eventEndsAt:0,nextEventAt:Date.now()+EVENT_INTERVAL,costs:{clickPower:25,autoCollector:75,multiplier:200,criticalChance:350,farm:600,rainBonus:1000,prestige:5000}}); save("Save resetado."); toast("Save resetado."); render(); }
function toast(msg){ els.toast.textContent=msg; els.toast.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>els.toast.classList.remove("show"),1900); }
function shake(el){ el.animate([{transform:"translateX(0)"},{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"translateX(0)"}],{duration:220,easing:"ease-out"}); }

els.fruitButton.onclick = clickFruit; els.saveBtn.onclick = () => { save("Salvo manualmente."); toast("Jogo salvo."); }; els.resetBtn.onclick = reset; window.addEventListener("beforeunload",()=>save("Salvo ao fechar."));
load(); render(); setInterval(tickAuto,1000); setInterval(tickRain,1000); setInterval(tickEvent,1000); setInterval(()=>save("Salvo automaticamente."),5000);
