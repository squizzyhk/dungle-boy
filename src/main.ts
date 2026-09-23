import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from './constants'
import { GameOverScene } from './scenes/GameOverScene'
import { GameScene } from './scenes/GameScene'
import { HudScene } from './scenes/HudScene'
import { LevelCompleteScene } from './scenes/LevelCompleteScene'
import { MenuScene } from './scenes/MenuScene'

new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#87d6ff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  scene: [MenuScene, GameScene, HudScene, LevelCompleteScene, GameOverScene],
})
