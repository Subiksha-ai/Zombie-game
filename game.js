// Game constants
const GAME_WIDTH = 600;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const ZOMBIE_SIZE = 30;
const TOOL_SIZE = 25;
const ZOMBIE_SPEED = 1;
const PLAYER_SPEED = 5;
const ZOMBIE_SPAWN_INTERVAL = 10000; // 10 seconds
const TOOL_SPAWN_INTERVAL = 10000; // 10 seconds

// Game state
let gameRunning = false;
let player = {
    x: GAME_WIDTH / 2 - PLAYER_SIZE / 2,
    y: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    element: null,
    lives: 3,
    currentTool: null
};
let zombies = [];
let tools = [];
let keysPressed = {};
let gameTime = 0;
let gameTimerId = null;
let zombieSpawnerId = null;
let toolSpawnerId = null;

// Tool types with their properties
const toolTypes = [
    { name: 'Bat', emoji: '🏏', damage: 1, range: 50 },
    { name: 'Knife', emoji: '🔪', damage: 2, range: 30 },
    { name: 'Pan', emoji: '🍳', damage: 1, range: 40 },
    { name: 'Teddy Bear', emoji: '🧸', damage: 0, range: 0 },
    { name: 'Pillow', emoji: '🛏️', damage: 0, range: 0 },
    { name: 'Axe', emoji: '🪓', damage: 3, range: 40 },
    { name: 'Wrench', emoji: '🔧', damage: 1, range: 35 }
];

// DOM elements
const gameArea = document.getElementById('game-area');
const timerElement = document.getElementById('timer');
const livesElement = document.getElementById('lives');
const toolDisplayElement = document.getElementById('tool-display');
const gameOverElement = document.getElementById('game-over');
const finalTimeElement = document.getElementById('final-time');
const restartButton = document.getElementById('restart-button');

// Initialize the game
function initGame() {
    // Create player
    player.element = document.createElement('div');
    player.element.className = 'player';
    player.element.innerHTML = '👤';
    player.element.style.width = `${PLAYER_SIZE}px`;
    player.element.style.height = `${PLAYER_SIZE}px`;
    player.element.style.left = `${player.x}px`;
    player.element.style.top = `${player.y}px`;
    gameArea.appendChild(player.element);

    // Reset game state
    player.lives = 3;
    player.currentTool = null;
    zombies = [];
    tools = [];
    gameTime = 0;
    updateLives();
    updateToolDisplay();
    updateTimer();

    // Start game loops
    gameRunning = true;
    gameTimerId = setInterval(updateTimer, 1000);
    zombieSpawnerId = setInterval(spawnZombie, ZOMBIE_SPAWN_INTERVAL);
    toolSpawnerId = setInterval(spawnTool, TOOL_SPAWN_INTERVAL);

    // Spawn initial zombie
    spawnZombie();

    // Hide game over screen if visible
    gameOverElement.style.display = 'none';

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    // Update player position based on keys pressed
    updatePlayerPosition();

    // Update zombie positions
    updateZombies();

    // Check collisions
    checkCollisions();

    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Update player position based on key presses
function updatePlayerPosition() {
    // Move horizontally
    if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        player.x = Math.max(0, player.x - PLAYER_SPEED);
    }
    if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        player.x = Math.min(GAME_WIDTH - PLAYER_SIZE, player.x + PLAYER_SPEED);
    }

    // Move vertically
    if (keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W']) {
        player.y = Math.max(0, player.y - PLAYER_SPEED);
    }
    if (keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S']) {
        player.y = Math.min(GAME_HEIGHT - PLAYER_SIZE, player.y + PLAYER_SPEED);
    }

    // Update player element position
    player.element.style.left = `${player.x}px`;
    player.element.style.top = `${player.y}px`;
}

// Update zombie positions
function updateZombies() {
    zombies.forEach(zombie => {
        // Calculate direction towards player
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalize and apply speed
        if (distance > 0) {
            zombie.x += (dx / distance) * ZOMBIE_SPEED;
            zombie.y += (dy / distance) * ZOMBIE_SPEED;
        }

        // Update zombie element position
        zombie.element.style.left = `${zombie.x}px`;
        zombie.element.style.top = `${zombie.y}px`;
    });
}

// Spawn a new zombie at a random edge
function spawnZombie() {
    if (!gameRunning) return;

    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (edge) {
        case 0: // top
            x = Math.random() * (GAME_WIDTH - ZOMBIE_SIZE);
            y = -ZOMBIE_SIZE;
            break;
        case 1: // right
            x = GAME_WIDTH;
            y = Math.random() * (GAME_HEIGHT - ZOMBIE_SIZE);
            break;
        case 2: // bottom
            x = Math.random() * (GAME_WIDTH - ZOMBIE_SIZE);
            y = GAME_HEIGHT;
            break;
        case 3: // left
            x = -ZOMBIE_SIZE;
            y = Math.random() * (GAME_HEIGHT - ZOMBIE_SIZE);
            break;
    }

    const zombieElement = document.createElement('div');
    zombieElement.className = 'zombie';
    zombieElement.innerHTML = '🧟‍♂️';
    zombieElement.style.width = `${ZOMBIE_SIZE}px`;
    zombieElement.style.height = `${ZOMBIE_SIZE}px`;
    zombieElement.style.left = `${x}px`;
    zombieElement.style.top = `${y}px`;
    gameArea.appendChild(zombieElement);

    zombies.push({
        x,
        y,
        element: zombieElement,
        health: 2 // Zombies take 2 hits to kill with basic weapon
    });
}

