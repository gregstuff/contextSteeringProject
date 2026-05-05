import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import Phaser from "phaser";

export class SimpleForwards implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid, secondsSinceStart: number, weight: number, debugOutput: boolean): void {

        const desiredVelocity: Vector2 = boid.velocity.clone().normalize().scale(boid.maximumSpeed);

        steeringContext.putInterestForVelocity(desiredVelocity, weight);
    }
}