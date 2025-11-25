/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const __wbg_obstacle_free: (a: number, b: number) => void;
export const obstacle_new: (a: number, b: number) => number;
export const obstacle_get_x: (a: number) => number;
export const obstacle_get_y: (a: number) => number;
export const obstacle_get_width: (a: number) => number;
export const obstacle_get_height: (a: number) => number;
export const obstacle_move_down: (a: number, b: number) => void;
export const __wbg_gamestate_free: (a: number, b: number) => void;
export const gamestate_new: (a: number, b: number) => number;
export const gamestate_move_left: (a: number) => void;
export const gamestate_move_right: (a: number) => void;
export const gamestate_jump: (a: number) => void;
export const gamestate_toggle_pause: (a: number) => void;
export const gamestate_update: (a: number) => void;
export const gamestate_get_player_x: (a: number) => number;
export const gamestate_get_player_y: (a: number) => number;
export const gamestate_get_score: (a: number) => number;
export const gamestate_get_level: (a: number) => number;
export const gamestate_get_speed: (a: number) => number;
export const gamestate_is_game_over: (a: number) => number;
export const gamestate_is_paused: (a: number) => number;
export const gamestate_get_obstacle_count: (a: number) => number;
export const gamestate_get_obstacle: (a: number, b: number) => number;
export const gamestate_reset: (a: number) => void;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_start: () => void;
