(() => {
  'use strict';
  const VERSION = '10.4.0-pc-mobile-perf-fix';
  const SAVE_KEY = 'maca_clicker_v10_world_pets_save';
  const RANK_KEY = 'maca_clicker_v10_ranking';
  const MINUTE = 60000, HOUR = 3600000;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const now = () => Date.now();
  const fmt = v => Intl.NumberFormat('pt-BR',{notation:Math.abs(v)>=10000?'compact':'standard',maximumFractionDigits:2}).format(Math.floor(v||0));
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const dayKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const weekKey = (d=new Date()) => { const onejan = new Date(d.getFullYear(),0,1); return `${d.getFullYear()}-W${Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7)}`; };
  const clock = ms => { const s=Math.max(0,Math.ceil(ms/1000)); const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),r=s%60; return h?`${h}h ${m}m`:`${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`; };

  const worlds = [
    {id:'farm',icon:'🌾',name:'Fazenda inicial',theme:'theme-farm',need:0,multi:1,desc:'Começo leve, simples e equilibrado.',music:220,shop:'Sementes e ferramentas básicas.'},
    {id:'gold',icon:'🏆',name:'Pomar dourado',theme:'theme-gold',need:15000,multi:2.2,desc:'Maçãs douradas e loja de riqueza.',music:260,shop:'Upgrades de ouro e crítico.'},
    {id:'welison',icon:'💙',name:'Floresta azul do Welison',theme:'theme-welison',need:80000,multi:3.5,desc:'Área azul com bônus forte em eventos.',music:300,shop:'Energia azul e evento Welison.'},
    {id:'rare',icon:'🏝️',name:'Ilha das maçãs raras',theme:'theme-rare',need:280000,multi:5.5,desc:'Melhor sorte em pets e ovos raros.',music:340,shop:'Sorte, ovos e chuva rara.'},
    {id:'boss',icon:'👹',name:'Mundo sombrio / boss',theme:'theme-boss',need:900000,multi:8.5,desc:'Dano aumentado contra bosses.',music:170,shop:'Dano, tickets e sombras.'},
    {id:'celestial',icon:'🌌',name:'Mundo celestial',theme:'theme-celestial',need:3000000,multi:13,desc:'Área final com multiplicador absurdo.',music:420,shop:'Prestígio, estrelas e poder global.'}
  ];
  const worldMap = Object.fromEntries(worlds.map(w=>[w.id,w]));
  const skins = [
    {id:'normal',icon:'🍎',name:'Maçã normal',need:0}, {id:'gold',icon:'🍏',name:'Maçã dourada',need:15000},
    {id:'welison',icon:'🔵',name:'Maçã azul Welison',need:80000}, {id:'fire',icon:'🔥',name:'Maçã fogo',need:180000},
    {id:'ice',icon:'🧊',name:'Maçã gelo',need:360000}, {id:'cosmic',icon:'🪐',name:'Maçã cósmica',need:900000},
    {id:'hacker',icon:'💻',name:'Maçã hacker',need:1600000}
  ];
  const rarities = {comum:{multi:.08}, raro:{multi:.18}, épico:{multi:.36}, lendário:{multi:.75}, mítico:{multi:1.35}};
  const petPool = [
    {id:'dog',icon:'🐶',name:'Cachorro Pomar',rarity:'comum'}, {id:'cat',icon:'🐱',name:'Gato Maçã',rarity:'comum'},
    {id:'rabbit',icon:'🐰',name:'Coelho Dourado',rarity:'raro'}, {id:'fox',icon:'🦊',name:'Raposa Azul',rarity:'raro'},
    {id:'owl',icon:'🦉',name:'Coruja Épica',rarity:'épico'}, {id:'dragon',icon:'🐉',name:'Dragão da Colheita',rarity:'lendário'},
    {id:'phoenix',icon:'🔥',name:'Fênix Celestial',rarity:'mítico'}, {id:'alien',icon:'👽',name:'Alien Maçã',rarity:'mítico'}
  ];
  const eggs = [
    {id:'common',icon:'🥚',name:'Ovo comum',cost:2500,rarities:{comum:72,raro:23,épico:5}},
    {id:'rare',icon:'💎',name:'Ovo raro',cost:25000,rarities:{comum:25,raro:45,épico:22,lendário:7,mítico:1}},
    {id:'event',icon:'🌈',name:'Ovo evento',cost:120000,rarities:{raro:32,épico:37,lendário:22,mítico:9}}
  ];
  const upgrades = [
    {id:'click',icon:'👆',name:'Clique forte',desc:'+1 base por nível.',base:25,grow:1.45,apply:s=>s.up.click++},
    {id:'crit',icon:'💥',name:'Crítico',desc:'+2% chance crítica.',base:180,grow:1.55,apply:s=>s.up.crit++},
    {id:'auto',icon:'🤖',name:'Auto coletor',desc:'+2 maçãs/s.',base:90,grow:1.48,apply:s=>s.up.auto++},
    {id:'rain',icon:'🌧️',name:'Chuva de maçãs',desc:'Melhora eventos de chuva.',base:1250,grow:1.7,apply:s=>s.up.rain++},
    {id:'global',icon:'✖️',name:'Multiplicador global',desc:'+20% geral.',base:1800,grow:1.82,apply:s=>s.up.global++},
    {id:'eventSpeed',icon:'⏱️',name:'Velocidade de evento',desc:'Eventos 2x chegam mais rápido.',base:3500,grow:1.95,cap:20,apply:s=>s.up.eventSpeed++},
    {id:'petLuck',icon:'🍀',name:'Sorte em pets',desc:'Melhora chance de raridade alta.',base:4200,grow:1.85,apply:s=>s.up.petLuck++},
    {id:'bossDmg',icon:'⚔️',name:'Dano em boss',desc:'+25% dano contra boss.',base:2600,grow:1.7,apply:s=>s.up.bossDmg++},
    {id:'prestige',icon:'⭐',name:'Prestígio',desc:'Reseta parte da economia e dá bônus permanente.',special:true}
  ];

  const defaultState = () => ({
    version:VERSION, fruits:0, world:'farm', skin:'normal', unlockedWorlds:{farm:true}, unlockedSkins:{normal:true},
    up:{click:1,crit:0,auto:0,rain:0,global:0,eventSpeed:0,petLuck:0,bossDmg:0}, prestige:0,
    pets:[], equippedPets:[], petSeq:0,
    boss:{active:false,name:'',hp:0,max:0,ends:0,type:'normal',damage:0}, tickets:{boss:2},
    event:{active:null,ends:0,next:now()+30*MINUTE,welisonKey:'',welisonEnds:0,rare:null,rareEnds:0},
    pass:{xp:0,claimedFree:{},claimedPremium:{},premium:true},
    missions:{dailyKey:'',weeklyKey:'',daily:{},weekly:{},dailyClaimed:{},weeklyClaimed:{}},
    stats:{clicks:0,total:0,bestClick:0,bossDamage:0,bossKills:0,prestiges:0,started:now(),play:0,lastSeen:now()},
    combo:{count:0,best:0,expires:0}, daily:{last:'',streak:0}, codes:{},
    settings:{sound:false,music:false,perf:'auto',seenStory:false,quickCollapsed:false}, screen:'home'
  });
  let state = defaultState(), dirty = true, lastTick = now(), lastSave = now(), lastHud = 0, lastFloat = 0, audio = null, musicTimer = null, visible = true, lastPetSig = '';
  const dom = {};

  function bindDom(){ ['loadingScreen','loaderBar','startBtn','storyModal','closeStoryBtn','toastStack','particleLayer','mainNav','mobileMenuBtn','worldSubtitle','eventTitle','eventHint','fruitCount','clickStat','autoStat','multiStat','petStat','worldStat','worldIcon','worldName','comboText','offlineText','passMini','bossMini','bossAlert','bossAlertName','bossAlertTimer','bossAlertLife','petOrbit','appleBtn','appleSkin','floatLayer','claimDailyBtn','openBestEggBtn','summonBossBtn','worldGrid','shopSubtitle','shopList','eggGrid','petList','bossName','bossDesc','bossLife','bossTicketBtn','weeklyBossBtn','eventList','passLevelText','passBar','passRewards','missionList','rankingGrid','skinGrid','codeInput','codeBtn','soundBtn','musicBtn','perfBtn','saveBox','saveBtn','exportBtn','importBtn','resetBtn','quickShopPanel','quickShopToggle','quickShopList','quickShopHint','openFullShopBtn'].forEach(id=>dom[id]=$('#'+id)); }
  function merge(base, extra){ for(const k in extra||{}){ if(extra[k] && typeof extra[k]==='object' && !Array.isArray(extra[k]) && base[k]) merge(base[k], extra[k]); else base[k]=extra[k]; } return base; }
  function load(){ try{ state=merge(defaultState(), JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')); }catch{ state=defaultState(); } migrateV9IfNeeded(); normalizeState(); computeOffline(); ensureMissions(); applyVisualState(); }
  function normalizeState(){ state.tickets ||= {boss:2}; state.boss ||= defaultState().boss; state.event ||= defaultState().event; state.settings ||= defaultState().settings; state.settings.quickCollapsed ||= false; state.missions.dailyClaimed ||= {}; state.missions.weeklyClaimed ||= {}; if(!state.event.next || state.event.next < now()-HOUR) state.event.next = now()+Math.max(5*MINUTE,30*MINUTE-state.up.eventSpeed*MINUTE); }
  function migrateV9IfNeeded(){ if(state.stats.total>0) return; try{ const old=JSON.parse(localStorage.getItem('maca_clicker_v9_cinema_save')||'null'); if(!old) return; state.fruits=old.fruits||0; state.stats.total=old.stats?.total||state.fruits; state.stats.clicks=old.stats?.clicks||0; state.prestige=old.prestige||0; state.up.click=old.clickPower||1; state.up.auto=old.autoCollector||0; state.up.global=Math.max(0,(old.multiplier||1)-1); setTimeout(()=>toast('Progresso antigo importado e preservado.'),700); }catch{} }
  function save(){ state.version=VERSION; state.stats.lastSeen=now(); localStorage.setItem(SAVE_KEY, JSON.stringify(state)); dirty=false; }
  function computeOffline(){ const diff=Math.min(12*HOUR, Math.max(0, now()-(state.stats.lastSeen||now()))); if(diff>60000){ const gain=Math.floor(autoGain()*diff/1000*.55); if(gain>0){ state.fruits+=gain; state.stats.total+=gain; setTimeout(()=>toast(`Você ganhou ${fmt(gain)} maçãs enquanto estava fora.`),900); } } }

  function fxMode(){
    if(state.settings.perf==='low') return 'low';
    const smallScreen = innerWidth <= 980 || matchMedia('(pointer: coarse)').matches;
    const weakCpu = (navigator.hardwareConcurrency || 4) <= 6;
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
    if(state.settings.perf==='high' && !smallScreen) return 'high';
    return (smallScreen || weakCpu || lowMemory) ? 'low' : 'high';
  }
  function world(){ return worldMap[state.world]||worlds[0]; }
  function skin(){ return skins.find(x=>x.id===state.skin)||skins[0]; }
  function petMulti(){ return 1 + state.equippedPets.map(id=>state.pets.find(p=>p.uid===id)).filter(Boolean).reduce((a,p)=>a + (rarities[p.rarity]?.multi||0) * p.level, 0); }
  function worldMulti(){ return world().multi; }
  function eventMulti(){ let m=1; if(state.event.active==='double') m*=2; if(state.event.welisonEnds>now()) m*=5; if(state.event.rare==='legend' && state.event.rareEnds>now()) m*=4; return m; }
  function globalMulti(){ return (1+state.up.global*.2) * (1+state.prestige*.15) * petMulti() * worldMulti() * eventMulti(); }
  function clickGain(){ let g=(state.up.click+1)*globalMulti(); if(state.combo.count>1) g*=Math.min(3,1+state.combo.count/90); return Math.max(1,Math.floor(g)); }
  function autoGain(){ let g=(state.up.auto*2 + worlds.indexOf(world())*6) * globalMulti(); if(state.event.rare==='auto' && state.event.rareEnds>now()) g*=3; return Math.floor(g); }
  function critChance(){ let c=state.up.crit*2 + state.up.petLuck*.25; if(state.event.rare==='crit' && state.event.rareEnds>now()) c += 25; return clamp(c,0,80); }
  function bossDamageMulti(){ return 1 + state.up.bossDmg*.25 + (state.world==='boss'?1.2:0) + (state.event.welisonEnds>now()?0.35:0); }
  function upgradeCost(u){ if(u.special) return prestigeCost(); const lvl=state.up[u.id]||0; return Math.floor(u.base*Math.pow(u.grow,lvl)); }
  function prestigeCost(){ return Math.floor(250000*Math.pow(1.75,state.prestige)); }

  function sound(freq=360,dur=.09,type='sine'){ if(!state.settings.sound) return; try{ audio ||= new (window.AudioContext||window.webkitAudioContext)(); const o=audio.createOscillator(), g=audio.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=.045; o.connect(g); g.connect(audio.destination); o.start(); g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur); o.stop(audio.currentTime+dur+.02); }catch{} }
  function music(on=state.settings.music){ clearInterval(musicTimer); if(!on) return; musicTimer=setInterval(()=>{ const w=world(); sound(w.music,.15,'triangle'); setTimeout(()=>sound(w.music*1.5,.12,'triangle'),180); },2200); }
  function toast(text){ if(!dom.toastStack) return; const t=document.createElement('div'); t.className='toast'; t.textContent=text; dom.toastStack.appendChild(t); setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(-8px)'},2600); setTimeout(()=>t.remove(),3100); }

  function applyVisualState(){
    const classes=[world().theme];
    if(state.boss.active) classes.push('boss-active');
    if(state.event.active==='double') classes.push('event-double');
    if(state.event.welisonEnds>now()) classes.push('event-welison');
    if(state.event.rare && state.event.rareEnds>now()) classes.push('rare-'+state.event.rare);
    document.body.className=classes.join(' ');
    document.body.dataset.fx=fxMode();
    if(dom.worldSubtitle) dom.worldSubtitle.textContent = `${world().name} • multiplicador x${world().multi}`;
    if(dom.worldIcon) dom.worldIcon.textContent=world().icon;
    if(dom.worldName) dom.worldName.textContent=world().name;
  }
  function setScreen(screen){ state.screen=screen; $$('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${screen}`)); $$('#mainNav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===screen)); dom.mainNav?.classList.remove('open'); render(); dirty=true; }

  function clickApple(ev){
    const t=now(); if(t>state.combo.expires) state.combo.count=0; state.combo.count++; state.combo.best=Math.max(state.combo.best,state.combo.count); state.combo.expires=t+1700;
    let gain=clickGain(); const crit=Math.random()*100<critChance(); if(crit) gain*=3;
    gain=Math.floor(gain); state.fruits+=gain; state.stats.total+=gain; state.stats.clicks++; state.stats.bestClick=Math.max(state.stats.bestClick,gain); addPassXp(1);
    if(state.boss.active){ const dmg=Math.max(1,Math.floor((gain + state.up.click*4 + 10)*bossDamageMulti())); damageBoss(dmg); float(ev, `-${fmt(dmg)} HP`, true); }
    float(ev, `+${fmt(gain)}${crit?' CRIT':''}`, crit); burstClick(ev, crit); sound(state.boss.active?130:(crit?660:330), state.boss.active?.12:.08, state.boss.active?'sawtooth':'sine'); updateMissions(); dirty=true; renderHud();
  }
  function float(ev,text,crit=false){
    const low = fxMode()==='low';
    const t = now();
    if(low && !crit && t-lastFloat < 135) return;
    lastFloat = t;
    const r=dom.floatLayer.getBoundingClientRect(); const f=document.createElement('b'); f.className='float-text'+(crit?' crit':''); f.textContent=text; const x=ev?.clientX ? ev.clientX-r.left : r.width/2; const y=ev?.clientY ? ev.clientY-r.top : r.height/2; f.style.left=x+'px'; f.style.top=y+'px'; dom.floatLayer.appendChild(f); setTimeout(()=>f.remove(),low?620:950);
  }
  function burstClick(ev,crit=false){ if(fxMode()==='low' || !visible) return; const r=dom.floatLayer.getBoundingClientRect(); const cx=(ev?.clientX?ev.clientX-r.left:r.width/2), cy=(ev?.clientY?ev.clientY-r.top:r.height/2); const n=crit?8:4; for(let i=0;i<n;i++){ const b=document.createElement('i'); b.className='click-bit'; const a=Math.random()*Math.PI*2, d=35+Math.random()*58; b.style.left=cx+'px'; b.style.top=cy+'px'; b.style.setProperty('--dx',Math.cos(a)*d+'px'); b.style.setProperty('--dy',Math.sin(a)*d+'px'); dom.floatLayer.appendChild(b); setTimeout(()=>b.remove(),700); } }

  function buyUpgrade(id){ const u=upgrades.find(x=>x.id===id); if(!u) return; if(u.special){ doPrestige(); return; } if(u.cap && state.up[id]>=u.cap) return toast('Esse upgrade já está no máximo.'); const cost=upgradeCost(u); if(state.fruits<cost) return toast('Faltam maçãs para comprar.'); state.fruits-=cost; u.apply(state); sound(520,.1); toast(`${u.name} comprado.`); updateMissions(); dirty=true; render(); }
  function doPrestige(){ const cost=prestigeCost(); if(state.fruits<cost) return toast(`Prestígio precisa de ${fmt(cost)} maçãs.`); state.fruits=0; state.prestige++; state.stats.prestiges++; state.up.click=1; state.up.auto=0; state.up.crit=0; state.up.rain=0; state.stats.total+=1000; addPassXp(80); toast('Prestígio feito! Bônus permanente aumentado.'); sound(760,.18); dirty=true; render(); }
  function buyTicket(){ const c=60000*Math.max(1,state.tickets.boss+1); if(state.fruits<c) return toast('Faltam maçãs para comprar ticket.'); state.fruits-=c; state.tickets.boss++; toast('+1 ticket boss comprado.'); dirty=true; render(); }

  function unlockWorld(id){ const w=worldMap[id]; if(!w) return; if(state.unlockedWorlds[id]){ state.world=id; applyVisualState(); music(); render(); dirty=true; return; } if(state.stats.total < w.need) return toast(`Precisa coletar ${fmt(w.need)} maçãs no total.`); state.unlockedWorlds[id]=true; state.world=id; toast(`${w.name} desbloqueado!`); sound(780,.18); applyVisualState(); dirty=true; render(); }
  function unlockSkin(id){ const s=skins.find(x=>x.id===id); if(!s) return; if(state.unlockedSkins[id]){ state.skin=id; renderHud(); dirty=true; return; } if(state.stats.total < s.need) return toast(`Precisa coletar ${fmt(s.need)} maçãs no total.`); state.unlockedSkins[id]=true; state.skin=id; toast(`${s.name} desbloqueada!`); dirty=true; render(); }
  function openEgg(id){ const egg=eggs.find(e=>e.id===id)||eggs[0]; let cost=egg.cost; if(state.world==='rare') cost=Math.floor(cost*.85); if(state.fruits<cost) return toast('Faltam maçãs para abrir ovo.'); state.fruits-=cost; const rarity=rollRarity(egg); const options=petPool.filter(p=>p.rarity===rarity); const base=options[Math.floor(Math.random()*options.length)]||petPool[0]; const pet={...base,uid:'p'+(++state.petSeq),level:1}; state.pets.push(pet); if(state.equippedPets.length<3) state.equippedPets.push(pet.uid); toast(`Você ganhou ${pet.icon} ${pet.name} (${pet.rarity})!`); sound(720,.14); addPassXp(rarity==='mítico'?80:rarity==='lendário'?45:18); ensureMissions(); state.missions.daily.eggs=(state.missions.daily.eggs||0)+1; updateMissions(); dirty=true; render(); }
  function rollRarity(egg){ const luck=state.up.petLuck*1.8 + (state.world==='rare'?12:0); const adjusted={...egg.rarities}; if(adjusted.mítico) adjusted.mítico+=luck*.25; if(adjusted.lendário) adjusted.lendário+=luck*.45; if(adjusted.épico) adjusted.épico+=luck*.7; let total=Object.values(adjusted).reduce((a,b)=>a+b,0), r=Math.random()*total; for(const k in adjusted){ r-=adjusted[k]; if(r<=0) return k; } return 'comum'; }
  function equipPet(uid){ if(state.equippedPets.includes(uid)) state.equippedPets=state.equippedPets.filter(x=>x!==uid); else { if(state.equippedPets.length>=3) return toast('Máximo de 3 pets equipados.'); state.equippedPets.push(uid); } lastPetSig=''; dirty=true; render(); }
  function fusePet(uid){ const p=state.pets.find(x=>x.uid===uid); if(!p) return; const same=state.pets.filter(x=>x.id===p.id && x.rarity===p.rarity && x.level===p.level); if(same.length<3) return toast('Precisa de 3 pets iguais e do mesmo level.'); same.slice(1,3).forEach(rem=>{ state.pets=state.pets.filter(x=>x.uid!==rem.uid); state.equippedPets=state.equippedPets.filter(x=>x!==rem.uid); }); p.level++; toast(`${p.name} evoluiu para level ${p.level}!`); lastPetSig=''; dirty=true; render(); }
  function openBestEgg(){ const affordable=[...eggs].reverse().find(e=>state.fruits>=e.cost); openEgg(affordable?.id||'common'); }

  function startBoss(type='normal'){
    if(state.boss.active) return toast('Já existe um boss ativo. Clique na caveira para atacar.');
    if(type==='normal'){ if(state.tickets.boss<=0) return toast('Sem ticket boss. Compre na loja rápida ou ganhe em eventos.'); state.tickets.boss--; }
    const weekly=type==='weekly', welison=state.event.welisonEnds>now();
    const worldIndex=worlds.findIndex(w=>w.id===state.world)+1;
    const max=Math.floor((weekly?520000:160000) * (1+state.prestige*.28) * Math.max(1,worldIndex*.55));
    state.boss={active:true,type,name:welison?'💙 Boss Azul Welison':weekly?'💀 Boss Semanal Supremo':'💀 Rei Caveira do Pomar',hp:max,max,ends:now()+(weekly?120000:90000),damage:0};
    applyVisualState(); toast(`${state.boss.name} apareceu! A maçã virou caveira.`); spawnBossPulse(); sound(120,.28,'sawtooth'); dirty=true; render();
  }
  function damageBoss(dmg){ if(!state.boss.active) return; state.boss.hp=Math.max(0,state.boss.hp-dmg); state.boss.damage+=dmg; state.stats.bossDamage+=dmg; if(state.boss.hp<=0) killBoss(); }
  function killBoss(){ const reward=Math.floor((state.boss.max/9) * (state.boss.type==='weekly'?2.2:1) * (state.event.welisonEnds>now()?2:1)); state.fruits+=reward; state.stats.total+=reward; state.stats.bossKills++; state.tickets.boss++; ensureMissions(); state.missions.daily.boss=(state.missions.daily.boss||0)+1; addPassXp(120); toast(`Boss derrotado! +${fmt(reward)} maçãs e +1 ticket.`); state.boss.active=false; state.boss.hp=0; sound(820,.25); applyVisualState(); dirty=true; render(); }
  function endBossByTime(){ const reward=Math.floor(state.boss.damage/8); state.fruits+=reward; state.stats.total+=reward; toast(`Boss fugiu. Recompensa por dano: ${fmt(reward)} maçãs.`); state.boss.active=false; state.boss.hp=0; applyVisualState(); dirty=true; render(); }
  function spawnBossPulse(){ if(fxMode()==='low') return; for(let i=0;i<10;i++){ const p=document.createElement('span'); p.className='particle'; p.textContent=Math.random()<.7?'💀':'🔥'; p.style.left=Math.random()*100+'vw'; p.style.setProperty('--x',(Math.random()*120-60)+'px'); p.style.animationDuration=(2.4+Math.random()*2.4)+'s'; dom.particleLayer.appendChild(p); setTimeout(()=>p.remove(),5600); } }

  function updateEvents(){
    const t=now(); let changed=false;
    if(state.event.active && t>state.event.ends){ state.event.active=null; changed=true; toast('Evento 2x terminou. O jogo voltou ao normal.'); }
    if(state.event.rare && t>state.event.rareEnds){ state.event.rare=null; changed=true; }
    if(state.boss.active && t>state.boss.ends) endBossByTime();
    const d=new Date(); const key=dayKey(d); const isWelison=(d.getDay()===6 && ((d.getHours()===15 && d.getMinutes()>=30) || (d.getHours()===16 && d.getMinutes()<30)));
    if(isWelison && state.event.welisonKey!==key){ state.event.welisonKey=key; state.event.welisonEnds=t+HOUR; state.world='welison'; state.unlockedWorlds.welison=true; changed=true; toast('Evento Welison 5x começou! Tema azul, partículas e multiplicador ativados.'); spawnRain('💙'); sound(620,.25); if(!state.boss.active) setTimeout(()=>startBoss('welison'),700); }
    if(t>state.event.next){ state.event.active='double'; state.event.ends=t+Math.min(12*MINUTE,5*MINUTE+state.up.rain*20000); state.event.next=t+Math.max(10*MINUTE,30*MINUTE-state.up.eventSpeed*MINUTE); if(Math.random()<.24){ state.event.rare=['auto','legend','crit'][Math.floor(Math.random()*3)]; state.event.rareEnds=t+4*MINUTE; } changed=true; spawnRain(); toast('Evento 2x ativo! Fundo, botão, partículas e multiplicador mudaram.'); sound(540,.16); }
    if(changed){ applyVisualState(); dirty=true; render(); }
  }
  function spawnRain(symbol){ if(fxMode()==='low' || !visible) return; for(let i=0;i<14;i++){ const p=document.createElement('span'); p.className='particle'; p.textContent=symbol || (Math.random()<.78?'🍎':'🍏'); p.style.left=Math.random()*100+'vw'; p.style.setProperty('--x',(Math.random()*120-60)+'px'); p.style.animationDuration=(3+Math.random()*3)+'s'; p.style.animationDelay=(Math.random()*1.5)+'s'; dom.particleLayer.appendChild(p); setTimeout(()=>p.remove(),7000); } }

  function claimDaily(){ const k=dayKey(); if(state.daily.last===k) return toast('Presente diário já coletado hoje.'); const y=new Date(); y.setDate(y.getDate()-1); state.daily.streak=state.daily.last===dayKey(y)?state.daily.streak+1:1; state.daily.last=k; const reward=5000*state.daily.streak + state.stats.total*.01; state.fruits+=reward; state.stats.total+=reward; state.tickets.boss++; addPassXp(35); toast(`Presente: +${fmt(reward)} maçãs e +1 ticket boss.`); sound(780,.16); dirty=true; render(); }
  function addPassXp(x){ state.pass.xp+=x; }
  function passLevel(){ return Math.floor(state.pass.xp/100); }
  function claimPass(level,premium=false){ const bucket=premium?state.pass.claimedPremium:state.pass.claimedFree; if(passLevel()<level) return toast('Nível do passe insuficiente.'); if(bucket[level]) return toast('Recompensa já coletada.'); bucket[level]=true; const reward=premium?{fruits:level*7500+2500,ticket:level%3===0?1:0}:{fruits:level*2500+1000,ticket:level%5===0?1:0}; state.fruits+=reward.fruits; state.stats.total+=reward.fruits; state.tickets.boss+=reward.ticket; toast(`${premium?'Premium':'Grátis'} nível ${level}: +${fmt(reward.fruits)} maçãs${reward.ticket?' + ticket':''}.`); dirty=true; render(); }
  function ensureMissions(){ const dk=dayKey(), wk=weekKey(); if(state.missions.dailyKey!==dk){ state.missions.dailyKey=dk; state.missions.daily={clicks:0,eggs:0,boss:0}; state.missions.dailyClaimed={}; } if(state.missions.weeklyKey!==wk){ state.missions.weeklyKey=wk; state.missions.weekly={clicks:0,bossDamage:0,prestige:0}; state.missions.weeklyClaimed={}; } }
  function updateMissions(){ ensureMissions(); state.missions.daily.clicks=state.stats.clicks; state.missions.weekly.clicks=state.stats.clicks; state.missions.weekly.bossDamage=state.stats.bossDamage; state.missions.weekly.prestige=state.stats.prestiges; }
  function missionDefs(){ return [
    {id:'dclick',kind:'daily',icon:'👆',name:'Clique 300 vezes',cur:state.missions.daily.clicks||0,need:300,xp:40,reward:2500},
    {id:'degg',kind:'daily',icon:'🥚',name:'Abra 3 ovos',cur:state.missions.daily.eggs||0,need:3,xp:50,reward:4000},
    {id:'dboss',kind:'daily',icon:'👑',name:'Derrote 1 boss',cur:state.missions.daily.boss||0,need:1,xp:60,reward:7000},
    {id:'wclick',kind:'weekly',icon:'🔥',name:'Semana: 2500 cliques',cur:state.missions.weekly.clicks||0,need:2500,xp:180,reward:50000},
    {id:'wdmg',kind:'weekly',icon:'⚔️',name:'Semana: 500k dano boss',cur:state.missions.weekly.bossDamage||0,need:500000,xp:220,reward:90000},
    {id:'wprestige',kind:'weekly',icon:'⭐',name:'Semana: 1 prestígio',cur:state.missions.weekly.prestige||0,need:1,xp:160,reward:75000}
  ]; }
  function claimMission(id){ const m=missionDefs().find(x=>x.id===id); if(!m || m.cur<m.need) return toast('Missão ainda incompleta.'); const key=m.kind+'Claimed'; state.missions[key] ||= {}; if(state.missions[key][id]) return toast('Missão já coletada.'); state.missions[key][id]=true; state.fruits+=m.reward; state.stats.total+=m.reward; addPassXp(m.xp); toast(`Missão concluída: +${fmt(m.reward)} maçãs e +${m.xp} XP.`); dirty=true; render(); }
  function redeemCode(){ const code=(dom.codeInput.value||'').trim().toUpperCase(); const rewards={V10CINEMA:{fruits:50000,xp:100},WELISON5X:{fruits:25000,ticket:2},MACADOURADA:{skin:'gold',fruits:10000},BOSSUPDATE:{ticket:5,fruits:20000}}; const r=rewards[code]; if(!r) return toast('Código inválido.'); if(state.codes[code]) return toast('Código já usado.'); state.codes[code]=true; if(r.fruits){state.fruits+=r.fruits;state.stats.total+=r.fruits;} if(r.ticket) state.tickets.boss+=r.ticket; if(r.xp) addPassXp(r.xp); if(r.skin){state.unlockedSkins[r.skin]=true;state.skin=r.skin;} toast(`Código ${code} resgatado!`); sound(840,.18); dirty=true; dom.codeInput.value=''; render(); }
  function updateRanking(){ localStorage.setItem(RANK_KEY, JSON.stringify({clicks:state.stats.clicks, apples:state.stats.total, prestige:state.prestige, boss:state.stats.bossDamage, play:state.stats.play})); }

  function render(){ renderHud(); renderQuickShop(); const s=state.screen; if(s==='worlds') renderWorlds(); if(s==='shop') renderShop(); if(s==='pets') renderPets(); if(s==='boss') renderBoss(); if(s==='pass') renderPass(); if(s==='missions') renderMissions(); if(s==='ranking') renderRanking(); if(s==='skins') renderSkins(); if(s==='settings') renderSettings(); }
  function renderHud(){ applyVisualState(); dom.fruitCount.textContent=fmt(state.fruits); dom.clickStat.textContent='+'+fmt(clickGain()); dom.autoStat.textContent=fmt(autoGain())+'/s'; dom.multiStat.textContent='x'+globalMulti().toFixed(1); dom.petStat.textContent='x'+petMulti().toFixed(1); dom.worldStat.textContent='x'+worldMulti(); dom.comboText.textContent='Combo x'+Math.max(1,state.combo.count); dom.passMini.textContent=passLevel(); dom.appleSkin.textContent=state.boss.active?'💀':skin().icon; dom.bossMini.textContent=state.boss.active?clock(state.boss.ends-now()):'Inativo';
    dom.eventTitle.textContent=state.event.welisonEnds>now()?'💙 Welison 5x ativo':state.event.active==='double'?'⚡ Evento 2x ativo':'⚡ Próximo 2x';
    dom.eventHint.textContent=state.event.welisonEnds>now()?`Termina em ${clock(state.event.welisonEnds-now())}`:state.event.active==='double'?`Termina em ${clock(state.event.ends-now())}`:`Começa em ${clock(state.event.next-now())}`;
    const bossPct=state.boss.active?`${100*state.boss.hp/state.boss.max}%`:'0%'; if(dom.bossLife) dom.bossLife.style.width=bossPct; if(dom.bossAlertLife) dom.bossAlertLife.style.width=bossPct; dom.bossAlert?.classList.toggle('hidden',!state.boss.active); if(state.boss.active){ dom.bossAlertName.textContent=state.boss.name; dom.bossAlertTimer.textContent=`${clock(state.boss.ends-now())} • ${fmt(state.boss.hp)} HP`; }
    renderPetOrbit(); }
  function renderPetOrbit(){ const sig=state.equippedPets.join('|')+':'+state.pets.length; if(sig===lastPetSig) return; lastPetSig=sig; dom.petOrbit.innerHTML=''; state.equippedPets.map(id=>state.pets.find(p=>p.uid===id)).filter(Boolean).slice(0,3).forEach(p=>{ const e=document.createElement('span'); e.className='pet-friend'; e.textContent=p.icon; e.title=p.name; dom.petOrbit.appendChild(e); }); }
  function renderQuickShop(){ if(!dom.quickShopList) return; dom.quickShopPanel.classList.toggle('collapsed',!!state.settings.quickCollapsed && innerWidth>980); const ids=['click','auto','global','bossDmg','crit']; const html=ids.map(id=>{ const u=upgrades.find(x=>x.id===id), cost=upgradeCost(u), lvl=state.up[id]||0; return `<div class="quick-buy"><div class="icon">${u.icon}</div><div><h3>${u.name}</h3><small>Lv ${lvl} • ${fmt(cost)} 🍎</small></div><button class="primary" data-quick-buy="${id}">Comprar</button></div>`; }).join('') + `<div class="quick-buy"><div class="icon">🎟️</div><div><h3>Ticket Boss</h3><small>${state.tickets.boss} tickets • ${fmt(60000*Math.max(1,state.tickets.boss+1))} 🍎</small></div><button class="secondary" data-buy-ticket>Comprar</button></div>` + `<div class="quick-buy"><div class="icon">🥚</div><div><h3>Melhor ovo</h3><small>Abre o melhor ovo possível</small></div><button class="secondary" data-quick-egg>Abrir</button></div>`;
    dom.quickShopList.innerHTML=html; $$('[data-quick-buy]').forEach(b=>b.onclick=()=>buyUpgrade(b.dataset.quickBuy)); $('[data-buy-ticket]')?.addEventListener('click',buyTicket,{once:true}); $('[data-quick-egg]')?.addEventListener('click',openBestEgg,{once:true}); }
  function renderWorlds(){ dom.worldGrid.innerHTML=worlds.map(w=>{ const unlocked=!!state.unlockedWorlds[w.id], can=state.stats.total>=w.need; return `<div class="card ${unlocked?'':'locked'}"><div class="icon">${w.icon}</div><span class="tag">x${w.multi} • ${w.music}Hz</span><h3>${w.name}</h3><p>${w.desc}</p><p><b>Loja:</b> ${w.shop}</p><button class="${unlocked?'primary':'secondary'}" data-world="${w.id}">${unlocked?(state.world===w.id?'Atual':'Entrar'):can?'Desbloquear':'Precisa '+fmt(w.need)}</button></div>`; }).join(''); $$('[data-world]').forEach(b=>b.onclick=()=>unlockWorld(b.dataset.world)); }
  function renderShop(){ dom.shopSubtitle.textContent=world().shop; dom.shopList.innerHTML=upgrades.map(u=>{ const lvl=u.special?state.prestige:(state.up[u.id]||0), cost=upgradeCost(u); return `<div class="item"><div class="icon">${u.icon}</div><div><h3>${u.name} <small>Lv ${lvl}${u.cap?'/'+u.cap:''}</small></h3><p>${u.desc}</p></div><div><div class="price">${fmt(cost)} 🍎</div><button class="primary" data-buy="${u.id}">${u.special?'Prestigiar':'Comprar'}</button></div></div>`; }).join('') + `<div class="item"><div class="icon">🎟️</div><div><h3>Ticket Boss</h3><p>Compra +1 ticket para invocar boss.</p></div><div><div class="price">${fmt(60000*Math.max(1,state.tickets.boss+1))} 🍎</div><button class="primary" id="buyTicket">Comprar</button></div></div>`; $$('[data-buy]').forEach(b=>b.onclick=()=>buyUpgrade(b.dataset.buy)); $('#buyTicket').onclick=buyTicket; }
  function renderPets(){ dom.eggGrid.innerHTML=eggs.map(e=>`<div class="card"><div class="icon">${e.icon}</div><span class="tag">${fmt(e.cost)} 🍎</span><h3>${e.name}</h3><p>Chance muda com sorte e mundo raro.</p><button class="primary" data-egg="${e.id}">Abrir</button></div>`).join(''); $$('[data-egg]').forEach(b=>b.onclick=()=>openEgg(b.dataset.egg)); dom.petList.innerHTML=state.pets.length?state.pets.map(p=>`<div class="item card" data-rarity="${p.rarity}"><div class="icon">${p.icon}</div><div><h3>${p.name} <small>${p.rarity} • Lv ${p.level}</small></h3><p>Multiplicador: +${((rarities[p.rarity]?.multi||0)*p.level).toFixed(2)}x • ${state.equippedPets.includes(p.uid)?'Equipado':'Guardado'}</p></div><div><button class="secondary" data-equip="${p.uid}">${state.equippedPets.includes(p.uid)?'Remover':'Equipar'}</button><button class="primary" data-fuse="${p.uid}">Fundir</button></div></div>`).join(''):'<div class="panel-soft" style="padding:16px">Você ainda não tem pets. Abra um ovo.</div>'; $$('[data-equip]').forEach(b=>b.onclick=()=>equipPet(b.dataset.equip)); $$('[data-fuse]').forEach(b=>b.onclick=()=>fusePet(b.dataset.fuse)); }
  function renderBoss(){ dom.bossName.textContent=state.boss.active?state.boss.name:'Nenhum boss ativo'; dom.bossDesc.textContent=state.boss.active?`Tempo: ${clock(state.boss.ends-now())} • Vida: ${fmt(state.boss.hp)} / ${fmt(state.boss.max)} • Dano: ${fmt(state.boss.damage)}`:`Tickets: ${state.tickets.boss}. Boss recompensa por dano e por kill.`; dom.bossLife.style.width=state.boss.active?`${100*state.boss.hp/state.boss.max}%`:'0%'; dom.eventList.innerHTML=[`<div class="item"><div class="icon">⚡</div><div><h3>Evento 2x</h3><p>Muda fundo, botão, partículas e multiplicador.</p></div><b>${state.event.active==='double'?'Ativo':'Em '+clock(state.event.next-now())}</b></div>`,`<div class="item"><div class="icon">💙</div><div><h3>Welison 5x</h3><p>Todo sábado às 15:30 por 1 hora. Tema azul automático.</p></div><b>${state.event.welisonEnds>now()?clock(state.event.welisonEnds-now()):'Agenda fixa'}</b></div>`,`<div class="item"><div class="icon">🌈</div><div><h3>Evento raro</h3><p>Auto 3x, crítico ou lenda 4x pode aparecer junto do 2x.</p></div><b>${state.event.rare?state.event.rare:'Sorte'}</b></div>`].join(''); }
  function renderPass(){ const lvl=passLevel(); dom.passLevelText.textContent=`Nível ${lvl} • ${state.pass.xp%100}/100 XP`; dom.passBar.style.width=(state.pass.xp%100)+'%'; let html=''; for(let i=1;i<=20;i++) html+=`<div class="item"><div class="icon">🎫</div><div><h3>Nível ${i}</h3><p>Grátis: ${fmt(i*2500+1000)} maçãs • Premium fake: ${fmt(i*7500+2500)} maçãs</p></div><div><button class="secondary" data-pass-free="${i}">${state.pass.claimedFree[i]?'Coletado':'Grátis'}</button><button class="primary" data-pass-prem="${i}">${state.pass.claimedPremium[i]?'Coletado':'Premium'}</button></div></div>`; dom.passRewards.innerHTML=html; $$('[data-pass-free]').forEach(b=>b.onclick=()=>claimPass(+b.dataset.passFree,false)); $$('[data-pass-prem]').forEach(b=>b.onclick=()=>claimPass(+b.dataset.passPrem,true)); }
  function renderMissions(){ dom.missionList.innerHTML=missionDefs().map(m=>{ const claimed=state.missions[(m.kind+'Claimed')]?.[m.id]; return `<div class="item"><div class="icon">${m.icon}</div><div><h3>${m.name}</h3><p>${fmt(Math.min(m.cur,m.need))}/${fmt(m.need)} • +${m.xp} XP passe • +${fmt(m.reward)} maçãs</p><i class="life"><em style="width:${100*clamp(m.cur/m.need,0,1)}%"></em></i></div><button class="${claimed?'secondary':'primary'}" data-mission="${m.id}">${claimed?'Coletado':'Coletar'}</button></div>`; }).join(''); $$('[data-mission]').forEach(b=>b.onclick=()=>claimMission(b.dataset.mission)); }
  function renderRanking(){ updateRanking(); const r=JSON.parse(localStorage.getItem(RANK_KEY)||'{}'); const data=[['👆','Top cliques',r.clicks],['🍎','Top maçãs',r.apples],['⭐','Top prestígio',r.prestige],['⚔️','Top boss damage',r.boss],['⏱️','Tempo jogado',Math.floor((r.play||0)/60)+' min']]; dom.rankingGrid.innerHTML=data.map(x=>`<div class="card"><div class="icon">${x[0]}</div><span class="tag">Ranking local</span><h3>${x[1]}</h3><p>${typeof x[2]==='number'?fmt(x[2]):x[2]}</p></div>`).join(''); }
  function renderSkins(){ dom.skinGrid.innerHTML=skins.map(s=>{ const unlocked=state.unlockedSkins[s.id], can=state.stats.total>=s.need; return `<div class="card ${unlocked?'':'locked'}"><div class="icon">${s.icon}</div><span class="tag">${unlocked?'Desbloqueada':'Precisa '+fmt(s.need)}</span><h3>${s.name}</h3><p>${state.skin===s.id?'Skin atual':'Troque a aparência da maçã principal.'}</p><button class="${unlocked?'primary':'secondary'}" data-skin="${s.id}">${unlocked?'Usar':can?'Desbloquear':'Bloqueada'}</button></div>`; }).join(''); $$('[data-skin]').forEach(b=>b.onclick=()=>unlockSkin(b.dataset.skin)); }
  function renderSettings(){ dom.soundBtn.textContent=state.settings.sound?'🔊 Som ligado':'🔇 Som desligado'; dom.musicBtn.textContent=state.settings.music?'🎵 Música ligada':'🎵 Música desligada'; dom.perfBtn.textContent='✨ Efeitos: '+(state.settings.perf==='auto'?'Auto':state.settings.perf==='low'?'Leve':'Alto'); document.body.dataset.fx=fxMode(); }

  function loop(){ const t=now(), dt=Math.min(2,(t-lastTick)/1000); lastTick=t; if(visible){ const ag=autoGain()*dt; if(ag>0){ state.fruits+=ag; state.stats.total+=ag; dirty=true; } state.stats.play+=dt; } updateEvents(); if(t>state.combo.expires) state.combo.count=0; if(t-lastSave>5000 && dirty){ save(); lastSave=t; } const interval = fxMode()==='low' ? 260 : 120; if(t-lastHud>interval){ renderHud(); lastHud=t; } requestAnimationFrame(loop); }
  function init(){ bindDom(); load(); let progress=0; const loadTimer=setInterval(()=>{ progress+=18+Math.random()*16; dom.loaderBar.style.width=Math.min(100,progress)+'%'; if(progress>=100){ clearInterval(loadTimer); dom.startBtn.classList.remove('hidden'); } },160);
    dom.startBtn.onclick=()=>{ dom.loadingScreen.style.opacity='0'; setTimeout(()=>dom.loadingScreen.remove(),450); if(!state.settings.seenStory) dom.storyModal.classList.remove('hidden'); music(); };
    dom.closeStoryBtn.onclick=()=>{ state.settings.seenStory=true; dom.storyModal.classList.add('hidden'); dirty=true; };
    dom.mobileMenuBtn.onclick=()=>dom.mainNav.classList.toggle('open'); dom.mainNav.onclick=e=>{ const b=e.target.closest('button[data-screen]'); if(b) setScreen(b.dataset.screen); };
    dom.quickShopToggle.onclick=()=>{ if(innerWidth<=980) dom.quickShopPanel.classList.toggle('open-mobile'); else { state.settings.quickCollapsed=!state.settings.quickCollapsed; dirty=true; renderQuickShop(); } };
    dom.openFullShopBtn.onclick=()=>setScreen('shop');
    dom.appleBtn.onclick=clickApple; dom.claimDailyBtn.onclick=claimDaily; dom.openBestEggBtn.onclick=openBestEgg; dom.summonBossBtn.onclick=()=>startBoss('normal'); dom.bossTicketBtn.onclick=()=>startBoss('normal'); dom.weeklyBossBtn.onclick=()=>startBoss('weekly'); dom.codeBtn.onclick=redeemCode; dom.codeInput.onkeydown=e=>{if(e.key==='Enter')redeemCode();};
    dom.soundBtn.onclick=()=>{state.settings.sound=!state.settings.sound; sound(500,.1); dirty=true; renderSettings();}; dom.musicBtn.onclick=()=>{state.settings.music=!state.settings.music; music(); dirty=true; renderSettings();}; dom.perfBtn.onclick=()=>{state.settings.perf=state.settings.perf==='auto'?'high':state.settings.perf==='high'?'low':'auto'; document.body.dataset.fx=fxMode(); dirty=true; renderSettings();};
    dom.saveBtn.onclick=()=>{save();toast('Jogo salvo.');}; dom.exportBtn.onclick=()=>{dom.saveBox.value=btoa(unescape(encodeURIComponent(JSON.stringify(state)))); dom.saveBox.select(); toast('Save exportado.');}; dom.importBtn.onclick=()=>{try{state=merge(defaultState(), JSON.parse(decodeURIComponent(escape(atob(dom.saveBox.value.trim()))))); normalizeState(); save(); applyVisualState(); render(); toast('Save importado.');}catch{toast('Save inválido.');}}; dom.resetBtn.onclick=()=>{ if(confirm('Resetar todo o progresso V10?')){ localStorage.removeItem(SAVE_KEY); state=defaultState(); save(); location.reload(); } };
    document.addEventListener('visibilitychange',()=>{ visible=!document.hidden; if(!visible) save(); }); window.addEventListener('beforeunload',save); window.addEventListener('resize',()=>{document.body.dataset.fx=fxMode(); renderQuickShop();});
    setScreen(state.screen||'home'); render(); requestAnimationFrame(loop); if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js?v=10.4.0').catch(()=>{}); }
  }
  init();
})();
