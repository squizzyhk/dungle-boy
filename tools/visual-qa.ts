// Development-only visual fixture. This entry is not included in production builds.
import Phaser from 'phaser'
import { installAudioQA } from './audio-qa'
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, SCENE, GROUND_Y } from '../src/constants'
import { MenuScene } from '../src/scenes/MenuScene'
import { GameScene } from '../src/scenes/GameScene'
import { HudScene } from '../src/scenes/HudScene'
import { GameOverScene } from '../src/scenes/GameOverScene'
import { LevelCompleteScene } from '../src/scenes/LevelCompleteScene'
import { FinishGate } from '../src/graphics/FinishGate'
import { Player } from '../src/entities/Player'
import { SpaceBackdrop } from '../src/graphics/SpaceBackdrop'
const status = document.querySelector('#status')!
const routes = [[768,1605,2110,2451,3420,4492,4861],[676,1137,1660,2545,3001,3580,4718,5612],[682,1515,2037,2623,3440,4677,5285,5759,6263]]
let level = 0
class RunQA extends GameScene {
  create() {
    super.create()
    const target = this as any
    const route = routes[level]
    let i = 0, since = 999, double = false, clock = 0
    const frames = new Set<string>(); let min = 9, max = 0
    this.events.on(Phaser.Scenes.Events.PRE_UPDATE, (_:number,dt:number)=> {
      const p = target.player
      clock += dt; since += dt
      if (target.state === 'playing') {
        if (i < route.length && p.x >= route[i]) {
          double = route[i] === [3420,3580,3440][level]
          i++; since = 0
        }
        p.space.isDown = since < 330 || (double && since >= 365 && since < 800)
      }
      frames.add(`${p.visual.texture.key}:${p.visual.frame.name}`)
      min = Math.min(min,p.visual.scaleY); max = Math.max(max,p.visual.scaleY)
      status.textContent = `Live route ${level+1}: ${target.state}, x=${p.x.toFixed(0)}, y=${p.y.toFixed(0)}, jumps=${i}/${route.length}\nFrames ${[...frames].join(',')} | vertical scale ${min.toFixed(2)}–${max.toFixed(2)} | ${(clock/1000).toFixed(1)} sec`
    })
  }
}
class Showcase extends Phaser.Scene {
  private player!: Player
  private bg!: SpaceBackdrop
  private motion = false
  constructor() {super('showcase')}
  create(data:{motion?:boolean}) {
    this.motion=!!data.motion
    this.bg=new SpaceBackdrop(this)
    const floor=this.add.tileSprite(0,GROUND_Y,960,140,'ground').setOrigin(0)
    this.physics.add.existing(floor,true)
    this.player=new Player(this,380,GROUND_Y)
    this.physics.add.collider(this.player,floor)
    new FinishGate(this,570,GROUND_Y)
    this.add.text(80,100,this.motion?'RUN / LAUNCH / APEX / FALL / SQUISH':'FINISH BEACON',{fontSize:'22px',color:'#d1fff6'})
  }
  update(t:number,dt:number) {
    this.bg.update(t,0)
    const p=this.player as any
    const phase=t%2600
    p.space.isDown=this.motion && phase>750 && phase<1130
    this.player.tick(dt,this.motion?230:0,1)
    p.body.setVelocityX(0)
    status.textContent=`${this.motion?'Motion':'Finish'} showcase | frame ${p.visual.frame.name} | vertical scale ${p.visual.scaleY.toFixed(3)} | y ${p.y.toFixed(1)}`
  }
}
class StrideQA extends Phaser.Scene {
  private normal!: Phaser.GameObjects.Sprite
  private slow!: Phaser.GameObjects.Sprite
  constructor() { super('stride') }
  create() {
    this.add.text(30,24,'SOFT RUN: short steps / rounded leg ends / body bounce',{fontSize:'22px',color:'#d1fff6'})
    for (let i=0;i<6;i++) {
      const x=80+i*160
      this.add.line(0,0,x-65,245,x+65,245,0x79d9d0).setOrigin(0)
      this.add.sprite(x,245,'mallow-run',i*4).setOrigin(.5,178/192).setScale(1.15)
      this.add.text(x,266,`Frame ${i*4}`,{fontSize:'17px'}).setOrigin(.5)
    }
    this.normal=this.add.sprite(330,476,'mallow-run',0).setOrigin(.5,178/192).setScale(1.4)
    this.slow=this.add.sprite(650,476,'mallow-run',0).setOrigin(.5,178/192).setScale(1.4)
    this.add.text(330,507,'NORMAL SPEED',{fontSize:'16px'}).setOrigin(.5)
    this.add.text(650,507,'QUARTER SPEED',{fontSize:'16px'}).setOrigin(.5)
  }
  update(t:number) {
    this.normal.setFrame(Math.floor(t*.001*1.28*24)%24)
    this.slow.setFrame(Math.floor(t*.001*.32*24)%24)
    status.textContent=`24-frame rig | normal frame ${this.normal.frame.name} | slow frame ${this.slow.frame.name}`
  }
}
const app=new Phaser.Game({type:Phaser.WEBGL,parent:'app',width:GAME_WIDTH,height:GAME_HEIGHT,backgroundColor:'#101934',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:GRAVITY},debug:false}},scene:[MenuScene,RunQA,HudScene,LevelCompleteScene,GameOverScene,Showcase,StrideQA]})
installAudioQA(app)
function stop() {for (const s of app.scene.getScenes(true)) app.scene.stop(s.scene.key)}
document.querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>{level=Number(button.getAttribute('data-level'));stop();app.scene.start(SCENE.game,{levelIndex:level})}))
document.querySelector('#finish')!.addEventListener('click',()=>{stop();app.scene.start('showcase',{})})
document.querySelector('#motion')!.addEventListener('click',()=>{stop();app.scene.start('showcase',{motion:true})})
status.textContent='Ready for live Phaser checks'

document.querySelector('#stride')!.addEventListener('click',()=>{stop();app.scene.start('stride')})
