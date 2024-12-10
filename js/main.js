import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap'; // Ensure GSAP is installed in your project

// Create Scene and Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Create Camera and Controls
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50000);
camera.position.set(-6.85, -0.24, -1.38);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;

// GLTF Loader
const loader = new GLTFLoader();

let firstModel, secondModel;
let transitionInProgress = false;

// Define distinct positions for the models
const firstModelPosition = new THREE.Vector3(0, 0, 0);
const secondModelPosition = new THREE.Vector3(86, 0, 0);

// Save initial camera positions and control targets
const initialFirstModelCameraPos = new THREE.Vector3(-6.85, -0.24, -1.38);
const initialSecondModelCameraPos = new THREE.Vector3(82.32, 0.84, 13.81);

const initialFirstModelTarget = new THREE.Vector3(0, 0, 0);
const initialSecondModelTarget = new THREE.Vector3(86, 0, 0);

// Load Models
loader.load('model/shrine/scene.gltf', (gltf) => {
    firstModel = gltf.scene;
    scaleAndCenterModel(firstModel, firstModelPosition);
    scene.add(firstModel);
});

loader.load('model/sky/scene.gltf', (gltf) => {
    secondModel = gltf.scene;
    scaleAndCenterModel(secondModel, secondModelPosition);
    scene.add(secondModel);
});

// Scale and Center Model
function scaleAndCenterModel(model, position) {
    const bbox = new THREE.Box3().setFromObject(model);
    const size = bbox.getSize(new THREE.Vector3());
    const scaleFactor = 100 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scaleFactor);

    bbox.setFromObject(model);
    const center = bbox.getCenter(new THREE.Vector3());
    model.position.sub(center).add(position);
}

// Load Portal
let portal;
let currentPortalPosition = firstModelPosition.clone().add(new THREE.Vector3(1.3, -0.28, 1));

loader.load('model/portal/scene.gltf', (gltf) => {
    portal = gltf.scene;
    portal.scale.set(0.5, 0.5, 0.5);
    portal.rotation.y = Math.PI / 2;
    portal.position.copy(currentPortalPosition);
    scene.add(portal);

    const portalLight = new THREE.PointLight(0xffffff, 1, 10);
    portalLight.position.set(portal.position.x, portal.position.y + 2, portal.position.z);
    scene.add(portalLight);
});

// Rotation Variables
let isRotating = true;
let currentModel = 'first';

const firstModelRotationSpeed = 0.0003;
const firstModelRotationRadius = 10;

const secondModelRotationSpeed = 0.0003;
const secondModelRotationRadius = 9;

let isPortalActive = true;


// Stop and Start Rotation
function stopRotation() {
    isRotating = false;
}

function startRotation(model) {
    currentModel = model;
    isRotating = true;
}


// Show buttons for Model One and hide buttons for Model Two
function showButtonsForFirstModel() {
    document.getElementById('buttonsModelOne').style.display = 'flex';
    document.getElementById('buttonsModelTwo').style.display = 'none';
}

// Show buttons for Model Two and hide buttons for Model One
function showButtonsForSecondModel() {
    document.getElementById('buttonsModelOne').style.display = 'none';
    document.getElementById('buttonsModelTwo').style.display = 'flex';
}



function switchToSecondModel() {
    if (transitionInProgress) return;
    transitionInProgress = true;
    stopRotation();

    camera.position.copy(initialSecondModelCameraPos);
    controls.target.copy(initialSecondModelTarget);
    controls.update();

    portal.position.copy(secondModelPosition.clone().add(new THREE.Vector3(5, -3, 3)));
    portal.scale.set(2, 2, 2);
    portal.rotation.y = Math.PI * 2.5 / 4;
    currentPortalPosition.copy(portal.position);

    transitionInProgress = false;
    showButtonsForSecondModel(); // Show Model Two buttons
    startRotation('second');
}

function switchToFirstModel() {
    if (transitionInProgress) return;
    transitionInProgress = true;
    stopRotation();

    camera.position.copy(initialFirstModelCameraPos);
    controls.target.copy(initialFirstModelTarget);
    controls.update();

    portal.position.copy(firstModelPosition.clone().add(new THREE.Vector3(1.3, -0.28, 1)));
    portal.scale.set(0.5, 0.5, 0.5);
    portal.rotation.y = Math.PI / 2;
    currentPortalPosition.copy(portal.position);

    transitionInProgress = false;
    showButtonsForFirstModel(); // Show Model One buttons
    startRotation('first');
}

