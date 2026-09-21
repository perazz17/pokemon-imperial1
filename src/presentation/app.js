import { Game } from '../index.js';import { OverworldController } from '../world/overworld-controller.js';import { OverworldRenderer } from './overworld-renderer.js';import { BattlePresenter } from './battle-presenter.js';
const $=id=>document.getElementById(id),game=new Game(),world=new OverworldController(game),renderer=new OverworldRenderer($('world'));
const directions={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
function hud(){const s=game.state,m=game.maps[s.map];$('location').innerHTML=`<p class="eyebrow">${m.kind}</p><h2>${m.name}</h2>`;$('trainer').textContent=s.name;$('objective').textContent=game.nextObjective();$('party').textContent=s.party.map(p=>`${p.name} Lv.${p.level} · ${p.hp}/${p.maxHp} HP`).join('\n');}
function say(text){$('dialogText').textContent=text;$('dialog').hidden=false;}
function draw(){renderer.render(game);hud();}
function save(){if(game.state)localStorage.setItem('imperial-save',game.serialize());}
const battle=new BattlePresenter($('battle'),world,game,message=>say(message));
world.subscribe(event=>{save();if(event.type==='battle-started'){draw();battle.render();return;}if(event.type==='battle-ended'){$('battle').hidden=true;draw();return;}draw();if(event.result?.message)say(event.result.message);});
$('dialogClose').addEventListener('click',()=>{$('dialog').hidden=true;});
$('saveGame').addEventListener('click',()=>{save();say('Partita salvata su questo dispositivo.');});
$('loadGame').addEventListener('click',()=>{const raw=localStorage.getItem('imperial-save');if(!raw)return say('Nessun salvataggio trovato su questo dispositivo.');try{game.restore(raw);draw();if(game.state.battle){$('battle').hidden=false;battle.render();}say('Partita caricata.');}catch(error){say('Salvataggio non valido: '+error.message);}});
$('newGame').addEventListener('click',()=>{localStorage.removeItem('imperial-save');world.start('Ari','Terram');draw();});
document.querySelectorAll('.touch-controls [data-dir]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();const dir=directions[{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[button.dataset.dir]];world.move(...dir);}));
document.querySelector('.touch-controls [data-action="interact"]').addEventListener('pointerdown',event=>{event.preventDefault();world.interact();});
window.addEventListener('keydown',event=>{if(!$('dialog').hidden||!$('battle').hidden)return;const dir=directions[event.key];if(dir){event.preventDefault();world.move(...dir);}else if(event.key===' '||event.key==='e'||event.key==='E'){event.preventDefault();world.interact();}});
const startScreen=$('startScreen');
function begin(starter){startScreen.hidden=true;world.start('Ari',starter);draw();$('world').focus();}
const raw=localStorage.getItem('imperial-save');
if(raw){try{game.restore(raw);draw();}catch(error){localStorage.removeItem('imperial-save');startScreen.hidden=false;}}else startScreen.hidden=false;
document.querySelectorAll('[data-starter]').forEach(button=>button.addEventListener('click',()=>begin(button.dataset.starter)));
if(raw&&game.state)$('world').focus();