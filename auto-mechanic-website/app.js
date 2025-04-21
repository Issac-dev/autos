// Ensure Three.js and GLTFLoader are loaded via CDN in index.html

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Transparent background
document.getElementById('model-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Load the model
const loader = new THREE.GLTFLoader();
let model;
loader.load('./models/lambo.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(1.0, 1.0, 1.0); // Increase size from 0.8 to 1.0
    model.position.set(-3.2, 0.2, 0); // Move up from 0 to 0.2 to align better with text

    // Super aggressive removal of black surfaces
    model.traverse((child) => {
        if (child.isMesh) {
            // Handle single materials
            if (child.material) {
                // Check for black color
                if (child.material.color && child.material.color.getHex() === 0x000000) {
                    child.visible = false;
                }
                // Make any shadow receiving surfaces transparent
                if (child.material.receiveShadow) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                }
                // Force transparency for ground-like objects
                if (child.name.toLowerCase().includes('ground') ||
                    child.name.toLowerCase().includes('shadow') ||
                    child.name.toLowerCase().includes('plane') ||
                    child.position.y < -0.4) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                }
            }

            // Handle multiple materials
            if (Array.isArray(child.material)) {
                child.material = child.material.map(mat => {
                    if (mat.color && mat.color.getHex() === 0x000000) {
                        mat.transparent = true;
                        mat.opacity = 0;
                    }
                    return mat;
                });
            }

            // Additional checks for shadow-related properties
            child.castShadow = false;
            child.receiveShadow = false;
        }
    });

    scene.add(model);
});

// Ensure renderer doesn't create shadows
renderer.shadowMap.enabled = false;

// Add interactivity
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', () => {
    isDragging = true;
});

renderer.domElement.addEventListener('mouseup', () => {
    isDragging = false;
});

renderer.domElement.addEventListener('mousemove', (event) => {
    if (isDragging && model) {
        const deltaMove = {
            x: event.offsetX - previousMousePosition.x,
            y: event.offsetY - previousMousePosition.y,
        };

        model.rotation.y += deltaMove.x * 0.005;
        model.rotation.x += deltaMove.y * 0.005;
    }

    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY,
    };
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the model continuously
    if (model) {
        model.rotation.y += 0.005; // Slow down the rotation speed
    }

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Remove or comment out the navbar scroll effect code
// document.addEventListener('DOMContentLoaded', () => {
//     const navbar = document.querySelector('.navbar');
//     const heroSection = document.querySelector('#hero');
//     ...
// });