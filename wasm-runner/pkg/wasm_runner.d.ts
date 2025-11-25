/* tslint:disable */
/* eslint-disable */
export class GameState {
  free(): void;
  [Symbol.dispose](): void;
  constructor(width: number, height: number);
  move_left(): void;
  move_right(): void;
  jump(): void;
  toggle_pause(): void;
  update(): void;
  get_player_x(): number;
  get_player_y(): number;
  get_score(): number;
  get_level(): number;
  get_speed(): number;
  is_game_over(): boolean;
  is_paused(): boolean;
  get_obstacle_count(): number;
  get_obstacle(index: number): Obstacle | undefined;
  reset(): void;
}
export class Obstacle {
  free(): void;
  [Symbol.dispose](): void;
  constructor(x: number, y: number);
  get_x(): number;
  get_y(): number;
  get_width(): number;
  get_height(): number;
  move_down(distance: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_obstacle_free: (a: number, b: number) => void;
  readonly obstacle_new: (a: number, b: number) => number;
  readonly obstacle_get_x: (a: number) => number;
  readonly obstacle_get_y: (a: number) => number;
  readonly obstacle_get_width: (a: number) => number;
  readonly obstacle_get_height: (a: number) => number;
  readonly obstacle_move_down: (a: number, b: number) => void;
  readonly __wbg_gamestate_free: (a: number, b: number) => void;
  readonly gamestate_new: (a: number, b: number) => number;
  readonly gamestate_move_left: (a: number) => void;
  readonly gamestate_move_right: (a: number) => void;
  readonly gamestate_jump: (a: number) => void;
  readonly gamestate_toggle_pause: (a: number) => void;
  readonly gamestate_update: (a: number) => void;
  readonly gamestate_get_player_x: (a: number) => number;
  readonly gamestate_get_player_y: (a: number) => number;
  readonly gamestate_get_score: (a: number) => number;
  readonly gamestate_get_level: (a: number) => number;
  readonly gamestate_get_speed: (a: number) => number;
  readonly gamestate_is_game_over: (a: number) => number;
  readonly gamestate_is_paused: (a: number) => number;
  readonly gamestate_get_obstacle_count: (a: number) => number;
  readonly gamestate_get_obstacle: (a: number, b: number) => number;
  readonly gamestate_reset: (a: number) => void;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
