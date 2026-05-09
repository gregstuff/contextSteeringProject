import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, type BoidWithDistance, FAR_DISTANCE} from "../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import Phaser from "phaser";

const MAX_SPEED_DIST = 30;
const CACHE_DURATION_SECONDS = 0.1;

export class SelfFactionSeek implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid, secondsSinceStart: number, weight: number, debugOutput: boolean): void {

        this.resolveSeekPoint(boid, secondsSinceStart);

        const selfFactionSeekPoint: Vector2 | undefined = boid.blackboard.steeringCache.selfFactionSeekPoint;

        if(!selfFactionSeekPoint) return; // no seek point, cannot seek

        const relevantVelocity = selfFactionSeekPoint.clone().subtract(boid.pos.clone());

        const distanceFromTarget: number = relevantVelocity.length();

        let desiredSpeed: number = boid.maximumSpeed;

        if(distanceFromTarget < MAX_SPEED_DIST){
            const brakeFactor = distanceFromTarget / MAX_SPEED_DIST;
            desiredSpeed *= brakeFactor;
        }

        steeringContext.putInterestForVelocity(relevantVelocity.clone().normalize().scale(desiredSpeed), weight);
    }

    resolveSeekPoint(boid: Boid, secondsSinceStart: number): void {

        const lastCache = boid.blackboard.steeringCache.selfFactionSeekLastCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const allFriendlies: BoidWithDistance[] = [...boid.closeDistanceFriendlies, ...boid.mediumDistanceFriendlies];

        boid.blackboard.steeringCache.selfFactionSeekLastCacheSeconds = secondsSinceStart;

        if (allFriendlies.length === 0) {
            boid.blackboard.steeringCache.selfFactionSeekPoint = undefined;
            boid.blackboard.steeringCache.selfFactionSeekLastCacheSeconds = secondsSinceStart;
            return;
        }

        let x: number = 0;
        let y: number = 0;
        let weightSum: number = 0;

        for(let i: number = 0; i < allFriendlies.length; ++i) {

            const friendly = allFriendlies[i];

            const otherPos = friendly.boid.pos;
            const toThis = friendly.toThis;

            const dist = toThis.length();
            const weight = 1 - Phaser.Math.Clamp(dist / FAR_DISTANCE, 0, 1);

            x+= otherPos.x * weight;
            y+= otherPos.y * weight;

            weightSum += weight;
        }

        x /= weightSum;
        y /= weightSum;

        const resolvedPoint: Vector2 = new Vector2(x, y);

        boid.blackboard.steeringCache.selfFactionSeekPoint = resolvedPoint;
    }

}