import * as THREE from 'three'
import gsap from 'gsap'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import './style.css'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import planetsInfo from './planetsInfo';

//Texture loader
const textureLoader = new THREE.TextureLoader();

// planet array
const planets =[];


//Screen Sizes 
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

//scene
const scene = new THREE.Scene();

//Camera
const camera = new THREE.PerspectiveCamera(52.5, sizes.width/sizes.height, 0.1, 1000000)
camera.position.set(0, 0, 1000);
scene.add(camera)

// Camera 2
const c2 = new THREE.PerspectiveCamera(52.5, sizes.width/sizes.height, 0.1, 10000000)
c2.position.set(10,0,1000)
scene.add(c2)



//Star background
const addStarField = ()=>{
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

  const starCount = 10000;
  const starVertices = [];

  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 20000;
    const y = (Math.random() - 0.5) * 20000;
    const z = Math.random() > 0.5 ? Math.random() * 20000 : -Math.random() * 20000;
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
const sunTexture = textureLoader.load('/Textures/sunTexture.jpg');
const sunMaterial = new THREE.MeshStandardMaterial({
  map: sunTexture,
  emissive: new THREE.Color(0xffa500),
  emissiveIntensity: 0.5, 
  emissiveMap: sunTexture
})
const sun = new THREE.Mesh(sunGeometry,sunMaterial);
scene.add(sun)

//Sun light
const sunLight = new THREE.PointLight(0xffffff, 1, 200000000, 0);
sunLight.position.set(0,0,0)
sunLight.castShadow = true;
scene.add(sunLight);



// Function to create a planet
const createPlanet = (geometry, texturePath, size, distance, rotationDuration, orbitDuration, name) => {
  const texture = textureLoader.load(texturePath);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const planet = new THREE.Mesh(geometry, material);
  planet.position.set(distance, 0, -10);
  planet.name = name;
  gsap.timeline({ repeat: -1 }).to(planet.rotation, { y: 2 * Math.PI, duration: rotationDuration, ease: 'linear' });



  let angle = 0;
  gsap.timeline({ repeat: -1 }).to({}, {
    duration: orbitDuration,
    ease: 'linear',
    onUpdate: () => {
      angle += (2 * Math.PI) / (orbitDuration * 60); 
      if (angle > 2 * Math.PI) angle = 0; 
      planet.position.x = distance * Math.cos(angle); 
      planet.position.z = distance * Math.sin(angle); 
      // console.log(planet.position)
    },
  });
  
  // console.log(planet.position)
  scene.add(planet);
  planets.push(planet)
  return planet;
};

// Mercury
const mercuryGeometry = new THREE.SphereGeometry(51, 64, 64);
createPlanet(mercuryGeometry, './Textures/mercuryTexture.jpg', 51, 261, 5068, 76, 'Mercury');

// Venus
const venusGeometry = new THREE.SphereGeometry(55, 64, 64);
createPlanet(venusGeometry, './Textures/venusTexture.jpg', 55, 471, 20995, 194.4, 'Venus');

// Earth
const earthGeometry = new THREE.SphereGeometry(62, 64, 64);
createPlanet(earthGeometry, './Textures/earth_texture.jpg', 62, 650, 86.4, 315.5, 'Earth');

// Mars 
const marsGeometry = new THREE.SphereGeometry(60, 64,64);
createPlanet(marsGeometry, './Textures/marsTexture.jpg', 60, 912, 88.6, 593, 'Mars')

//Jupiter 
const jupiterGemoetry = new THREE.SphereGeometry(80,64,64);
createPlanet(jupiterGemoetry, './Textures/jupitarTexture.jpg', 80, 1200, 35.725, 3743.3, 'Jupiter')

// Saturn
const saturnGeometry = new THREE.SphereGeometry(75, 64, 64);
const saturn = createPlanet(saturnGeometry, './Textures/saturnTexture.jpg', 75, 1600, 35.725, 9294, 'Saturn');

// Saturn ring
const saturnRingGeometry = new THREE.RingGeometry(80, 90, 30, 30);
const saturnRingMaterial = new THREE.MeshStandardMaterial({
  map: textureLoader.load('./Textures/saturnRingTexture.jpg'),
  side: THREE.DoubleSide 
});
const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
saturnRing.rotation.x = Math.PI / 3; 
saturn.add(saturnRing);

// Uranus
const uranusGeometry = new THREE.SphereGeometry(65,64,64);
createPlanet(uranusGeometry, './Textures/uranusTexture.jpg', 65,1900 ,17.24, 26374,'Uranus');

// Neptune
const neptuneGeometry = new THREE.SphereGeometry(62,64,64);
createPlanet(neptuneGeometry, './Textures/neptuneTexture.jpg', 65, 2100, 16.02, 51836,'Neptune');


//Renderer
const canvas = document.querySelector('.WebGL');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(sizes.width,sizes.height);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(2)
renderer.render(scene, camera);





//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = true; 
controls.minDistance = 100 // Minimum distance to the camera
controls.maxDistance = 10000; // Maximum distance from the camera
controls.target.set(0, 0, 0); 
controls.update();






//Resizing 
window.addEventListener('resize', ()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight
  //Update camera;
  camera.aspect = sizes.width/sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
})

