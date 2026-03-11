/*  
    Followed these tutorials: 
    SETTING UP THE SCENE: https://threejs.org/manual/#en/fundamentals
    TEXTURES: https://threejs.org/manual/#en/textures
    OBJECTS: https://threejs.org/manual/#en/load-obj
    LIGHTS: https://threejs.org/manual/#en/lights 
    BACKGROUNDS: https://threejs.org/manual/#en/backgrounds 
*/

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

function main(){
    const canvas = document.querySelector('#c');

    // RENDERER
    const renderer = new THREE.WebGLRenderer( { antialias: true, canvas, logarithmicDepthBuffer: true } );
    renderer.physicallyCorrectLights = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFShadowMap;

     // CAMERA
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //camera.position.z = 2;
    camera.position.set(0, 10, 20);

    // CONTROLS
    const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 5, 0);
	controls.update();

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1028); // deep night blue

    // OBJECT LOADER
    const objLoader = new OBJLoader();

    const benchX = 0;
    const benchZ = 0;
    const planetRadius = 20;

    // MTL LOADER (BENCH)
    const mtlLoader = new MTLLoader();
    mtlLoader.load('objects/bench/bench.mtl', (mtl) => {
        mtl.preload();
        objLoader.setMaterials(mtl);
        objLoader.load('objects/bench/bench.obj', (root) => {
            root.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry.index) {
                        child.geometry = child.geometry.toNonIndexed();
                    }
                    const oldMat = child.material;
                    child.material = new THREE.MeshStandardMaterial({
                        map: oldMat.map || null,
                        color: oldMat.color || 0xffffff,
                        metalness: 0.1,
                        roughness: 0.4,
                        normalMap: oldMat.normalMap || null,
                        aoMap: oldMat.aoMap || null,
                        emissive: oldMat.emissive || 0x000000,
                        emissiveMap: oldMat.emissiveMap || null,
                        side: THREE.DoubleSide
                    });
                    child.material.needsUpdate = true;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            placeOnPlanet(root, benchX, benchZ, planetRadius);
            root.rotation.y = -Math.PI / 2;
            // Recompute normals after all transforms
            root.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeVertexNormals();
                }
            });
            scene.add(root);
        });
    });


    // STREET LAMP LOADER
    const lampMtlLoader = new MTLLoader();
    lampMtlLoader.load('objects/street-lamp/Street_Lamp.mtl', (mtl) => {
        mtl.preload();
        const lampObjLoader = new OBJLoader();
        lampObjLoader.setMaterials(mtl);
        const lampOffset = 1.3;
        lampObjLoader.load('objects/street-lamp/Street Lamp.obj', (root) => {
            root.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry.index) {
                        child.geometry = child.geometry.toNonIndexed();
                    }
                    const oldMat = child.material;
                    child.material = new THREE.MeshStandardMaterial({
                        map: oldMat.map || null,
                        color: oldMat.color || 0xffffff,
                        metalness: 0.7,
                        roughness: 0.15,
                        normalMap: oldMat.normalMap || null,
                        aoMap: oldMat.aoMap || null,
                        emissive: oldMat.emissive || 0x000000,
                        emissiveMap: oldMat.emissiveMap || null,
                        side: THREE.DoubleSide
                    });
                    child.material.needsUpdate = true;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
            const scale = 5 / maxDim;
            root.scale.multiplyScalar(scale);
            placeOnPlanet(root, benchX - lampOffset, benchZ + 0.2, planetRadius);
            const normal = root.position.clone().sub(new THREE.Vector3(0, -planetRadius, 0)).normalize();
            root.position.add(normal.multiplyScalar(-0.05));

            scene.add(root);

            // LIGHTING
            const lampLight = new THREE.SpotLight(0xfff7b2, 1000, 60, Math.PI/8, 0.7);
            lampLight.castShadow = true;
            lampLight.decay = 2;
            lampLight.distance = 60;
            lampLight.intensity = 40;
            lampLight.penumbra = 0.7;

            // Find the top of the lamp
            const lampBoxWorld = new THREE.Box3().setFromObject(root);
            const lampCenter = new THREE.Vector3();
            lampBoxWorld.getCenter(lampCenter);
            const lampTop = new THREE.Vector3(lampCenter.x, lampBoxWorld.max.y, lampCenter.z);

            // Offset the spotlight to the right to be above the bench
            const lampRight = new THREE.Vector3(1, 0, 0);
            lampRight.applyQuaternion(root.quaternion);
            const offsetAmount = 0.8;
            const lightPos = lampTop.clone().add(lampRight.multiplyScalar(offsetAmount));
            lampLight.position.copy(lightPos);

            const lampDown = new THREE.Vector3(0, -1, 0);
            lampDown.applyQuaternion(root.quaternion);

            const targetPos = lightPos.clone().add(lampDown.multiplyScalar(3));
            lampLight.target.position.copy(targetPos);
            scene.add(lampLight.target);
            scene.add(lampLight);
        });
    });


    // PLACE OBJECT ON PLANET
    function placeOnPlanet(object, x, z, radius) {
        const centerY = -radius;
        const y = centerY + Math.sqrt(radius * radius - x * x - z * z);
        object.position.set(x, y, z);
        const normal = new THREE.Vector3(x, y - centerY, z).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        object.setRotationFromQuaternion(quaternion);
        const box = new THREE.Box3().setFromObject(object);
        const bottomOffset = -box.min.y;
        object.position.add(normal.multiplyScalar(bottomOffset - 0.02));
    }

    // PLANET (SPHERE)
    // Moon position (top right in sky)
    const moonPos = new THREE.Vector3(25, 25, 10);
    {
        const sphereRadius = 20;

		// const loader = new THREE.TextureLoader();
		// const texture = loader.load( 'textures/grass.jpg' );
		// texture.colorSpace = THREE.SRGBColorSpace;
		// texture.wrapS = THREE.RepeatWrapping;
		// texture.wrapT = THREE.RepeatWrapping;
		// texture.magFilter = THREE.LinearFilter;
		// texture.minFilter = THREE.LinearMipmapLinearFilter;

		// const repeats = 4;
		// texture.repeat.set( repeats, repeats );
        // texture.offset.set(0, 0.25);

		// const sphereGeo = new THREE.SphereGeometry( sphereRadius, 256, 256 );
		// const planeMat = new THREE.MeshPhongMaterial( {
		// 	map: texture,
		// } );
		// const mesh = new THREE.Mesh( sphereGeo, planeMat );
		// mesh.position.y = -sphereRadius;
		// scene.add( mesh );

        const material = new THREE.MeshStandardMaterial({color: 0x114f06, roughness: 1, metalness: 0});
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
        const mesh = new THREE.Mesh(sphereGeo, material);
        mesh.position.y = -sphereRadius;
        mesh.receiveShadow = true;
        scene.add(mesh);
        // Add a glowing moon sphere at the top right (always visible)
        const moonGeo = new THREE.SphereGeometry(3, 48, 48);
        const moonMat = new THREE.MeshStandardMaterial({
            color: 0xfafaff,
            emissive: 0xffffff,
            emissiveIntensity: 2.5,
            roughness: 0.3,
            metalness: 0.0
        });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.copy(moonPos);
        scene.add(moon);

	}

    // LIGHTING
  
    // GEOMETRY
    const boxWidth = 0.5;
    const boxHeight = 0.5;
    const boxDepth = 0.5;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // LOAD MANAGER
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);
    // Define texture before any use
    const texture = loader.load('textures/pink.jpg');

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

    // LIGHTING (night)
    const ambientLight = new THREE.AmbientLight(0x223355, 0.08);
    scene.add(ambientLight);
    // Moonlight: bluish-white directional light from the moon
    const moonLight = new THREE.DirectionalLight(0xbbeeff, 0.7);
    moonLight.position.copy(moonPos);
    moonLight.target.position.set(0, 0, 0); // Point at world center
    scene.add(moonLight.target);
    moonLight.castShadow = true;
    scene.add(moonLight);
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.repeat.set(2, 2);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.8
    });

    const materials = [
        new THREE.MeshStandardMaterial({map: loader.load('textures/pink.jpg'), color: 0xffffff, metalness: 0.1, roughness: 0.8}),
        new THREE.MeshStandardMaterial({map: loader.load('textures/pink2.jpg'), color: 0xffffff, metalness: 0.1, roughness: 0.8}),
        new THREE.MeshStandardMaterial({map: loader.load('textures/pink3.jpg'), color: 0xffffff, metalness: 0.1, roughness: 0.8}),
        new THREE.MeshStandardMaterial({map: loader.load('textures/pink4.png'), color: 0xffffff, metalness: 0.1, roughness: 0.8}),
        new THREE.MeshStandardMaterial({map: loader.load('textures/pink5.jpg'), color: 0xffffff, metalness: 0.1, roughness: 0.8}),
        new THREE.MeshStandardMaterial({map: loader.load('textures/pink6.jpg'), color: 0xffffff, metalness: 0.1, roughness: 0.8}),
    ];


    // CUBES
    const cubes = [
        makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, 1),
        makeInstance(geometry, 0xaa8844,  -1),
        makeTexturedInstance(geometry, material, 2),
    ];

    loadManager.onLoad = () => {
        if (loadingElem) {
            loadingElem.style.display = 'none';
        }
        const cube = makeTexturedInstance(geometry, materials, -2);
        cubes.push(cube);
    };

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshStandardMaterial({color, metalness: 0.1, roughness: 0.8});
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
        const z = 0;
        const y = -20 + Math.sqrt(400 - x*x - z*z);
        cube.position.set(x, y, z);
        const normal = new THREE.Vector3(x, y + 20, z).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        cube.setRotationFromQuaternion(quaternion);
        return cube;
    }

    function makeTexturedInstance(geometry, material, x) {
        let mat = material;
        if (Array.isArray(material)) {
            mat = material.map(m => new THREE.MeshStandardMaterial({map: m.map, color: 0xffffff, metalness: 0.1, roughness: 0.8}));
        } else if (material instanceof THREE.Material) {
            mat = new THREE.MeshStandardMaterial({map: material.map, color: 0xffffff, metalness: 0.1, roughness: 0.8});
        }
        const cube = new THREE.Mesh(geometry, mat);
        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
        const z = 0;
        const y = -20 + Math.sqrt(400 - x*x - z*z);
        cube.position.set(x, y, z);
        const normal = new THREE.Vector3(x, y + 20, z).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        cube.setRotationFromQuaternion(quaternion);
        return cube;
    }

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render(time) {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}
        
        time *= 0.001;  // convert time to seconds
        
        const delta = 0.016;
        controls.update(delta);
        
        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });;
		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );
}
main();