import type {SteeringStateMachine} from "../SteeringStateMachine.ts";
import type {Boid} from "../../../boids/Model/Boid.ts";
import type {SteeringBehaviour} from "../../behaviours/SteeringBehaviour.ts";

export class EngagementStateMachine implements SteeringStateMachine {
    getPipelineForState(boid: Boid): SteeringBehaviour[] {



        return [];
    }

}