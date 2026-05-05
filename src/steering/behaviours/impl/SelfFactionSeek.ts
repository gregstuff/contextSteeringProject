import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, FAR_DISTANCE} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import Phaser from "phaser";

const MAX_SPEED_DIST = 30;
const CACHE_DURATION_SECONDS = 0.1;

export class SelfFactionSeek implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid, secondsSinceStart: number, weight: number, debugOutput: boolean): void {

        this.resolveSeekPoint(boid, secondsSinceStart);

        const selfFactionSeekPoint: Vector2 | undefined = boid.blackboard.selfFactionSeekPoint;

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

        const lastCache = boid.blackboard.selfFactionSeekLastCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const allFriendlies: Boid[] = [...boid.closeDistanceFriendlies, ...boid.mediumDistanceFriendlies];

        boid.blackboard.selfFactionSeekLastCacheSeconds = secondsSinceStart;

        if (allFriendlies.length === 0) {
            boid.blackboard.selfFactionSeekPoint = undefined;
            boid.blackboard.selfFactionSeekLastCacheSeconds = secondsSinceStart;
            return;
        }

        let x: number = 0;
        let y: number = 0;
        let weightSum: number = 0;

        for(let i: number = 0; i < allFriendlies.length; ++i) {

            const friendly = allFriendlies[i];

            const toOther = friendly.pos.clone().subtract(boid.pos);
            const dist = toOther.length();
            const weight = 1 - Phaser.Math.Clamp(dist / FAR_DISTANCE, 0, 1);

            x+= friendly.pos.x * weight;
            y+= friendly.pos.y * weight;

            weightSum += weight;
        }

        x /= weightSum;
        y /= weightSum;

        const resolvedPoint: Vector2 = new Vector2(x, y);

        boid.blackboard.selfFactionSeekPoint = resolvedPoint;
    }

}