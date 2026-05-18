import type {SteeringIntentService} from "../SteeringIntentService.ts";
import {SteeringIntent} from "../constants/SteeringIntent.ts";
import {Boid, type BoidWithDistance} from "../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;
import {DistanceBand, distanceToDistanceBand} from "../../../constants/DistanceBand.ts";
import type {EngagementSlot} from "../../../engagement/slotManagement/model/EngagementSlot.ts";
import type {Entity} from "../../../constants/Util.ts";

const CACHE_SECONDS = 0.1;

type TargetRelativeContext = {
    currentPosition: Vector2,
    projectedPosition: Vector2,
    toTargetDir: Vector2,
    projectedPositionToTargetDir: Vector2,
    currentDistanceFromTarget: number,
    projectedDistanceFromTarget: number,
    currentDistanceBand: DistanceBand,
    projectedDistanceBand: DistanceBand
    targetVelocity: Vector2
};

type RadialScore = {
    advance: number;
    retreat: number;
    maintain: number;
};

type OrbitScore = {
    none: number;
    cw: number;
    ccw: number;
};

type OrbitDirections = {
    cw: Vector2;
    ccw: Vector2;
};

type ProjectedPresence = {
    boid: Boid;
    projectedPos: Vector2;
};

type RadialIntent = 'ADVANCE' | 'RETREAT' | 'MAINTAIN';
type OrbitIntent = 'NONE' | 'CW' | 'CCW';

class EngagementSteeringIntent implements SteeringIntentService {

    lastCacheSeconds: number;

    constructor() {
        this.lastCacheSeconds = 0;
    }

    resolveSteeringIntent(allEntities: Entity[],
                          localBoids: Boid[], secondsSinceStart: number): void {

        if(this.lastCacheSeconds + CACHE_SECONDS > secondsSinceStart) return;

        this.lastCacheSeconds = secondsSinceStart;

        const boidTargetContexts = {} as Partial<Record<string, TargetRelativeContext>>;
        const presenceByTarget = new Map<string, ProjectedPresence[]>();

        // build agent to agent reference data
        for(let i: number = 0; i < allEntities.length; ++i) {
            const relevantEntity: Entity = allEntities[i];

            if(!(relevantEntity instanceof Boid)) continue;

            const relevantBoid = relevantEntity as Boid;

            const relevantEngagementSlot: EngagementSlot | undefined
                = relevantBoid.blackboard.engagementCache.reservedSlot;

            if(!relevantEngagementSlot) continue;

            const engagementTarget: Boid
                = relevantEngagementSlot.slotOwner;

            const engagementTargetSlotPos: Vector2 =
                relevantEngagementSlot.computePosition();

            const currentPosition: Vector2 = relevantBoid.pos;

            const projectedPosition: Vector2
                = currentPosition.clone().add(relevantBoid.velocity.clone().scale(CACHE_SECONDS));

            const targetVelocity: Vector2 = engagementTarget.velocity;

            const projectedSlotPosition: Vector2 =
                engagementTargetSlotPos.clone().add(targetVelocity.clone().scale(CACHE_SECONDS));

            const toTarget: Vector2 =
                engagementTargetSlotPos.clone().subtract(currentPosition);

            const fromProjectedPositionToTarget: Vector2 =
                projectedSlotPosition.clone().subtract(projectedPosition);

            const currentDistanceFromTarget: number =
                toTarget.length();

            const projectedDistanceFromTarget: number =
                fromProjectedPositionToTarget.length();

            const toTargetDir: Vector2 = toTarget.normalize();

            const projectedPositionToTargetDir: Vector2
                = fromProjectedPositionToTarget.normalize();

            const currentDistanceBand = distanceToDistanceBand(currentDistanceFromTarget);

            const projectedDistanceBand = distanceToDistanceBand(projectedDistanceFromTarget);

            const presences: ProjectedPresence[] = presenceByTarget.get(engagementTarget.id) ?? [];
            presences.push({ boid: relevantBoid, projectedPos: projectedPosition });
            presenceByTarget.set(engagementTarget.id, presences);

            boidTargetContexts[relevantBoid.id] = {
                currentPosition,
                projectedPosition,
                toTargetDir,
                projectedPositionToTargetDir,
                currentDistanceFromTarget,
                projectedDistanceFromTarget,
                currentDistanceBand,
                projectedDistanceBand,
                targetVelocity
            };
        }

        for(let i: number = 0; i < localBoids.length; ++i) {

            const relevantBoid: Boid = localBoids[i];

            const relevantEngagementSlot: EngagementSlot | undefined
                = relevantBoid.blackboard.engagementCache.reservedSlot;

            const targetRelativeCtx: TargetRelativeContext | undefined = boidTargetContexts[relevantBoid.id];

            // if there's no engagement info for this boid, can't do anything
            if (!targetRelativeCtx || !relevantEngagementSlot) continue;

            const relevantAgents: BoidWithDistance[] = [
                ...relevantBoid.closeDistanceEnemies,
                ...relevantBoid.closeDistanceFriendlies,
                ...relevantBoid.mediumDistanceEnemies,
                ...relevantBoid.mediumDistanceFriendlies
            ];

            const relevantProjectedPresences: ProjectedPresence[] =
                presenceByTarget.get(relevantEngagementSlot?.slotOwner.id) ?? [];

            const radialIntentScore: RadialScore =
                this.getRadialIntentScore(targetRelativeCtx);

            const orbitalIntentScore: OrbitScore =
                this.getOrbitScores(relevantBoid, targetRelativeCtx, relevantAgents, relevantProjectedPresences);

            const resolvedIntent: SteeringIntent = this.getSteeringIntent(radialIntentScore, orbitalIntentScore);

            relevantBoid.blackboard.steeringIntentCache.currentState = resolvedIntent;
        }
    }

