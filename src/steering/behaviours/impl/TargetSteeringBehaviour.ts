import type {SteeringContext} from "../../model/SteeringContext.ts";
import type {Boid} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";

const MAX_SPEED_DIST = 30;

export class TargetSteeringBehaviour implements SteeringBehaviour {

    steer(steeringContext: SteeringContext, boid: Boid, weight: number, debugOutput: boolean){

        const { target } = steeringContext;

        if (!target) return;

        const boidPos: Vector2 = boid.pos;
        const desiredVelocity: Vector2 = new Phaser.Math.Vector2()
            .copy(target)
            .subtract(boidPos);

        const distanceFromTarget: number = desiredVelocity.length();

        const heading: Vector2 = desiredVelocity.clone().normalize();

        let desiredSpeed: number = boid.maximumSpeed;

        if(distanceFromTarget < MAX_SPEED_DIST){
            const brakeFactor = distanceFromTarget / MAX_SPEED_DIST;
            desiredSpeed *= brakeFactor;
        }
        
        steeringContext.putInterestForVelocity(heading.clone().scale(desiredSpeed), weight);
    }

}