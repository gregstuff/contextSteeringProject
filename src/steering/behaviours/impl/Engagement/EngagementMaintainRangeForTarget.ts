import type {SteeringBehaviour} from "../../SteeringBehaviour.ts";
import type {SteeringContext} from "../../../model/SteeringContext.ts";
import type {Boid} from "../../../../boids/Model/Boid.ts";
import type {EngagementSlot} from "../../../../engagement/slotManagement/model/EngagementSlot.ts";
import Vector2 = Phaser.Math.Vector2;
import {
    DistanceBand,
    DistanceForDistanceBand,
    distanceToDistanceBand
} from "../../../../constants/DistanceBand.ts";

export class EngagementMaintainRangeForTarget implements SteeringBehaviour {

    distanceBand: DistanceBand;

    constructor(desiredBand: DistanceBand) {
        this.distanceBand = desiredBand;
    }

    steer(
        steeringContext: SteeringContext,
        boid: Boid,
        secondsSinceStart: number,
        weight: number,
        debugOutput: boolean
    ): void {
        const target: EngagementSlot | undefined =
            boid.blackboard.engagementCache.reservedSlot;

        if (!target) return;

        const targetPos: Vector2 = target.computePosition();

        const toTarget: Vector2 = targetPos.clone().subtract(boid.pos);
        const distFromTarget: number = toTarget.length();

        if (distFromTarget === 0) return;

        const currentBand: DistanceBand = distanceToDistanceBand(distFromTarget);

        if (currentBand === this.distanceBand) return;

        const currentBandIndex: number = DISTANCE_BAND_ORDER.indexOf(currentBand);
        const desiredBandIndex: number = DISTANCE_BAND_ORDER.indexOf(this.distanceBand);

        const tooClose: boolean = currentBandIndex < desiredBandIndex;
        const tooFar: boolean = currentBandIndex > desiredBandIndex;

        let interestVector: Vector2;

        if (tooClose) {
            const desiredMinDistance: number = getBandLowerBound(this.distanceBand);
            const strength: number = normaliseDistanceError(
                desiredMinDistance - distFromTarget,
                desiredMinDistance
            );

            interestVector = boid.pos
                .clone()
                .subtract(targetPos)
                .normalize()
                .scale(strength);
        }
        else if (tooFar) {
            const desiredMaxDistance: number = DistanceForDistanceBand[this.distanceBand];
            const strength: number = normaliseDistanceError(
                distFromTarget - desiredMaxDistance,
                desiredMaxDistance
            );

            interestVector = toTarget
                .clone()
                .normalize()
                .scale(strength);
        }
        else {
            return;
        }

        steeringContext.putInterestForVelocity(interestVector, weight);
    }
}

const DISTANCE_BAND_ORDER: DistanceBand[] = [
    DistanceBand.TOO_CLOSE,
    DistanceBand.CLOSE,
    DistanceBand.MID,
    DistanceBand.FAR,
    DistanceBand.TOO_FAR
];

function getBandLowerBound(distanceBand: DistanceBand): number {
    const bandIndex: number = DISTANCE_BAND_ORDER.indexOf(distanceBand);

    if (bandIndex <= 0) return 0;

    const previousBand: DistanceBand = DISTANCE_BAND_ORDER[bandIndex - 1];

    return DistanceForDistanceBand[previousBand];
}

function normaliseDistanceError(error: number, divisor: number): number {
    if (divisor <= 0) return 1;

    return Phaser.Math.Clamp(error / divisor, 0, 1);
}