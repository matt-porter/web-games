# Zombie Survival Escape

A top-down survival shooter built with p5play and p5.js! Fight your way through waves of zombies, collect new weapons, and escape each level.

---

**This game was generated by GitHub Copilot and GPT-4.1.**

---

## How to Play

- **Move:** Arrow keys or WASD
- **Aim:** Move your mouse
- **Shoot:** Left mouse button or Spacebar
- **Pick up weapons:** Walk near a weapon pickup
- **Survive:** Defeat all zombies and reach the escape pod to advance

## Features

- Multiple zombie types, including:
  - **Standard Zombies** (green, label "Z")
  - **Fast Zombies** (orange, label "F") – appear after level 2 and move much faster
  - **Boss Zombies** (dark red, label "BOSS") – appear at the end of each level
- Weapon pickups: Start with a pistol, unlock an SMG in later levels
- Health bars for player and zombies
- Scrolling world and camera
- Escape pod to complete each level
- Score, high score, and level tracking
- Game over and victory screens
- UI legend for zombie types

## Contents

- `favicon.png` - the icon for the web page, which appears on the browser tab
- `index.html` - the webpage that runs your sketch.js code
- `jsconfig.json` - enables auto-complete and hover documentation for p5play in code editors like Visual Studio Code
- `sketch.js` - main game code

## Getting Started

Use the [p5play VSCode](https://marketplace.visualstudio.com/items?itemName=quinton-ashley.p5play-vscode) or [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for Visual Studio Code to run your project.

## Offline Use

For offline use, install [bun](https://bun.sh/) or [npm](https://nodejs.org). Then in the file menu hover over "Terminal" and select "New Terminal". In your p5play project folder run `bun i` or `npm install` to install the q5 and p5play packages.

Note: To participate in p5play game jams your project must use the latest version of p5play. Use `bun up` or `npm update` to update packages to the latest versions.

## Credits

Made with [p5play](https://p5play.org), [p5.js](https://p5js.org), and generated by GitHub Copilot & GPT-4.1.
