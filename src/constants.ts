export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540
export const GRAVITY = 1600
export const GROUND_Y = 448
export const GROUND_HEIGHT = 140
export const PLAYER_WIDTH = 32
export const PLAYER_HEIGHT = 44
export const PLAYER_START_X = 128
export const KILL_Y = 700
export const LOOKAHEAD = 1200
export const DESPAWN_MARGIN = 180
export const CRATE_WIDTH = 48
export const CRATE_HEIGHT = 64
export const SPIKE_WIDTH = 44
export const SPIKE_HEIGHT = 36
export const PICKUP_SIZE = 32
export const PLATFORM_HEIGHT = 22
export const FINISH_WIDTH = 48
export const FINISH_HEIGHT = 200

export const SCENE = {
  menu: 'menu',
  game: 'game',
  hud: 'hud',
  complete: 'level-complete',
  over: 'game-over',
} as const
