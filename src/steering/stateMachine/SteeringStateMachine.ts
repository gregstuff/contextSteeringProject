import type {Boid} from "../../boids/Model/Boid.ts";
import type {SteeringBehaviourConfig} from "../../config/GameConfig.ts";

export interface SteeringStateMachine {
    getPipelineForState(boid: Boid): SteeringBehaviourConfig[];
    computeState(boid: Boid, secondsSinceStart: number): void;
}