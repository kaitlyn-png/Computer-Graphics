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
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //camera.position.z = 2;
    camera.position.set(0, 10, 20);

    // CONTROLS
    const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 5, 0);
	controls.update();

    // SCENE
    const scene = new THREE.Scene();
    // Set galaxy background with improved clarity
    const bgLoader = new THREE.TextureLoader();
    bgLoader.load('textures/galaxybackground.jpg', function(texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        scene.background = texture;
    });

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
            lampLight.intensity = 80;
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

    
    // // PROGRESS BAR AND LOADING MANAGER UI
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    // PLANET (SPHERE)
    // Moon position (top right in sky)
    const moonPos = new THREE.Vector3(10, 25, 10);
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

        // PLANET 
        const material = new THREE.MeshStandardMaterial({color: 0x114f06, roughness: 1, metalness: 0});
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
        const mesh = new THREE.Mesh(sphereGeo, material);
        mesh.position.y = -sphereRadius;
        mesh.receiveShadow = true;
        scene.add(mesh);

        const moonGeo = new THREE.SphereGeometry(3, 48, 48);
        loader.load('textures/moon.jpg', function(moonTexture) {
            moonTexture.colorSpace = THREE.SRGBColorSpace;
            moonTexture.minFilter = THREE.LinearMipMapLinearFilter;
            moonTexture.magFilter = THREE.LinearFilter;
            moonTexture.generateMipmaps = true;
            moonTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            const moonMat = new THREE.MeshStandardMaterial({
                map: moonTexture,
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.3,
                roughness: 0.3,
                metalness: 0.0
            });
            const moon = new THREE.Mesh(moonGeo, moonMat);
            moon.position.copy(moonPos);
            scene.add(moon);

            // Store reference for animation
            window._moonMesh = moon;

            // Directional light from the moon, aimed at the planet center
            const moonDirLight = new THREE.DirectionalLight(0xffffff, 0.4);
            moonDirLight.position.copy(moonPos);
            moonDirLight.target.position.set(0, -sphereRadius, 0);
            scene.add(moonDirLight);
            scene.add(moonDirLight.target);
        });
	}

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // STARS
    const stars = [];
    function createStarShape() {
        // 5-pointed star
        const shape = new THREE.Shape();
        const outerRadius = 0.4;
        const innerRadius = 0.18;
        const spikes = 5;
        let rot = Math.PI / 2 * 3;
        let x = 0;
        let y = 0;
        const step = Math.PI / spikes;
        shape.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            shape.lineTo(x, y);
            rot += step;
            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            shape.lineTo(x, y);
            rot += step;
        }
        shape.lineTo(0, -outerRadius);
        return shape;
    }

    const starShape = createStarShape();
    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2 };
    const starMaterial = new THREE.MeshStandardMaterial({ color: 0xffff44, emissive: 0xffff99, emissiveIntensity: 1.5, metalness: 0.2, roughness: 0.5 });
    const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);

    // Place 100 stars randomly scattered around the planet
    for (let i = 0; i < 100; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        // Random spherical coordinates all around the planet
        const radius = 22 + Math.random() * 6; // slightly above planet
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI; // full sphere
        const x = Math.cos(theta) * Math.sin(phi) * radius;
        const y = Math.cos(phi) * radius;
        const z = Math.sin(theta) * Math.sin(phi) * radius;
        star.position.set(x, y, z);
        star.rotation.y = Math.random() * Math.PI * 2;
        star.rotation.x = Math.random() * Math.PI * 2;
        star.castShadow = false;
        star.receiveShadow = false;
        scene.add(star);
        stars.push(star);
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
        
        // Animate stars (twinkle effect)
        stars.forEach((star, ndx) => {
            const twinkle = 1 + 0.2 * Math.sin(time * 2 + ndx);
            star.material.emissiveIntensity = 1.2 + 0.8 * twinkle;
            star.rotation.z += 0.01 * (ndx % 2 === 0 ? 1 : -1);
        });

        // Animate moon rotation
        if (window._moonMesh) {
            window._moonMesh.rotation.y += 0.003;
        }
		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );
}
main();