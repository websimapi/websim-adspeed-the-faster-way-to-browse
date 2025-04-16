import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const adToggle = document.getElementById('adToggle');
    const toggleStatus = document.getElementById('toggleStatus');
    const speedNeedle = document.getElementById('speedNeedle');
    const adOverlay = document.getElementById('adOverlay');
    const gameContainer = document.querySelector('.game-container');
    const gameCanvas = document.getElementById('gameCanvas');
    const healthFill = document.getElementById('healthFill');

    // Game states
    let is3DMode = adToggle.checked;
    let gameLoaded = false;
    let player = {
        health: 100,
        x: 0,
        y: 0,
        z: 0,
        speed: 0.1,
        rotation: 0
    };
    
    // Controls state
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false
    };

    // Ad content for in-game billboards
    const adContents = [
        { title: "ENERGY POTION", content: "BOOST YOUR GAME!", color: "#FF5733" },
        { title: "PREMIUM ARMOR", content: "JOIN VIP NOW!", color: "#33FF57" },
        { title: "LEGENDARY SWORD", content: "50% OFF TODAY!", color: "#3357FF" },
        { title: "RARE MOUNT", content: "LIMITED TIME OFFER!", color: "#F3FF33" }
    ];

    // Three.js setup
    let scene, camera, renderer, controls;
    let character3D, ground, skybox;
    
    // 2D Game setup
    let ctx, canvas2D;
    let character2D = { width: 20, height: 20 };
    let lastFrameTime = 0;
    let frameCount = 0;
    let fps = 0;

    // Map tiles
    const mapSize = 20;
    const tileSize = 2;
    const map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    // Initialize the game
    initGame();
    updateSpeedMeter(is3DMode);

    // Toggle event listener
    adToggle.addEventListener('change', function() {
        is3DMode = this.checked;
        toggleStatus.textContent = is3DMode ? 'ON' : 'OFF';
        document.body.classList.toggle('ads-disabled', !is3DMode);
        
        // Switch game modes
        if (is3DMode) {
            init3D();
        } else {
            init2D();
        }
        
        updateSpeedMeter(is3DMode);
        updateAdDisplay(is3DMode);
    });

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

    function initGame() {
        if (is3DMode) {
            init3D();
        } else {
            init2D();
        }
        updateAdDisplay(is3DMode);
        gameLoaded = true;
    }

    function init3D() {
        // Clear any 2D canvas
        if (canvas2D) {
            gameCanvas.innerHTML = '';
        }

        // Three.js initialization
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, gameContainer.clientWidth / gameContainer.clientHeight, 0.1, 1000);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
        gameCanvas.innerHTML = '';
        gameCanvas.appendChild(renderer.domElement);

        // Add controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enabled = false; // Disable orbit controls for character movement

        // Create skybox
        const skyGeometry = new THREE.BoxGeometry(100, 100, 100);
        const skyMaterials = [
            new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide }), // Right
            new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide }), // Left
            new THREE.MeshBasicMaterial({ color: 0x99CCFF, side: THREE.BackSide }), // Top
            new THREE.MeshBasicMaterial({ color: 0x336699, side: THREE.BackSide }), // Bottom
            new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide }), // Front
            new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide })  // Back
        ];
        skybox = new THREE.Mesh(skyGeometry, skyMaterials);
        scene.add(skybox);

        // Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(mapSize * tileSize, mapSize * tileSize);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x339933, 
            side: THREE.DoubleSide,
            roughness: 0.8
        });
        ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = -0.5;
        scene.add(ground);

        // Create walls from map
        for (let z = 0; z < mapSize; z++) {
            for (let x = 0; x < mapSize; x++) {
                if (map[z][x] === 1) { // Wall
                    const wallGeometry = new THREE.BoxGeometry(tileSize, 2, tileSize);
                    const wallMaterial = new THREE.MeshStandardMaterial({ 
                        color: 0x8866cc,
                        roughness: 0.7
                    });
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(
                        (x - mapSize/2) * tileSize + tileSize/2, 
                        0.5, 
                        (z - mapSize/2) * tileSize + tileSize/2
                    );
                    scene.add(wall);
                }
            }
        }

        // Create character
        const characterGeometry = new THREE.ConeGeometry(0.5, 1.5, 4);
        const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        character3D = new THREE.Mesh(characterGeometry, characterMaterial);
        character3D.position.y = 0.5;
        character3D.rotation.x = Math.PI;
        scene.add(character3D);

        // Set player start position (middle of the map)
        player.x = 0;
        player.z = 0;
        character3D.position.x = player.x;
        character3D.position.z = player.z;

        // Add ad billboards
        addBillboards();

        // Set camera position
        camera.position.set(0, 5, 5);
        camera.lookAt(character3D.position);

        // Start animation loop
        animate3D();
    }

    function init2D() {
        // Clear 3D renderer
        gameCanvas.innerHTML = '';
        
        // Create canvas
        canvas2D = document.createElement('canvas');
        canvas2D.width = gameContainer.clientWidth;
        canvas2D.height = gameContainer.clientHeight;
        gameCanvas.appendChild(canvas2D);
        ctx = canvas2D.getContext('2d');

        // Set player start position (center of canvas)
        player.x = canvas2D.width / 2;
        player.y = canvas2D.height / 2;

        // Start animation loop
        requestAnimationFrame(animate2D);
    }

    function addBillboards() {
        // Add 3D ad billboards in the world
        for (let i = 0; i < 10; i++) {
            const adIndex = i % adContents.length;
            const adContent = adContents[adIndex];
            
            // Create billboard geometry
            const billboardGeometry = new THREE.PlaneGeometry(3, 2);
            
            // Create canvas for the billboard texture
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 200;
            const context = canvas.getContext('2d');
            
            // Draw background
            context.fillStyle = adContent.color;
            context.fillRect(0, 0, 300, 200);
            
            // Draw border
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 10;
            context.strokeRect(5, 5, 290, 190);
            
            // Draw text
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 30px Arial';
            context.textAlign = 'center';
            context.fillText(adContent.title, 150, 80);
            
            context.font = 'bold 24px Arial';
            context.fillText(adContent.content, 150, 130);
            
            // Create texture
            const texture = new THREE.CanvasTexture(canvas);
            const billboardMaterial = new THREE.MeshBasicMaterial({ 
                map: texture, 
                side: THREE.DoubleSide 
            });
            
            const billboard = new THREE.Mesh(billboardGeometry, billboardMaterial);
            
            // Position the billboard randomly on the map but not on walls
            let validPosition = false;
            let x, z;
            
            while (!validPosition) {
                x = Math.floor(Math.random() * mapSize);
                z = Math.floor(Math.random() * mapSize);
                
                if (map[z][x] === 0) {
                    validPosition = true;
                }
            }
            
            billboard.position.set(
                (x - mapSize/2) * tileSize + tileSize/2,
                1.5,
                (z - mapSize/2) * tileSize + tileSize/2
            );
            
            // Random rotation
            billboard.rotation.y = Math.random() * Math.PI * 2;
            
            scene.add(billboard);
        }
    }

    function animate3D() {
        if (!is3DMode) return;
        
        requestAnimationFrame(animate3D);
        
        // Move character based on key input
        moveCharacter3D();
        
        // Update camera to follow character
        camera.position.x = character3D.position.x;
        camera.position.z = character3D.position.z + 5;
        camera.lookAt(character3D.position);
        
        renderer.render(scene, camera);
    }

    function animate2D(timestamp) {
        if (is3DMode) return;
        
        requestAnimationFrame(animate2D);
        
        // Calculate FPS
        if (!lastFrameTime) {
            lastFrameTime = timestamp;
        }
        
        const delta = timestamp - lastFrameTime;
        frameCount++;
        
        if (delta >= 1000) {
            fps = Math.round((frameCount * 1000) / delta);
            frameCount = 0;
            lastFrameTime = timestamp;
        }
        
        // Clear canvas
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas2D.width, canvas2D.height);
        
        // Move character
        moveCharacter2D();
        
        // Draw map
        drawMap2D();
        
        // Draw character
        drawCharacter2D();
        
        // Draw FPS counter (intentionally low)
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`FPS: ${fps}`, 10, 20);
        
        // Add artificial lag in 2D mode
        if (Math.random() < 0.2) {
            // Simulate lag spike by doing useless calculations
            for (let i = 0; i < 500000; i++) {
                Math.sqrt(i);
            }
        }
    }

    function moveCharacter3D() {
        const moveSpeed = player.speed;
        const rotateSpeed = 0.05;
        
        if (keys.w) {
            // Move forward in the direction character is facing
            player.z -= Math.cos(player.rotation) * moveSpeed;
            player.x += Math.sin(player.rotation) * moveSpeed;
        }
        if (keys.s) {
            // Move backward in the opposite direction character is facing
            player.z += Math.cos(player.rotation) * moveSpeed;
            player.x -= Math.sin(player.rotation) * moveSpeed;
        }
        if (keys.a) {
            // Rotate left
            player.rotation -= rotateSpeed;
        }
        if (keys.d) {
            // Rotate right
            player.rotation += rotateSpeed;
        }
        
        // Collision detection with walls
        const gridX = Math.floor((player.x + mapSize * tileSize / 2) / tileSize);
        const gridZ = Math.floor((player.z + mapSize * tileSize / 2) / tileSize);
        
        // Check if outside map bounds or hitting a wall
        if (gridX < 0 || gridX >= mapSize || gridZ < 0 || gridZ >= mapSize || map[gridZ][gridX] === 1) {
            // Revert movement if collision
            player.x = character3D.position.x;
            player.z = character3D.position.z;
        } else {
            // Update 3D character position
            character3D.position.x = player.x;
            character3D.position.z = player.z;
            character3D.rotation.y = player.rotation;
        }
    }

    function moveCharacter2D() {
        const moveSpeed = player.speed * 3; // Faster in 2D for playability
        
        // Track previous position for collision detection
        const prevX = player.x;
        const prevY = player.y;
        
        if (keys.w) player.y -= moveSpeed;
        if (keys.s) player.y += moveSpeed;
        if (keys.a) player.x -= moveSpeed;
        if (keys.d) player.x += moveSpeed;
        
        // Crude collision detection with map borders
        if (player.x < character2D.width/2 || 
            player.x > canvas2D.width - character2D.width/2 ||
            player.y < character2D.height/2 || 
            player.y > canvas2D.height - character2D.height/2) {
            player.x = prevX;
            player.y = prevY;
        }
        
        // Collision with "walls" in 2D view
        const tileWidth = canvas2D.width / mapSize;
        const tileHeight = canvas2D.height / mapSize;
        
        const gridX = Math.floor(player.x / tileWidth);
        const gridY = Math.floor(player.y / tileHeight);
        
        if (gridX >= 0 && gridX < mapSize && gridY >= 0 && gridY < mapSize) {
            if (map[gridY][gridX] === 1) {
                player.x = prevX;
                player.y = prevY;
            }
        }
    }

    function drawMap2D() {
        const tileWidth = canvas2D.width / mapSize;
        const tileHeight = canvas2D.height / mapSize;
        
        for (let y = 0; y < mapSize; y++) {
            for (let x = 0; x < mapSize; x++) {
                const tileType = map[y][x];
                
                if (tileType === 1) { // Wall
                    ctx.fillStyle = '#664488';
                } else { // Floor
                    ctx.fillStyle = '#226622';
                }
                
                ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
                
                // Add grid lines
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
            }
        }
        
        // Draw some "2D ads" if we're in 2D mode but make them pixelated
        if (!is3DMode) {
            for (let i = 0; i < 5; i++) {
                const adIndex = i % adContents.length;
                const x = Math.floor(Math.random() * mapSize);
                const y = Math.floor(Math.random() * mapSize);
                
                if (map[y][x] === 0) { // Only on floor tiles
                    ctx.fillStyle = adContents[adIndex].color;
                    ctx.fillRect(
                        x * tileWidth + tileWidth * 0.2, 
                        y * tileHeight + tileHeight * 0.2, 
                        tileWidth * 0.6, 
                        tileHeight * 0.6
                    );
                    
                    // Pixelated text effect
                    ctx.fillStyle = 'white';
                    ctx.font = '10px monospace';
                    ctx.fillText('AD', x * tileWidth + tileWidth * 0.4, y * tileHeight + tileHeight * 0.5);
                }
            }
        }
    }

    function drawCharacter2D() {
        // Draw player character - a red triangle pointing in movement direction
        ctx.save();
        ctx.translate(player.x, player.y);
        
        // Determine rotation based on last movement
        let rotation = 0;
        if (keys.w) rotation = -Math.PI/2;
        if (keys.s) rotation = Math.PI/2;
        if (keys.a) rotation = Math.PI;
        if (keys.d) rotation = 0;
        if (keys.w && keys.a) rotation = -Math.PI*3/4;
        if (keys.w && keys.d) rotation = -Math.PI/4;
        if (keys.s && keys.a) rotation = Math.PI*3/4;
        if (keys.s && keys.d) rotation = Math.PI/4;
        
        ctx.rotate(rotation);
        
        // Draw triangle
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(0, -character2D.height/2);
        ctx.lineTo(-character2D.width/2, character2D.height/2);
        ctx.lineTo(character2D.width/2, character2D.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    function updateSpeedMeter(isHighQuality) {
        // Set rotation angle: 0deg is slow, 180deg is fast
        const angle = isHighQuality ? 140 : 20;
        speedNeedle.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    }

    function updateAdDisplay(show3DAds) {
        adOverlay.innerHTML = '';
        
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
                
                adOverlay.appendChild(ad);
            }
        }
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (is3DMode && renderer) {
            camera.aspect = gameContainer.clientWidth / gameContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
        } else if (!is3DMode && canvas2D) {
            canvas2D.width = gameContainer.clientWidth;
            canvas2D.height = gameContainer.clientHeight;
        }
    });
});