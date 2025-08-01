import {
    Camera,
    EventDispatcher,
    Object3D,
    Vector3
} from 'three';

class ThirdPersonControls extends EventDispatcher {

    private camera: Camera;
    private target: Object3D;
    private domElement: HTMLElement;

    private offset: Vector3;
    private rotation: {
        theta: number;
        phi: number;
    };

    private sensitivity: number;
    private enabled: boolean;

    isLocked: boolean;

    constructor(camera: Camera, targetObject: Object3D, domElement: HTMLElement) {
        super();

        this.camera = camera;
        this.target = targetObject;
        this.domElement = domElement;

        this.offset = new Vector3(0, 2, -5);
        this.rotation = {
            theta: 0,
            phi: 15 * Math.PI / 180
        };

        this.sensitivity = 0.002;
        this.enabled = true;
        this.isLocked = false;

        // 바인딩
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        // Pointer lock
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', this.onPointerLockChange);
        document.addEventListener('mousemove', this.onMouseMove);
    }

    private onPointerLockChange(): void {
        this.isLocked = document.pointerLockElement === this.domElement;
        this.dispatchEvent({ type: this.isLocked ? 'lock' : 'unlock' });
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.enabled || !this.isLocked) return;

        this.rotation.theta -= event.movementX * this.sensitivity;
        this.rotation.phi -= event.movementY * this.sensitivity;

        const maxPhi = Math.PI / 2 - 0.1;
        const minPhi = 0.1;
        this.rotation.phi = Math.max(minPhi, Math.min(maxPhi, this.rotation.phi));
    }

    update(): void {
        if (!this.enabled) return;

        const radius = Math.abs(this.offset.z);
        const x = radius * Math.sin(this.rotation.phi) * Math.sin(this.rotation.theta);
        const y = radius * Math.cos(this.rotation.phi);
        const z = radius * Math.sin(this.rotation.phi) * Math.cos(this.rotation.theta);

        const cameraOffset = new Vector3(x, y, z);

        this.camera.position.copy(this.target.position).add(cameraOffset);
        this.camera.lookAt(this.target.position);
    }

    dispose(): void {
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('mousemove', this.onMouseMove);
    }
}


export default ThirdPersonControls;
