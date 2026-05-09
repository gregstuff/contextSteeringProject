import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, type ObstacleWithDistance} from "../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const OBSTACLE_MARGIN = 180;
const CACHE_DURATION_SECONDS = 0.1;

export class AvoidObstacles implements SteeringBehaviour {
    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {

        this.resolveAvoidVector(boid, secondsSinceStart);

        const avoidVector: Vector2 | undefined = boid.blackboard.steeringCache.avoidObstaclesVector;

        if(!avoidVector) return;

        steeringContext.putDangerForVelocity(avoidVector, weight);
        steeringContext.putInterestForVelocity(avoidVector.clone().scale(-1), weight);
    }

    resolveAvoidVector(boid: Boid, secondsSinceStart: number): void {

        const lastCache: number | undefined = boid.blackboard.steeringCache.avoidObstaclesCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const obstacles: ObstacleWithDistance[] = boid.obstacles;

        boid.blackboard.steeringCache.avoidObstaclesCacheSeconds = secondsSinceStart;

        if (obstacles.length === 0) {
            boid.blackboard.steeringCache.avoidObstaclesVector = undefined;
            return;
        }

        let x: number = 0;
        let y: number = 0;
        let weightSum: number = 0;

        for(let i: number = 0; i < obstacles.length; ++i) {
            const obstacle: ObstacleWithDistance = obstacles[i];

            const avoidDist: number = obstacle.obstacle.size + OBSTACLE_MARGIN;

            const toThis = obstacle.toThis;

            const centerDist = toThis.length();
            const surfaceDist = Math.max(0, centerDist - obstacle.obstacle.size);

            if (surfaceDist >= avoidDist) continue;

            const t: number = 1 - Phaser.Math.Clamp(surfaceDist / avoidDist, 0, 1);
            const weight: number = t * t * t;

            const towardDanger = toThis.clone().normalize().scale(weight);
            x += towardDanger.x;
            y += towardDanger.y;

            weightSum += weight;
        }

        if(weightSum == 0) {
            boid.blackboard.steeringCache.avoidObstaclesVector = undefined;
            return;
        }

        x /= weightSum;
        y /= weightSum;

        const resolvedVector: Vector2 = new Vector2(x, y);

        boid.blackboard.steeringCache.avoidObstaclesVector = resolvedVector;
    }

}