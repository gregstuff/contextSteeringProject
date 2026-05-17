import {SteeringIntent} from "./constants/SteeringIntent.ts";
import type {Boid} from "../../boids/Model/Boid.ts";

export type SteeringIntentScore = {
    intent: SteeringIntentService,
    score: number
}

export interface SteeringIntentService {
    resolveSteeringIntent(allBoids: Boid[], secondsSinceStart: number): void;
}