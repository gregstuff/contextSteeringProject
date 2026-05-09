import type { SteeringBehaviour } from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import type { SteeringContext } from "../../model/SteeringContext.ts";
import {type Boid, type BoidWithDistance} from "../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

export class ChaseTarget implements SteeringBehaviour {
    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {

        const currentTarget: BoidWithDistance | undefined = boid.blackboard.targetBoid;

        if(!currentTarget) return;

        steeringContext.putInterestForVelocity(currentTarget.toThis, weight);
    }
}