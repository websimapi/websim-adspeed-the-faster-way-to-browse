document.addEventListener('DOMContentLoaded', function() {
    const adToggle = document.getElementById('adToggle');
    const toggleStatus = document.getElementById('toggleStatus');
    const speedNeedle = document.getElementById('speedNeedle');
    const adContainer = document.getElementById('adContainer');
    const adContainer2 = document.getElementById('adContainer2');
    const delayedElements = document.querySelectorAll('.delayed-element');
    const loadingDemo = document.getElementById('loadingDemo');
    const loadingBar = loadingDemo.querySelector('.loading-bar');

    // Ad content - SVGs instead of images
    const adContents = [
        {
            title: "AMAZING PRODUCT",
            content: createAdSVG("#FF5733", "Super Amazing Product", "BUY NOW!")
        },
        {
            title: "YOU WON'T BELIEVE",
            content: createAdSVG("#33FF57", "This One Weird Trick", "CLICK HERE!")
        },
        {
            title: "HOT SINGLES",
            content: createAdSVG("#3357FF", "In Your Network Area", "MEET NOW!")
        },
        {
            title: "MAKE $$$ FAST",
            content: createAdSVG("#F3FF33", "Become Rich Tomorrow", "START NOW!")
        }
    ];

    // Initialize the page
    updateAdDisplay(adToggle.checked);
    showDelayedElements();
    runLoadingDemo();
    updateSpeedMeter(adToggle.checked);

    // Toggle event listener
    adToggle.addEventListener('change', function() {
        const adsEnabled = this.checked;
        toggleStatus.textContent = adsEnabled ? 'ON' : 'OFF';
        
        document.body.classList.toggle('ads-disabled', !adsEnabled);
        
        updateAdDisplay(adsEnabled);
        updateSpeedMeter(adsEnabled);
        
        // Reset and restart animations
        showDelayedElements();
        runLoadingDemo();
    });

    // Function to create SVG ads
    function createAdSVG(color, text1, text2) {
        return `
        <svg width="100%" height="120" viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="${color}" />
            <rect x="5" y="5" width="290" height="110" fill="white" fill-opacity="0.8" />
            <text x="150" y="45" font-family="Arial" font-size="16" text-anchor="middle" font-weight="bold">${text1}</text>
            <text x="150" y="85" font-family="Arial" font-size="20" text-anchor="middle" fill="${color}" font-weight="bold">${text2}</text>
        </svg>
        `;
    }

    // Function to update ad display
    function updateAdDisplay(showAds) {
        adContainer.innerHTML = '';
        adContainer2.innerHTML = '';
        
        if (showAds) {
            // Add ads to the first container
            for (let i = 0; i < 2; i++) {
                const ad = document.createElement('div');
                ad.className = 'ad';
                ad.innerHTML = `
                    <h3>${adContents[i].title}</h3>
                    ${adContents[i].content}
                `;
                adContainer.appendChild(ad);
            }
            
            // Add ads to the second container
            for (let i = 2; i < 4; i++) {
                const ad = document.createElement('div');
                ad.className = 'ad';
                ad.innerHTML = `
                    <h3>${adContents[i].title}</h3>
                    ${adContents[i].content}
                `;
                adContainer2.appendChild(ad);
            }
        }
    }

    // Function to show delayed elements
    function showDelayedElements() {
        delayedElements.forEach((el, index) => {
            // Hide all elements first
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            // Then show them with a delay
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, adToggle.checked ? 300 + (index * 150) : 1500 + (index * 750));
        });
    }

    // Function to run loading demo
    function runLoadingDemo() {
        loadingBar.style.width = '0%';
        
        setTimeout(() => {
            // Start loading animation
            const duration = adToggle.checked ? 3000 : 15000;
            const increment = 1;
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += increment;
                loadingBar.style.width = `${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, duration / 100);
        }, 500);
    }

    // Function to update speed meter
    function updateSpeedMeter(isAdEnabled) {
        // Set rotation angle: 0deg is slow, 180deg is fast
        const angle = isAdEnabled ? 140 : 20;
        speedNeedle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    }

    // Add interactive features with different performance based on ad status
    document.addEventListener('mousemove', function(e) {
        if (adToggle.checked) {
            // Smooth response with ads
            e.target.style.cursor = 'pointer';
        } else {
            // Delayed response without ads
            setTimeout(() => {
                e.target.style.cursor = 'pointer';
            }, 500);
        }
    });
});