// Initialize with Model One buttons visible
showButtonsForFirstModel();



function createPortalInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function clickHandler(event) {
        if (transitionInProgress || !portal || !isPortalActive) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(portal, true);

        if (intersects.length > 0) {
            if (currentPortalPosition.equals(firstModelPosition.clone().add(new THREE.Vector3(1.3, -0.28, 1)))) {
                switchToSecondModel();
            } else {
                switchToFirstModel();
            }
        }
    }

    window.addEventListener('click', clickHandler);
}


createPortalInteraction();

// Add click event listeners to the new buttons
document.querySelectorAll('.glowing-button').forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.getAttribute('data-section');
        showInfoSection(sectionId);
    });
});

// Function to switch between project videos and descriptions
document.querySelectorAll('.project-button').forEach(button => {
    button.addEventListener('click', () => {
        const videoId = button.getAttribute('data-video');
        const descriptionId = button.getAttribute('data-description');

        // Hide all videos and descriptions
        document.querySelectorAll('.video-container').forEach(video => {
            video.style.display = 'none';
        });
        document.querySelectorAll('.project-description').forEach(desc => {
            desc.style.display = 'none';
        });

        // Show the selected video and description
        document.getElementById(videoId).style.display = 'block';
        document.getElementById(descriptionId).style.display = 'block';
    });
});




function showInfoSection(sectionId) {
    // Hide all sections first
    document.querySelectorAll('.info-section').forEach((section) => {
        section.style.display = 'none';
        section.style.opacity = 1; // Reset opacity to 1
    });

    // Show the selected section
    const infoContainer = document.getElementById('infoSections');
    infoContainer.style.display = 'block';

    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';

        // Disable portal only when the projects section is shown
        if (sectionId === 'projects') {
            isPortalActive = false;
        } else {
            isPortalActive = true; // Re-enable portal for other sections
        }

        // Handle the Reset section differently with a countdown
        if (sectionId === 'reset') {
            let countdown = 3;
            section.innerHTML = `<h2>try clicking the portal between the pillars... :) ${countdown}</h2>`;

            const countdownInterval = setInterval(() => {
                countdown -= 1;
                section.innerHTML = `<h2>try clicking the portal between the pillars... :) ${countdown}</h2>`;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    gsap.to(section, {
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            section.style.display = 'none';
                            infoContainer.style.display = 'none';
                        }
                    });
                }
            }, 1000);
        }

        // Handle the Back Home section with a countdown
        if (sectionId === 'backHome') {
            let countdown = 3;
            section.innerHTML = `<h2>return through the portal again :) ${countdown}</h2>`;

            const countdownInterval = setInterval(() => {
                countdown -= 1;
                section.innerHTML = `<h2>return through the portal again :) ${countdown}</h2>`;

                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    gsap.to(section, {
                        opacity: 0,
                        duration: 1,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            section.style.display = 'none';
                            infoContainer.style.display = 'none';
                        }
                    });
                }
            }, 1000);
        }
    }
}



// Animation Loop with Dynamic Rotation
function animate() {
    requestAnimationFrame(animate);

    if (isRotating) {
        const time = Date.now();

        if (currentModel === 'first') {
            camera.position.x = Math.sin(time * firstModelRotationSpeed) * firstModelRotationRadius;
            camera.position.z = Math.cos(time * firstModelRotationSpeed) * (firstModelRotationRadius * 0.8);
            camera.position.y = Math.sin(time * firstModelRotationSpeed * 0.5) * 2;
        } else if (currentModel === 'second') {
            camera.position.x = Math.sin(time * secondModelRotationSpeed) * secondModelRotationRadius + secondModelPosition.x;
            camera.position.z = Math.sin(time * secondModelRotationSpeed * 2) * (secondModelRotationRadius * 0.6) + secondModelPosition.z;
            camera.position.y = Math.cos(time * secondModelRotationSpeed * 0.5) * 3;
        }

        camera.lookAt(currentModel === 'first' ? firstModelPosition : secondModelPosition);
    }

    controls.update();
    renderer.render(scene, camera);
}



startRotation('first');
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
