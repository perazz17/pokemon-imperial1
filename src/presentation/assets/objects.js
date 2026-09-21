import { drawCharacter, paletteFor } from './characters.js';
const px=(ctx,x,y,color,w=1,h=1)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};

function landmark(ctx,o,x,y){
  const theme=o.style;
  if(theme==='abbey'){px(ctx,x+3,y-8,'#d9d2bd',26,40);px(ctx,x+9,y-18,'#8f8a78',14,12);px(ctx,x+13,y-14,'#3f4650',6,10);px(ctx,x+6,y+2,'#6d6470',20,7);px(ctx,x+13,y+8,'#4b4050',6,24);}
  else if(theme==='forge'){px(ctx,x+2,y-7,'#5e6366',28,39);px(ctx,x+7,y-17,'#3f464a',18,12);px(ctx,x+10,y-14,'#d66a48',12,7);px(ctx,x+8,y+2,'#252b2d',16,10);px(ctx,x+12,y+14,'#a97b52',8,18);}
  else if(theme==='stars'){px(ctx,x+3,y-10,'#65758c',26,42);px(ctx,x+9,y-18,'#39485e',14,10);px(ctx,x+12,y-14,'#d8c46a',8,5);px(ctx,x+8,y,'#202c3b',16,12);for(const [dx,dy] of [[7,-5],[21,-2],[14,5]])px(ctx,x+dx,y+dy,'#f3e7a2',2,2);}
  else if(theme==='wind'){px(ctx,x+5,y-5,'#d8e1e1',22,37);px(ctx,x+12,y-15,'#b9c8ca',8,10);px(ctx,x+14,y-22,'#e4ecec',4,9);px(ctx,x+15,y-22,'#6d8790',20,3);px(ctx,x+15,y-22,'#6d8790',3,20);}
  else if(theme==='caldera'){px(ctx,x+3,y-4,'#8a5a43',26,36);px(ctx,x+7,y-13,'#623d35',18,10);px(ctx,x+11,y-10,'#e46e45',10,6);px(ctx,x+9,y+5,'#382d2d',14,10);px(ctx,x+14,y+14,'#d06a43',5,18);}
  else if(theme==='memorial'){px(ctx,x+5,y-8,'#8d8990',22,40);px(ctx,x+10,y-17,'#b6b0b0',12,10);px(ctx,x+13,y-13,'#59606b',6,8);px(ctx,x+8,y+4,'#c9c1b0',16,5);px(ctx,x+12,y+12,'#5c5360',8,20);}
  else if(theme==='dragon'){px(ctx,x+3,y-5,'#71698c',26,37);px(ctx,x+8,y-16,'#50486e',16,12);px(ctx,x+10,y-20,'#a49cc0',5,8);px(ctx,x+17,y-20,'#a49cc0',5,8);px(ctx,x+10,y+3,'#343348',16,12);px(ctx,x+12,y+17,'#8e86ad',12,15);}
  else if(theme==='greenhouse'){px(ctx,x+2,y-5,'#b6d2b8',28,37);px(ctx,x+5,y-13,'#dbe7d0',22,9);for(const [dx,dy] of [[7,3],[14,8],[21,2],[10,17],[19,20]]){px(ctx,x+dx,y+dy,'#4f8b55',5,9);px(ctx,x+dx+1,y+dy-3,'#8fc66e',3,4);}px(ctx,x+12,y+22,'#70533f',8,15);}\n  else if(theme==='rail'){px(ctx,x+3,y+7,'#604936',26,7);px(ctx,x+6,y-4,'#7d8788',18,11);px(ctx,x+9,y-8,'#b56e4f',12,7);px(ctx,x+12,y+14,'#4d3d35',8,17);}\n  else if(theme==='lighthouse'){px(ctx,x+6,y-14,'#d9ded7',20,46);px(ctx,x+10,y-20,'#b7c6c4',12,8);px(ctx,x+11,y-15,'#e9d77b',10,5);px(ctx,x+13,y+4,'#4d6570',6,10);}\n  else if(theme==='stele'){px(ctx,x+8,y-12,'#7d7774',16,45);px(ctx,x+5,y-5,'#aaa39a',22,9);px(ctx,x+12,y+5,'#49464b',8,18);}\n  else if(theme==='altar'){px(ctx,x+4,y+8,'#5b536b',24,12);px(ctx,x+9,y-8,'#756b91',14,17);px(ctx,x+12,y-13,'#b9a9cf',8,6);px(ctx,x+13,y+18,'#41394d',6,12);}
}

export function drawObject(ctx,o,x,y){
  if(o.kind==='legend'||o.kind==='mythic'||o.kind==='emperor'){
    const aura=o.kind==='emperor'?'#d8b85a':o.kind==='legend'?'#8bc5e0':'#a78bd0';
    px(ctx,x+3,y+2,aura,26,3);px(ctx,x+6,y-3,aura,20,3);px(ctx,x+9,y-8,aura,14,3);
    px(ctx,x+11,y-18,'#26333a',10,28);px(ctx,x+8,y-12,aura,16,8);
    px(ctx,x+6,y-7,'#26333a',5,6);px(ctx,x+21,y-7,'#26333a',5,6);
    px(ctx,x+13,y-9,'#f2e7c4',6,4);px(ctx,x+9,y+5,aura,14,8);px(ctx,x+12,y+13,'#26333a',8,10);
    return;
  }
  if(o.kind==='landmark'){landmark(ctx,o,x,y);return;}
  if(['npc','sign','trainer','leader','center','shop','box','league','fountain'].includes(o.kind)){
    if(o.kind==='sign'){px(ctx,x+13,y+5,'#e2c27f',7,10);px(ctx,x+15,y+15,'#6c482e',3,15);return;}
    if(o.kind==='fountain'){px(ctx,x+5,y+9,'#758d9d',22,17);px(ctx,x+10,y+4,'#d6e6e8',12,11);return;}
    drawCharacter(ctx,x,y,paletteFor(o),o.face||'down');return;
  }
  if(o.kind==='item'||o.kind==='relic'){const relic=o.kind==='relic';px(ctx,x+10,y+9,relic?'#9f8bd0':'#f1df8c',13,15);px(ctx,x+12,y+6,relic?'#d8c9ff':'#fff4bd',9,5);px(ctx,x+15,y+2,relic?'#e8ddff':'#fff8d0',3,4);return;}
  if(o.kind==='door'){px(ctx,x+2,y-15,'#8c493f',28,15);px(ctx,x+4,y-18,'#d87555',24,5);px(ctx,x+6,y-10,'#f0d39a',20,10);px(ctx,x+11,y+5,'#503827',10,27);return;}
  if(o.kind==='switch'){px(ctx,x+8,y+9,'#71787b',16,17);px(ctx,x+13,y+3,'#d5b94a',5,12);}
}
