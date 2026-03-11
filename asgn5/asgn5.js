/*  
    Followed these tutorials: 
    SETTING UP THE SCENE: https://threejs.org/manual/#en/fundamentals
    TEXTURES: https://threejs.org/manual/#en/textures
*/

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

function main(){
    const canvas = document.querySelector('#c');

    // WINDOW SIZE
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    // RENDERER
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(sizes.width, sizes.height);

     // CAMERA
    const fov = 75;
    const aspect = sizes.width / sizes.height;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // SCENE
    const scene = new THREE.Scene();

    // RESIZE HANDLER
    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        // Update camera
        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(sizes.width, sizes.height);
    });

    // GEOMETRY
    const boxWidth = 0.5;
    const boxHeight = 0.5;
    const boxDepth = 0.5;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // LIGHTING
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // LOAD MANAGER
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    // LOAD UI
    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem ? loadingElem.querySelector('.progressbar') : null;

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        if (progressBarElem) {
            progressBarElem.style.transform = `scaleX(${progress})`;
        }
    };

    loadManager.onLoad = () => {
        if (loadingElem) {
            loadingElem.style.display = 'none';
        }
    };

    // TEXTURE
    const texture = loader.load('textures/pink.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set(2, 2);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshPhongMaterial({
        map: texture,
    });

    const materials = [
        new THREE.MeshBasicMaterial({map: loader.load('textures/pink.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/pink2.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/pink3.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/pink4.png')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/pink5.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/pink6.jpg')}),
    ];


    // CUBES
    const cubes = [
        makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, 1),
        makeInstance(geometry, 0xaa8844,  -1),
        makeTexturedInstance(geometry, material, 2),
    ];

    // Once all textures load, add the multi-textured cube
    loadManager.onLoad = () => {
        if (loadingElem) {
            loadingElem.style.display = 'none';
        }
        const cube = makeTexturedInstance(geometry, materials, -2);
        cubes.push(cube);
    };


    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
        
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        
        cube.position.x = x;
        
        return cube;
    }

    function makeTexturedInstance(geometry, material, x) {
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        
        cube.position.x = x;
        
        return cube;
    }
    
    // ANIMATION LOOP
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });;
        
        renderer.render(scene, camera);
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
main();