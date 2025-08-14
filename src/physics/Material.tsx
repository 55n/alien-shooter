import { usePhysicsWorld } from '@/physics/Physics';
import * as Cannon from 'cannon-es';
import { useEffect } from 'react';

export const characterMaterial = new Cannon.Material('characterMaterial');
export const groundMaterial = new Cannon.Material('groundMaterial');

export const playerGroundContactMaterial = new Cannon.ContactMaterial(
    characterMaterial,
    groundMaterial,
    {
        friction: 0.3,
        restitution: 0, // No bouncing
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
    }
);

export const MaterialSetup = () => {
    const world = usePhysicsWorld();

    useEffect(() => {
        world.addContactMaterial(playerGroundContactMaterial);
    }, [world]);

    return null;
};