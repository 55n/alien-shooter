import { mainCamera } from '@/core/camera';
import { WebGLRenderer } from 'three';

const FULL_SIZE_WIDTH = window.innerWidth;
const FULL_SIZE_HEIGHT = window.innerHeight;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const renderer = new WebGLRenderer({ canvas });

let resizeTimer: number;

window.addEventListener('resize', (event) => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
        mainCamera.aspect = FULL_SIZE_WIDTH / FULL_SIZE_HEIGHT;
        mainCamera.updateProjectionMatrix();

        renderer.setSize(FULL_SIZE_WIDTH, FULL_SIZE_HEIGHT);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }, 150);
});
