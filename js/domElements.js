export function setupDomElements() {
    return {
        adToggle: document.getElementById('adToggle'),
        toggleStatus: document.getElementById('toggleStatus'),
        speedNeedle: document.getElementById('speedNeedle'),
        adOverlay: document.getElementById('adOverlay'),
        gameContainer: document.querySelector('.game-container'),
        gameCanvas: document.getElementById('gameCanvas'),
        healthFill: document.getElementById('healthFill')
    };
}

