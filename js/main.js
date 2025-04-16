import { setupDomElements } from './domElements.js';
import { initControls } from './controls.js';
import { GameState } from './gameState.js';
import { init3D, animate3D } from './game3D.js';
import { init2D } from './game2D.js';
import { updateAdDisplay } from './adManager.js';
import { updateSpeedMeter } from './uiManager.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize game components
    const domElements = setupDomElements();
    const gameState = new GameState();
    
    // Initialize the game
    initGame(gameState, domElements);
    updateSpeedMeter(gameState.is3DMode, domElements);
    
    // Set up event listeners
    initEventListeners(gameState, domElements);
    
    // Set up keyboard controls
    initControls(gameState.keys);
    
    // Start animation loop for 3D mode
    if (gameState.is3DMode) {
        animate3D(gameState, domElements);
    }
    
    function initGame(gameState, domElements) {
        if (gameState.is3DMode) {
            init3D(gameState, domElements);
        } else {
            init2D(gameState, domElements);
        }
        updateAdDisplay(gameState.is3DMode, domElements);
        gameState.gameLoaded = true;
    }
    
    function initEventListeners(gameState, domElements) {
        // Toggle event listener
        domElements.adToggle.addEventListener('change', function() {
            gameState.is3DMode = this.checked;
            domElements.toggleStatus.textContent = gameState.is3DMode ? 'ON' : 'OFF';
            document.body.classList.toggle('ads-disabled', !gameState.is3DMode);
            
            // Switch game modes
            if (gameState.is3DMode) {
                init3D(gameState, domElements);
                animate3D(gameState, domElements);
            } else {
                init2D(gameState, domElements);
            }
            
            updateSpeedMeter(gameState.is3DMode, domElements);
            updateAdDisplay(gameState.is3DMode, domElements);
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (gameState.is3DMode && gameState.renderer) {
                gameState.camera.aspect = domElements.gameContainer.clientWidth / domElements.gameContainer.clientHeight;
                gameState.camera.updateProjectionMatrix();
                gameState.renderer.setSize(domElements.gameContainer.clientWidth, domElements.gameContainer.clientHeight);
            } else if (!gameState.is3DMode && gameState.canvas2D) {
                gameState.canvas2D.width = domElements.gameContainer.clientWidth;
                gameState.canvas2D.height = domElements.gameContainer.clientHeight;
            }
        });
    }
});