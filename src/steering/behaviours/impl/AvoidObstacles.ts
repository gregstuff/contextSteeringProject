import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, type ObstacleWithDistance} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const OBSTACLE_AVOID_DIST = 120;
const CACHE_DURATION_SECONDS = 0.1;

export class AvoidObstacles implements SteeringBehaviour {
    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {

        this.resolveAvoidVector(boid, secondsSinceStart);

        const avoidVector: Vector2 | undefined = boid.blackboard.avoidObstaclesVector;

        if(!avoidVector) return;

        steeringContext.putDangerForVelocity(avoidVector, weight);
        steeringContext.putInterestForVelocity(avoidVector.clone().scale(-1), weight);
    }

    resolveAvoidVector(boid: Boid, secondsSinceStart: number): void {

        const lastCache: number | undefined = boid.blackboard.avoidObstaclesCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const obstacles: ObstacleWithDistance[] = boid.obstacles;

        boid.blackboard.avoidObstaclesCacheSeconds = secondsSinceStart;

        if (obstacles.length === 0) {
            boid.blackboard.avoidObstaclesVector = undefined;
            boid.blackboard.avoidObstaclesCacheSeconds = secondsSinceStart;
            return;
        }

        let x: number = 0;
        let y: number = 0;
        let weightSum: number = 0;

        for(let i: number = 0; i < obstacles.length; ++i) {
            const obstacle: ObstacleWithDistance = obstacles[i];

            const obstaclePos: Vector2 = obstacle.obstacle.pos;
            const toThis = obstacle.toThis;

            const dist = toThis.length();
            const weight = 1 - Phaser.Math.Clamp(dist / OBSTACLE_AVOID_DIST, 0, 1);

            x+= obstaclePos.x * weight;
            y+= obstaclePos.y * weight;

            weightSum += weight;
        }

        x /= weightSum;
        y /= weightSum;

        const resolvedPoint: Vector2 = new Vector2(x, y);

        const toDanger: Vector2 = resolvedPoint.subtract(boid.pos)

        boid.blackboard.avoidObstaclesVector = toDanger;
    }

}