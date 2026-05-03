import type {SteeringContext} from "../../model/SteeringContext.ts";
import type {Boid} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import type {SteeringBehaviour} from "../SteeringBehaviour.ts";

const WANDER_RADIUS = 50;
const LOOK_AHEAD_DIST = 100;

export class WanderingBehaviour implements SteeringBehaviour {

    steer(steeringContext: SteeringContext, boid: Boid, weight: number, debugOutput: boolean){

        const boidPos: Vector2 = boid.pos;
        const dir: Vector2 = boid.velocity.clone().normalize();
        const projectedPoint: Vector2 = dir.scale(LOOK_AHEAD_DIST);
        projectedPoint.add(boidPos); // can now draw a circle at projected position, need debug graphics

        let theta: number = Math.PI / 2;

        let x: number = WANDER_RADIUS * Math.cos(theta);
        let y: number = WANDER_RADIUS * Math.sin(theta);

        // projectedPoint.x + x, projectedPoint.y + y for the target placed on the circle

        // projectedPoint.Add(x,y) -> amends the projected point

        let steeringVelocity: Vector2 = projectedPoint.subtract(boidPos); // steering force


        // push debug shapes to ctx, return ctx to boids controller
        // draw debug shapes from boids controller


        
        // steeringContext.putInterestForVelocity(heading.clone().scale(desiredSpeed), this.weightResolver);
    }

}