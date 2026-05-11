import type {SteeringBehaviour} from "../../SteeringBehaviour.ts";
import type {SteeringContext} from "../../../model/SteeringContext.ts";
import type {Boid} from "../../../../boids/Model/Boid.ts";
import type {EngagementSlot} from "../../../../engagement/slotManagement/model/EngagementSlot.ts";
import Vector2 = Phaser.Math.Vector2;

const TOO_CLOSE: number = 50;
const TOO_FAR: number = 200;

export class MaintainIdealRangeForTarget implements SteeringBehaviour {
    steer(steeringContext: SteeringContext,
          boid: Boid, secondsSinceStart: number,
          weight: number, debugOutput: boolean): void {
        const target: EngagementSlot | undefined = boid.blackboard.engagementCache.reservedSlot;

        if(!target) return;

        // attract if too far away, repulse if too close
        const boidTooCloseDistance: number = TOO_CLOSE + boid.size;
        const relevantTargetPos: Vector2 = target.computePosition();

        const distFromTarget: number = boid.pos.distance(relevantTargetPos);

        let interestVector: Vector2;

        if(distFromTarget < boidTooCloseDistance) {
            const repulsiveScale: number = 1 - (distFromTarget / boidTooCloseDistance);
            interestVector = boid.pos.clone().subtract(relevantTargetPos).scale(repulsiveScale);
        }
        else {
            const attractiveScale: number = (distFromTarget - boidTooCloseDistance) / (TOO_FAR - boidTooCloseDistance);
            interestVector = relevantTargetPos.subtract(boid.pos).scale(attractiveScale);
        }

        steeringContext.putInterestForVelocity(interestVector, weight);

    }

}