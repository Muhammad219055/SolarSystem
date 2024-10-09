import * as THREE from 'three'
import gsap from 'gsap'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import './style.css'

//Texture loader
const textureLoader = new THREE.TextureLoader();




//Screen Sizes 
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

//scene
const scene = new THREE.Scene();

//Camera
const camera = new THREE.PerspectiveCamera(52.5, sizes.width/sizes.height, 0.1, 1000)
camera.position.set(10, 10, 300);
scene.add(camera)


//Star background
const addStarField = ()=>{
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

  const starCount = 1000;
  const starVertices = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -Math.random() * 2000; // Push stars farther into the scene
    starVertices.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStarField();


//Ambient light
const ambientLighting = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLighting);

//Sun
const sunGeometry = new THREE.SphereGeometry(150,64,64);
const sunTexture = textureLoader.load('/sunTexture.jpg');
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture
})
const sun = new THREE.Mesh(sunGeometry,sunMaterial);
gsap.to(sunMaterial, { emissiveIntensity: 2, duration: 2, yoyo: true, repeat: -1 });
scene.add(sun)

//Sun light
const sunLight = new THREE.PointLight(0xffffff, 1, 200000000, 0);
sunLight.position.set(0,0,0)
sunLight.castShadow = true;
scene.add(sunLight);



// Function to create a planet
const createPlanet = (geometry, texturePath, size, distance, rotationDuration, orbitDuration) => {
  const texture = textureLoader.load(texturePath);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(distance, 0, -10);
  gsap.timeline({ repeat: -1 }).to(planet.rotation, { y: 2 * Math.PI, duration: rotationDuration, ease: 'linear' });

  // Orbit animation
  gsap.timeline({ repeat: -1 }).to(planet.position, {
    x: `+=${distance * 2}`,
    y: `+=${distance * 2}`,
    duration: 10,
    ease: 'linear',
    modifiers: {
      x: (x) => distance * Math.cos(parseFloat(x) * (Math.PI / 180)),
      y: (y) => distance * Math.sin(parseFloat(y) * (Math.PI / 180)),
    },
  });
  console.log(planet.position)
  scene.add(planet);
  return planet;
};

// Mercury
const mercuryGeometry = new THREE.SphereGeometry(51, 64, 64);
createPlanet(mercuryGeometry, './mercuryTexture.jpg', 51, 261, 5068, 7603200);

// Venus
const venusGeometry = new THREE.SphereGeometry(55, 64, 64);
createPlanet(venusGeometry, './venusTexture.jpg', 55, 471, 20995, 19440000);

// Earth
const earthGeometry = new THREE.SphereGeometry(62, 64, 64);
createPlanet(earthGeometry, './earth_texture.jpg', 62, 650, 86.4, 31557600);





//Renderer
const canvas = document.querySelector('.WebGL');
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(sizes.width,sizes.height);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(2)
renderer.render(scene, camera);





//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = true; // Enable panning
controls.minDistance = 50; // Minimum distance to the camera
controls.maxDistance = 100000000000; // Maximum distance from the camera
// controls.target.set(0, 0, 100); 
// controls.update();






//Resizing 
window.addEventListener('resize', ()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight
  //Update camera;
  camera.aspect = sizes.width/sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
})

const loop = ()=>{
  controls.update()
  renderer.render(scene,camera)
  window.requestAnimationFrame(loop)
}
loop();


