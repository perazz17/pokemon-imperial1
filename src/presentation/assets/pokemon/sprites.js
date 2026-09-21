import DATA from '../../../data/imperial-data.js';

const px=(ctx,x,y,c,w=1,h=1)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const shade=(hex,delta)=>{const n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+delta)),g=Math.max(0,Math.min(255,((n>>8)&255)+delta)),b=Math.max(0,Math.min(255,(n&255)+delta));return `rgb(${r},${g},${b})`;};
const hash=name=>[...name].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const typeColor=type=>({Fire:'#d66a48',Water:'#4087bd',Grass:'#5d9b5b',Electric:'#d6b63e',Flying:'#889ed2',Rock:'#9c8660',Ground:'#ac8057',Ghost:'#71558e',Dragon:'#7368a7',Ice:'#70b9bd',Dark:'#5d5362',Psychic:'#c2628d',Bug:'#879d44',Steel:'#7b9699',Poison:'#9a5f9b',Fighting:'#b45345',Normal:'#8b8c7f'}[type]||'#788c87');

export function drawPokemonSprite(ctx,name,{back=false,frame=0}={}){
 const d=DATA.species[name], w=ctx.canvas.width, h=ctx.canvas.height, base=Math.min(w,h), r=hash(name);
 const color=d?.color||typeColor(d?.types?.[0]), dark=shade(color,-48), light=shade(color,45), ink='#18252a';
 const cx=w/2, ground=h*.78, bob=(frame%4<2?0:-Math.max(2,base*.018)), scale=base/260;
 ctx.clearRect(0,0,w,h);
 // Ground shadow
 ctx.globalAlpha=.28;px(ctx,cx-base*.29,ground,ink,base*.58,base*.055);ctx.globalAlpha=1;
 const shape=(d?.shape??r)%4, wide=base*(shape===1?.52:shape===2?.62:.48), bodyY=ground-base*(shape===3?.49:.43)+bob;
 // Body silhouettes vary by species data: round, quadruped, tall or winged.
 if(shape===0){px(ctx,cx-wide/2,bodyY,color,wide,base*.30);px(ctx,cx-wide*.36,bodyY-base*.16,light,wide*.72,base*.20);}
 if(shape===1){px(ctx,cx-wide/2,bodyY,color,wide,base*.38);px(ctx,cx-wide*.34,bodyY-base*.22,light,wide*.68,base*.25);}
 if(shape===2){px(ctx,cx-wide/2,bodyY,color,wide,base*.34);px(ctx,cx-wide*.30,bodyY-base*.30,light,wide*.60,base*.25);}
 if(shape===3){px(ctx,cx-wide/2,bodyY,color,wide,base*.44);px(ctx,cx-wide*.25,bodyY-base*.34,light,wide*.50,base*.28);}
 // Ears / horns / antennae.
 const earH=base*(.10+((r>>>4)%3)*.025), earW=base*.11;
 px(ctx,cx-wide*.38,bodyY-earH,dark,earW,earH);
 px(ctx,cx+wide*.27,bodyY-earH,dark,earW,earH);
 if(d?.types?.includes('Dragon')||d?.types?.includes('Electric')){
   px(ctx,cx-wide*.30,bodyY-earH-base*.07,light,base*.07,base*.10);
   px(ctx,cx+wide*.23,bodyY-earH-base*.07,light,base*.07,base*.10);
 }
 // Wings / fins for flying or water species.
 if(d?.types?.includes('Flying')){
   px(ctx,cx-wide*.72,bodyY+base*.02,dark,base*.25,base*.16);
   px(ctx,cx+wide*.47,bodyY+base*.02,dark,base*.25,base*.16);
 }
 if(d?.types?.includes('Water')){
   px(ctx,cx-wide*.56,bodyY+base*.05,light,base*.16,base*.20);
   px(ctx,cx+wide*.40,bodyY+base*.05,light,base*.16,base*.20);
 }
 // Tail: deterministic direction/shape.
 const tailRight=((r>>>8)&1)===0;
 const tx=cx+(tailRight?wide*.46:-wide*.46), ty=bodyY+base*.18;
 px(ctx,tx-(tailRight?0:base*.13),ty,dark,base*.22,base*.09);
 px(ctx,tx-(tailRight?base*.04:-base*.04),ty-base*.09,color,base*.14,base*.18);
 // Legs / claws.
 const leg=base*.075;
 px(ctx,cx-wide*.30,bodyY+base*.28,dark,leg,base*.14);
 px(ctx,cx+wide*.20,bodyY+base*.28,dark,leg,base*.14);
 // Face / back markings.
 if(!back){
   const eyeY=bodyY+base*.015, eye=base*.052;
   px(ctx,cx-wide*.20,eyeY,ink,eye,eye);
   px(ctx,cx+wide*.12,eyeY,ink,eye,eye);
   px(ctx,cx-base*.035,eyeY+base*.11,dark,base*.07,base*.035);
 }else{
   px(ctx,cx-wide*.22,bodyY+base*.02,dark,wide*.44,base*.055);
   px(ctx,cx-wide*.16,bodyY-base*.18,light,wide*.32,base*.07);
 }
 // Species-specific accent blocks keep otherwise similar silhouettes distinguishable.
 const accents=Math.max(1,Math.min(4,1+(r%4)));
 for(let i=0;i<accents;i++){
   const ax=cx-wide*.32+(i%2)*wide*.43, ay=bodyY+base*.10+Math.floor(i/2)*base*.09;
   px(ctx,ax,ay,light,base*.065,base*.065);
 }
 ctx.imageSmoothingEnabled=false;
}

export { typeColor };
