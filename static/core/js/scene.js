// ===== صحنه‌ی سه‌بعدی پس‌زمینه =====
const canvasContainer = document.getElementById('scene-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

camera.position.z = 12;

// --- ستاره‌های پس‌زمینه ---
const starCount = 1500;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 60;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- ذرات طلایی نزدیک‌تر ---
const goldCount = 300;
const goldPositions = new Float32Array(goldCount * 3);
for (let i = 0; i < goldCount * 3; i++) {
    goldPositions[i] = (Math.random() - 0.5) * 20;
}
const goldGeometry = new THREE.BufferGeometry();
goldGeometry.setAttribute('position', new THREE.BufferAttribute(goldPositions, 3));
const goldMaterial = new THREE.PointsMaterial({ color: 0xD4A94D, size: 0.08, transparent: true, opacity: 0.9 });
const goldParticles = new THREE.Points(goldGeometry, goldMaterial);
scene.add(goldParticles);

// --- حلقه‌ی درخشان مرکزی ---
const ringGeometry = new THREE.TorusGeometry(3.2, 0.04, 16, 100);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xD4A94D, transparent: true, opacity: 0.85 });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.position.set(4, 0, -6);
scene.add(ring);

// هاله‌ی نور دور حلقه (با یه چندضلعی محو بزرگ‌تر پشت حلقه)
const glowGeometry = new THREE.TorusGeometry(3.2, 0.6, 16, 100);
const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xD4A94D, transparent: true, opacity: 0.06 });
const ringGlow = new THREE.Mesh(glowGeometry, glowMaterial);
ringGlow.position.copy(ring.position);
scene.add(ringGlow);

// --- چندوجهی‌های کوچیک شناور ---
const shapes = [];
for (let i = 0; i < 6; i++) {
    const geo = new THREE.IcosahedronGeometry(0.25, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xD4A94D, wireframe: true, transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10 - 3);
    scene.add(mesh);
    shapes.push(mesh);
}

// --- تعامل با موس و اسکرول ---
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

function animate() {
    requestAnimationFrame(animate);

    stars.rotation.y += 0.0003;
    goldParticles.rotation.y -= 0.0005;
    ring.rotation.z += 0.002;
    ringGlow.rotation.z += 0.002;

    shapes.forEach((s, i) => {
        s.rotation.x += 0.003 + i * 0.0005;
        s.rotation.y += 0.004;
    });

    camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.03;
    camera.position.z = 12 + scrollY * 0.01;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});