    getOrbitScores(
        boid: Boid,
        context: TargetRelativeContext,
        relevantAgents: BoidWithDistance[],
        presences: ProjectedPresence[]
    ): OrbitScore {
        const addScore =
            (scoreA: OrbitScore, scoreB: OrbitScore): OrbitScore => {
            return {
                cw: scoreA.cw + scoreB.cw,
                ccw: scoreA.ccw + scoreB.ccw,
                none: scoreA.none + scoreB.none
            }
        };

        const getRepulsiveScores = (): OrbitScore => {
            const toTargetDir = context.toTargetDir;
            const cw = new Vector2(toTargetDir.y, -toTargetDir.x);
            const ccw = new Vector2(-toTargetDir.y, toTargetDir.x);

            let cwRepulsion = 0;
            let ccwRepulsion = 0;
            const EPSILON = 0.01;

            for (const presence of presences) {
                if (presence.boid.id === boid.id) continue;

                const toOther = presence.projectedPos.clone().subtract(context.projectedPosition);
                const distSq = toOther.lengthSq();
                const repulsionWeight = 1 / (distSq + EPSILON);

                const dirToOther = toOther.clone().normalize();

                // which orbit direction does this friendly sit in?
                const cwAlignment = dirToOther.dot(cw);
                const ccwAlignment = dirToOther.dot(ccw);

                if (cwAlignment > 0) cwRepulsion += cwAlignment * repulsionWeight;
                if (ccwAlignment > 0) ccwRepulsion += ccwAlignment * repulsionWeight;
            }

            // repulsion pushes you away — high cwRepulsion means bias CCW
            return {
                cw: -cwRepulsion,
                ccw: -ccwRepulsion,
                none: 0
            };
        }

        const getOrbitDirs = () => {
            const toTargetDir: Vector2 = context.toTargetDir;
            return {
                cw: new Vector2(toTargetDir.y, -toTargetDir.x),
                ccw: new Vector2(-toTargetDir.y, toTargetDir.x),
            };
        }

        const {cw, ccw} = getOrbitDirs();

        let scores = {
            none: 1,
            cw: 3,
            ccw: 3,
        };

        for (let i = 0; i < relevantAgents.length; ++i) {
            const other = relevantAgents[i].boid;
            if (other.id === boid.id) continue;

            const fromBoidToOther = other.pos.clone().subtract(context.currentPosition);
            const distSq = fromBoidToOther.lengthSq();

            if (distSq === 0) continue;

            const dirToOther = fromBoidToOther.normalize();

            const cwBlocked = dirToOther.dot(cw);
            const ccwBlocked = dirToOther.dot(ccw);

            // If another agent is in the CW direction, reduce CW score.
            if (cwBlocked > 0.5) {
                scores.cw -= cwBlocked * 4;
            }

            // If another agent is in the CCW direction, reduce CCW score.
            if (ccwBlocked > 0.5) {
                scores.ccw -= ccwBlocked * 4;
            }
        }

        const repulsionVariation = getRepulsiveScores();

        const scoresWithRepulsion = addScore(repulsionVariation, scores);

        return scoresWithRepulsion;
    }

