// ===== صحنه‌ی سه‌بعدی پس‌زمینه =====
const canvasContainer = document.getElementById('scene-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

camera.position.z = 12;

// ===== توابع ساخت بافت =====
function createGlowTexture(color) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

// بافت باندی جزئیات‌دار برای حلقه‌ی پهن (با نویز ریز شبیه ذرات یخ/سنگ)
function createRingBandTexture() {
    const width = 512;
    const height = 64;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // گرادیانت پایه (شعاعی -> تبدیل به افقی چون همین محور رو به شعاع نگاشت می‌کنیم)
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0.00, 'rgba(212, 169, 77, 0)');
    gradient.addColorStop(0.08, 'rgba(212, 169, 77, 0.5)');
    gradient.addColorStop(0.16, 'rgba(240, 217, 160, 0.15)');
    gradient.addColorStop(0.24, 'rgba(212, 169, 77, 0.65)');
    gradient.addColorStop(0.34, 'rgba(207, 232, 255, 0.2)');
    gradient.addColorStop(0.42, 'rgba(183, 156, 232, 0.35)');
    gradient.addColorStop(0.50, 'rgba(212, 169, 77, 0.7)');
    gradient.addColorStop(0.58, 'rgba(240, 217, 160, 0.15)');
    gradient.addColorStop(0.68, 'rgba(212, 169, 77, 0.55)');
    gradient.addColorStop(0.78, 'rgba(207, 232, 255, 0.25)');
    gradient.addColorStop(0.88, 'rgba(212, 169, 77, 0.4)');
    gradient.addColorStop(1.00, 'rgba(212, 169, 77, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // نویز ریز روی کل باند برای حس دونه‌دونگی طبیعی (نه صاف مصنوعی)
    const imgData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        imgData.data[i] = Math.max(0, Math.min(255, imgData.data[i] + noise));
        imgData.data[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + noise));
        imgData.data[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// ===== ساخت هندسه‌ی حلقه با نگاشت بافت شعاعی درست =====
function createPlanetRingGeometry(innerRadius, outerRadius, segments) {
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // رأس داخلی (نزدیک مرکز)
        positions.push(innerRadius * cosT, innerRadius * sinT, 0);
        uvs.push(0, i / segments * 4);

        // رأس بیرونی (لبه‌ی حلقه)
        positions.push(outerRadius * cosT, outerRadius * sinT, 0);
        uvs.push(1, i / segments * 4);
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
        indices.push(a, b, c);
        indices.push(b, d, c);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    return geometry;
}

// ===== مه کهکشانی رنگی =====
const nebulaTexturePurple = createGlowTexture('rgba(107, 70, 193, 0.5)');
const nebulaTextureBlue = createGlowTexture('rgba(58, 98, 193, 0.4)');

function createNebulaCloud(texture, x, y, z, scale) {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale, 1);
    return sprite;
}

const nebulaClouds = [
    createNebulaCloud(nebulaTexturePurple, 8, 3, -20, 22),
    createNebulaCloud(nebulaTextureBlue, -10, -4, -25, 18),
    createNebulaCloud(nebulaTexturePurple, -4, 6, -30, 20),
];
nebulaClouds.forEach(c => scene.add(c));

// ===== ستاره‌های چشمک‌زن =====
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

const starGeometry2 = new THREE.BufferGeometry();
const starPositions2 = new Float32Array(800 * 3);
for (let i = 0; i < 800 * 3; i++) {
    starPositions2[i] = (Math.random() - 0.5) * 60;
}
starGeometry2.setAttribute('position', new THREE.BufferAttribute(starPositions2, 3));
const starMaterial2 = new THREE.PointsMaterial({ color: 0xF0D9A0, size: 0.04, transparent: true, opacity: 0.4 });
const stars2 = new THREE.Points(starGeometry2, starMaterial2);
scene.add(stars2);

// ===== ذرات طلایی پراکنده =====
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

// ===== لایه‌ی غبار جلوی دوربین =====
const dustCount = 150;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 16;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    dustPositions[i * 3 + 2] = Math.random() * 4 + 5;
}
const dustGeometry = new THREE.BufferGeometry();
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMaterial = new THREE.PointsMaterial({ color: 0xF0D9A0, size: 0.035, transparent: true, opacity: 0.5 });
const dustParticles = new THREE.Points(dustGeometry, dustMaterial);
scene.add(dustParticles);

// ===== سیاره‌ی مداری (Armillary Planet) =====
const armillaryGroup = new THREE.Group();
armillaryGroup.position.set(-9, 0.3, -11);
armillaryGroup.scale.set(2, 2, 2);
scene.add(armillaryGroup);

