// Globe and data visualization logic
let scene, camera, renderer, globe, dataPoints = [];

// Initialize Three.js scene
function initGlobe() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("globe-container").appendChild(renderer.domElement);

    // Add globe
    const geometry = new THREE.SphereGeometry(2, 50, 50);
    const texture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/textures/land_ocean_ice_cloud_2048.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Rotate animation
    animate();
}

// Animate the globe
function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.002;
    renderer.render(scene, camera);
}

// Add data points
function addDataPoints(data) {
    const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    data.forEach(d => {
        const lat = parseFloat(d.latitude);
        const lon = parseFloat(d.longitude);
        const time = d.time;

        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        point.position.set(
            2 * Math.sin(phi) * Math.cos(theta),
            2 * Math.cos(phi),
            2 * Math.sin(phi) * Math.sin(theta)
        );
        point.userData = { time };
        dataPoints.push(point);
        scene.add(point);
    });
}

// Filter points based on the slider value
function updatePointsByTime(currentTime) {
    dataPoints.forEach(point => {
        point.visible = point.userData.time <= currentTime;
    });
}

// Load CSV and initialize everything
d3.csv('data.csv').then(data => {
    initGlobe();
    addDataPoints(data);

    // Setup time slider
    const slider = document.getElementById('time-slider');
    const label = document.getElementById('time-label');
    const times = Array.from(new Set(data.map(d => d.time))).sort();

    slider.max = times.length - 1;
    slider.addEventListener('input', () => {
        const time = times[slider.value];
        label.textContent = `Time: ${time}`;
        updatePointsByTime(time);
    });
});
