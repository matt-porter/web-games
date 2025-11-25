# Build Plan for WASM Runner

## Phase 1: Project Setup

- Initialize Rust project with cargo new wasm-runner --lib
- Add WebAssembly dependencies (wasm-bindgen, wasm-bindgen-futures)
- Set up Cargo.toml with WASM target configuration
- Create HTML/CSS scaffold with game canvas element
- Configure build pipeline (cargo build --target wasm32-unknown-unknown --release)

## Phase 2: Core Game Logic (Rust)

- Implement game state struct (player position, speed, obstacles, level, score)
- Build player movement system (left/right constraints, jump mechanics)
- Create obstacle generation and collision detection
- Implement difficulty/speed progression system
- Handle pause/resume state management

## Phase 3: Graphics & Rendering (JS/Canvas)

- JavaScript wrapper to call Rust functions via WASM
- Canvas rendering loop to display player, obstacles, and track
- Implement viewport scrolling to simulate downtrack movement
- Render pixelated aesthetics (scale pixels)

## Phase 4: Input Handling & Sound Effects

- JavaScript event listeners for arrow keys, space, escape
- Wire keyboard input to Rust game logic
- Implement debouncing/frame-based input polling
- Web Audio API for retro sound effects (jump, collision, level-up)
- Audio feedback for game events

## Phase 5: Web Deployment

- Bundle compiled WASM with HTML/CSS/JS
- Optimize WASM binary size with wasm-opt
- Set up simple local server or deploy to static host (GitHub Pages, Vercel, etc.)
