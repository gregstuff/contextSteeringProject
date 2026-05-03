import type {SteeringContext} from "../model/SteeringContext.ts";
import type {Boid} from "../../model/Boid.ts";

export interface SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid, weight: number, debugOutput: boolean): void;
}