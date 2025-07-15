new Q5();

let player;
let zombies = [];
let zombieCount = 5;
let playerSpeed = 4;
let zombieSpeed = 1.0; // slower zombies
let playerHealth = 100;
let damageCooldown = 0;
let bullets = [];
let canShoot = true;
let particles = [];
let level = 1;
let score = 0;
let highScore = 0;
let levelInProgress = true;
let nextLevelTimer = 0;
let gameOver = false;
let worldWidth = 2400; // 3x canvas width
let worldHeight = 600;
let arrowTimer = 0;
let zombieSpawnCooldown = 0; // Cooldown for dynamic zombie spawning
let escapePod;
let escapePodFlashTimer = 0;
let weaponPickup;
let playerWeapon = 'pistol';
let weaponFireCooldown = 0;
let weaponFireTimers = { pistol: 18, smg: 6 };
let weaponColors = { pistol: 'yellow', smg: 'cyan' };

// Fast zombie properties
const FAST_ZOMBIE = {
  color: 'orange',
  label: 'F',
  speedMultiplier: 1.8, // 80% faster than normal
  health: 60
};

let backgroundImg;
let roadImg;

function preload() {
  backgroundImg = loadImage('assets/background.png');
  roadImg = loadImage('assets/road.png');
}

function startLevel() {
  textSize(16); // Ensure zombie labels are always the correct size
  zombies = [];
  bullets = [];
  particles = [];
  // Place player near the left edge of the world
  player.x = 60;
  player.y = worldHeight / 2;
  // Incremental zombies per stage as level increases
  let baseInitial = 3, baseMid = 3, baseEnd = 4;
  let inc = Math.floor((level - 1) / 1); // +1 per stage per level
  let initialZ = baseInitial + inc;
  let midZ = baseMid + inc;
  let endZ = baseEnd + inc;
  let maxZombies = initialZ + midZ + endZ;
  window.zombieSpawnPlan = {
    max: maxZombies,
    initial: initialZ,
    mid: midZ,
    end: endZ,
    midSpawned: false,
    endSpawned: false
  };
  let speed = playerSpeed * 0.7 + (level - 1) * 0.15; // Zombies are 70% of player speed, scale with level
  zombieSpeed = speed;
  // Spawn initial zombies (left side)
  for (let i = 0; i < window.zombieSpawnPlan.initial; i++) {
    let zx, zy;
    do {
      zx = random(100, 350);
      zy = random(50, worldHeight - 50);
    } while (dist(zx, zy, player.x, player.y) < 120);
    // 1 in 3 chance for fast zombie after level 2
    let isFast = (level > 2 && random() < 0.33);
    let zombie = new Sprite(zx, zy, 32, 32);
    if (isFast) {
      zombie.color = FAST_ZOMBIE.color;
      zombie.text = FAST_ZOMBIE.label;
      zombie.isFast = true;
      zombie.health = FAST_ZOMBIE.health;
    } else {
      zombie.color = 'green';
      zombie.text = 'Z';
      zombie.health = 100;
    }
    zombie.physics = 'dynamic';
    zombie.rotationLock = true;
    zombies.push(zombie);
  }
  // Create escape pod at far right, centered in the ground area
  if (escapePod) escapePod.remove();
  let bgHeight = Math.floor(worldHeight * 0.4);
  let groundHeight = worldHeight - bgHeight;
  let groundCenterY = bgHeight + groundHeight / 2;
  escapePod = new Sprite(worldWidth - 100, groundCenterY, 120, 80); // Moved 60px left
  escapePod.color = 'purple';
  escapePod.text = 'Escape Pod';
  escapePod.textSize = 24;
  escapePod.rotationLock = true;
  escapePod.collider = 'static';
  levelInProgress = true;
  nextLevelTimer = 0;
  arrowTimer = 120; // Show arrow for 2 seconds (120 frames at 60fps)
  zombieSpawnCooldown = 0;
  escapePodFlashTimer = 0;
  // Remove any previous weapon pickup
  if (weaponPickup) weaponPickup.remove();
  weaponPickup = undefined;
  playerWeapon = (level === 1) ? undefined : playerWeapon;
  // Place pistol pickup at start of level 1
  if (level === 1) {
    weaponPickup = new Sprite(player.x + 60, player.y, 28, 12);
    weaponPickup.color = 'gray';
    weaponPickup.text = 'Pistol';
    weaponPickup.textSize = 14;
    weaponPickup.collider = 'static';
    weaponPickup.layer = 2;
  } else if (level > 1) {
    weaponPickup = new Sprite(worldWidth / 2, worldHeight / 2, 32, 16);
    weaponPickup.color = 'cyan';
    weaponPickup.text = 'SMG';
    weaponPickup.textSize = 14;
    weaponPickup.collider = 'static';
    weaponPickup.layer = 2;
  }
}

