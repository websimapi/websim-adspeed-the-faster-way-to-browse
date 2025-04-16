export function initControls(keys) {
    // Key event listeners
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'w') keys.w = true;
        if (e.key.toLowerCase() === 'a') keys.a = true;
        if (e.key.toLowerCase() === 's') keys.s = true;
        if (e.key.toLowerCase() === 'd') keys.d = true;
        if (e.key === ' ') keys.space = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key.toLowerCase() === 'w') keys.w = false;
        if (e.key.toLowerCase() === 'a') keys.a = false;
        if (e.key.toLowerCase() === 's') keys.s = false;
        if (e.key.toLowerCase() === 'd') keys.d = false;
        if (e.key === ' ') keys.space = false;
    });
}

