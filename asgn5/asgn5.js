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

function main(){
        // WASD and fly movement state
        const moveState = { w: false, a: false, s: false, d: false, space: false, shift: false };
        const moveSpeed = 0.25;

        // Listen for WASD keydown/up, but ignore if sitting
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') return;
            if (isSitting) return;
            if (e.target !== document.body && e.target !== canvas) return;
            if (e.key === 'w' || e.key === 'W') moveState.w = true;
            if (e.key === 'a' || e.key === 'A') moveState.a = true;
            if (e.key === 's' || e.key === 'S') moveState.s = true;
            if (e.key === 'd' || e.key === 'D') moveState.d = true;
            if (e.code === 'Space') moveState.space = true;
            if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight') moveState.shift = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'e' || e.key === 'E') return;
            if (isSitting) return;
            if (e.key === 'w' || e.key === 'W') moveState.w = false;
            if (e.key === 'a' || e.key === 'A') moveState.a = false;
            if (e.key === 's' || e.key === 'S') moveState.s = false;
            if (e.key === 'd' || e.key === 'D') moveState.d = false;
            if (e.code === 'Space') moveState.space = false;
            if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight') moveState.shift = false;
        });
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
    // GALAXY BACKGROUND
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

    // BENCH SIT LOGIC
    let isSitting = false;
    let prevCameraPosition = null;
    let prevCameraQuaternion = null;
    let benchObject = null;
    let benchSitPosition = null;
    let benchLookTarget = null;

    // Interact popup
    const interactPopup = document.getElementById('interact-popup');

    function isCameraNearBench() {
        const camPos = camera.position;
        const benchY = -planetRadius + Math.sqrt(planetRadius * planetRadius - benchX * benchX - benchZ * benchZ);
        const dist = Math.sqrt(
            (camPos.x - benchX) ** 2 +
            (camPos.y - benchY) ** 2 +
            (camPos.z - benchZ) ** 2
        );
        return dist < 15;
    }

    // Sit on bench
    function sitOnBench() {
        // Clear all WASD movement when sitting
        moveState.w = false;
        moveState.a = false;
        moveState.s = false;
        moveState.d = false;
        if (!benchObject) return;
        prevCameraPosition = camera.position.clone();
        prevCameraQuaternion = camera.quaternion.clone();
        // Use bounding box to find seat center and height
        const box = new THREE.Box3().setFromObject(benchObject);
        // Seat height
        const seatY = box.max.y - 0.05 * (box.max.y - box.min.y); 
        // Center of the bench in local coordinates
        const seatZ = (box.min.z + box.max.z) / 2;
        const seatX = (box.min.x + box.max.x) / 2;
        // Sit position: center of bench, on top, but raise Y for head height
        let localSit = new THREE.Vector3(seatX, seatY + 0.6, seatZ);
        benchSitPosition = localSit.clone();
        benchObject.localToWorld(benchSitPosition);
        camera.position.copy(benchSitPosition);
        const camDir = new THREE.Vector3(0, 1, 2).applyQuaternion(camera.quaternion);
        controls.target.copy(benchSitPosition.clone().add(camDir));
        controls.update();
        // Allow mouse look, but no pan/zoom
        controls.enabled = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.minDistance = 0.01;
        controls.maxDistance = 0.01;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        // Disable WASD movement while sitting
        moveState.w = false;
        moveState.a = false;
        moveState.s = false;
        moveState.d = false;
        isSitting = true;
        // Hide interact popup when sitting
        if (interactPopup) interactPopup.style.display = 'none';
    }

    // Stand up from bench
    function standFromBench() {
        if (prevCameraPosition && prevCameraQuaternion) {
            camera.position.copy(prevCameraPosition);
            camera.quaternion.copy(prevCameraQuaternion);
        }
        controls.enabled = true;
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.minDistance = 0.1;
        controls.maxDistance = 1000;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        isSitting = false;
    }

    // Toggle sit and stand with E key when near bench
    window.addEventListener('keydown', (e) => {
        if (e.key === 'e' || e.key === 'E') {
            if (!isSitting && isCameraNearBench()) {
                sitOnBench();
            } else if (isSitting) {
                standFromBench();
            }
        }
    });

    // Keep camera locked to bench sit position while sitting, but allow mouse look
    function updateSittingCamera() {
        if (isSitting && benchSitPosition) {
            camera.position.copy(benchSitPosition);
            const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            controls.target.copy(benchSitPosition.clone().add(camDir));
            controls.update();
        }
    }

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
            root.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.computeVertexNormals();
                }
            });
            scene.add(root);
            benchObject = root;
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

            // FIND LAMP COORINATES FOR LIGHT PLACEMENT
            const lampBoxWorld = new THREE.Box3().setFromObject(root);
            const lampCenter = new THREE.Vector3();
            lampBoxWorld.getCenter(lampCenter);
            const lampTop = new THREE.Vector3(lampCenter.x, lampBoxWorld.max.y, lampCenter.z);

            const lampRight = new THREE.Vector3(1, 0, 0);
            lampRight.applyQuaternion(root.quaternion);
            const offsetAmount = 0.8;
            let lightPos = lampTop.clone().add(lampRight.multiplyScalar(offsetAmount));
            lightPos.y -= 0.4;
            lightPos.z += 0.02;
            lampLight.position.copy(lightPos);

            // SPOTLIGHT ORIGIN SPHERE
            const spotOriginGeometry = new THREE.SphereGeometry(0.22, 32, 32);
            const spotOriginMaterial = new THREE.MeshStandardMaterial({
                color: 0xfff7b2,
                emissive: 0xfff7b2,
                emissiveIntensity: 7.0,
                roughness: 0.1,
                metalness: 0.0,
                transparent: true,
                opacity: 0.95
            });
            const spotOriginSphere = new THREE.Mesh(spotOriginGeometry, spotOriginMaterial);
            spotOriginSphere.position.copy(lightPos);
            scene.add(spotOriginSphere);

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

    const sphereRadius = 20;

    // PLANET AND MOON
    const moonPos = new THREE.Vector3(10, 25, 10);
    {
        // PLANET 
        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/grass2.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;

        // Use a more square repeat ratio to reduce stretching
        const repeatsX = 8;
        const repeatsY = 8;
        texture.repeat.set(repeatsX, repeatsY);
        texture.offset.set(0, 0.0);

        const sphereGeo = new THREE.SphereGeometry(sphereRadius, 256, 256);
        const uvs = sphereGeo.attributes.uv;
        uvs.needsUpdate = true;

        // Use MeshStandardMaterial for better lighting and texture appearance
        const planetMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(sphereGeo, planetMat);
        mesh.position.y = -sphereRadius;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // const material = new THREE.MeshStandardMaterial({color: 0x114f06, roughness: 1, metalness: 0});
        // const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
        // const mesh = new THREE.Mesh(sphereGeo, material);
        // mesh.position.y = -sphereRadius;
        // mesh.receiveShadow = true;
        // scene.add(mesh);

        // MOON
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
                    emissiveIntensity: 0.4,
                    roughness: 0.1,
                    metalness: 0.0
                });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.position.copy(moonPos);
                scene.add(moon);

                window._moonMesh = moon;

                // HALO EFFECT
                function createRadialGradientTexture(size = 256) {
                    const canvas = document.createElement('canvas');
                    canvas.width = canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    const gradient = ctx.createRadialGradient(
                        size / 2, size / 2, 0,
                        size / 2, size / 2, size / 2
                    );
                    gradient.addColorStop(0, 'rgba(255,255,255,0.5)');
                    gradient.addColorStop(0.5, 'rgba(255,255,255,0.15)');
                    gradient.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, size, size);
                    const texture = new THREE.Texture(canvas);
                    texture.needsUpdate = true;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    return texture;
                }

                const haloGeo = new THREE.SphereGeometry(3.6, 48, 48);
                const haloTexture = createRadialGradientTexture(256);
                const haloMat = new THREE.MeshBasicMaterial({
                    map: haloTexture,
                    color: 0xffffff,
                    transparent: true,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                const halo = new THREE.Mesh(haloGeo, haloMat);
                halo.position.copy(moonPos);
                scene.add(halo);

                // DIRECTIONAL LIGHT FROM MOON
                const moonDirLight = new THREE.DirectionalLight(0xffffff, 1.2);
                moonDirLight.position.copy(moonPos);
                moonDirLight.target.position.set(0, -sphereRadius, 0);
                scene.add(moonDirLight);
                scene.add(moonDirLight.target);
        });
	}

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.1);
    scene.add(hemisphereLight);

    // STARS
    const stars = [];
    function createStarShape() {
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
    for (let i = 0; i < 200; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const radius = 60 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi) - sphereRadius; // center at (0, -sphereRadius, 0)
        const z = radius * Math.sin(phi) * Math.sin(theta);
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

                // Show/hide interact popup
                if (!isSitting && isCameraNearBench()) {
                    interactPopup.style.display = 'block';
                } else {
                    interactPopup.style.display = 'none';
                }


                // If not sitting: WASD and fly movement
                if (!isSitting) {
                    let moveVec = new THREE.Vector3();
                    const forward = new THREE.Vector3();
                    camera.getWorldDirection(forward);
                    forward.y = 0;
                    forward.normalize();
                    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
                    if (moveState.w) moveVec.add(forward);
                    if (moveState.s) moveVec.add(forward.clone().negate());
                    if (moveState.a) moveVec.add(right.clone().negate());
                    if (moveState.d) moveVec.add(right);
                    if (moveState.space) moveVec.y += 1;
                    if (moveState.shift) moveVec.y -= 1;
                    if (moveVec.lengthSq() > 0) {
                        moveVec.normalize().multiplyScalar(moveSpeed);
                        camera.position.add(moveVec);
                        controls.target.add(moveVec);
                    }
                } else {
                    updateSittingCamera();
                }

                const delta = 0.016;
                controls.update(delta);

                // Animate stars
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