function setup() {
  new Canvas(800, 600);
  worldWidth = 2400;
  worldHeight = 600;
  player = new Sprite(width/2, height/2, 32, 32);
  player.color = 'dodgerblue';
  player.text = 'You';
  player.rotationLock = true;
  player.health = 100;
  player.physics = 'kinematic';
  startLevel();
}

function restartGame() {
  level = 1;
  score = 0;
  player.health = 100;
  gameOver = false;
  // Restore player and zombie visibility
  player.visible = true;
  for (let z of zombies) z.visible = true;
  startLevel();
}

function drawBackground() {
  // Draw the background image in the top 40% of the world
  let bgHeight = Math.floor(worldHeight * 0.4);
  if (backgroundImg) {
    image(
      backgroundImg,
      0, 0, // x, y in world coordinates
      worldWidth, bgHeight, // stretch to full width, top 40% height
      0, 0, backgroundImg.width, backgroundImg.height
    );
  }
  // Draw the road image scaled to fit the ground area (bottom 60%)
  if (roadImg) {
    let groundHeight = worldHeight - bgHeight;
    let scale = groundHeight / 550;
    let scaledW = roadImg.width * scale;
    let scaledH = roadImg.height * scale;
    if (roadImg.width > 0 && roadImg.height > 0) {
      let yStart = bgHeight; // Start road just below the background
      for (let x = 0; x < worldWidth; x += scaledW) {
        image(roadImg, x, yStart, scaledW, scaledH);
      }
    }
  }
}

