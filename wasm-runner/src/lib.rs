use wasm_bindgen::prelude::*;

#[derive(Clone, Debug)]
#[wasm_bindgen]
pub struct Obstacle {
    x: i32,
    y: i32,
    width: i32,
    height: i32,
}

#[wasm_bindgen]
impl Obstacle {
    #[wasm_bindgen(constructor)]
    pub fn new(x: i32, y: i32) -> Obstacle {
        Obstacle {
            x,
            y,
            width: 60,
            height: 40,
        }
    }

    pub fn get_x(&self) -> i32 {
        self.x
    }

    pub fn get_y(&self) -> i32 {
        self.y
    }

    pub fn get_width(&self) -> i32 {
        self.width
    }

    pub fn get_height(&self) -> i32 {
        self.height
    }

    pub fn move_down(&mut self, distance: i32) {
        self.y += distance;
    }
}

#[wasm_bindgen]
pub struct GameState {
    // Player
    player_x: i32,
    player_y: i32,
    player_width: i32,
    player_height: i32,
    
    // Physics
    velocity_y: f32,
    gravity: f32,
    jump_power: f32,
    is_jumping: bool,
    
    // Obstacles
    obstacles: Vec<Obstacle>,
    obstacle_spawn_rate: i32,
    spawn_counter: i32,
    
    // Game state
    score: u32,
    level: u32,
    speed: f32,
    is_paused: bool,
    game_over: bool,
    
    // Game parameters
    game_width: i32,
    game_height: i32,
    
    // Random seed for obstacle placement
    random_seed: u32,
}

#[wasm_bindgen]
impl GameState {
    #[wasm_bindgen(constructor)]
    pub fn new(width: i32, height: i32) -> GameState {
        GameState {
            // Player starts at bottom center
            player_x: width / 2 - 20,
            player_y: height - 60,
            player_width: 40,
            player_height: 40,
            
            velocity_y: 0.0,
            gravity: 0.5,
            jump_power: 12.0,
            is_jumping: false,
            
            obstacles: Vec::new(),
            obstacle_spawn_rate: 40,
            spawn_counter: 0,
            
            score: 0,
            level: 1,
            speed: 3.0,
            is_paused: false,
            game_over: false,
            
            game_width: width,
            game_height: height,
            
            random_seed: 12345,
        }
    }

    // Player movement
    pub fn move_left(&mut self) {
        self.player_x = (self.player_x - 15).max(0);
    }

    pub fn move_right(&mut self) {
        self.player_x = (self.player_x + 15).min(self.game_width - self.player_width);
    }

    pub fn jump(&mut self) {
        if !self.is_jumping && !self.game_over {
            self.is_jumping = true;
            self.velocity_y = -self.jump_power;
        }
    }

    // Pause/resume
    pub fn toggle_pause(&mut self) {
        if !self.game_over {
            self.is_paused = !self.is_paused;
        }
    }

    // Game loop update
    pub fn update(&mut self) {
        if self.is_paused || self.game_over {
            return;
        }

        // Apply gravity
        self.velocity_y += self.gravity;
        self.player_y += self.velocity_y as i32;

        // Ground collision
        if self.player_y >= self.game_height - self.player_height {
            self.player_y = self.game_height - self.player_height;
            self.velocity_y = 0.0;
            self.is_jumping = false;
        }

        // Spawn obstacles
        self.spawn_counter += 1;
        if self.spawn_counter >= self.obstacle_spawn_rate {
            self.spawn_counter = 0;
            self.spawn_obstacle();
        }

        // Move obstacles
        for obstacle in &mut self.obstacles {
            obstacle.move_down(self.speed as i32);
        }

        // Check collisions
        for obstacle in &self.obstacles {
            if self.check_collision(obstacle) {
                self.game_over = true;
            }
        }

        // Remove off-screen obstacles and award points
        let initial_count = self.obstacles.len();
        self.obstacles.retain(|obstacle| obstacle.get_y() < self.game_height);
        let removed = initial_count - self.obstacles.len();
        self.score += removed as u32;

        // Increase difficulty
        self.update_difficulty();
    }

    fn spawn_obstacle(&mut self) {
        // Linear congruential generator for pseudo-random x position
        self.random_seed = self.random_seed.wrapping_mul(1103515245).wrapping_add(12345);
        let random_value = (self.random_seed / 65536) % (self.game_width as u32 - 60);
        let x = random_value as i32;
        let obstacle = Obstacle::new(x, -50);
        self.obstacles.push(obstacle);
    }

    fn check_collision(&self, obstacle: &Obstacle) -> bool {
        let px1 = self.player_x;
        let px2 = self.player_x + self.player_width;
        let py1 = self.player_y;
        let py2 = self.player_y + self.player_height;

        let ox1 = obstacle.get_x();
        let ox2 = obstacle.get_x() + obstacle.get_width();
        let oy1 = obstacle.get_y();
        let oy2 = obstacle.get_y() + obstacle.get_height();

        // AABB collision: check if rectangles overlap (not just touching)
        px1 < ox2 && px2 > ox1 && py1 < oy2 && py2 > oy1
    }

    fn update_difficulty(&mut self) {
        // Increase speed every 500 points
        let new_level = (self.score / 500) + 1;
        if new_level != self.level {
            self.level = new_level;
            self.speed = 3.0 + (self.level as f32 - 1.0) * 0.5;
            self.obstacle_spawn_rate = (40 - (self.level as i32 - 1) * 3).max(15);
        }
    }

    // Getters for rendering
    pub fn get_player_x(&self) -> i32 {
        self.player_x
    }

    pub fn get_player_y(&self) -> i32 {
        self.player_y
    }

    pub fn get_score(&self) -> u32 {
        self.score
    }

    pub fn get_level(&self) -> u32 {
        self.level
    }

    pub fn get_speed(&self) -> f32 {
        self.speed
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    pub fn is_paused(&self) -> bool {
        self.is_paused
    }

    pub fn get_obstacle_count(&self) -> usize {
        self.obstacles.len()
    }

    pub fn get_obstacle(&self, index: usize) -> Option<Obstacle> {
        self.obstacles.get(index).cloned()
    }

    pub fn reset(&mut self) {
        self.player_x = self.game_width / 2 - 20;
        self.player_y = self.game_height - 60;
        self.velocity_y = 0.0;
        self.is_jumping = false;
        self.obstacles.clear();
        self.spawn_counter = 0;
        self.score = 0;
        self.level = 1;
        self.speed = 3.0;
        self.is_paused = false;
        self.game_over = false;
        self.random_seed = 12345;
    }
}