    getSteeringIntent(radialScores: RadialScore, orbitalScores: OrbitScore): SteeringIntent {
        const pickRadialIntent = (): RadialIntent => {
            if (radialScores.advance >= radialScores.retreat && radialScores.advance >= radialScores.maintain) {
                return 'ADVANCE';
            }

            if (radialScores.retreat >= radialScores.advance && radialScores.retreat >= radialScores.maintain) {
                return 'RETREAT';
            }

            return 'MAINTAIN';
        }

        const pickOrbitIntent = (): OrbitIntent => {
            if (orbitalScores.cw >= orbitalScores.ccw && orbitalScores.cw >= orbitalScores.none) {
                return 'CW';
            }

            if (orbitalScores.ccw >= orbitalScores.cw && orbitalScores.ccw >= orbitalScores.none) {
                return 'CCW';
            }

            return 'NONE';
        }

        const radial = pickRadialIntent();
        const orbit = pickOrbitIntent();

        if (orbit === 'NONE') {
            switch (radial) {
                case 'ADVANCE':
                    return SteeringIntent.ADVANCE;
                case 'RETREAT':
                    return SteeringIntent.RETREAT;
                case 'MAINTAIN':
                    return SteeringIntent.MAINTAIN_POSITION;
            }
        }

        if (orbit === 'CW') {
            switch (radial) {
                case 'ADVANCE':
                    return SteeringIntent.ORBIT_ADVANCE_CW;
                case 'RETREAT':
                    return SteeringIntent.ORBIT_RETREAT_CW;
                case 'MAINTAIN':
                    return SteeringIntent.ORBIT_CW;
            }
        }

        switch (radial) {
            case 'ADVANCE':
                return SteeringIntent.ORBIT_ADVANCE_CCW;
            case 'RETREAT':
                return SteeringIntent.ORBIT_RETREAT_CCW;
            case 'MAINTAIN':
                return SteeringIntent.ORBIT_CCW;
        }
    }

    getRadialIntentScore(context: TargetRelativeContext): RadialScore {
        const scoreForCurr = () => {
            switch (context.currentDistanceBand) {
                case DistanceBand.TOO_CLOSE:
                    return {
                        advance: 0,
                        retreat: 10,
                        maintain: 0,
                    };

                case DistanceBand.CLOSE:
                    return {
                        advance: 0,
                        retreat: 4,
                        maintain: 2,
                    };

                case DistanceBand.MID:
                    return {
                        advance: 0,
                        retreat: 0,
                        maintain: 8,
                    };

                case DistanceBand.FAR:
                    return {
                        advance: 5,
                        retreat: 0,
                        maintain: 1,
                    };

                case DistanceBand.TOO_FAR:
                    return {
                        advance: 10,
                        retreat: 0,
                        maintain: 0,
                    };
            }
        }

        const adjustForProjection = (
            scores: RadialScore
        ): RadialScore  => {
            if (
                context.currentDistanceBand === DistanceBand.TOO_CLOSE &&
                context.projectedDistanceFromTarget < context.currentDistanceFromTarget
            ) {
                scores.retreat += 5;
            }

            if (
                context.currentDistanceBand === DistanceBand.TOO_FAR &&
                context.projectedDistanceFromTarget > context.currentDistanceFromTarget
            ) {
                scores.advance += 5;
            }

            return scores;
        }

        const adjustForTargetVelocity = (scores: RadialScore): RadialScore => {
            const targetClosingSpeed = context.targetVelocity.dot(context.toTargetDir) * -1;

            if (context.currentDistanceBand === DistanceBand.TOO_CLOSE && targetClosingSpeed > 0) {
                scores.retreat += 4;
            }

            if (context.currentDistanceBand === DistanceBand.CLOSE && targetClosingSpeed > 0) {
                scores.retreat += 2;
            }

            if (context.currentDistanceBand === DistanceBand.FAR && targetClosingSpeed < 0) {
                scores.advance += 4;
            }

            if (context.currentDistanceBand === DistanceBand.MID && targetClosingSpeed < 0) {
                scores.advance += 2;
            }

            return scores;
        };

        return adjustForTargetVelocity(adjustForProjection(scoreForCurr()));
    }

}

export default EngagementSteeringIntent