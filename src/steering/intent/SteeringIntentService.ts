import type {Entity} from "../../constants/Util.ts";

export type SteeringIntentScore = {
    intent: SteeringIntentService,
    score: number
}

export interface SteeringIntentService {
    resolveSteeringIntent(allEntities: Entity[], secondsSinceStart: number): void;
}