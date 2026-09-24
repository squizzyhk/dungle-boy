import Phaser from 'phaser'
import { preloadSfx } from '../audio/sfx'
import { preloadMusic, enterMenuMusic, addMusicControl } from '../audio/music'
import { SCENE } from '../constants'
import { levels } from '../data/levels'
import { ensureTextures, preloadArtwork } from '../graphics/textures'
import { MallowMotion } from '../entities/MallowMotion'
import { SpaceBackdrop } from '../graphics/SpaceBackdrop'
import { addButton } from '../ui/button'
import { FONT, INK } from '../ui/theme'

export class MenuScene extends Phaser.Scene {
  private backdrop!: SpaceBackdrop
  private readonly heroMotion = new MallowMotion()
  private hero!: Phaser.GameObjects.Sprite
  constructor() { super(SCENE.menu) }

  preload(): void { preloadArtwork(this); preloadSfx(this); preloadMusic(this) }

  create(): void {
    enterMenuMusic(this)
    addMusicControl(this)
    ensureTextures(this)
    this.backdrop = new SpaceBackdrop(this)
    this.add.rectangle(0,0,520,540,0x111a35,.58).setOrigin(0)
    this.add.text(72,51,'A LITTLE MALLOW. A VERY BIG UNIVERSE.', {
      fontFamily: FONT, fontSize:'12px', color:'#a8f4e9', letterSpacing:2,
    })
    this.add.text(68,83,'Dungle Boy', {
      fontFamily: FONT, fontSize:'58px', fontStyle:'bold', color:INK,
      shadow:{offsetX:0,offsetY:4,color:'#111a35',blur:18,fill:true},
    })
    this.add.text(73,158,'An orbital adventure', {fontFamily:FONT,fontSize:'21px',color:'#e4d4ef'})
    this.add.text(73,198,'SPACE / CLICK / TAP to jump\nJump again in the air. Hold for more height.', {
      fontFamily:FONT,fontSize:'15px',color:'#c4d7e5',lineSpacing:7,
    })
    levels.forEach((level,index) => {
      addButton(this,244,290+index*74,`${String(index+1).padStart(2,'0')}   ${level.name}`,()=>this.scene.start(SCENE.game,{levelIndex:index}))
    })
    this.add.tileSprite(550,431,350,109,'ground').setOrigin(0).setDepth(2)
    this.add.ellipse(715,431,150,20,0x152538,.45).setDepth(3)
    this.hero = this.add.sprite(715,431,'mallow-run',0).setOrigin(.5,178/192).setScale(1.55).setDepth(4)
    this.add.rectangle(715,488,234,34,0x152039,.97).setStrokeStyle(1,0x597689).setDepth(5)
    this.add.text(715,488,'READY TO FLUMP', {
      fontFamily:FONT,fontSize:'12px',color:'#9ff7e8',letterSpacing:3,
    }).setOrigin(.5).setDepth(6)
    this.add.text(73,497,'THREE SECTORS  /  ONE SQUISHY EXPLORER', {
      fontFamily:FONT,fontSize:'11px',color:'#acb4d1',letterSpacing:1,
    })
  }

  update(time: number, delta: number): void {
    this.backdrop.update(time,0)
    const pose = this.heroMotion.update(delta,{grounded:true,velocityY:0,speed:230})
    this.hero.setTexture(pose.texture,pose.frame)
    this.hero.setScale(1.55*pose.scaleX,1.55*pose.scaleY)
    this.hero.y = 431 - pose.lift
  }
}