// Bloom for sun
// Post-processing Bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  1, // Bloom strength
  0.4, // Bloom radius
  0.1 // Bloom threshold
);
composer.addPass(bloomPass);

// Click planet functionality

// raycaster & mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2()

// Variable to store the currently selected planet
let selectedPlanet = null;
// extra variables
let detailedInfo = false;
// Function to convert 3D position to 2D screen coordinates
const toScreenPosition = (obj, camera) => {
  const vector = new THREE.Vector3();
  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  vector.project(camera);

  const x = (vector.x * 0.5 + 0.5) * sizes.width;
  const y = -(vector.y * 0.5 - 0.5) * sizes.height;
  return { x, y };
};

// Event listener for click
window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets, true);

  if (intersects.length > 0) {
    const clickedPlanet = intersects[0].object;
    selectedPlanet = clickedPlanet; // Store the selected planet
    const planetInfoPopUp = document.querySelector('.planet-info');
    const clickedPlanetName = clickedPlanet.name.trim();
    planetInfoPopUp.innerHTML = `<h5>${clickedPlanetName}</h5>`;
    const closeButton = document.createElement('button')
    closeButton.textContent = 'X';
    planetInfoPopUp.appendChild(closeButton)
    closeButton.addEventListener('click', ()=>{
      planetInfoPopUp.style.display = 'none'
    })
    closeButton.classList.add('close-button')
    const infoAboutPlanet = document.createElement('p');
    infoAboutPlanet.textContent = planetsInfo[clickedPlanetName] || 'Information not available.';
    planetInfoPopUp.appendChild(infoAboutPlanet);
    const readMore = document.createElement('button');
    readMore.innerText = 'Read More';
    planetInfoPopUp.appendChild(readMore);
    readMore.classList.add('read-more-button');
    readMore.addEventListener('click', ()=>{
      detailedInfo = true;
    })
    planetInfoPopUp.style.display = 'flex';
  }
});

// Update the planet-info position in the render loop
const updatePopupPosition = () => {
  if (selectedPlanet) {
    const planetInfoPopUp = document.querySelector('.planet-info');
    
    const screenPosition = toScreenPosition(selectedPlanet, camera);

    const verticalPosition = screenPosition.y -70
    planetInfoPopUp.style.left = `${screenPosition.x}px`;
    planetInfoPopUp.style.top = `${verticalPosition}px`;
  }
};

const loop = () => {
  controls.update();
  composer.render(); 

  // Update the popup position if a planet is selected
  updatePopupPosition();

  window.requestAnimationFrame(loop);
};
loop();
