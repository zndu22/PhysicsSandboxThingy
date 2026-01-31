import * as THREE from "three";
import * as CANNON from "cannon";

class PhysicsObject {
    constructor ({ world, scene, shape, geometry, material,
                   mass = 1, position = { x: 0, y: 0, z: 0 }, restitution = 0.2, friction = 0.8,}) {
        // --- Physics ---
        this.body = new CANNON.Body({
            mass,
            shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: new CANNON.Material({
                restitution,
                friction,
            }),
        });

        world.addBody(this.body);

        // --- Render ---
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    syncPosition() {
        this.position = this.body.position;
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }

    applyImpulse(vec) {
        this.body.applyImpulse(
            new CANNON.Vec3(vec.x, vec.y, vec.z),
            this.body.position
        );
    }
}

export { PhysicsObject };