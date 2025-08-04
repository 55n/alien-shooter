import { ReactNode } from 'react';
import { Physics as CannonPhysics } from '@react-three/cannon';

interface PhysicsProps {
    children: ReactNode;
    gravity?: [number, number, number];
    step?: number;
}

function Physics({ 
    children, 
    gravity = [0, -9.82, 0]
}: PhysicsProps) {
    return (
        <CannonPhysics 
            gravity={gravity}
            broadphase="Naive"
            allowSleep={false}
            iterations={10}
            tolerance={0.001}
        >
            {children}
        </CannonPhysics>
    );
}

export default Physics;