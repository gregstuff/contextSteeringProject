import type {SteeringBehaviour} from "../../SteeringBehaviour.ts";
import type {SteeringContext} from "../../../model/SteeringContext.ts";
import type {Boid} from "../../../../boids/Model/Boid.ts";
import type {EngagementSlot} from "../../../../engagement/slotManagement/model/EngagementSlot.ts";
import Vector2 = Phaser.Math.Vector2;
import Phaser from "phaser";

export const ORBIT_DIRECTION = ['CW', 'CCW'] as const;
export type OrbitDirection = typeof ORBIT_DIRECTION[number];

export class EngagementOrbitTarget implements SteeringBehaviour {

    orbitDirection: OrbitDirection;

    constructor(orbitDirection: OrbitDirection) {
        this.orbitDirection = orbitDirection;
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

        const toTarget: Vector2 = targetPos
            .clone()
            .subtract(boid.pos);

        if (toTarget.lengthSq() === 0) return;

        const toTargetDir: Vector2 = toTarget.normalize();

        const orbitVector: Vector2 =
            this.orbitDirection === 'CW'
                ? clockwisePerpendicular(toTargetDir)
                : counterClockwisePerpendicular(toTargetDir);

        steeringContext.putInterestForVelocity(orbitVector, weight);
    }
}

function clockwisePerpendicular(vector: Vector2): Vector2 {
    return new Vector2(vector.y, -vector.x);
}

function counterClockwisePerpendicular(vector: Vector2): Vector2 {
    return new Vector2(-vector.y, vector.x);
}