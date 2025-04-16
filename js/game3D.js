import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { adContents } from './gameState.js';

export function init3D(gameState, domElements) {
    // Clear any 2D canvas
    if (gameState.canvas2D) {
        domElements.gameCanvas.innerHTML = '';
    }

    // Three.js initialization
    gameState.scene = new THREE.Scene();
    gameState.camera = new THREE.PerspectiveCamera(75, domElements.gameContainer.clientWidth / domElements.gameContainer.clientHeight, 0.1, 1000);
    
    gameState.renderer = new THREE.WebGLRenderer({ antialias: true });
    gameState.renderer.setSize(domElements.gameContainer.clientWidth, domElements.gameContainer.clientHeight);
    domElements.gameCanvas.innerHTML = '';
    domElements.gameCanvas.appendChild(gameState.renderer.domElement);

    // Add controls
    gameState.controls = new OrbitControls(gameState.camera, gameState.renderer.domElement);
    gameState.controls.enableDamping = true;
    gameState.controls.dampingFactor = 0.25;
    gameState.controls.enabled = false; // Disable orbit controls for character movement

    // Create skybox
    createSkybox(gameState);
    
    // Add lighting
    addLighting(gameState);
    
    // Create ground
    createGround(gameState);
    
    // Create walls from map
    createWalls(gameState);
    
    // Create character
    createCharacter(gameState);
    
    // Add ad billboards
    addBillboards(gameState);

    // Set camera position
    gameState.camera.position.set(0, 5, 5);
    gameState.camera.lookAt(gameState.character3D.position);
}

export function animate3D(gameState, domElements) {
    if (!gameState.is3DMode || !gameState.scene || !gameState.camera || !gameState.renderer) return;
    
    requestAnimationFrame(() => animate3D(gameState, domElements));
    
    // Move character based on key input
    if (gameState.character3D) {
        moveCharacter3D(gameState);
    }
    
    // Update camera to follow character
    if (gameState.character3D && gameState.camera) {
        gameState.camera.position.x = gameState.character3D.position.x;
        gameState.camera.position.z = gameState.character3D.position.z + 5;
        gameState.camera.lookAt(gameState.character3D.position);
    }
    
    // Render the scene
    gameState.renderer.render(gameState.scene, gameState.camera);
}

function createSkybox(gameState) {
    const skyGeometry = new THREE.BoxGeometry(100, 100, 100);
    const skyMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide }), // Right
        new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide }), // Left
        new THREE.MeshBasicMaterial({ color: 0x99CCFF, side: THREE.BackSide }), // Top
        new THREE.MeshBasicMaterial({ color: 0x336699, side: THREE.BackSide }), // Bottom
        new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide }), // Front
        new THREE.MeshBasicMaterial({ color: 0x6699FF, side: THREE.BackSide })  // Back
    ];
    gameState.skybox = new THREE.Mesh(skyGeometry, skyMaterials);
    gameState.scene.add(gameState.skybox);
}

function addLighting(gameState) {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    gameState.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    gameState.scene.add(directionalLight);
}

function createGround(gameState) {
    const groundGeometry = new THREE.PlaneGeometry(gameState.mapSize * gameState.tileSize, gameState.mapSize * gameState.tileSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x339933, 
        side: THREE.DoubleSide,
        roughness: 0.8
    });
    gameState.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    gameState.ground.rotation.x = Math.PI / 2;
    gameState.ground.position.y = -0.5;
    gameState.scene.add(gameState.ground);
}

function createWalls(gameState) {
    for (let z = 0; z < gameState.mapSize; z++) {
        for (let x = 0; x < gameState.mapSize; x++) {
            if (gameState.map[z][x] === 1) { // Wall
                const wallGeometry = new THREE.BoxGeometry(gameState.tileSize, 2, gameState.tileSize);
                const wallMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x8866cc,
                    roughness: 0.7
                });
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(
                    (x - gameState.mapSize/2) * gameState.tileSize + gameState.tileSize/2, 
                    0.5, 
                    (z - gameState.mapSize/2) * gameState.tileSize + gameState.tileSize/2
                );
                gameState.scene.add(wall);
            }
        }
    }
}

function createCharacter(gameState) {
    const characterGeometry = new THREE.ConeGeometry(0.5, 1.5, 4);
    const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    gameState.character3D = new THREE.Mesh(characterGeometry, characterMaterial);
    gameState.character3D.position.y = 0.5;
    gameState.character3D.rotation.x = Math.PI;
    gameState.scene.add(gameState.character3D);

    // Set player start position (middle of the map)
    gameState.player.x = 0;
    gameState.player.z = 0;
    gameState.character3D.position.x = gameState.player.x;
    gameState.character3D.position.z = gameState.player.z;
}

function addBillboards(gameState) {
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
            x = Math.floor(Math.random() * gameState.mapSize);
            z = Math.floor(Math.random() * gameState.mapSize);
            
            if (gameState.map[z][x] === 0) {
                validPosition = true;
            }
        }
        
        billboard.position.set(
            (x - gameState.mapSize/2) * gameState.tileSize + gameState.tileSize/2,
            1.5,
            (z - gameState.mapSize/2) * gameState.tileSize + gameState.tileSize/2
        );
        
        // Random rotation
        billboard.rotation.y = Math.random() * Math.PI * 2;
        
        gameState.scene.add(billboard);
    }
}

function moveCharacter3D(gameState) {
    const moveSpeed = gameState.player.speed;
    const rotateSpeed = 0.05;
    
    if (gameState.keys.w) {
        // Move forward in the direction character is facing
        gameState.player.z -= Math.cos(gameState.player.rotation) * moveSpeed;
        gameState.player.x += Math.sin(gameState.player.rotation) * moveSpeed;
    }
    if (gameState.keys.s) {
        // Move backward in the opposite direction character is facing
        gameState.player.z += Math.cos(gameState.player.rotation) * moveSpeed;
        gameState.player.x -= Math.sin(gameState.player.rotation) * moveSpeed;
    }
    if (gameState.keys.a) {
        // Rotate left
        gameState.player.rotation -= rotateSpeed;
    }
    if (gameState.keys.d) {
        // Rotate right
        gameState.player.rotation += rotateSpeed;
    }
    
    // Collision detection with walls
    const gridX = Math.floor((gameState.player.x + gameState.mapSize * gameState.tileSize / 2) / gameState.tileSize);
    const gridZ = Math.floor((gameState.player.z + gameState.mapSize * gameState.tileSize / 2) / gameState.tileSize);
    
    // Check if outside map bounds or hitting a wall
    if (gridX < 0 || gridX >= gameState.mapSize || gridZ < 0 || gridZ >= gameState.mapSize || gameState.map[gridZ][gridX] === 1) {
        // Revert movement if collision
        gameState.player.x = gameState.character3D.position.x;
        gameState.player.z = gameState.character3D.position.z;
    } else {
        // Update 3D character position
        gameState.character3D.position.x = gameState.player.x;
        gameState.character3D.position.z = gameState.player.z;
        gameState.character3D.rotation.y = gameState.player.rotation;
    }
}