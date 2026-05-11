import type {SteeringBehaviour} from "../../SteeringBehaviour.ts";
import type {SteeringContext} from "../../../model/SteeringContext.ts";
import type {Boid} from "../../../../boids/Model/Boid.ts";

export class DeconflictOrbit implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid,
          secondsSinceStart: number, weight: number,
          debugOutput: boolean): void {
    }

}