import Character from '@/Character';
import Ground from '@/Ground';
import Obstacle from '@/Obstacle';
import MainControls from '@/systems/MainControls';
import { Canvas } from '@react-three/fiber';
import * as Cannon from 'cannon-es';
import Crosshair from './Crosshair';
import Physics from './Physics';

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
                    <Ground size={[100, 100]} />
                    <Obstacle position={[0, 2, -10]} color='#008e2f' />
                    <Character userData={{ type: 'hero' }} name='hero' bodyName='hero' defaultPosition={new Cannon.Vec3(0, 1, 0)} />
                </Physics>
                <MainControls />
            </Canvas>
        </div>
    );
};

export default App;
