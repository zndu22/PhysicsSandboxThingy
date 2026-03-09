import * as THREE from 'three';
import * as CANNON from 'cannon';
import { PhysicsObject } from './PhysicsObject.js';

class PlayerRagdoll {
  constructor({ world, scene, objects, material }) {
    this.world = world;
    this.scene = scene;
    this.objects = objects;
    this.material = material;

    this.head = new PhysicsObject({
      world,
      scene,
      objects,
      shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
      geometry: new THREE.BoxGeometry(1, 1, 1),
      material,
      position: { x: 0, y: 7, z: 0 },
    });

    this.body = new PhysicsObject({
      world,
      scene,
      objects,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 0.5)),
      geometry: new THREE.BoxGeometry(2, 2, 1),
      material,
      position: { x: 0, y: 5, z: 0 },
    });

    this.limbs = {
      arm1: new PhysicsObject({
        world,
        scene,
        objects,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        geometry: new THREE.BoxGeometry(1, 2, 1),
        material,
        position: { x: 1.6, y: 5, z: 0 },
      }),
      arm2: new PhysicsObject({
        world,
        scene,
        objects,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        geometry: new THREE.BoxGeometry(1, 2, 1),
        material,
        position: { x: -1.6, y: 5, z: 0 },
      }),
      leg1: new PhysicsObject({
        world,
        scene,
        objects,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        geometry: new THREE.BoxGeometry(1, 2, 1),
        material,
        position: { x: 0.5, y: 3, z: 0 },
      }),
      leg2: new PhysicsObject({
        world,
        scene,
        objects,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5)),
        geometry: new THREE.BoxGeometry(1, 2, 1),
        material,
        position: { x: -0.5, y: 3, z: 0 },
      }),
    };

    this.constraints = {
      head: new CANNON.HingeConstraint(this.head.body, this.body.body, {
        pivotA: new CANNON.Vec3(0, -0.51, 0),
        axisA: new CANNON.Vec3(0, 1, 0),
        pivotB: new CANNON.Vec3(0, 1.01, 0),
        axisB: new CANNON.Vec3(0, 1, 0),
      }),
      arm1: new CANNON.HingeConstraint(this.limbs.arm1.body, this.body.body, {
        pivotA: new CANNON.Vec3(0, 0.5, 0),
        axisA: new CANNON.Vec3(1, 0, 0),
        pivotB: new CANNON.Vec3(1.51, 0.5, 0),
        axisB: new CANNON.Vec3(1, 0, 0),
        collideConnected: true,
      }),
      arm2: new CANNON.HingeConstraint(this.limbs.arm2.body, this.body.body, {
        pivotA: new CANNON.Vec3(0, 0.5, 0),
        axisA: new CANNON.Vec3(1, 0, 0),
        pivotB: new CANNON.Vec3(-1.51, 0.5, 0),
        axisB: new CANNON.Vec3(1, 0, 0),
        collideConnected: true,
      }),
      leg1: new CANNON.HingeConstraint(this.limbs.leg1.body, this.body.body, {
        pivotA: new CANNON.Vec3(0, 1, 0),
        axisA: new CANNON.Vec3(1, 0, 0),
        pivotB: new CANNON.Vec3(0.51, -1, 0),
        axisB: new CANNON.Vec3(1, 0, 0),
        collideConnected: true,
      }),
      leg2: new CANNON.HingeConstraint(this.limbs.leg2.body, this.body.body, {
        pivotA: new CANNON.Vec3(0, 1, 0),
        axisA: new CANNON.Vec3(1, 0, 0),
        pivotB: new CANNON.Vec3(-0.51, -1, 0),
        axisB: new CANNON.Vec3(1, 0, 0),
        collideConnected: true,
      }),
    };

    Object.values(this.constraints).forEach((constraint) => {
      this.world.addConstraint(constraint);
    });

    this.objects.forEach((currentObject) => {
      currentObject.body.updateMassProperties();
    });
  }
}

export { PlayerRagdoll };
