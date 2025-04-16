export function updateSpeedMeter(isHighQuality, domElements) {
    // Set rotation angle: 0deg is slow, 180deg is fast
    const angle = isHighQuality ? 140 : 20;
    domElements.speedNeedle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
}

