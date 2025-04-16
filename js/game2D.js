import { adContents } from './gameState.js';

export function init2D(gameState, domElements) {
    // Clear 3D renderer
    domElements.gameCanvas.innerHTML = '';
    
    // Create canvas
    gameState.canvas2D = document.createElement('canvas');
    gameState.canvas2D.width = domElements.gameContainer.clientWidth;
    gameState.canvas2D.height = domElements.gameContainer.clientHeight;
    domElements.gameCanvas.appendChild(gameState.canvas2D);
    gameState.ctx = gameState.canvas2D.getContext('2d');

    // Set player start position (center of canvas)
    gameState.player.x = gameState.canvas2D.width / 2;
    gameState.player.y = gameState.canvas2D.height / 2;

    // Start animation loop
    requestAnimationFrame((timestamp) => animate2D(timestamp, gameState));
}

export function animate2D(timestamp, gameState) {
    if (gameState.is3DMode || !gameState.ctx || !gameState.canvas2D) return;
    
    requestAnimationFrame((newTimestamp) => animate2D(newTimestamp, gameState));
    
    // Calculate FPS
    if (!gameState.lastFrameTime) {
        gameState.lastFrameTime = timestamp;
    }
    
    const delta = timestamp - gameState.lastFrameTime;
    gameState.frameCount++;
    
    if (delta >= 1000) {
        gameState.fps = Math.round((gameState.frameCount * 1000) / delta);
        gameState.frameCount = 0;
        gameState.lastFrameTime = timestamp;
    }
    
    // Clear canvas
    gameState.ctx.fillStyle = '#111';
    gameState.ctx.fillRect(0, 0, gameState.canvas2D.width, gameState.canvas2D.height);
    
    // Move character
    moveCharacter2D(gameState);
    
    // Draw map
    drawMap2D(gameState);
    
    // Draw character
    drawCharacter2D(gameState);
    
    // Draw FPS counter (intentionally low)
    gameState.ctx.fillStyle = 'white';
    gameState.ctx.font = '14px Arial';
    gameState.ctx.fillText(`FPS: ${gameState.fps}`, 10, 20);
    
    // Add artificial lag in 2D mode
    if (Math.random() < 0.2) {
        // Simulate lag spike by doing useless calculations
        for (let i = 0; i < 500000; i++) {
            Math.sqrt(i);
        }
    }
}

function moveCharacter2D(gameState) {
    const moveSpeed = gameState.player.speed * 3; // Faster in 2D for playability
    
    // Track previous position for collision detection
    const prevX = gameState.player.x;
    const prevY = gameState.player.y;
    
    if (gameState.keys.w) gameState.player.y -= moveSpeed;
    if (gameState.keys.s) gameState.player.y += moveSpeed;
    if (gameState.keys.a) gameState.player.x -= moveSpeed;
    if (gameState.keys.d) gameState.player.x += moveSpeed;
    
    // Crude collision detection with map borders
    if (gameState.player.x < gameState.character2D.width/2 || 
        gameState.player.x > gameState.canvas2D.width - gameState.character2D.width/2 ||
        gameState.player.y < gameState.character2D.height/2 || 
        gameState.player.y > gameState.canvas2D.height - gameState.character2D.height/2) {
        gameState.player.x = prevX;
        gameState.player.y = prevY;
    }
    
    // Collision with "walls" in 2D view
    const tileWidth = gameState.canvas2D.width / gameState.mapSize;
    const tileHeight = gameState.canvas2D.height / gameState.mapSize;
    
    const gridX = Math.floor(gameState.player.x / tileWidth);
    const gridY = Math.floor(gameState.player.y / tileHeight);
    
    if (gridX >= 0 && gridX < gameState.mapSize && gridY >= 0 && gridY < gameState.mapSize) {
        if (gameState.map[gridY][gridX] === 1) {
            gameState.player.x = prevX;
            gameState.player.y = prevY;
        }
    }
}

function drawMap2D(gameState) {
    const tileWidth = gameState.canvas2D.width / gameState.mapSize;
    const tileHeight = gameState.canvas2D.height / gameState.mapSize;
    
    for (let y = 0; y < gameState.mapSize; y++) {
        for (let x = 0; x < gameState.mapSize; x++) {
            const tileType = gameState.map[y][x];
            
            if (tileType === 1) { // Wall
                gameState.ctx.fillStyle = '#664488';
            } else { // Floor
                gameState.ctx.fillStyle = '#226622';
            }
            
            gameState.ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            
            // Add grid lines
            gameState.ctx.strokeStyle = '#333';
            gameState.ctx.lineWidth = 1;
            gameState.ctx.strokeRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
        }
    }
    
    // Draw some "2D ads" if we're in 2D mode but make them pixelated
    if (!gameState.is3DMode) {
        for (let i = 0; i < 5; i++) {
            const adIndex = i % adContents.length;
            const x = Math.floor(Math.random() * gameState.mapSize);
            const y = Math.floor(Math.random() * gameState.mapSize);
            
            if (gameState.map[y][x] === 0) { // Only on floor tiles
                gameState.ctx.fillStyle = adContents[adIndex].color;
                gameState.ctx.fillRect(
                    x * tileWidth + tileWidth * 0.2, 
                    y * tileHeight + tileHeight * 0.2, 
                    tileWidth * 0.6, 
                    tileHeight * 0.6
                );
                
                // Pixelated text effect
                gameState.ctx.fillStyle = 'white';
                gameState.ctx.font = '10px monospace';
                gameState.ctx.fillText('AD', x * tileWidth + tileWidth * 0.4, y * tileHeight + tileHeight * 0.5);
            }
        }
    }
}

function drawCharacter2D(gameState) {
    // Draw player character - a red triangle pointing in movement direction
    gameState.ctx.save();
    gameState.ctx.translate(gameState.player.x, gameState.player.y);
    
    // Determine rotation based on last movement
    let rotation = 0;
    if (gameState.keys.w) rotation = -Math.PI/2;
    if (gameState.keys.s) rotation = Math.PI/2;
    if (gameState.keys.a) rotation = Math.PI;
    if (gameState.keys.d) rotation = 0;
    if (gameState.keys.w && gameState.keys.a) rotation = -Math.PI*3/4;
    if (gameState.keys.w && gameState.keys.d) rotation = -Math.PI/4;
    if (gameState.keys.s && gameState.keys.a) rotation = Math.PI*3/4;
    if (gameState.keys.s && gameState.keys.d) rotation = Math.PI/4;
    
    gameState.ctx.rotate(rotation);
    
    // Draw triangle
    gameState.ctx.fillStyle = '#FF0000';
    gameState.ctx.beginPath();
    gameState.ctx.moveTo(0, -gameState.character2D.height/2);
    gameState.ctx.lineTo(-gameState.character2D.width/2, gameState.character2D.height/2);
    gameState.ctx.lineTo(gameState.character2D.width/2, gameState.character2D.height/2);
    gameState.ctx.closePath();
    gameState.ctx.fill();
    
    gameState.ctx.restore();
}