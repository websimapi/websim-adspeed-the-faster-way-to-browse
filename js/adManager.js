import { adContents } from './gameState.js';

export function updateAdDisplay(show3DAds, domElements) {
    domElements.adOverlay.innerHTML = '';
    
    if (show3DAds) {
        // Create floating ad overlays
        for (let i = 0; i < 4; i++) {
            const ad = document.createElement('div');
            ad.className = 'in-game-ad';
            ad.style.top = `${Math.random() * 80 + 10}%`;
            ad.style.left = `${Math.random() * 80 + 10}%`;
            ad.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
            
            const adIndex = Math.floor(Math.random() * adContents.length);
            
            ad.innerHTML = `
                <h4>${adContents[adIndex].title}</h4>
                <p>${adContents[adIndex].content}</p>
                <button style="background-color:${adContents[adIndex].color}">CLICK!</button>
            `;
            
            // Make ad closable
            ad.addEventListener('click', function(e) {
                if (e.target.tagName !== 'BUTTON') {
                    this.style.display = 'none';
                }
            });
            
            domElements.adOverlay.appendChild(ad);
        }
    }
}