import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RTNavmeshTerrain } from './sro/RTNavmeshTerrain';

const dragzone = document.getElementById('dropzone');
dragzone.addEventListener("dragover", onFileDragOver)
dragzone.addEventListener("drop", onFileDropped)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 100, 0);
controls.update();

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render(scene, camera);
}

animate();

async function onFileDropped(ev) {
    console.log('file dropped: ', ev)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        for (let i=0; i < ev.dataTransfer.items.length; i++) {
            if (ev.dataTransfer.items[i].kind === 'file') {
                const file = ev.dataTransfer.items[i].getAsFile();
                console.log('loading file ' + file.name)
                const terrain = await RTNavmeshTerrain.fromFile(file)
                scene.clear();
                terrain.getGeometries().forEach(geom => {
                    scene.add(geom);
                })
                // camera.position.set(0, 100, 1920/2)
                // controls.update()
                camera.lookAt(0, 100, 0)
            }
        }
    }
}

function onFileDragOver(ev) {
    ev.preventDefault();
}