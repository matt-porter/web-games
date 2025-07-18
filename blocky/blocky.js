import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

let scene, camera, renderer, light;
let player = null;
let wall = [];
let ball; // Ball will be created later
let playerModel = null; // Store loaded player model
let keys = {};
let score = 0;
let ballVel = { x: 0, y: 0, z: 0 };
let ballLaunched = false;
let gameOver = false;
let win = false;

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222233);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 30);
  camera.lookAt(0, 5, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x888888));

  // Ground (sloped)
  let groundGeo = new THREE.BoxGeometry(30, 1, 30);
  let groundMat = new THREE.MeshPhongMaterial({color: 0x444444});
  let ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.5;
//   remove slope
//   ground.rotation.x = -Math.PI / 24; // ~7.5 degrees slope toward player
  scene.add(ground);

  // Wall of bricks
  let brickRows = 4, brickCols = 8;
  let brickW = 2, brickH = 1, brickD = 1;
  let wallY = 2, wallZ = -10;
  for (let row = 0; row < brickRows; row++) {
    for (let col = 0; col < brickCols; col++) {
      let brickGeo = new THREE.BoxGeometry(brickW, brickH, brickD);
      let brickMat = new THREE.MeshPhongMaterial({color: 0xff4444});
      let brick = new THREE.Mesh(brickGeo, brickMat);
      brick.position.set((col - brickCols/2) * (brickW + 0.2), wallY + row * (brickH + 0.2), wallZ);
      brick.userData = { hits: 0 };
      scene.add(brick);
      wall.push(brick);
    }
  }

  // Ball (football)
  let ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
  let ballMat = new THREE.MeshPhongMaterial({color: 0xffff44});
  ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(0, 1, 8); // Default position until player is loaded
  scene.add(ball);

  // GLTFLoader for player model
    loader.load('assets/blocky.gltf', function(gltf) {
        playerModel = gltf.scene;
        playerModel.position.set(0, 1, 10);
        playerModel.scale.set(3.6, 3.6, 3.6); // 3x bigger
        scene.add(playerModel);
        player = playerModel;
        // Now that player is loaded, update ball position
        ball.position.x = player.position.x;
        ball.position.z = player.position.z - 2;
        ball.position.y = 1;
    }, undefined, function(error) {
        console.error('Error loading blocky.gltf:', error);
    });
  
  
  // Keyboard controls
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    // Space to launch ball or kick if near player
    if (e.key === ' ') {
      let distZ = Math.abs(ball.position.z - player.position.z);
      let distX = Math.abs(ball.position.x - player.position.x);
      if (!ballLaunched) {
        ballVel.x = (player.position.x - ball.position.x) * 0.2;
        ballVel.z = -0.7;
        ballVel.y = 0.1;
        ballLaunched = true;
      } else if (distZ < 4 && distX < 4) {
        // Kick: boost ball away from player
        let kickPower = 0.7;
        let dx = ball.position.x - player.position.x;
        let dz = ball.position.z - player.position.z;
        let mag = Math.sqrt(dx*dx + dz*dz) || 1;
        ballVel.x += (dx / mag) * kickPower + (Math.random() - 0.5) * 0.1;
        ballVel.z += (dz / mag) * kickPower;
        ballVel.y = 0.4; // Higher kick for upper bricks
      }
    }
  });
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  window.addEventListener('resize', onWindowResize);

  // Invisible back wall (positive Z)
  let backWallGeo = new THREE.BoxGeometry(30, 10, 1);
  let backWallMat = new THREE.MeshPhongMaterial({color: 0x222233, transparent: true, opacity: 0});
  let backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(0, 5, 18.5); // Just behind player area
  scene.add(backWall);
}

