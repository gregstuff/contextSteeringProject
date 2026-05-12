import type {SteeringBehaviour} from "../../SteeringBehaviour.ts";
import type {SteeringContext} from "../../../model/SteeringContext.ts";
import type {Boid} from "../../../../boids/Model/Boid.ts";

export const ORBIT_DIRECTION = ['CW','CCW'];
export type OrbitDirection = typeof ORBIT_DIRECTION[number];

export class EngagementOrbitTarget implements SteeringBehaviour {

    constructor(orbitDirection: OrbitDirection) {

    }

    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {
    }

}