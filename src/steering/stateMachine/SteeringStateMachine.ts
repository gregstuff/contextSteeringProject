import type {SteeringBehaviour} from "../behaviours/SteeringBehaviour.ts";
import type {Boid} from "../../boids/Model/Boid.ts";

export interface SteeringStateMachine {
    getPipelineForState(boid: Boid): SteeringBehaviour[];
}