function update() {
  background('skyblue');

  // Camera follows player
  camera.x = constrain(player.x, width/2, worldWidth - width/2);
  camera.y = height/2;

  // Draw scrolling background and world elements
  push();
  translate(-camera.x + width/2, 0);
  drawBackground();

  // Player movement (independent of aim)
  let dx = 0, dy = 0;
  if (kb.pressing('left') || kb.pressing('a')) dx -= 1;
  if (kb.pressing('right') || kb.pressing('d')) dx += 1;
  if (kb.pressing('up') || kb.pressing('w')) dy -= 1;
  if (kb.pressing('down') || kb.pressing('s')) dy += 1;
  if (dx !== 0 || dy !== 0) {
    let mag = Math.sqrt(dx*dx + dy*dy);
    player.vel.x = (dx/mag) * playerSpeed;
    player.vel.y = (dy/mag) * playerSpeed;
  } else {
    player.vel.x = 0;
    player.vel.y = 0;
  }

  // Prevent player from entering the top 40% (background area)
  let minY = Math.floor(worldHeight * 0.4) + player.height / 2;
  player.x = constrain(player.x, player.width/2, worldWidth - player.width/2);
  player.y = constrain(player.y, minY, worldHeight - player.height/2);

  // Zombies follow player
  let touching = false;
  for (let zombie of zombies) {
    // Set color for fast zombies every frame (in case of effects)
    if (zombie.isFast) zombie.color = FAST_ZOMBIE.color;
    else if (!zombie.isBoss) zombie.color = 'green';
    let angle = Math.atan2(player.y - zombie.y, player.x - zombie.x);
    // Use fast speed if fast zombie
    let zSpeed = zombie.isFast ? zombieSpeed * FAST_ZOMBIE.speedMultiplier : zombieSpeed;
    zombie.vel.x = Math.cos(angle) * zSpeed;
    zombie.vel.y = Math.sin(angle) * zSpeed;
    // Prevent zombies from entering the top 40% (background area)
    let zMinY = Math.floor(worldHeight * 0.4) + zombie.height / 2;
    zombie.y = constrain(zombie.y, zMinY, worldHeight - zombie.height/2);
    // Draw zombie health bar (in world coordinates), but not on game over
    if (!gameOver && player.health > 0) {
      let zBarW = zombie.isBoss ? 56 : 28;
      let zBarH = zombie.isBoss ? 10 : 5;
      let zHealthPercent = zombie.health / (zombie.isBoss ? 200 : (zombie.isFast ? FAST_ZOMBIE.health : 100));
      let zBarX = zombie.x - zBarW/2;
      let zBarY = zombie.y - zombie.height/2 - (zombie.isBoss ? 20 : 12);
      stroke('black');
      strokeWeight(1);
      fill('gray');
      rect(zBarX, zBarY, zBarW, zBarH, 2);
      noStroke();
      fill(zHealthPercent > 0.5 ? (zombie.isFast ? 'orange' : 'limegreen') : (zHealthPercent > 0.25 ? 'orange' : 'red'));
      rect(zBarX, zBarY, zBarW * zHealthPercent, zBarH, 2);
    }
    if (zombie.overlapping(player) && player.health > 0) {
      touching = true;
    }
  }
  // Damage player at most 5 times per second
  if (damageCooldown > 0) damageCooldown--;
  if (touching && damageCooldown === 0) {
    player.health = max(0, player.health - 1);
    damageCooldown = Math.round(60 / 5); // 60fps / 5 = 12 frames cooldown
  }

  // Player aim (independent of movement)
  let aimAngle = atan2(mouse.y - player.y, mouse.x - player.x);

  // Shooting
  // Prevent shooting if unarmed
  if (weaponFireCooldown > 0) weaponFireCooldown--;
  if ((mouse.presses() || kb.presses('space')) && weaponFireCooldown === 0 && player.health > 0 && playerWeapon) {
    let bullet = new Sprite(player.x + cos(aimAngle) * 20, player.y + sin(aimAngle) * 20, 8, 4);
    bullet.color = weaponColors[playerWeapon];
    bullet.rotation = degrees(aimAngle);
    bullet.vel.x = cos(aimAngle) * 10;
    bullet.vel.y = sin(aimAngle) * 10;
    bullet.life = 60;
    bullet.layer = 1;
    bullet.collider = 'dynamic';
    bullets.push(bullet);
    weaponFireCooldown = weaponFireTimers[playerWeapon];
  }

  // Bullets update
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    // Remove bullet if off world bounds
    if (bullet.x < 0 || bullet.x > worldWidth || bullet.y < 0 || bullet.y > worldHeight) {
      bullet.remove();
      bullets.splice(i, 1);
      continue;
    }
    // Check collision with zombies
    for (let zombie of zombies) {
      if (bullet.overlapping(zombie) && zombie.health > 0) {
        zombie.health = max(0, zombie.health - 10);
        score += 10; // 10 points per hit
        bullet.remove();
        bullets.splice(i, 1);
        break;
      }
    }
  }

  // Remove dead zombies and spawn effect
  for (let i = zombies.length - 1; i >= 0; i--) {
    if (zombies[i].health <= 0) {
      score += 40; // 40 bonus for kill
      // Particle burst effect
      for (let j = 0; j < 12; j++) {
        let angle = random(TWO_PI);
        let speed = random(2, 5);
        particles.push({
          x: zombies[i].x,
          y: zombies[i].y,
          vx: cos(angle) * speed,
          vy: sin(angle) * speed,
          life: 20,
          color: color(200 + random(55), 0, 0)
        });
      }
      zombies[i].remove();
      zombies.splice(i, 1);
    }
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    fill(p.color);
    noStroke();
    ellipse(p.x, p.y, 8, 8);
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Draw escape pod (in world)
  push();
  translate(-camera.x + width/2, 0);
  if (escapePod) {
    // Draw a glow if player is near and all zombies are dead
    if (dist(player.x, player.y, escapePod.x, escapePod.y) < 60 && zombies.length === 0) {
      for (let i = 0; i < 3; i++) {
        fill(200, 0, 255, 60 - i*15);
        ellipse(escapePod.x, escapePod.y + 10, 80 + i*20, 100 + i*25);
      }
    }
  }
  pop();

  // Escape pod logic
  let playerAtPod = false;
  if (escapePod && player && typeof player.overlapping === 'function') {
    // Use bounding box overlap for reliability
    let pad = 4;
    playerAtPod = (
      player.x + player.width/2 - pad > escapePod.x - escapePod.width/2 + pad &&
      player.x - player.width/2 + pad < escapePod.x + escapePod.width/2 - pad &&
      player.y + player.height/2 - pad > escapePod.y - escapePod.height/2 + pad &&
      player.y - player.height/2 + pad < escapePod.y + escapePod.height/2 - pad
    );
  }
  pop(); // End world/camera transform before UI messages

  // Level complete effect and progression (draw UI messages on fixed layer)
  if (zombies.length === 0 && playerAtPod) {
    textSize(64);
    textAlign(CENTER, CENTER);
    fill('gold');
    stroke('black');
    strokeWeight(6);
    text('Victory!', width/2, height/2);
    noStroke();
    // Particle burst around player (once)
    if (!window.victoryParticles) {
      for (let j = 0; j < 40; j++) {
        let angle = random(TWO_PI);
        let speed = random(3, 7);
        particles.push({
          x: player.x,
          y: player.y,
          vx: cos(angle) * speed,
          vy: sin(angle) * speed,
          life: 40,
          color: color(random(255), random(255), 0)
        });
      }
      window.victoryParticles = true;
      // Level complete bonus only once
      score += 100 * level;
      if (score > highScore) highScore = score;
      nextLevelTimer = 0;
    }
    nextLevelTimer++;
    if (nextLevelTimer > 120) { // 2 seconds
      level++;
      startLevel();
      window.victoryParticles = false;
    }
    // Reset text size for sprites
    textSize(16);
  } else {
    window.victoryParticles = false;
    // Reset text size for sprites
    textSize(16);
    // If player is at pod but zombies remain, flash a message
    if (playerAtPod && zombies.length > 0) {
      escapePodFlashTimer = 300; // 5 second flash
    }
    // Always show the flashing hint if player is at pod and zombies remain
    if (playerAtPod && zombies.length > 0 && escapePodFlashTimer > 0) {
      textAlign(CENTER, CENTER);
      textSize(38);
      let flashAlpha = 180 + 75 * Math.sin(frameCount * 0.3);
      fill(255, 50, 50, flashAlpha);
      stroke('black');
      strokeWeight(4);
      text('Defeat all zombies before escaping!', width/2, height/2 - 120);
      noStroke();
      escapePodFlashTimer--;
    }
    // If player is at pod and all zombies are dead, show normal hint
    else if (zombies.length === 0 && !playerAtPod) {
      textAlign(CENTER, CENTER);
      textSize(36);
      fill('yellow');
      stroke('black');
      strokeWeight(3);
      text('Go to the escape pod to escape!', width/2, height/2 + 100);
      noStroke();
    }
    // If player is not at pod and zombies remain, show defeat all hint if near pod
    else if (escapePod && dist(player.x, player.y, escapePod.x, escapePod.y) < 200 && zombies.length > 0) {
      textAlign(CENTER, CENTER);
      textSize(36);
      fill('yellow');
      stroke('black');
      strokeWeight(3);
      text('Defeat all zombies to escape!', width/2, height/2 + 100);
      noStroke();
    }
  }

  // Draw UI (fixed to screen)
  textSize(20);
  fill('black');
  noStroke();
  textAlign(LEFT, TOP);
  text('Level: ' + level, 20, 50);
  text('Score: ' + score, 20, 75);
  text('High Score: ' + highScore, 20, 100);
  // Fast zombie legend
  textSize(16);
  fill(FAST_ZOMBIE.color);
  text('F = Fast Zombie', 20, 130);
  fill('black');

  // Draw player health bar (fixed to screen)
  let barWidth = 200;
  let barHeight = 20;
  let healthPercent = player.health / 100;
  let barColor = 'limegreen';
  if (player.health <= 25) barColor = 'red';
  else if (player.health <= 50) barColor = 'orange';
  stroke('black');
  strokeWeight(2);
  fill('gray');
  rect(20, 20, barWidth, barHeight, 5);
  noStroke();
  fill(barColor);
  rect(20, 20, barWidth * healthPercent, barHeight, 5);
  fill('black');
  textSize(16);
  textAlign(LEFT, CENTER);
  text('Health: ' + Math.round(player.health), 30, 30);

  // Animated arrow and text at start of level
  if (arrowTimer > 0) {
    let alpha = map(arrowTimer, 0, 120, 0, 255);
    push();
    translate(width/2, height/2);
    // Arrow animation: pulse size
    let scaleArrow = 1 + 0.1 * sin(frameCount * 0.2);
    scale(scaleArrow);
    stroke(255, alpha);
    strokeWeight(6);
    fill(255, 255, 0, alpha);
    beginShape();
    vertex(-40, -40);
    vertex(40, 0);
    vertex(-40, 40);
    vertex(-20, 0);
    endShape(CLOSE);
    pop();
    textAlign(CENTER, TOP);
    textSize(36);
    fill(255, 255, 0, alpha);
    stroke(0, alpha);
    strokeWeight(3);
    text('Escape - this way!', width/2, height/2 + 60);
    noStroke();
    arrowTimer--;
  }

  // Game Over screen (drawn last, overlays everything)
  if (player.health <= 0 || gameOver) {
    // Hide player and zombies
    player.visible = false;
    for (let z of zombies) z.visible = false;
    gameOver = true;
    if (score > highScore) highScore = score;
    textSize(64);
    textAlign(CENTER, CENTER);
    fill('red');
    stroke('black');
    strokeWeight(6);
    text('Game Over', width/2, height/2 - 60);
    fill('white');
    strokeWeight(2);
    textSize(32);
    text('Score: ' + score, width/2, height/2);
    text('High Score: ' + highScore, width/2, height/2 + 50);
    textSize(24);
    fill('yellow');
    text('Press R or Click to Restart', width/2, height/2 + 120);
    noStroke();
    // Restart logic
    if (kb.presses('r') || mouse.presses()) {
      restartGame();
    }
    // Reset text size for sprites
    textSize(16);
    return;
  }

  // Staged zombie spawning as player progresses
  if (levelInProgress) {
    let plan = window.zombieSpawnPlan;
    // Spawn mid zombies at 1/2 map
    if (!plan.midSpawned && player.x > worldWidth / 2 - 200) {
      for (let i = 0; i < plan.mid; i++) {
        let zx = random(worldWidth / 2 - 100, worldWidth / 2 + 200);
        let zy = random(50, worldHeight - 50);
        // 1 in 3 chance for fast zombie after level 2
        let isFast = (level > 2 && random() < 0.33);
        let zombie = new Sprite(zx, zy, 32, 32);
        if (isFast) {
          zombie.color = FAST_ZOMBIE.color;
          zombie.text = FAST_ZOMBIE.label;
          zombie.isFast = true;
          zombie.health = FAST_ZOMBIE.health;
        } else {
          zombie.color = 'green';
          zombie.text = 'Z';
          zombie.health = 100;
        }
        zombie.physics = 'dynamic';
        zombie.rotationLock = true;
        zombies.push(zombie);
      }
      plan.midSpawned = true;
    }
    // Spawn end zombies at 4/5 map
    if (!plan.endSpawned && player.x > worldWidth * 0.8) {
      for (let i = 0; i < plan.end; i++) {
        let zx = random(worldWidth - 300, worldWidth - 60);
        let zy = random(50, worldHeight - 50);
        // 1 in 3 chance for fast zombie after level 2
        let isFast = (level > 2 && random() < 0.33);
        let zombie = new Sprite(zx, zy, 32, 32);
        if (isFast) {
          zombie.color = FAST_ZOMBIE.color;
          zombie.text = FAST_ZOMBIE.label;
          zombie.isFast = true;
          zombie.health = FAST_ZOMBIE.health;
        } else {
          zombie.color = 'green';
          zombie.text = 'Z';
          zombie.health = 100;
        }
        zombie.physics = 'dynamic';
        zombie.rotationLock = true;
        zombies.push(zombie);
      }
      // Add boss zombie for final stage
      let bossX = random(worldWidth - 300, worldWidth - 60);
      let bossY = random(50, worldHeight - 50);
      let boss = new Sprite(bossX, bossY, 45.25, 45.25); // 2x area of 32x32
      boss.color = 'darkred';
      boss.text = 'BOSS';
      boss.textSize = 18;
      boss.physics = 'dynamic';
      boss.rotationLock = true;
      boss.health = 200;
      boss.isBoss = true;
      zombies.push(boss);
      plan.endSpawned = true;
    }
    // Prevent exceeding max zombies
    if (zombies.length > plan.max + 1) { // +1 for boss
      zombies = zombies.slice(0, plan.max + 1);
    }
  }

  // Weapon pickup logic
  if (weaponPickup && dist(player.x, player.y, weaponPickup.x, weaponPickup.y) < 36) {
    if (weaponPickup.text === 'SMG') {
      playerWeapon = 'smg';
    } else if (weaponPickup.text === 'Pistol') {
      playerWeapon = 'pistol';
    }
    weaponPickup.remove();
    weaponPickup = undefined;
  }

  // Draw weapon on player (fix position to be relative to player center and aim, always on top)
  if (playerWeapon) {
    push();
    let playerScreenX = player.x - camera.x + width/2;
    let playerScreenY = player.y - camera.y + height/2;
    translate(playerScreenX, playerScreenY);
    let weaponOffset = 20;
    let drawAngle = typeof aimAngle !== 'undefined' ? aimAngle : 0;
    rotate(drawAngle);
    if (playerWeapon === 'pistol') {
      fill('gray');
      rect(weaponOffset, -4, 16, 8, 2);
    } else if (playerWeapon === 'smg') {
      fill('cyan');
      rect(weaponOffset, -6, 22, 12, 3);
    }
    pop();
  }
}
