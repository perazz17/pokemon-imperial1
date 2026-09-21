import { TILE_SIZE, drawTile } from './assets/tiles.js';import { drawCharacter, characterPalettes } from './assets/characters.js';import { drawObject } from './assets/objects.js';export class OverworldRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;this.frame=0;}
 render(game){
  const s=game.state,map=game.maps[s.map],ctx=this.ctx;
  this.frame++;
  this.canvas.width=map.w*TILE_SIZE;this.canvas.height=map.h*TILE_SIZE;
  map.grid.forEach((row,y)=>row.forEach((kind,x)=>drawTile(ctx,kind,x*TILE_SIZE,y*TILE_SIZE,x,y,{frame:this.frame,theme:map.theme})));
  map.objects.forEach(o=>drawObject(ctx,o,o.x*TILE_SIZE,o.y*TILE_SIZE));
  this.drawMapAtmosphere(ctx,map);
  drawCharacter(ctx,s.x*TILE_SIZE,s.y*TILE_SIZE,characterPalettes.player,s.face,this.frame%2===0);
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
