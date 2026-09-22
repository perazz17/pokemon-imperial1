const px=(ctx,x,y,color,w=1,h=1)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
export const characterPalettes={player:{hair:'#27384d',skin:'#dca67a',coat:'#d5b749',accent:'#efe5ae'},villager:{hair:'#54382c',skin:'#d9a678',coat:'#4f7193',accent:'#b9d0dc'},trainer:{hair:'#332638',skin:'#d99f72',coat:'#9a4d4d',accent:'#e1a77e'},leader:{hair:'#57313d',skin:'#dca67a',coat:'#7f496f',accent:'#d8b8df'}};
export function paletteFor(object){if(object?.kind==='leader')return characterPalettes.leader;if(object?.kind==='trainer')return characterPalettes.trainer;const variants=[characterPalettes.villager,{hair:'#7c5834',skin:'#bc805a',coat:'#5c8d62',accent:'#d6e4ad'},{hair:'#4c3c52',skin:'#edbd8d',coat:'#7564a8',accent:'#c8c0ee'}];let n=0;for(const c of String(object?.name||''))n+=c.charCodeAt(0);return variants[n%variants.length];}
export function drawCharacter(ctx,x,y,colors,facing='down',walking=false){
 const bob=walking?1:0, shadow=colors.coat==='#d5b749'?'#66522c':'#263847';
 px(ctx,x+6,y+27,shadow,20,4);
 px(ctx,x+9,y+3+bob,colors.hair,14,7);px(ctx,x+7,y+7+bob,colors.hair,18,6);
 px(ctx,x+10,y+11+bob,colors.skin,12,8);
 if(facing==='up'){px(ctx,x+10,y+4+bob,colors.hair,12,9);px(ctx,x+12,y+12+bob,colors.hair,8,3);}
 else {px(ctx,x+12,y+13+bob,'#263847',2,2);px(ctx,x+18,y+13+bob,'#263847',2,2);}
 px(ctx,x+7,y+18+bob,colors.coat,18,10);px(ctx,x+4,y+20+bob,colors.coat,4,8);px(ctx,x+24,y+20+bob,colors.coat,4,8);
 px(ctx,x+9,y+27+bob,'#263847',5,5);px(ctx,x+18,y+27+bob,'#263847',5,5);
 px(ctx,x+10,y+19+bob,colors.accent||'#ddd',12,3);
 if(facing==='left')px(ctx,x+8,y+13+bob,'#263847',2,2);if(facing==='right')px(ctx,x+21,y+13+bob,'#263847',2,2);
}