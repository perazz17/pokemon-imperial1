import { TILE_SIZE, drawTile } from './assets/tiles.js';import { drawCharacter, characterPalettes } from './assets/characters.js';import { drawObject } from './assets/objects.js';export class OverworldRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;this.frame=0;}
 render(game){
  const s=game.state,map=game.maps[s.map],ctx=this.ctx;
  this.frame++;
  this.canvas.width=map.w*TILE_SIZE;this.canvas.height=map.h*TILE_SIZE;
  map.grid.forEach((row,y)=>row.forEach((kind,x)=>drawTile(ctx,kind,x*TILE_SIZE,y*TILE_SIZE,x,y,{frame:this.frame,theme:map.theme})));
  map.objects.forEach(o=>drawObject(ctx,o,o.x*TILE_SIZE,o.y*TILE_SIZE));
  this.drawMapAtmosphere(ctx,map);this.drawSettlementDetails(ctx,map);
  drawCharacter(ctx,s.x*TILE_SIZE,s.y*TILE_SIZE,characterPalettes.player,s.face,this.frame%2===0);
 }
 drawSettlementDetails(ctx,map){
  if(map.kind!=='town')return;
  const accents={
   home:['#8f6b42','#d7bd7b'],c0:['#58733e','#a7bd72'],c1:['#59636b','#c18a4c'],
   c2:['#4d5878','#c5b77d'],c3:['#5d8794','#dce6d8'],c4:['#774d38','#d48a4d'],
   c5:['#55545f','#9b8994'],c6:['#55456e','#b79cda'],c7:['#4d7548','#c1d47e'],
   port:['#4d7185','#d5bd79'],kingdom:['#6e6847','#d7c77f']
  }[map.id];
  if(!accents)return;
  const [dark,light]=accents;
  const w=this.canvas.width,h=this.canvas.height;
  ctx.save();
  ctx.globalAlpha=.8;
  if(map.id==='c1'||map.id==='c4'){for(let x=3;x<w;x+=64){ctx.fillStyle=dark;ctx.fillRect(x,48,5,20);ctx.fillStyle=light;ctx.fillRect(x+5,51,12,3);}}
  if(map.id==='c2'||map.id==='c5'||map.id==='c6'){for(let x=64;x<w-48;x+=96){ctx.fillStyle=dark;ctx.fillRect(x,36,3,22);ctx.fillStyle=light;ctx.fillRect(x-4,34,11,3);}}
  if(map.id==='c3'||map.id==='port'){for(let x=32;x<w-32;x+=80){ctx.fillStyle=light;ctx.fillRect(x,28,3,26);ctx.fillRect(x-7,28,17,2);ctx.fillStyle=dark;ctx.fillRect(x-3,31,9,2);}}
  if(map.id==='c0'||map.id==='c7'||map.id==='home'){for(let y=96;y<h-48;y+=64){ctx.fillStyle=dark;ctx.fillRect(24,y,20,3);ctx.fillStyle=light;ctx.fillRect(29,y-4,3,11);}}
  if(map.id==='kingdom'){ctx.strokeStyle=dark;ctx.lineWidth=3;ctx.strokeRect(54,54,w-108,h-108);ctx.strokeStyle=light;ctx.lineWidth=2;ctx.strokeRect(62,62,w-124,h-124);}
  ctx.restore();
 }
 drawMapAtmosphere(ctx,map){
  const tint={forest:'rgba(34,72,48,.08)',stone:'rgba(72,82,88,.08)',sky:'rgba(80,130,160,.08)',fire:'rgba(150,75,45,.08)',ghost:'rgba(80,55,100,.10)',dragon:'rgba(90,70,130,.08)',grass:'rgba(90,125,65,.04)'}[map.theme];
  if(tint){ctx.fillStyle=tint;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}
  if(map.kind==='dungeon'||map.kind==='gym'){
   ctx.fillStyle='rgba(15,18,24,.10)';
   ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
   const glow=map.theme==='ghost'||map.theme==='dragon';
   if(glow){ctx.globalAlpha=.14;ctx.fillStyle=map.theme==='ghost'?'#b48ad4':'#9e91dc';for(let i=0;i<7;i++){const x=((i*97+map.id.length*31)%this.canvas.width);const y=((i*53+17)%this.canvas.height);ctx.beginPath();ctx.arc(x,y,18+(i%3)*7,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
  }
 }
}
