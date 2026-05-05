import type {SteeringBehaviour} from "../SteeringBehaviour.ts";
import Phaser from "phaser";
import  {type SteeringContext} from "../../model/SteeringContext.ts";
import {type Boid, FAR_DISTANCE} from "../../../model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const CACHE_DURATION_SECONDS = 0.1;

export class Alignment implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid,
          secondsSinceStart: number, weight: number,
          debugOutput: boolean): void {

        this.resolveAlignmentVector(boid, secondsSinceStart);

        const alignmentVector: Vector2 | undefined = boid.blackboard.alignmentVector;

        if(!alignmentVector) return; // no seek point, cannot seek

        const desiredSpeed: number = boid.maximumSpeed;

        steeringContext.putInterestForVelocity(alignmentVector.clone().normalize().scale(desiredSpeed), weight);
    }

    resolveAlignmentVector(boid: Boid, secondsSinceStart: number): void {

        const lastCache = boid.blackboard.alignmentCacheSeconds;

        if(lastCache && lastCache + CACHE_DURATION_SECONDS > secondsSinceStart) return;

        const allFriendlies: Boid[] = [...boid.closeDistanceFriendlies, ...boid.mediumDistanceFriendlies];

        boid.blackboard.alignmentCacheSeconds = secondsSinceStart;

        if (allFriendlies.length === 0) {
            boid.blackboard.alignmentVector = undefined;
            boid.blackboard.alignmentCacheSeconds = secondsSinceStart;
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

            const normalizedDir: Vector2 = friendly.velocity.clone().normalize();

            x+= normalizedDir.x * weight;
            y+= normalizedDir.y * weight;

            weightSum += weight;
        }

        x /= weightSum;
        y /= weightSum;

        const resolvedVector: Vector2 = new Vector2(x, y);

        boid.blackboard.alignmentVector = resolvedVector;
    }

}