import type {SteeringContext} from "../model/SteeringContext.ts";
import type {Boid} from "../../boids/Model/Boid.ts";

export interface SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid, secondsSinceStart:number, weight: number, debugOutput: boolean): void;
}