function animate() {
  if (gameOver || win) {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    return;
  }

  // Player movement
  if (player === null) {   
    return requestAnimationFrame(animate);
    }
  let speed = 0.3;
  if (keys['a'] || keys['arrowleft']) player.position.x -= speed;
  if (keys['d'] || keys['arrowright']) player.position.x += speed;
  if (keys['w'] || keys['arrowup']) player.position.z -= speed;
  if (keys['s'] || keys['arrowdown']) player.position.z += speed;
  // Clamp player position
  player.position.x = Math.max(-12, Math.min(12, player.position.x));
  player.position.z = Math.max(5, Math.min(17, player.position.z)); // Allow player to move further forward

  // Ball physics
  if (ballLaunched) {
    ball.position.x += ballVel.x;
    ball.position.y += ballVel.y;
    ball.position.z += ballVel.z;
    // Gravity
    ballVel.y -= 0.02;
    // Ball speed limit
    let maxSpeed = 1.5;
    ballVel.x = Math.max(-maxSpeed, Math.min(maxSpeed, ballVel.x));
    ballVel.y = Math.max(-maxSpeed, Math.min(maxSpeed, ballVel.y));
    ballVel.z = Math.max(-maxSpeed, Math.min(maxSpeed, ballVel.z));
    // Bounce on ground
    if (ball.position.y < 1) {
      ball.position.y = 1;
      ballVel.y *= -0.7; // Slightly less damping for more bounce
      ballVel.x *= 0.98; // Less damping
      ballVel.z *= 0.98; // Less damping
      if (Math.abs(ballVel.y) < 0.05) ballVel.y = 0;
      // Slope effect: accelerate ball toward player (positive Z)
      ballVel.z += 0.03; // Slope strength, tweak for gameplay
    }
    // Wall boundaries
    if (ball.position.x < -14 || ball.position.x > 14) ballVel.x *= -1;
    if (ball.position.z < -12) ballVel.z *= -1;
    // Bounce off invisible back wall
    if (ball.position.z > 18) {
      ball.position.z = 18;
      ballVel.z *= -0.9; // Slight damping for bounce
    }
    // Improved player collision with variable bounce
    if (intersect(ball, player)) {
      // Calculate overlap and push ball out
      let pBox = new THREE.Box3().setFromObject(player);
      let bBox = new THREE.Box3().setFromObject(ball);
      let overlapZ = pBox.max.z - bBox.min.z;
      if (overlapZ > 0 && ballVel.z > 0) {
        // --- Variable bounce: reflect velocity over normal ---
        let normal = new THREE.Vector3(
          ball.position.x - player.position.x,
          0,
          ball.position.z - player.position.z
        ).normalize();
        let ballVelVec = new THREE.Vector3(ballVel.x, 0, ballVel.z);
        let reflected = ballVelVec.clone().sub(normal.clone().multiplyScalar(2 * ballVelVec.dot(normal)));
        // Add some of player's movement to ball for realism
        let playerVelX = (keys['d'] || keys['arrowright'] ? 0.3 : 0) - (keys['a'] || keys['arrowleft'] ? 0.3 : 0);
        let playerVelZ = (keys['s'] || keys['arrowdown'] ? 0.3 : 0) - (keys['w'] || keys['arrowup'] ? 0.3 : 0);
        reflected.x += playerVelX * 0.5;
        reflected.z += playerVelZ * 0.5;
        // Damping for energy loss
        reflected.multiplyScalar(0.92);
        ballVel.x = reflected.x;
        ballVel.z = reflected.z;
        ballVel.y = 0.22; // Consistent upward bounce
        // Push ball out of player
        ball.position.z = pBox.min.z - (bBox.max.z - bBox.min.z) / 2 - 0.01;
      }
      // Side collision (variable bounce)
      let overlapX = Math.min(pBox.max.x, bBox.max.x) - Math.max(pBox.min.x, bBox.min.x);
      if (overlapX > 0 && Math.abs(ballVel.x) > 0) {
        let normalX = ball.position.x < player.position.x ? -1 : 1;
        ballVel.x = -ballVel.x * 0.9 + normalX * 0.1;
        if (ball.position.x < player.position.x) {
          ball.position.x = pBox.min.x - (bBox.max.x - bBox.min.x) / 2 - 0.01;
        } else {
          ball.position.x = pBox.max.x + (bBox.max.x - bBox.min.x) / 2 + 0.01;
        }
      }
    }
    // Improved brick collision with variable bounce
    for (let i = wall.length - 1; i >= 0; i--) {
      let brick = wall[i];
      if (intersect(ball, brick)) {
        // --- Variable bounce: reflect velocity over normal ---
        let normal = new THREE.Vector3(
          ball.position.x - brick.position.x,
          ball.position.y - brick.position.y,
          ball.position.z - brick.position.z
        ).normalize();
        let ballVelVec = new THREE.Vector3(ballVel.x, ballVel.y, ballVel.z);
        let reflected = ballVelVec.clone().sub(normal.clone().multiplyScalar(2 * ballVelVec.dot(normal)));
        // Damping and slight randomization for variety
        reflected.multiplyScalar(0.85 + Math.random() * 0.1);
        ballVel.x = reflected.x;
        ballVel.y = reflected.y;
        ballVel.z = reflected.z;
        brick.userData.hits++;
        if (brick.userData.hits >= 3) {
          scene.remove(brick);
          wall.splice(i, 1);
          score += 10;
          document.getElementById('score').textContent = 'Score: ' + score;
        }
        break;
      }
    }
    // Win condition
    if (wall.length === 0) {
      win = true;
      showMessage('You Win! Press R to restart.');
    }
    // Remove loss condition for ball behind player
  } else {
    // Keep ball in front of player until launch
    ball.position.x = player.position.x;
    ball.position.z = player.position.z - 2;
    ball.position.y = 1;
  }

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function showMessage(msg) {
  let div = document.getElementById('message');
  if (!div) {
    div = document.createElement('div');
    div.id = 'message';
    div.style.position = 'absolute';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.color = '#fff';
    div.style.fontSize = '2em';
    div.style.background = 'rgba(0,0,0,0.7)';
    div.style.padding = '1em 2em';
    div.style.borderRadius = '12px';
    div.style.zIndex = 20;
    document.body.appendChild(div);
  }
  div.textContent = msg;
}

window.addEventListener('keydown', e => {
  if ((gameOver || win) && e.key.toLowerCase() === 'r') {
    location.reload();
  }
});

function intersect(a, b) {
  // Simple AABB collision
  let aBox = new THREE.Box3().setFromObject(a);
  let bBox = new THREE.Box3().setFromObject(b);
  return aBox.intersectsBox(bBox);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
