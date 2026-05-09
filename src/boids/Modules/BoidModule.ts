import type {Boid} from "../Model/Boid.ts";

export interface BoidModule {
    onCache(boid: Boid): void;
    onTick(boid: Boid): void;
}