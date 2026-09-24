import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const sharp = require(process.env.SHARP_MODULE || 'sharp')
const source = 'assets/source/mallow-rig-source.png'
const {data,info} = await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true})
for (const [name,region,width] of [
  ['body',[0,0,Math.floor(info.width*.65),info.height],256],
  ['arm',[Math.floor(info.width*.65),0,info.width,Math.floor(info.height*.63)],80],
  ['foot',[Math.floor(info.width*.65),Math.floor(info.height*.63),info.width,info.height],100],
]) {
  let x0=info.width,y0=info.height,x1=0,y1=0
  for(let y=region[1];y<region[3];y++) for(let x=region[0];x<region[2];x++) {
    if(data[(y*info.width+x)*4+3]>100){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  }
  await sharp(source).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize({width}).png().toFile(`public/assets/mallow-${name}.png`)
  console.log(name,{x0,y0,x1,y1})
}
