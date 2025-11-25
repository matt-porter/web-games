# WASM Runner

A game where you (a pixellated block) run down a track avoiding obstacles.

Speed will increase along with difficulty throughout the levels.

## Controls

- Left Arrow: Move Left
- Right Arrow: Move Right
- Space: Jump
- Escape: Pause

## How it was built

- HTML/CSS for the game's layout and styling
- Rust for the game's logic and interactivity
- WebAssembly for the compile target for web deployment.

## How to run

- Clone the repository
- Build using `cargo build --target wasm32-unknown-unknown --release`
- Open the `index.html` file in your web browser to play the game
