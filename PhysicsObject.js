import * as THREE from "three";
import * as CANNON from "cannon";

class PhysicsObject {
    constructor ({ world, scene, objects, shape, geometry, material,
                   mass = 1, position = { x: 0, y: 0, z: 0 }, restitution = 0.2, friction = 0.3,}) {
        // --- Physics ---
        this.body = new CANNON.Body({
          mass,
          shape,
          position: new CANNON.Vector3(position.x, position.y, position.z),
          material: new CANNON.Material({
            restitution,
            friction,
          }),
        });

        world.addBody(this.body);

        // --- Render ---
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);

        objects.push(this);
    }

    syncPosition(self) {
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