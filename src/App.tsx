import Character from '@/meshes/Character';
import Ground from '@/meshes/Ground';
import Obstacle from '@/Obstacle';
import { MaterialSetup } from '@/physics/Material';
import Physics from '@/physics/Physics';
import { PhysicsDebugger } from '@/physics/PhysicsDebugger';
import MainControls from '@/systems/MainControls';
import Player from '@/systems/Player';
import Crosshair from '@/ui/Crosshair';
import { Canvas } from '@react-three/fiber';
import * as Cannon from 'cannon-es';


const App = () => {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <Crosshair />
            <Canvas camera={{ fov: 75, near: 0.1, far: 1000 }} gl={{ antialias: true }} shadows>
                <color attach="background" args={['#6ea5bf']} />

                <hemisphereLight
                    intensity={1}
                    args={['#ffffff', '#444444']}
                    position={[0, 20, 0]}
                />

                <Physics>
                    <PhysicsDebugger />
                    <MaterialSetup />
                    <Ground size={[100, 1, 100]} />
                    <Obstacle position={[0, 2, -10]} color='#008e2f' />
                    <Player>
                        <Character userData={{ type: 'hero' }} name='hero' bodyName='hero' defaultPosition={new Cannon.Vec3(0, 1, 0)} />
                    </Player>
                </Physics>
                <MainControls />
            </Canvas>
        </div>
    );
};

export default App;
