import * as THREE from 'three';

// --- INITIALIZATION ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#bg'), 
    antialias: true, 
    alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D CONTENT ---
// Central Object (Torus Knot)
const coreGeo = new THREE.TorusKnotGeometry(10, 3, 120, 16);
const coreMat = new THREE.MeshStandardMaterial({ 
    color: 0x00f2ff, wireframe: true, transparent: true, opacity: 0.4 
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

// Starfield
const starCount = 2500;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
for(let i=0; i<starCount*3; i++) starPos[i] = (Math.random() - 0.5) * 450;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.15, color: 0xffffff }));
scene.add(stars);

// Grid Floor
const grid = new THREE.GridHelper(300, 40, 0x00f2ff, 0x050505);
grid.position.y = -25;
scene.add(grid);

// Lights
const pLight = new THREE.PointLight(0xffffff, 150);
pLight.position.set(20, 25, 10);
scene.add(pLight, new THREE.AmbientLight(0xffffff, 0.4));

camera.position.z = 50;

// --- INTERACTION LOGIC ---
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
    
    // Custom Cursor (Desktop only)
    if(window.innerWidth > 768) {
        gsap.to('#cursor', { x: e.clientX - 4, y: e.clientY - 4, duration: 0.1 });
        gsap.to('#cursor-blur', { x: e.clientX - 20, y: e.clientY - 20, duration: 0.4 });
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

// --- NAVIGATION ENGINE ---
window.nav = (id) => {
    // UI Update
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    navLinks.classList.remove('active'); // Close mobile menu

    // Camera Cinematic Movement
    const paths = {
        home: { x: 0, y: 0, z: 50, color: 0x00f2ff },
        about: { x: -25, y: 5, z: 30, color: 0xff00ff },
        skills: { x: 25, y: -5, z: 35, color: 0x00ff88 },
        contact: { x: 0, y: -10, z: 20, color: 0xffffff }
    };

    const p = paths[id];
    gsap.to(camera.position, { x: p.x, y: p.y, z: p.z, duration: 2, ease: "power3.inOut" });
    gsap.to(core.material.color, { 
        r: new THREE.Color(p.color).r, 
        g: new THREE.Color(p.color).g, 
        b: new THREE.Color(p.color).b, 
        duration: 1 
    });
};

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Constant Movement
    core.rotation.y += 0.002;
    grid.position.z += 0.2;
    if (grid.position.z > 7.5) grid.position.z = 0;

    // Mouse Parallax
    camera.position.x += (mouse.x * 15 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 15 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Global Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start Site
window.addEventListener('load', () => {
    gsap.to('#loader', { opacity: 0, duration: 1.5, delay: 0.5, onComplete: () => {
        document.getElementById('loader').style.display = 'none';
        animate();
    }});
});