// ----- هسته‌ی نورانی -----
const coreSolidGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const coreSolidMaterial = new THREE.MeshBasicMaterial({ color: 0xFFF6E0, transparent: true, opacity: 0.9 });
const coreSolid = new THREE.Mesh(coreSolidGeometry, coreSolidMaterial);
armillaryGroup.add(coreSolid);

const coreGlowTexture = createGlowTexture('rgba(212, 169, 77, 0.9)');
const coreGlowMaterial = new THREE.SpriteMaterial({ map: coreGlowTexture, transparent: true, depthWrite: false });
const core = new THREE.Sprite(coreGlowMaterial);
core.scale.set(3.4, 3.4, 1);
armillaryGroup.add(core);

const coreGlowOuterTexture = createGlowTexture('rgba(240, 217, 160, 0.4)');
const coreGlowOuterMaterial = new THREE.SpriteMaterial({ map: coreGlowOuterTexture, transparent: true, depthWrite: false });
const coreGlowOuter = new THREE.Sprite(coreGlowOuterMaterial);
coreGlowOuter.scale.set(5.4, 5.4, 1);
armillaryGroup.add(coreGlowOuter);

const sparkCount = 30;
const sparkPositions = new Float32Array(sparkCount * 3);
for (let i = 0; i < sparkCount; i++) {
    const r = 0.75 + Math.random() * 0.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    sparkPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    sparkPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    sparkPositions[i * 3 + 2] = r * Math.cos(phi);
}
const sparkGeometry = new THREE.BufferGeometry();
sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
const sparkMaterial = new THREE.PointsMaterial({ color: 0xFFF6E0, size: 0.05, transparent: true, opacity: 0.9 });
const coreSparks = new THREE.Points(sparkGeometry, sparkMaterial);
armillaryGroup.add(coreSparks);

// ----- چهار حلقه‌ی نازک مداری -----
function createOrbitRing(radius, tube, color, opacity) {
    const geo = new THREE.TorusGeometry(radius, tube, 12, 100);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
    return new THREE.Mesh(geo, mat);
}

const ringA = createOrbitRing(3.0, 0.03, 0xD4A94D, 0.85);
ringA.rotation.x = Math.PI / 2.2;
armillaryGroup.add(ringA);

const ringB = createOrbitRing(3.6, 0.02, 0xF0D9A0, 0.55);
ringB.rotation.x = Math.PI / 5;
ringB.rotation.y = Math.PI / 3;
armillaryGroup.add(ringB);

const ringC = createOrbitRing(2.5, 0.015, 0xCFE8FF, 0.4);
ringC.rotation.y = Math.PI / 2.5;
ringC.rotation.z = Math.PI / 6;
armillaryGroup.add(ringC);

const ringD = createOrbitRing(4.2, 0.012, 0xB79CE8, 0.3);
ringD.rotation.x = Math.PI / 3.2;
ringD.rotation.z = Math.PI / 4;
armillaryGroup.add(ringD);

// ----- حلقه‌ی پهن به‌سبک زحل (با نگاشت بافت شعاعی درست) -----
const ringWidePivot = new THREE.Group();
ringWidePivot.rotation.x = 0.45;
armillaryGroup.add(ringWidePivot);

const ringWideTexture = createRingBandTexture();
const ringWideGeometry = createPlanetRingGeometry(4.8, 7.4, 128);
const ringWideMaterial = new THREE.MeshBasicMaterial({
    map: ringWideTexture,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: 0.95,
    depthWrite: false
});
const ringWide = new THREE.Mesh(ringWideGeometry, ringWideMaterial);
ringWidePivot.add(ringWide);

// یه هاله‌ی نور خیلی ظریف زیر حلقه‌ی پهن برای عمق بیشتر
const ringGlowUnderTexture = createGlowTexture('rgba(212, 169, 77, 0.15)');
const ringGlowUnderMaterial = new THREE.SpriteMaterial({ map: ringGlowUnderTexture, transparent: true, depthWrite: false });
const ringGlowUnder = new THREE.Sprite(ringGlowUnderMaterial);
ringGlowUnder.scale.set(15, 15, 1);
ringWidePivot.add(ringGlowUnder);

// ----- دونه‌های نورانی جواهرمانند رو مسیر ringA -----
const beadTexture = createGlowTexture('rgba(255, 246, 224, 1)');
const beadColors = [0xD4A94D, 0xCFE8FF, 0xB79CE8, 0xFFFFFF];
const beads = [];
const beadCount = 10;

for (let i = 0; i < beadCount; i++) {
    const angle = (i / beadCount) * Math.PI * 2;
    const mat = new THREE.SpriteMaterial({
        map: beadTexture,
        color: beadColors[i % beadColors.length],
        transparent: true,
        depthWrite: false
    });
    const bead = new THREE.Sprite(mat);
    bead.scale.set(0.35, 0.35, 1);
    bead.position.set(Math.cos(angle) * 3.0, Math.sin(angle) * 3.0, 0);
    beads.push(bead);
}

