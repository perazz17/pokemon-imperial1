/** V78 engine orchestrator; world and battle mechanics live in sibling modules. */
/* Motore unico, indipendente dal DOM. */
import DATA from '../data/imperial-data.js';
import { clone, clamp } from './utils.js';
import { buildMaps } from '../world/map-factory.js';
import { battleMethods } from '../battle/battle-system.js';
import { persistenceMethods } from '../persistence/save-state.js';

const D = DATA;
class Game{
 constructor(rng=Math.random){this.rng=rng;this.state=null;this.messages=[];this.maps=this.buildMaps();}
 fresh(name,starter){if(!['Terram','Ignivar','Elaris'].includes(starter))throw Error('Starter non valido');this.state={version:20,name:String(name||'Allenatore').slice(0,18),starter,map:'home',x:13,y:13,face:'up',party:[this.mon(starter,5)],box:[],bag:{ball:12,great:0,ultra:0,potion:8,super:0,revive:2,antidote:2,ether:2},money:1200,badges:[],flags:{},seen:[starter],caught:[starter],puzzles:{},visited:['home'],league:0,champion:false,completed:false,battle:null,steps:0,playTime:0,volume:true,difficulty:'normal',lastCenter:'home',materials:0};this.messages=['Professor Vannaccius: benvenuto a Imperial. Otto città custodiscono le tracce di un regno diviso.','Scegli cosa proteggere. Le corone non comandano i guardiani: sono i guardiani a riconoscere chi ne è degno.','Raggiungi Fioren attraverso la Strada dei Pascoli. Nell’erba puoi incontrare e catturare nuove creature.'];return this.state;}
 mon(name,level){const d=D.species[name];if(!d)throw Error('Specie sconosciuta: '+name);level=clamp(Math.floor(level),1,100);const moves=['Azione',D.moveSets[d.types[0]][0],level>=20?D.moveSets[d.types[0]][1]:'Rafforza',d.types[1]?D.moveSets[d.types[1]][level>=25?1:0]:'Attacco Rapido'];if(d.types[0]==='Grass'&&level>=12)moves[3]='Sonnifero';if(d.legendary)moves[3]='Ripresa';const m={id:name+'-'+Math.floor(this.rng()*1e12).toString(36),name,level,xp:0,moves:[...new Set(moves)],pp:{},hp:1,status:null,statusTurns:0,stages:{atk:0,def:0}};this.recalc(m,true);this.refill(m);return m;}
 recalc(m,full=false){const d=D.species[m.name],old=m.maxHp||0;m.stats={};['hp','atk','def','spa','spd','spe'].forEach((k,i)=>m.stats[k]=Math.floor((2*d.base[i]+24)*m.level/100)+(i===0?m.level+10:5));m.maxHp=m.stats.hp;m.hp=full?m.maxHp:m.hp===0?0:clamp(m.hp+Math.max(0,m.maxHp-old),0,m.maxHp);return m;}
 refill(m){m.moves.forEach(n=>m.pp[n]=D.moves[n].pp);m.hp=m.maxHp;m.status=null;m.statusTurns=0;m.stages={atk:0,def:0};}
 heal(){this.state.party.forEach(m=>this.refill(m));}
 seen(n,caught=false){if(!this.state.seen.includes(n))this.state.seen.push(n);if(caught&&!this.state.caught.includes(n))this.state.caught.push(n);}
 experience(m,amount){m.xp+=amount;const logs=[];while(m.level<100&&m.xp>=m.level*12){m.xp-=m.level*12;m.level++;this.recalc(m);logs.push(m.name+' sale al livello '+m.level+'!');let e=D.species[m.name].evo;if(e&&m.level>=e.level){const old=m.name;m.name=e.to;this.recalc(m);this.seen(m.name,true);logs.push(old+' si evolve in '+m.name+'!');}let t=D.species[m.name].types;let learned=m.level===20?D.moveSets[t[0]][1]:m.level===32&&t[1]?D.moveSets[t[1]][1]:null;if(learned&&!m.moves.includes(learned)){if(m.moves.length>=4)m.moves[0]=learned;else m.moves.push(learned);m.pp[learned]=D.moves[learned].pp;logs.push(m.name+' impara '+learned+'.');}}return logs;}
 puzzleState(i){const s=this.state;s.puzzleState=s.puzzleState||{};if(!s.puzzleState[i])s.puzzleState[i]={seq:[],cart:1,loaded:false,discs:[0,0,0],windows:[false,false,false],heat:2,lamps:[false,false,false],channels:[0,0],beds:0};return s.puzzleState[i];}
 puzzleText(i){const p=this.puzzleState(i);if((this.state.puzzles[i]||[]).length===3)return 'Passaggio aperto: il Capopalestra ti attende.';return [
 'Taglia le ragnatele nell’ordine radice → foglia → fiore. Le altre si ricompongono.',
 'Carrello '+p.cart+'/4 · '+(p.loaded?'minerale caricato':'vuoto')+'. Carica alla stazione 1, porta alla 4 e scarica.',
 'Dischi: '+p.discs.join(' · ')+'. Allinea la costellazione a 1 · 3 · 2.',
 'Finestre: '+p.windows.map(v=>v?'aperta':'chiusa').join(' · ')+'. Apri la prima e la terza, chiudi la seconda.',
 'Calore: '+p.heat+'/8. Regola le valvole a 5, poi abbassa il ponte.',
 'Lanterne: '+p.lamps.map(v=>v?'luce':'ombra').join(' · ')+'. La cripta richiede luce · ombra · luce.',
 'Ricostruisci la storia: origine → guerra → promessa.',
 'Canali: '+p.channels.join(' · ')+'. Porta il primo a 2, il secondo a 1, poi semina le tre aiuole.'
 ][i];}
 puzzleAction(i,k){const s=this.state,p=this.puzzleState(i);if((s.puzzles[i]||[]).length===3)return {message:'Il percorso è già aperto.'};let solved=false,msg='';
 if(i===0||i===6){if(k===p.seq.length){p.seq.push(k);msg=i===0?'Ragnatela recisa.':'Tavola storica collocata.';}else{p.seq=[];msg='Ordine errato: il meccanismo si ripristina.';}solved=p.seq.length===3;}
 if(i===1){if(k===0)p.cart=Math.max(1,p.cart-1);if(k===1)p.cart=Math.min(4,p.cart+1);if(k===2){if(p.cart===1&&!p.loaded)p.loaded=true;else if(p.cart===4&&p.loaded)solved=true;else msg='La gru può caricare alla stazione 1 e scaricare alla 4.';}}
 if(i===2){p.discs[k]=(p.discs[k]+1)%4;solved=p.discs.join(',')==='1,3,2';}
 if(i===3){p.windows[k]=!p.windows[k];solved=p.windows.join(',')==='true,false,true';}
 if(i===4){if(k===0)p.heat=Math.max(0,p.heat-1);if(k===1)p.heat=Math.min(8,p.heat+1);if(k===2){solved=p.heat===5;if(!solved)msg='La passerella non è stabile: serve calore 5.';}}
 if(i===5){p.lamps[k]=!p.lamps[k];solved=p.lamps.join(',')==='true,false,true';}
 if(i===7){if(k<2)p.channels[k]=(p.channels[k]+1)%3;else if(p.channels[0]===2&&p.channels[1]===1)p.beds++;else msg='L’acqua non raggiunge le aiuole: regola prima i canali.';solved=p.beds>=3;if(p.beds)msg='Aiuole coltivate: '+p.beds+'/3.';}
 if(solved){s.puzzles[i]=[0,1,2];return {message:'Il meccanismo è risolto: il passaggio al Capopalestra è aperto!'};}s.puzzles[i]=p.seq||[];return {message:msg+' '+this.puzzleText(i)};}
 nextObjective(){const s=this.state;if(s.completed)return 'Regno riunito! Completa il Pokédex o affronta di nuovo la Lega.';if(s.champion){if(!s.flags.light)return 'Dal Porto raggiungi l’Isola delle Reliquie e il Santuario della Luce.';if(!s.flags.shadow)return 'Esplora l’Isola dell’Ombra e affronta Noctivar nella cripta.';return 'Raggiungi il Palazzo Imperiale: ti attende la prova finale.';}if(s.badges.length===8)return 'Attraversa la Via Imperiale e conquista la Lega.';let i=s.badges.length;return 'Conquista la Medaglia '+D.gyms[i].badge+' a '+D.gyms[i].city+'.';}

