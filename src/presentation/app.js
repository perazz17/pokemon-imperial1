import { Game } from '../index.js';import { OverworldController } from '../world/overworld-controller.js';import { OverworldRenderer } from './overworld-renderer.js';import { BattlePresenter } from './battle-presenter.js';import { drawPokemonSprite } from './assets/pokemon/sprites.js';
const $=id=>document.getElementById(id),game=new Game(),world=new OverworldController(game),renderer=new OverworldRenderer($('world'));
const directions={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
function hud(){const s=game.state,m=game.maps[s.map];$('location').innerHTML=`<p class="eyebrow">${m.kind}</p><h2>${m.name}</h2>`;$('trainer').textContent=s.name;$('objective').textContent=game.nextObjective();$('party').textContent=s.party.map(p=>`${p.name} Lv.${p.level} · ${p.hp}/${p.maxHp} HP`).join('\n');}
function say(text){$('dialogText').textContent=text;$('dialog').hidden=false;}
function draw(){renderer.render(game);hud();}
function save(){if(game.state)localStorage.setItem('imperial-save',game.serialize());}
const battle=new BattlePresenter($('battle'),world,game,message=>say(message));
world.subscribe(event=>{if(event.result?.message){game.state.messages=game.state.messages||[];game.state.messages.push(event.result.message);game.state.messages=game.state.messages.slice(-40);}save();if(event.result?.panel){openMenu(event.result.panel);return;}if(event.type==='battle-started'){draw();battle.render();return;}if(event.type==='battle-ended'){$('battle').hidden=true;draw();return;}draw();if(event.result?.message)say(event.result.message);});
$('dialogClose').addEventListener('click',()=>{$('dialog').hidden=true;});
const menu=$('gameMenu'),menuContent=$('menuContent'),menuTitle=$('menuTitle');
let menuTab='party';
const itemNames={ball:'Poké Ball',great:'Mega Ball',ultra:'Ultra Ball',potion:'Pozione',super:'Super Pozione',revive:'Revitalizzante',antidote:'Antidoto',ether:'Etere'};
function openMenu(tab=menuTab){
 if(!game.state||game.state.battle)return;
 menuTab=tab;menu.hidden=false;renderMenu();
}
function renderMenu(){
 const s=game.state;
 const titles={party:'Squadra',bag:'Borsa',map:'Mappa',journal:'Diario',shop:'Emporio',box:'Box Pokémon'};
 menuTitle.textContent=titles[menuTab]||'Menu';
 document.querySelectorAll('[data-menu-tab]').forEach(b=>b.classList.toggle('active',b.dataset.menuTab===menuTab));
 if(menuTab==='party'){
  menuContent.innerHTML=`<div class="menu-grid party-grid">${s.party.map((p,i)=>`<article class="menu-mon"><div><b>${p.name}</b><span>Lv.${p.level}</span></div><div class="mini-hp"><i style="width:${Math.max(0,Math.round(p.hp/p.maxHp*100))}%"></i></div><small>${p.hp}/${p.maxHp} HP · ${p.status||'nessuna condizione'}</small><button data-party-lead="${i}" ${i===0||p.hp<=0?'disabled':''}>Metti in testa</button></article>`).join('')}</div>`;
 }else if(menuTab==='bag'){
  const items=Object.entries(s.bag).filter(([,q])=>q>0);
  menuContent.innerHTML=`<div class="menu-note">Usa una cura fuori dalla lotta. Le Poké Ball si usano durante gli incontri selvatici.</div><div class="menu-grid bag-grid">${items.map(([id,q])=>`<article class="bag-item"><b>${itemNames[id]||id}</b><strong>x${q}</strong>${['potion','super','revive','antidote','ether'].includes(id)?`<button data-use-item="${id}">Usa su ${s.party[0]?.name||'Pokémon'}</button>`:''}</article>`).join('')}</div>`;
 }else if(menuTab==='map'){
  const towns=s.visited.filter(id=>game.maps[id]&&(game.maps[id].kind==='town'||game.maps[id].kind==='league'));
  menuContent.innerHTML=`<div class="map-summary"><b>${game.maps[s.map].name}</b><span>${s.badges.length}/8 Medaglie · ${s.visited.length} luoghi scoperti</span></div><div class="travel-list">${towns.map(id=>{const m=game.maps[id],can=id===s.map||(m.kind==='town'||m.kind==='league')&&s.badges.length>=4;return `<button data-travel="${id}" ${can?'':'disabled'}><span>${m.name}</span><small>${id===s.map?'POSIZIONE ATTUALE':can?'Viaggio rapido disponibile':'Sblocca dopo 4 Medaglie'}</small></button>`}).join('')}</div>`;
 }else if(menuTab==='shop'){
  const stock=[['ball','Poké Ball','Cattura Pokémon selvatici.','150₽'],['great','Mega Ball','Maggiore probabilità di cattura.','350₽'],['ultra','Ultra Ball','Alta probabilità di cattura.','700₽'],['potion','Pozione','Recupera 20 HP.','100₽'],['super','Super Pozione','Recupera 60 HP.','300₽'],['revive','Revitalizzante','Rianima un Pokémon al 50% HP.','500₽'],['antidote','Antidoto','Cura una condizione.','150₽'],['ether','Etere','Ripristina tutti i PP.','400₽']];
  menuContent.innerHTML=`<div class="menu-note"><b>Disponibilità: ${s.money}₽</b> · Acquista singoli oggetti o confezioni da 5.</div><div class="menu-grid shop-grid">${stock.map(([id,name,desc,price])=>`<article class="bag-item"><div><b>${name}</b><small>${desc}</small></div><strong>${price}</strong><div class="shop-actions"><button data-buy="${id}" data-qty="1">+1</button><button data-buy="${id}" data-qty="5">+5</button></div></article>`).join('')}</div>`;
 }else if(menuTab==='box'){
  menuContent.innerHTML=`<div class="menu-note">Squadra ${s.party.length}/6 · Box ${s.box.length}. Non puoi depositare l'ultimo Pokémon della squadra.</div><div class="box-section"><h3>Squadra</h3><div class="menu-grid">${s.party.map((p,i)=>`<article class="menu-mon"><div><b>${p.name}</b><span>Lv.${p.level}</span></div><small>${p.hp}/${p.maxHp} HP</small><button data-deposit="${i}" ${s.party.length<=1?'disabled':''}>Deposita nel Box</button></article>`).join('')}</div></div><div class="box-section"><h3>Box</h3><div class="menu-grid">${s.box.length?s.box.map((p,i)=>`<article class="menu-mon"><div><b>${p.name}</b><span>Lv.${p.level}</span></div><small>${p.hp}/${p.maxHp} HP</small><button data-withdraw="${i}" ${s.party.length>=6?'disabled':''}>Aggiungi alla squadra</button></article>`).join(''):'<p class="menu-note">Il Box è vuoto. Cattura nuovi Pokémon per riempirlo.</p>'}</div></div>`;
 }else{
  const last=(s.messages||[]).slice(-8);
  menuContent.innerHTML=`<div class="journal-objective"><p class="eyebrow">OBIETTIVO</p><p>${game.nextObjective()}</p></div><div class="journal-stats"><span>Medaglie <b>${s.badges.length}/8</b></span><span>Pokédex visti <b>${s.seen.length}</b></span><span>Catturati <b>${s.caught.length}</b></span><span>Materiali <b>${s.materials}</b></span><span>Denaro <b>${s.money}₽</b></span></div><div class="journal-log">${last.map(x=>`<p>${x}</p>`).join('')}</div>`;
 }
}
menu.addEventListener('click',event=>{
 const tab=event.target.closest('[data-menu-tab]')?.dataset.menuTab;
 if(tab){menuTab=tab;renderMenu();return;}
 if(event.target.id==='menuClose'){menu.hidden=true;return;}
 const lead=event.target.closest('[data-party-lead]')?.dataset.partyLead;
 if(lead!==undefined){if(game.lead(+lead)){save();renderMenu();draw();}return;}
 const item=event.target.closest('[data-use-item]')?.dataset.useItem;
 if(item){const result=game.useItem(item,0);save();renderMenu();draw();if(result.message)say(result.message);return;}
 const buy=event.target.closest('[data-buy]');
 if(buy){const id=buy.dataset.buy,qty=+buy.dataset.qty;const ok=game.buy(id,qty);save();renderMenu();draw();say(ok?`Acquistato: ${itemNames[id]||id} ×${qty}.`:'Acquisto non riuscito: controlla il denaro o la disponibilità.');return;}
 const deposit=event.target.closest('[data-deposit]')?.dataset.deposit;
 if(deposit!==undefined){const ok=game.deposit(+deposit);save();renderMenu();draw();if(!ok)say('Non puoi depositare questo Pokémon.');return;}
 const withdraw=event.target.closest('[data-withdraw]')?.dataset.withdraw;
 if(withdraw!==undefined){const ok=game.withdraw(+withdraw);save();renderMenu();draw();if(!ok)say('La squadra è piena o il Pokémon non è disponibile.');return;}
 const travel=event.target.closest('[data-travel]')?.dataset.travel;
 if(travel&&travel!==game.state.map){if(game.travel(travel)){save();menu.hidden=true;draw();}return;}
});
$('menuButton').addEventListener('click',()=>openMenu());

$('saveGame').addEventListener('click',()=>{save();say('Partita salvata su questo dispositivo.');});
$('loadGame').addEventListener('click',()=>{const raw=localStorage.getItem('imperial-save');if(!raw)return say('Nessun salvataggio trovato su questo dispositivo.');try{game.restore(raw);draw();if(game.state.battle){$('battle').hidden=false;battle.render();}say('Partita caricata.');}catch(error){say('Salvataggio non valido: '+error.message);}});
$('newGame').addEventListener('click',()=>{localStorage.removeItem('imperial-save');game.state=null;game.messages=[];$('battle').hidden=true;startScreen.hidden=false;});
document.querySelectorAll('.touch-controls [data-dir]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();const dir=directions[{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[button.dataset.dir]];world.move(...dir);}));
document.querySelector('.touch-controls [data-action="interact"]').addEventListener('pointerdown',event=>{event.preventDefault();world.interact();});
window.addEventListener('keydown',event=>{if(!$('dialog').hidden||!$('battle').hidden||!menu.hidden||!game.state)return;const dir=directions[event.key];if(dir){event.preventDefault();world.move(...dir);}else if(event.key===' '||event.key==='e'||event.key==='E'){event.preventDefault();world.interact();}else if(event.key==='m'||event.key==='M'){event.preventDefault();openMenu();}});
const startScreen=$('startScreen');
function renderStarters(){document.querySelectorAll('.starter-sprite').forEach(canvas=>drawPokemonSprite(canvas.getContext('2d'),canvas.dataset.sprite,{frame:0}));}function begin(starter){startScreen.hidden=true;world.start('Ari',starter);game.state.messages=[...game.messages];draw();$('world').focus();}
const raw=localStorage.getItem('imperial-save');
if(raw){try{game.restore(raw);draw();}catch(error){localStorage.removeItem('imperial-save');startScreen.hidden=false;}}else startScreen.hidden=false;
document.querySelectorAll('[data-starter]').forEach(button=>button.addEventListener('click',()=>begin(button.dataset.starter)));
if(raw&&game.state)$('world').focus();else renderStarters();