const beadsPivot = new THREE.Group();
beadsPivot.rotation.copy(ringA.rotation);
beads.forEach(b => beadsPivot.add(b));
armillaryGroup.add(beadsPivot);

// ----- ماه‌واره‌های نامنظم دور کره -----
const moons = [];

function createMoon(orbitRadius, size, speed, tiltX, tiltY, colorHex, ShapeGeo) {
    const geo = new ShapeGeo(size, 0);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true, transparent: true, opacity: 0.75 });
    const mesh = new THREE.Mesh(geo, mat);

    const pivot = new THREE.Group();
    pivot.rotation.set(tiltX, tiltY, 0);
    mesh.position.set(orbitRadius, 0, 0);
    pivot.add(mesh);
    armillaryGroup.add(pivot);

    moons.push({ pivot, mesh, speed });
}

createMoon(3.0, 0.15, 0.006, Math.PI / 2.2, 0, 0xD4A94D, THREE.TetrahedronGeometry);
createMoon(3.6, 0.11, -0.004, Math.PI / 5, Math.PI / 3, 0xF0D9A0, THREE.OctahedronGeometry);
createMoon(2.5, 0.09, 0.005, 0, Math.PI / 2.5, 0xCFE8FF, THREE.DodecahedronGeometry);
createMoon(4.2, 0.1, -0.0035, Math.PI / 3.2, Math.PI / 4, 0xB79CE8, THREE.TetrahedronGeometry);

// ===== چندوجهی‌های ریز شناور در کل صحنه =====
const shapes = [];
for (let i = 0; i < 6; i++) {
    const geo = new THREE.IcosahedronGeometry(0.25, 0);
    const mat = new THREE.MeshBasicMaterial({ color: 0xD4A94D, wireframe: true, transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10 - 3);
    scene.add(mesh);
    shapes.push(mesh);
}

// ===== شهاب‌سنگ‌های در حال عبور =====
const shootingStars = [];

function spawnShootingStar() {
    const startX = -20 + Math.random() * 10;
    const startY = 8 + Math.random() * 5;
    const startZ = -10 + Math.random() * 10;

    const points = [];
    for (let i = 0; i < 8; i++) {
        points.push(new THREE.Vector3(startX - i * 0.3, startY + i * 0.15, startZ));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);

    shootingStars.push({
        line,
        velocity: new THREE.Vector3(0.35, -0.18, 0),
        life: 0,
        maxLife: 60
    });
}

setInterval(() => {
    if (Math.random() > 0.4) spawnShootingStar();
}, 3000);

// ===== تعامل با موس و اسکرول =====
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    starMaterial.opacity = 0.5 + Math.sin(elapsed * 0.8) * 0.15;
    starMaterial2.opacity = 0.3 + Math.sin(elapsed * 1.3 + 2) * 0.15;
    stars.rotation.y += 0.0003;
    stars2.rotation.y -= 0.0002;
    goldParticles.rotation.y -= 0.0005;

    nebulaClouds.forEach((cloud, i) => {
        cloud.material.rotation += 0.0004 * (i % 2 === 0 ? 1 : -1);
    });

    const pulse = 1 + Math.sin(elapsed * 1.2) * 0.1;
    core.scale.set(3.4 * pulse, 3.4 * pulse, 1);
    coreGlowOuter.scale.set(
        5.4 * (1 + Math.sin(elapsed * 0.9 + 1) * 0.07),
        5.4 * (1 + Math.sin(elapsed * 0.9 + 1) * 0.07),
        1
    );
    coreSolid.rotation.y += 0.004;
    coreSparks.rotation.y += 0.0015;
    coreSparks.rotation.x += 0.001;

    ringA.rotation.z += 0.004;
    ringB.rotation.z -= 0.0025;
    ringC.rotation.z += 0.0032;
    ringD.rotation.z -= 0.0018;
    beadsPivot.rotation.z += 0.004;

    ringWide.rotation.z += 0.0006;

    armillaryGroup.rotation.y += 0.0006;

    moons.forEach(m => {
        m.pivot.rotation.z += m.speed;
        m.mesh.rotation.x += 0.02;
        m.mesh.rotation.y += 0.015;
    });

    shapes.forEach((s, i) => {
        s.rotation.x += 0.003 + i * 0.0005;
        s.rotation.y += 0.004;
    });

    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.line.position.add(s.velocity);
        s.life++;
        s.line.material.opacity = 0.8 * (1 - s.life / s.maxLife);
        if (s.life >= s.maxLife) {
            scene.remove(s.line);
            shootingStars.splice(i, 1);
        }
    }

    dustParticles.position.x = mouseX * 0.6;
    dustParticles.position.y = -mouseY * 0.4;

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