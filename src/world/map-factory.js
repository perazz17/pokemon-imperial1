/** V78 map construction extracted from Game. */
import DATA from '../data/imperial-data.js';

const D = DATA;

export function buildMaps() {const maps={};const names=Object.keys(D.species).filter(n=>!D.legends.includes(n));const tiers=[5,16,24,31,38,45,51,55];const evolutionMin={};Object.values(D.species).forEach(d=>{if(d.evo)evolutionMin[d.evo.to]=d.evo.level;});const pools=Array.from({length:8},()=>[]);names.forEach((n,j)=>pools[j%8].push(n));pools[0]=[...new Set(['Bidoof','Starly','Shinx','Erbello','Weedle','Scarab',...pools[0]])];
 const make=(id,name,theme='grass',kind='route',level=5)=>{const m={id,name,theme,kind,level,w:26,h:18,grid:[],objects:[],pool:[],description:''};for(let y=0;y<18;y++){m.grid[y]=[];for(let x=0;x<26;x++){const border=x===0||y===0||x===25||y===17;let t=border?'wall':'grass';if(kind==='route'){if((x*7+y*11)%17<3&&x!==13&&y!==9)t='tree';if(x>=18&&x<=20&&y>1&&y<16)t='water';if(y===9||x===13)t='path';if(y===9&&x>=18&&x<=20)t='bridge';if(x>=3&&x<=10&&y>=4&&y<=7)t='tall';
if(kind==='route'){
 if(theme==='forest'&&x%4===0&&y>2&&y<16&&y!==9)t='tree';
 if(theme==='stone'&&((x+y)%7===0)&&y!==9&&x!==13)t='rock';
 if(theme==='sky'&&y>=3&&y<=5&&x>2&&x<23)t='flower';
 if(theme==='fire'&&x>=3&&x<=7&&y>=11&&y<=15)t='rock';
 if(theme==='ghost'&&((x*5+y*3)%13===0)&&y!==9&&x!==13)t='flower';
 if(theme==='dragon'&&x>=18&&x<=22&&y>=4&&y<=8)t='rock';
 if(theme==='forest'&&((x*11+y*5)%23===0)&&y!==9)t='tall';
 if(theme==='stone'&&((x*9+y*13)%29===0)&&y!==9&&x!==13)t='rock';
 if(theme==='sky'&&((x*5+y*17)%31===0)&&y!==9)t='flower';
 if(theme==='fire'&&((x*13+y*3)%37===0)&&y!==9)t='rock';
 if(theme==='ghost'&&((x*17+y*7)%31===0)&&y!==9)t='flower';
 if(theme==='dragon'&&((x*19+y*11)%41===0)&&y!==9)t='rock';
}}else if(['gym','interior','dungeon','league'].includes(kind)){t=border?'wall':'floor';if(x===13||y===9)t='carpet';if(kind==='dungeon'&&(x*3+y*7)%19<3&&x!==13&&y!==9)t='rock';}else{if(x===13||y===9||y===13)t='path';if((x+y*3)%31===0&&x!==13&&y!==9&&y!==13)t='flower';}m.grid[y][x]=t;}}maps[id]=m;return m;};
 const obj=(m,o)=>{m.objects.push(o);if(o.kind==='door'){for(let dy=-2;dy<=-1;dy++)for(let dx=-2;dx<=2;dx++)if(m.grid[o.y+dy]?.[o.x+dx])m.grid[o.y+dy][o.x+dx]='wall';}if(o.kind!=='decor')m.grid[o.y][o.x]=m.kind==='route'?'path':m.kind==='town'?'path':'floor';return o;};
 const exit=(m,x,y,to,tx=13,ty=14,gate=null)=>obj(m,{kind:'exit',x,y,to,tx,ty,gate,name:'Passaggio'});
 const sign=(m,x,y,name,text)=>obj(m,{kind:'sign',x,y,name,text});
 const trainer=(m,x,y,id,name,team,extra={})=>obj(m,{kind:'trainer',x,y,id,name,team,...extra});
 const home=make('home','Borgofoglia','grass','town');sign(home,9,10,'Professor Vannaccius','Le otto medaglie apriranno la Via Imperiale. Torna nei centri per curare HP e PP. Esplora i santuari laterali: le reliquie raccontano una storia diversa da quella ufficiale.');sign(home,16,13,'Mira, la cartografa','Frecce o WASD per camminare. Spazio o E per interagire. Nell’erba alta trovi incontri. Premi M per la mappa.');exit(home,13,1,'r0');
 for(let i=0;i<8;i++){const g=D.gyms[i],r=make('r'+i,D.routes[i],['grass','forest','stone','sky','fire','ghost','dragon','grass'][i],'route',tiers[i]);r.pool=pools[i].filter(n=>(evolutionMin[n]||1)<=tiers[i]+3);if(!r.pool.length)r.pool=['Bidoof'];exit(r,13,16,i?'c'+(i-1):'home',13,2);exit(r,13,1,'c'+i,13,14,i===1?'event-rival':i===2?'event-tablet':i===3?'event-archive':i===6?'event-crown':null);trainer(r,11,9,'route-'+i,['Ada','Minatore Enzo','Studiosa Livia','Custode Neri','Fabbro Orin','Pellegrina Lea','Cavaliere Ruan','Botanica Iris'][i],[[pools[i][0],tiers[i]],[pools[i][1],tiers[i]+1]]);trainer(r,7,13,'route-side-'+i,['Esploratore Dario','Minatrice Vera','Ricercatore Milo','Navigatrice Nora','Fabbro Timo','Custode Elena','Cavaliere Aldo','Giardiniera Nina'][i],[[pools[i][2],tiers[i]+1],[pools[i][3],tiers[i]+2]],{after:'Hai trovato il sentiero secondario. Le vecchie rotte imperiali nascondono ancora rifornimenti.'});obj(r,{kind:'item',x:6,y:6,id:'route-item-'+i,name:'Scorta da viaggio',item:i>3?'ultra':'potion',qty:3});for(const [sx,sy,sn,st] of [[4,12,'Sentiero laterale','Un vecchio sentiero porta dietro gli alberi. Qui l’Impero lasciava rifornimenti per i viandanti.'],[21,12,'Segnale imperiale','Il simbolo è quasi cancellato, ma indica una vecchia deviazione.']]){obj(r,{kind:'sign',x:sx,y:sy,name:sn,text:st});}obj(r,{kind:'item',x:22,y:4,id:'hidden-route-item-'+i,name:'Scorta nascosta',item:i%3===0?'revive':i%3===1?'great':'ether',qty:1});
 if(i===1)trainer(r,13,3,'event-rival','Impero Ottomano · pattuglia',[['Vargan',16],['Zubat',16]],{double:true,story:'Il tuo rivale Elio si schiera al tuo fianco. Due reclute stanno sottraendo una tavoletta: affrontatele insieme!',after:'Elio: questa tavoletta parla di una guerra senza vincitori. Ci ritroveremo negli archivi di Astravia.'});
 if(i===2)trainer(r,13,3,'event-tablet','Archivista Corvin',[['Murkrow',23],['Ferryn',24]],{story:'Corvin: la tavoletta sottratta sulla prima strada contiene un secondo sigillo. L’Impero vuole distruggerlo prima che venga letto.',after:'Corvin: ho decifrato una parte della tavoletta. Il sigillo conduce agli archivi di Astravia: lì troverai la cronaca autentica della Prima Guerra.'});
 if(i===3)trainer(r,13,3,'event-archive','Capitana Selma',[['Murkrow',29],['Ferryn',30],['Morvik',31]],{story:'Selma: gli archivi devono restare sigillati. Senza una storia comune, nessuno metterà in dubbio la nostra conquista.',after:'L’archivista ti consegna la cronaca autentica: il regno fu diviso per fermare una guerra, non per obbedire a un nuovo imperatore.'});
 if(i===6)trainer(r,13,3,'event-crown','Gran Visir Azhar',[['Houndoom',53],['Armoryn',54],['Vargor',54],['Dravurion',55]],{story:'Azhar vuole imporre la Corona Imperiale a Blanchivus. Il santuario rifiuta il suo ordine. È il momento di fermare l’esercito.',after:'La Corona si spezza e il sigillo si apre. Azhar si ritira: il guardiano ha scelto la libertà. Draconia può finalmente raccontare la verità.'});
 const c=make('c'+i,g.city,r.theme,'town',g.level);c.description=['Un’abbazia fra campi e tessitori.','Rotaie, pietra e officine sotto la montagna.','La città degli archivi e delle stelle.','Torri bianche sulle correnti del mare.','Una fortezza che vive attorno alla caldera.','Le campane custodiscono la memoria del regno.','La promessa dei draghi incisa nella pietra.','Giardini, canali e serre nella valle.'][i];// City-specific street layouts: plazas, canals, workshops and memorial spaces make each settlement read differently.
 const cityLayouts=[
  [[6,10],[7,10],[8,10],[9,10],[10,10],[17,10],[18,10],[19,10]],
  [[6,8],[7,8],[8,8],[9,8],[10,8],[16,8],[17,8],[18,8],[19,8]],
  [[5,11],[6,11],[7,11],[8,11],[9,11],[17,11],[18,11],[19,11],[20,11]],
  [[4,6],[5,6],[6,6],[7,6],[19,6],[20,6],[21,6],[22,6]],
  [[6,12],[7,12],[8,12],[9,12],[17,12],[18,12],[19,12],[20,12]],
  [[5,8],[6,8],[7,8],[8,8],[18,8],[19,8],[20,8],[21,8]],
  [[4,11],[5,11],[6,11],[7,11],[19,11],[20,11],[21,11],[22,11]],
  [[6,6],[7,6],[8,6],[9,6],[17,6],[18,6],[19,6],[20,6]]
 ][i];
 cityLayouts.forEach(([x,y])=>{if(c.grid[y]?.[x]&&c.grid[y][x]!=='wall')c.grid[y][x]='path';});
 const cityLandmarks=[['abbey','Piazza dell’Abbazia'],['rail','Officine Imperiali'],['stars','Osservatorio Astravia'],['lighthouse','Torre del Vento'],['caldera','Forgia della Caldera'],['memorial','Memoriale della Prima Guerra'],['altar','Stele dei Draghi'],['greenhouse','Serre della Valle']];
 obj(c,{kind:'landmark',x:13,y:10,style:cityLandmarks[i][0],name:cityLandmarks[i][1]});
 const citizens=[['Marta','La strada verso la palestra è aperta, ma il capopalestra non regala nulla.'],['Tano','Le officine di questa città lavorano giorno e notte. Dicono che sotto la montagna ci siano ancora vecchie rotaie imperiali.'],['Iris','Gli archivi conservano più versioni della stessa storia. Leggi sempre le cronache fino in fondo.'],['Nerea','Quando il vento cambia, le navi del porto interno cambiano rotta. Qui impari a non fidarti del primo percorso.'],['Bruno','La caldera scalda ancora le forge. Se senti tremare il terreno, non è un buon momento per stare vicino ai tubi.'],['Ada','Ogni nome inciso sul memoriale appartiene a qualcuno che è esistito davvero. La memoria è parte della città.'],['Ruan','I draghi non obbediscono alle corone. Se un giorno incontrerai Blanchivus, ricordalo.'],['Lia','I canali portano acqua ai giardini. Se li sistemi bene, anche la valle fiorisce.']][i];obj(c,{kind:'npc',x:8,y:12,name:citizens[0],text:citizens[1]});obj(c,{kind:'npc',x:19,y:13,name:'Viandante',text:'Le palestre sono solo una parte del viaggio. Cerca anche dungeon, reliquie e sentieri secondari.'});exit(c,13,16,'r'+i,13,2);exit(c,13,1,i===7?'victory':'r'+(i+1),13,14,'badge-'+(i+1));obj(c,{kind:'door',x:13,y:5,to:'g'+i,tx:13,ty:14,name:'Palestra · '+g.leader});sign(c,18,10,'Abitante',c.description+' Il Capopalestra custodisce la Medaglia '+g.badge+'.');exit(c,24,9,'d'+i,2,9);const d=make('d'+i,D.dungeons[i],r.theme,'dungeon',tiers[i]+3);
 const dungeonStyles=['abbey','rail','stars','lighthouse','caldera','memorial','altar','greenhouse'];
 obj(d,{kind:'landmark',x:5,y:5,style:dungeonStyles[i],name:'Segno distintivo · '+D.dungeons[i]});
 const dungeonTypes=[['Grass','Bug'],['Rock','Ground','Steel'],['Psychic','Ghost'],['Flying','Water'],['Fire','Rock'],['Ghost','Dark'],['Dragon','Rock','Fighting'],['Grass','Water']][i];
 const themed=names.filter(n=>D.species[n].types.some(type=>dungeonTypes.includes(type))).filter(n=>(evolutionMin[n]||1)<=tiers[i]+8);
 d.pool=[...new Set([...themed,...pools[i]])].slice(0,12);
 d.encounterRate=.16;
 d.rarePool=themed.filter(n=>(evolutionMin[n]||1)>Math.max(1,tiers[i]-2)).slice(0,4);
 exit(d,1,9,'c'+i,23,9);obj(d,{kind:'relic',x:13,y:3,id:'relic-'+i,name:'Frammento della memoria',text:['Il primo regno nacque da un patto fra città libere.','Il ferro della miniera costruì ponti prima delle armi.','Le cronache furono riscritte dopo la Prima Guerra.','Le isole si separarono, ma le rotte rimasero aperte.','Le forge alimentarono la guerra. Ora possono ricostruire.','Ogni nome ricordato restituisce dignità a chi è caduto.','Blanchivus riconosce la promessa, non il potere della corona.','Il regno vive di ciò che viene coltivato insieme.'][i]});obj(d,{kind:'item',x:21,y:13,id:'material-'+i,name:'Minerale antico',item:'material',qty:2});trainer(d,12,8,'dungeon-'+i,'Custode della memoria',[[pools[i][2],tiers[i]+3]]);
 // Every dungeon now has a small optional vault: three physical sigils must be activated in order.
 const sigils=[[6,8],[13,12],[20,8]];
 sigils.forEach(([x,y],k)=>obj(d,{kind:'dungeonSwitch',x,y,index:k,dungeon:i,name:['Primo sigillo','Secondo sigillo','Terzo sigillo'][k]}));
 obj(d,{kind:'door',x:13,y:6,to:'d'+i+'secret',tx:13,ty:14,gate:'dungeon-secret-'+i,name:'Cripta laterale'});
 const vault=make('d'+i+'secret','Cripta laterale · '+D.dungeons[i],r.theme,'interior',tiers[i]+5);
 exit(vault,13,16,'d'+i,13,7);
 obj(vault,{kind:'relic',x:8,y:7,id:'vault-relic-'+i,name:'Sigillo secondario',text:['Un sigillo agricolo racconta il patto originario tra Borgofoglia e le città del nord.','Un frammento di ferro ricorda le rotte commerciali prima della guerra.','Una stella incisa indica che gli archivi erano aperti a tutti i cittadini.','Un diario di bordo prova che le isole non furono mai davvero isolate.','Una targa della forgia ricorda chi costruì strumenti invece di armi.','Un nome sul muro restituisce identità a una vittima cancellata dalle cronache.','Una promessa incisa nella pietra parla di libertà davanti a Blanchivus.','Un seme antico dimostra che il regno prosperava quando le città collaboravano.'][i]});
 obj(vault,{kind:'item',x:19,y:7,id:'vault-item-'+i,name:'Tesoro della cripta',item:i%2?'great':'ultra',qty:2});
 const gym=make('g'+i,'Palestra di '+g.city,r.theme,'gym',g.level);exit(gym,13,16,'c'+i,13,6);sign(gym,13,12,'Iscrizione','Attiva i tre sigilli in questo ordine: '+g.puzzle.join(' → ')+'. Una scelta errata spegne tutti i sigilli.');[0,1,2].forEach(k=>obj(gym,{kind:'switch',x:[6,13,20][k],y:8,index:[1,2,0][k],gym:i,name:g.puzzle[[1,2,0][k]]}));trainer(gym,8,11,'gym-trainer-'+i,'Apprendista di '+g.leader,[[g.team[0][0],g.level-2]]);obj(gym,{kind:'leader',x:13,y:3,gym:i,name:g.leader});
 }
 for(const m of Object.values(maps).filter(m=>m.kind==='town')){for(const [kind,x] of [['center',5],['shop',21]]){obj(m,{kind:'door',x,y:6,to:m.id+'-'+kind,tx:13,ty:14,name:kind==='center'?'Centro di cura':'Emporio'});const room=make(m.id+'-'+kind,kind==='center'?'Centro di cura · '+m.name:'Emporio · '+m.name,m.theme,'interior');exit(room,13,16,m.id,x,7);obj(room,{kind,x:13,y:5,name:kind==='center'?'Infermiera':'Mercante',home:m.id});if(kind==='center')obj(room,{kind:'box',x:20,y:5,name:'Terminale Box'});} }
 const v=make('victory','Via Imperiale','stone','route',61);v.pool=['Dravurion','Armoryn','Aquilord','Brumagnus','Vargor'];exit(v,13,16,'c7',13,2);exit(v,13,1,'league',13,14,'badges');trainer(v,13,4,'final-rival','Elio · ultima sfida',[['Ramgarth',60],['Veyron',60],['Elarion',60],['Astrelios',61]],{after:'Elio: hai dato un significato nuovo al nostro viaggio. Ci vediamo oltre la Lega.'});
 const l=make('league','Forte della Lega','sky','league',63);exit(l,13,16,'victory',13,2);obj(l,{kind:'league',x:13,y:4,name:'Custode della Lega'});obj(l,{kind:'center',x:6,y:10,name:'Infermiera',home:'league'});obj(l,{kind:'shop',x:20,y:10,name:'Emporio della Lega'});exit(l,24,9,'port',2,9,'champion');
 const port=make('port','Porto Imperiale','sky','town',66);exit(port,1,9,'league',23,9);exit(port,7,2,'lightIsland',13,14,'champion');exit(port,19,2,'shadowIsland',13,14,'light');exit(port,24,9,'kingdom',2,9,'both');sign(port,7,5,'Rotta occidentale','Isola delle Reliquie → Santuario della Luce');sign(port,19,5,'Rotta orientale','Isola dell’Ombra → Cripta di Noctivar');obj(port,{kind:'center',x:13,y:12,name:'Medico del porto',home:'port'});
 for(const [id,name,theme,boss,flag,lv] of [['light','Isola delle Reliquie','sky','Blanchivus','light',70],['shadow','Isola dell’Ombra','ghost','Noctivar','shadow',73]]){let a=make(id+'Island',name,theme,'route',lv-4);a.pool=id==='light'?['Terram','Ignivar','Elaris','Astrion','Dravurion']:['Noctelia','Morvik','Vargor','Armoryn'];exit(a,13,16,'port',id==='light'?7:19,3);exit(a,13,1,id+'Shrine');let sh=make(id+'Shrine',id==='light'?'Santuario della Luce':'Cripta di Noctivar',theme,'dungeon',lv);sh.pool=[];exit(sh,13,16,id+'Island',13,2);obj(sh,{kind:'legend',x:13,y:4,name:boss,flag,level:lv,text:id==='light'?'Blanchivus riconosce la Corona spezzata. Il patto vale più del dominio. Il guardiano vuole metterti alla prova.':'Noctivar custodisce il dolore cancellato dalle cronache. Affrontalo senza cancellare la sua memoria.'});}
 let k=make('kingdom','Regno Imperiale','grass','town',75);exit(k,1,9,'port',23,9);exit(k,13,1,'palace');sign(k,9,10,'Consigliera','Il regno si è riunito per scelta. La prova del Palazzo deciderà chi saprà custodire questo patto.');obj(k,{kind:'center',x:18,y:10,name:'Guaritore di corte',home:'kingdom'});let pal=make('palace','Palazzo Imperiale','dragon','gym',78);exit(pal,13,16,'kingdom',13,2);obj(pal,{kind:'emperor',x:13,y:4,name:'Maestra della Corona'});
 ['Lumeris','Marelune','Sylvaris','Aurex','Noctelia'].forEach((n,i)=>obj(maps['d'+i],{kind:'mythic',x:20,y:4,name:n,id:'mythic-'+n,level:68+i,required:'relic-'+i}));
 for(let i=0;i<8;i++){
 const m=maps['g'+i],labels=[['Radice','Foglia','Fiore'],['Indietro','Avanti','Gru carico/scarico'],['Disco I','Disco II','Disco III'],['Finestra I','Finestra II','Finestra III'],['Raffredda','Riscalda','Ponte'],['Lanterna I','Lanterna II','Lanterna III'],['Origine','Guerra','Promessa'],['Canale I','Canale II','Semina']][i];
 m.objects.filter(o=>o.kind==='switch').forEach(o=>{o.name=labels[o.index];if(i!==0&&i!==6)o.x=[6,13,20][o.index];});
 for(let x=1;x<25;x++)if(x!==13)m.grid[5][x]='wall';
 // Each gym gets a distinct physical puzzle layout while preserving a playable central route.
 const layouts=[
  [[4,7],[4,8],[4,9],[22,7],[22,8],[22,9],[9,11],[17,11]],
  [[5,7],[5,8],[21,7],[21,8],[9,12],[17,12],[9,7],[17,7]],
  [[4,7],[4,8],[4,9],[22,7],[22,8],[22,9],[8,12],[18,12]],
  [[6,7],[6,8],[20,7],[20,8],[9,11],[17,11],[9,13],[17,13]],
  [[4,7],[4,8],[22,7],[22,8],[7,12],[19,12],[7,13],[19,13]],
  [[5,7],[5,8],[21,7],[21,8],[9,11],[17,11],[9,13],[17,13]],
  [[4,7],[4,8],[22,7],[22,8],[8,12],[18,12],[8,13],[18,13]],
  [[5,7],[5,8],[21,7],[21,8],[9,12],[17,12],[9,13],[17,13]]
 ][i];
 layouts.forEach(([x,y])=>{if(!((x===6||x===13||x===20)&&y===8)&&!(x===13&&y===3))m.grid[y][x]='rock';});
 for(let x=2;x<24;x++)if(x!==6&&x!==13&&x!==20)m.grid[10][x]='floor';
 const sign=m.objects.find(o=>o.kind==='sign');sign.text=[
 'Tre tele chiudono la torre. Recidile seguendo il ciclo: Radice → Foglia → Fiore.',
 'La gru carica minerale alla stazione 1. Usa le leve per portare il carrello alla 4, quindi scarica: il peso aprirà il portale.',
 'Ruota i dischi astrali fino a ottenere 1 · 3 · 2. Ogni tocco avanza di un quarto di giro.',
 'Le correnti si bilanciano aprendo le finestre esterne e chiudendo quella centrale.',
 'La passerella resiste solo a calore 5. Usa raffreddamento e fuoco, poi aziona il ponte.',
 'Le lapidi rivelano la sequenza: Luce → Ombra → Luce. Accendi e spegni le tre lanterne.',
 'Ricomponi la storia: prima l’Origine del regno, poi la Guerra, infine la Promessa del guardiano.',
 'I canali hanno tre posizioni. Regola il primo a 2 e il secondo a 1, poi semina tre volte per far crescere tutte le aiuole.'
 ][i];
 }
 // Optional side paths turn each route and dungeon into a small exploration space instead of a single corridor.
 for(let i=0;i<8;i++){
  const m=maps['r'+i];
  // Each route gets a different side-corridor shape so exploration is not just a straight line between cities.
  const corridors=[
   [[7,9],[7,8],[7,7],[7,6],[8,6],[9,6]],
   [[16,9],[16,10],[16,11],[17,11],[18,11],[19,11]],
   [[7,9],[7,10],[7,11],[8,11],[9,11],[10,11]],
   [[19,9],[19,8],[19,7],[18,7],[17,7],[16,7]],
   [[7,9],[7,8],[8,8],[9,8],[9,7],[10,7]],
   [[16,9],[16,10],[17,10],[18,10],[18,11],[19,11]],
   [[7,9],[7,8],[7,7],[8,7],[9,7],[9,6]],
   [[19,9],[19,10],[18,10],[17,10],[17,11],[16,11]]
  ][i];
  corridors.forEach(([x,y])=>m.grid[y][x]='path');
  for(let x=7;x<=13;x++)m.grid[9][x]='path';
  for(let y=5;y<=9;y++)m.grid[y][7]='path';
  for(let y=9;y<=14;y++)m.grid[y][16]='path';
  obj(m,{kind:'item',x:7,y:4,id:'hidden-route-'+i+'-west',name:'Tesoro nascosto',item:i%2?'super':'potion',qty:i%2?2:3});
  obj(m,{kind:'item',x:16,y:14,id:'hidden-route-'+i+'-east',name:'Borsa del viandante',item:i>4?'ultra':'super',qty:2});
 }
 for(let i=0;i<8;i++){
  const m=maps['d'+i];
  for(let x=7;x<=13;x++)m.grid[9][x]='floor';
  for(let y=5;y<=9;y++)m.grid[y][7]='floor';
  for(let y=9;y<=13;y++)m.grid[y][19]='floor';
  obj(m,{kind:'item',x:7,y:4,id:'hidden-dungeon-'+i+'-west',name:'Cassa dimenticata',item:'ultra',qty:1});
  obj(m,{kind:'item',x:19,y:13,id:'hidden-dungeon-'+i+'-east',name:'Reliquia secondaria',item:'material',qty:3});
  // Every dungeon gets a compact optional vault: three physical sigils, a gated door and a themed reward room.
  const vaultY=[6,7,6,7,6,7,6,7][i];
  const sigilXs=[6,13,20];
  sigilXs.forEach((x,index)=>obj(m,{kind:'dungeonSwitch',x,y:vaultY,index,dungeon:i,name:'Sigillo '+(index+1)}));
  obj(m,{kind:'door',x:13,y:4,to:'d'+i+'secret',tx:13,ty:14,gate:'dungeon-secret-'+i,name:'Cripta segreta'});
  const vault=make('d'+i+'secret','Tesoro · '+D.dungeons[i],m.theme,'interior',m.level);
  exit(vault,13,16,'d'+i,13,3);
  const rewards=['ultra','super','revive','ether','great','ultra','revive','super'];
  obj(vault,{kind:'item',x:13,y:8,id:'dungeon-vault-reward-'+i,name:'Tesoro della cripta',item:rewards[i],qty:i%3===0?2:1});
  obj(vault,{kind:'npc',x:13,y:5,name:'Custode della cripta',text:'I tre sigilli custodiscono ciò che l’Impero non riuscì a confiscare. Hai trovato una traccia che non appare nelle cronache ufficiali.'});
  // The room itself is visibly different for each dungeon, using the existing pixel-art tile vocabulary.
  const vaultPatterns=[
    [[8,4],[9,4],[10,4],[15,4],[16,4],[17,4]],
    [[5,6],[6,6],[7,6],[18,6],[19,6],[20,6]],
    [[8,5],[10,5],[12,5],[14,5],[16,5],[18,5]],
    [[4,8],[5,8],[20,8],[21,8],[4,10],[21,10]],
    [[8,6],[9,6],[16,6],[17,6],[8,11],[17,11]],
    [[6,5],[7,5],[19,5],[20,5],[6,11],[20,11]],
    [[9,5],[10,5],[16,5],[17,5],[9,11],[17,11]],
    [[5,5],[6,5],[19,5],[20,5],[11,11],[15,11]]
  ][i];
  vaultPatterns.forEach(([x,y])=>{if(vault.grid[y]?.[x])vault.grid[y][x]='carpet';});
 }
 // Add city-specific interactive set dressing and architecture.
 const cityDetails={
  c0:[['tree',4,4],['tree',5,4],['flower',8,3],['fountain',10,7]],
  c1:[['rock',4,4],['rock',5,4],['rock',22,4],['item',7,3]],
  c2:[['flower',4,4],['flower',5,4],['rock',21,3],['item',22,6]],
  c3:[['water',4,4],['water',5,4],['flower',21,4],['item',22,12]],
  c4:[['rock',4,4],['rock',5,4],['rock',22,4],['item',8,3]],
  c5:[['flower',4,4],['flower',5,4],['tree',22,4],['item',22,12]],
  c6:[['rock',4,4],['rock',5,4],['flower',21,4],['item',8,3]],
  c7:[['crop',4,4],['crop',5,4],['crop',6,4],['crop',21,4]]
 };
 for(const [id,parts] of Object.entries(cityDetails)){
  const m=maps[id];
  parts.forEach(([kind,x,y],j)=>{
   if(kind==='item')obj(m,{kind:'item',x,y,id:'city-secret-'+id+'-'+j,name:'Scorta cittadina',item:'super',qty:2});
   else if(m.grid[y]?.[x]&&!m.objects.some(o=>o.x===x&&o.y===y))m.grid[y][x]=kind;
  });
 }
 // Public gardens, fountains and inhabited archives give each settlement a readable layout.
 for(const m of Object.values(maps).filter(m=>m.kind==='town')){
  for(const o of m.objects)if(o.kind==='sign'&&!o.name.startsWith('Rotta'))o.kind='npc';
  obj(m,{kind:'fountain',x:10,y:7,name:'Fontana del patto'});
  for(const [x,y] of [[2,2],[3,2],[22,2],[23,2],[2,14],[3,14],[22,15],[23,15]])if(m.grid[y][x]==='grass')m.grid[y][x]='tree';
  for(let y=10;y<=14;y++)for(let x=3;x<=7;x++)if(!m.objects.some(o=>o.x===x&&o.y===y))m.grid[y][x]=m.theme==='grass'?'crop':'flower';
  const landmarkStyles={home:'abbey',c0:'abbey',c1:'forge',c2:'stars',c3:'wind',c4:'caldera',c5:'memorial',c6:'dragon',c7:'greenhouse'};
  const routeLandmarks={r0:['abbey','Antico cippo di Borgofoglia'],r1:['forge','Vecchia rotaia imperiale'],r2:['stars','Osservatorio crollato'],r3:['wind','Faro delle correnti'],r4:['caldera','Pietra della caldera'],r5:['memorial','Stele dei caduti'],r6:['dragon','Altare del Guardiano'],r7:['greenhouse','Serra di confine']};
  if(routeLandmarks[m.id]){
   const [style,name]=routeLandmarks[m.id];
   obj(m,{kind:'landmark',x:5,y:5,style,name});
  }
  if(landmarkStyles[m.id]){
   const style=landmarkStyles[m.id];
   const names={home:'Abbazia di Borgofoglia',c0:'Abbazia delle Radici',c1:'Grande Forgia',c2:'Torre Astrale',c3:'Torre dei Venti',c4:'Forgia della Caldera',c5:'Memoriale della Memoria',c6:'Statua del Guardiano',c7:'Serra Imperiale'};
   obj(m,{kind:'landmark',x:16,y:5,style,name:names[m.id]});
  }
  if(m.id==='home'||/^c[0-7]$/.test(m.id)){
   const rid=m.id+'-archive';obj(m,{kind:'door',x:20,y:13,to:rid,tx:13,ty:14,name:m.id==='home'?'Laboratorio':'Archivio cittadino'});
   const archive=make(rid,m.id==='home'?'Laboratorio di Vannaccius':'Archivio · '+m.name,m.theme,'interior');exit(archive,13,16,m.id,20,14);
   obj(archive,{kind:'npc',x:13,y:5,name:m.id==='home'?'Professor Vannaccius':'Archivista',text:m.id==='home'?'Le creature crescono con l’esperienza condivisa. Se una sfida è difficile, cambia la composizione della squadra o esplora un santuario.':'Le cronache appartengono a tutti. Cerca il frammento della memoria nel santuario a est della città. Dopo la Lega i primi cinque santuari rivelano i loro custodi.'});
  }
 }
 return maps;}