 gate(g){const s=this.state;if(!g)return true;if(g==='badges')return s.badges.length===8;if(g.startsWith('badge-'))return s.badges.length>=+g.split('-')[1];if(g==='champion')return s.champion;if(g==='both')return s.flags.light&&s.flags.shadow;return !!s.flags[g];}
 enter(id,x=13,y=14){if(!this.maps[id])throw Error('Mappa sconosciuta');const s=this.state;s.map=id;s.x=x;s.y=y;if(!s.visited.includes(id))s.visited.push(id);return this.maps[id];}
 walk(dx,dy){const s=this.state;if(s.battle||Math.abs(dx)+Math.abs(dy)!==1)return {blocked:true};s.face=dx<0?'left':dx>0?'right':dy<0?'up':'down';let m=this.maps[s.map],x=s.x+dx,y=s.y+dy,t=m.grid[y]?.[x];if(!t||['water','tree','wall','rock'].includes(t))return {blocked:true};if(m.id.match(/^g[0-7]$/)&&y===5&&x===13&&(s.puzzles[+m.id[1]]||[]).length!==3)return {message:'Il passaggio è chiuso dal meccanismo della palestra.'};let obj=m.objects.find(o=>o.x===x&&o.y===y&&!['exit','door','item','decor'].includes(o.kind));if(obj)return {blocked:true,object:obj};s.x=x;s.y=y;s.steps++;let e=m.objects.find(o=>o.x===x&&o.y===y);if(e&&['exit','door'].includes(e.kind)){if(!this.gate(e.gate)){s.x-=dx;s.y-=dy;return {message:e.gate?.startsWith('event')?'La pattuglia blocca il passaggio. Affrontala prima di proseguire.':'Il passaggio è chiuso. Segui l’obiettivo del diario.'};}this.enter(e.to,e.tx,e.ty);return {travel:true};}if(e?.kind==='item')return this.interact(e);if((t==='tall'||m.kind==='dungeon')&&m.pool.length&&this.rng()<(m.encounterRate??.13)){const source=m.kind==='dungeon'&&m.rarePool?.length&&this.rng()<.12?m.rarePool:m.pool;const name=source[Math.floor(this.rng()*source.length)],lv=clamp(m.level+Math.floor(this.rng()*4),2,80);this.startBattle({kind:'wild',name:'Incontro selvatico',team:[[name,lv]]});return {battle:true};}return {moved:true};}
 nearest(){const s=this.state,v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[s.face],objects=this.maps[s.map].objects;return objects.find(o=>o.x===s.x+v[0]&&o.y===s.y+v[1])||objects.find(o=>Math.abs(o.x-s.x)+Math.abs(o.y-s.y)<=1);}
 interact(o=this.nearest()){const s=this.state;if(!o)return {message:'Nessuno con cui interagire. Avvicinati a un personaggio, un sigillo o una porta.'};switch(o.kind){case 'npc':case 'sign':return {message:o.name+': '+o.text};case 'center':this.heal();s.lastCenter=o.home||s.map;return {message:'Squadra curata: HP, PP e condizioni ripristinati. Puoi continuare il viaggio.'};case 'shop':return {panel:'shop'};case 'box':return {panel:'box'};case 'item':if(s.flags[o.id])return {message:'Hai già raccolto questa scorta.'};s.flags[o.id]=true;if(o.item==='material')s.materials+=o.qty;else s.bag[o.item]+=o.qty;return {message:o.name+' ×'+o.qty+' raccolto!'};case 'relic':if(!s.flags[o.id]){s.flags[o.id]=true;s.materials++;s.money+=300;}return {message:o.text+' Hai registrato questo frammento nel diario.'};case 'switch':return this.puzzleAction(o.gym,o.index);
 case 'dungeonSwitch':{const d=o.dungeon, key='dungeon-puzzle-'+d;const seq=s.flags[key]||[];if(s.flags['dungeon-secret-'+d])return {message:'Il sigillo è già aperto. La stanza segreta è accessibile.'};if(o.index===seq.length){const next=[...seq,o.index];s.flags[key]=next;if(next.length===3){s.flags['dungeon-secret-'+d]=true;return {message:'I tre sigilli della cripta si allineano. Una porta segreta si apre!'};}return {message:'Sigillo '+(next.length)+'/3 attivato. Cerca il prossimo.'};}s.flags[key]=[];return {message:'Sequenza errata: i sigilli si spengono e il meccanismo si resetta.'};}
 case 'trainer':if(s.flags[o.id])return {message:o.name+': buona fortuna per il viaggio!'};this.startBattle({kind:'trainer',id:o.id,name:o.name,team:o.team,double:!!o.double,after:o.after||null});return {battle:true,message:o.story};
 case 'leader':{let i=o.gym,g=D.gyms[i];if(s.badges.includes(i))return {message:g.leader+': la Medaglia '+g.badge+' testimonia il tuo valore.'};if(s.badges.length!==i)return {message:'Prima conquista le medaglie precedenti.'};if((s.puzzles[i]||[]).length!==3)return {message:'Risolvi il puzzle dei tre sigilli prima della sfida.'};this.startBattle({kind:'gym',gym:i,name:g.leader+' · '+D.labels[g.type],team:g.team});return {battle:true};}
 case 'league':{if(s.badges.length<8)return {message:'Servono tutte le otto medaglie.'};if(s.league>=5)s.league=0;const teams=[[['Magnezone',63],['Electabuzz',63],['Luxray',64],['Rotom',64]],[['Lucario',64],['Hariyama',64],['Medicham',65],['Machamp',65]],[['Froslass',65],['Mamoswine',65],['Glalie',66],['Elarion',66]],[['Honchkrow',66],['Houndoom',66],['Absol',67],['Vargor',67]],[['Astrelios',68],['Empoleon',68],['Dravurion',69],['Armoryn',69],['Silvorn',70],['Ramgarth',70]]];this.startBattle({kind:'league',round:s.league,name:['Maestro Volter · Elettro','Maestra Dalia · Lotta','Maestro Nival · Ghiaccio','Maestra Umbra · Buio','Campionessa Aurelia'][s.league],team:teams[s.league]});return {battle:true};}
 case 'legend':if(s.flags['caught-'+o.name])return {message:'Il guardiano viaggia già con te.'};this.startBattle({kind:'legend',name:o.name,flag:o.flag,team:[[o.name,o.level]],catchable:true});return {battle:true,message:o.text};
 case 'mythic':if(!s.champion||!s.flags[o.required])return {message:'Il sigillo reagisce alla memoria del santuario. Torna dopo aver trovato la reliquia e conquistato la Lega.'};if(s.flags['caught-'+o.name])return {message:'Il sigillo è quieto. Hai già incontrato il suo custode.'};this.startBattle({kind:'legend',name:o.name,team:[[o.name,o.level]],catchable:true});return {battle:true};
 case 'emperor':if(!s.flags.light||!s.flags.shadow)return {message:'Prima devi essere riconosciuto da entrambi i guardiani.'};this.startBattle({kind:'emperor',name:'Maestra della Corona',team:[['Aquilord',75],['Gastrodon',76],['Armoryn',76],['Flygon',77],['Dravurion',78],['Blanchivus',78]]});return {battle:true};case 'door':case 'exit':if(!this.gate(o.gate))return {message:'Passaggio ancora chiuso.'};this.enter(o.to,o.tx,o.ty);return {travel:true};default:return {message:'Una traccia dell’antico regno.'};}}
 startBattle(context){const s=this.state;let pi=s.party.findIndex(m=>m.hp>0);if(pi<0){this.heal();pi=0;}const enemies=context.team.map(([n,l])=>this.mon(n,l));enemies.forEach(m=>this.seen(m.name));s.party.forEach(m=>m.stages={atk:0,def:0});s.battle={context:clone(context),enemies,pi,ally:context.double?this.mon('Elaris',Math.max(16,s.party[pi].level)):null,turn:0,over:false,log:[context.name+' ti sfida!'],result:null};}










