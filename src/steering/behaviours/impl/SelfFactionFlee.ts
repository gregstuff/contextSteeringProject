import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import type {SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, type BoidWithDistance, FAR_DISTANCE} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const MAX_SPEED_DIST = 30;
const CACHE_DURATION_SECONDS = 0.1;

export class SelfFactionFlee implements SteeringBehaviour {
    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {

        this.resolveFleePoint(boid, secondsSinceStart);

        const selfFactionFleePoint: Vector2 | undefined = boid.blackboard.selfFactionFleePoint;

        if(!selfFactionFleePoint) return; // no seek point, cannot seek

        const relevantVelocity = boid.pos.clone().subtract(selfFactionFleePoint.clone());

        const distanceFromTarget: number = relevantVelocity.length();

        let desiredSpeed: number = boid.maximumSpeed;

        steeringContext.putInterestForVelocity(relevantVelocity.clone().normalize().scale(desiredSpeed), weight);
    }

    resolveFleePoint(boid: Boid, secondsSinceStart: number): void {

        const lastCache = boid.blackboard.selfFactionFleeLastCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const resolvedFriendlies: BoidWithDistance[] = [...boid.closeDistanceFriendlies];

        boid.blackboard.selfFactionFleeLastCacheSeconds = secondsSinceStart;

        if (resolvedFriendlies.length === 0) {
            boid.blackboard.selfFactionFleePoint = undefined;
            boid.blackboard.selfFactionFleeLastCacheSeconds = secondsSinceStart;
            return;
        }

        let x: number = 0;
        let y: number = 0;
        let weightSum: number = 0;

        for(let i: number = 0; i < resolvedFriendlies.length; ++i) {

            const friendly = resolvedFriendlies[i];

            const otherPos: Vector2 = friendly.boid.pos;
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

        boid.blackboard.selfFactionFleePoint = resolvedPoint;
    }

}