// Spawn a new tool at a random position
function spawnTool() {
    if (!gameRunning) return;

    // Select a random tool type
    const toolType = toolTypes[Math.floor(Math.random() * toolTypes.length)];

    // Random position (with padding from edges)
    const padding = 50;
    const x = padding + Math.random() * (GAME_WIDTH - TOOL_SIZE - padding * 2);
    const y = padding + Math.random() * (GAME_HEIGHT - TOOL_SIZE - padding * 2);

    const toolElement = document.createElement('div');
    toolElement.className = 'tool';
    toolElement.innerHTML = toolType.emoji;
    toolElement.style.width = `${TOOL_SIZE}px`;
    toolElement.style.height = `${TOOL_SIZE}px`;
    toolElement.style.left = `${x}px`;
    toolElement.style.top = `${y}px`;
    gameArea.appendChild(toolElement);

    tools.push({
        x,
        y,
        element: toolElement,
        type: toolType
    });

    // Remove tool after 15 seconds if not picked up
    setTimeout(() => {
        if (gameRunning && tools.includes(tool)) {
            const index = tools.indexOf(tool);
            if (index !== -1) {
                gameArea.removeChild(tools[index].element);
                tools.splice(index, 1);
            }
        }
    }, 15000);

    // Fix: Define the tool variable for the setTimeout callback
    const tool = tools[tools.length - 1];
}

// Check for collisions between game elements
function checkCollisions() {
    // Check player-zombie collisions
    zombies.forEach((zombie, zombieIndex) => {
        if (isColliding(player, zombie)) {
            // Player loses a life
            player.lives--;
            updateLives();

            // Remove the zombie
            gameArea.removeChild(zombie.element);
            zombies.splice(zombieIndex, 1);

            // Check if game over
            if (player.lives <= 0) {
                endGame();
            }
        }
    });

    // Check player-tool collisions
    tools.forEach((tool, toolIndex) => {
        if (isColliding(player, tool)) {
            // Player picks up the tool
            player.currentTool = tool.type;
            updateToolDisplay();

            // Remove the tool
            gameArea.removeChild(tool.element);
            tools.splice(toolIndex, 1);
        }
    });
}

// Check if two objects are colliding
function isColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + TOOL_SIZE &&
        obj1.x + PLAYER_SIZE > obj2.x &&
        obj1.y < obj2.y + TOOL_SIZE &&
        obj1.y + PLAYER_SIZE > obj2.y
    );
}

// Attack zombies with current tool
function attackZombies() {
    if (!player.currentTool || player.currentTool.damage === 0) return;

    // Add attack animation to player
    player.element.classList.add('attack-animation');
    setTimeout(() => {
        player.element.classList.remove('attack-animation');
    }, 500);

    // Check for zombies in range
    const range = player.currentTool.range;
    const damage = player.currentTool.damage;

    zombies.forEach((zombie, index) => {
        // Calculate distance to zombie
        const dx = zombie.x - player.x;
        const dy = zombie.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If zombie is in range, damage it
        if (distance <= range + PLAYER_SIZE) {
            zombie.health -= damage;

            // If zombie is dead, remove it
            if (zombie.health <= 0) {
                gameArea.removeChild(zombie.element);
                zombies.splice(index, 1);
            }
        }
    });
}

// Update the timer display
function updateTimer() {
    gameTime++;
    timerElement.textContent = gameTime;
}

// Update the lives display
function updateLives() {
    livesElement.textContent = '❤️'.repeat(player.lives);
}

// Update the tool display
function updateToolDisplay() {
    if (player.currentTool) {
        toolDisplayElement.textContent = `${player.currentTool.emoji} ${player.currentTool.name}`;
        if (player.currentTool.damage > 0) {
            toolDisplayElement.textContent += ` (Damage: ${player.currentTool.damage}, Range: ${player.currentTool.range}px)`;
        } else {
            toolDisplayElement.textContent += " (Useless)";
        }
    } else {
        toolDisplayElement.textContent = "No tool equipped";
    }
}

// End the game
function endGame() {
    gameRunning = false;
    clearInterval(gameTimerId);
    clearInterval(zombieSpawnerId);
    clearInterval(toolSpawnerId);

    // Show game over screen
    finalTimeElement.textContent = gameTime;
    gameOverElement.style.display = 'block';
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;

    // Attack with spacebar
    if (e.key === ' ' && gameRunning) {
        attackZombies();
    }
});

document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
});

restartButton.addEventListener('click', () => {
    // Clear the game area
    while (gameArea.firstChild) {
        gameArea.removeChild(gameArea.firstChild);
    }

    // Restart the game
    initGame();
});

// Start the game when the page loads
window.addEventListener('load', initGame);