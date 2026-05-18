import type {Entity} from "../../constants/Util.ts";
import type {Boid} from "../../boids/Model/Boid.ts";

export type SteeringIntentScore = {
    intent: SteeringIntentService,
    score: number
}

export interface SteeringIntentService {
    resolveSteeringIntent(allEntities: Entity[], localBoids: Boid[], secondsSinceStart: number): void;
}