 useItem(item,index=0){const s=this.state,m=s.party[index];if(!m||!(s.bag[item]>0))return {ok:false,message:'Oggetto non disponibile.'};if(['potion','super'].includes(item)){if(m.hp<=0||m.hp>=m.maxHp)return {ok:false,message:'La cura non serve a questo Pokémon.'};m.hp=Math.min(m.maxHp,m.hp+(item==='super'?60:20));}else if(item==='revive'){if(m.hp>0)return {ok:false,message:'Il Pokémon non è esausto.'};m.hp=Math.ceil(m.maxHp/2);m.status=null;}else if(item==='antidote'){if(!m.status)return {ok:false,message:'Nessuna condizione da curare.'};m.status=null;}else if(item==='ether'){if(m.moves.every(n=>m.pp[n]>=D.moves[n].pp))return {ok:false,message:'PP già al massimo.'};m.moves.forEach(n=>m.pp[n]=D.moves[n].pp);}else return {ok:false,message:'Usa le Ball durante un incontro selvatico.'};s.bag[item]--;return {ok:true,message:m.name+': oggetto utilizzato.'};}
 buy(item,qty=1){const prices={ball:150,great:350,ultra:700,potion:100,super:300,revive:500,antidote:150,ether:400};if(!prices[item]||![1,5].includes(qty))return false;let cost=prices[item]*qty;if(this.state.money<cost)return false;this.state.money-=cost;this.state.bag[item]+=qty;return true;}
 deposit(index){const s=this.state;if(s.battle||s.party.length<=1||!s.party[index])return false;s.box.push(s.party.splice(index,1)[0]);return true;}
 withdraw(index){const s=this.state;if(s.battle||s.party.length>=6||!s.box[index])return false;s.party.push(s.box.splice(index,1)[0]);return true;}
 swapBox(index,partyIndex){const s=this.state;if(s.battle||!s.box[index]||!s.party[partyIndex])return false;[s.box[index],s.party[partyIndex]]=[s.party[partyIndex],s.box[index]];return true;}
 lead(index){const s=this.state;if(s.battle||!s.party[index]||s.party[index].hp<=0)return false;[s.party[0],s.party[index]]=[s.party[index],s.party[0]];return true;}
 forge(index,move){const s=this.state,m=s.party[index];if(s.battle||s.materials<2||!m||!D.moves[move]||m.moves.includes(move))return false;s.materials-=2;if(m.moves.length===4)m.moves[3]=move;else m.moves.push(move);m.pp[move]=D.moves[move].pp;return true;}
 travel(id){const s=this.state;if(s.battle||!s.visited.includes(id)||!this.maps[id]||!['town','league'].includes(this.maps[id].kind))return false;if(s.badges.length<4&&id!==s.lastCenter)return false;this.enter(id,13,12);return true;}


}
Game.prototype.buildMaps = buildMaps;
Object.assign(Game.prototype, battleMethods, persistenceMethods);

export { Game, D };
export default Game;