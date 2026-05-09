import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, type BoidWithDistance, FAR_DISTANCE} from "../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const MAX_SPEED_DIST = 30;
const CACHE_DURATION_SECONDS = 0.1;

export class OtherFactionFleeingBehaviour implements SteeringBehaviour {
    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {

        this.resolveFleePoint(boid, secondsSinceStart);

        const selfFactionFleePoint: Vector2 | undefined = boid.blackboard.steeringCache.otherFactionFleePoint;

        if(!selfFactionFleePoint) return;

        const relevantVelocity: Vector2 = boid.pos.clone().subtract(selfFactionFleePoint.clone());

        let desiredSpeed: number = boid.maximumSpeed;

        steeringContext.putInterestForVelocity(relevantVelocity.clone().normalize().scale(desiredSpeed), weight);
    }

    resolveFleePoint(boid: Boid, secondsSinceStart: number): void {

        const lastCache = boid.blackboard.steeringCache.otherFactionFleeLastCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const resolvedEnemies: BoidWithDistance[] = [...boid.closeDistanceEnemies, ...boid.mediumDistanceEnemies];

        boid.blackboard.steeringCache.otherFactionFleeLastCacheSeconds = secondsSinceStart;

        if (resolvedEnemies.length === 0) {
            boid.blackboard.steeringCache.otherFactionFleePoint = undefined;
            return;
        }

        let x: number = 0;
        let y: number = 0;
        let weightSum: number = 0;

        for(let i: number = 0; i < resolvedEnemies.length; ++i) {

            const enemy: BoidWithDistance = resolvedEnemies[i];

            const otherPos: Vector2 = enemy.boid.pos;
            const toThis = enemy.toThis;

            const dist = toThis.length();
            const weight = 1 - Phaser.Math.Clamp(dist / FAR_DISTANCE, 0, 1);

            x+= otherPos.x * weight;
            y+= otherPos.y * weight;

            weightSum += weight;
        }

        x /= weightSum;
        y /= weightSum;

        const resolvedPoint: Vector2 = new Vector2(x, y);

        boid.blackboard.steeringCache.otherFactionFleePoint = resolvedPoint;
    }

}