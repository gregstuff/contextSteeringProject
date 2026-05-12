import Vector2 = Phaser.Math.Vector2;
import { type BoidWithDistance } from "./Boid.ts";
import type {EngagementSlot} from "../../engagement/slotManagement/model/EngagementSlot.ts";

export type BoidBlackboard = {
    wanderAngle: number;
    targetBoid: BoidWithDistance | undefined;
    steeringCache: SteeringCache;
    engagementCache: EngagementCache;
    steeringStateMachine: SteeringStateMachineCache;
}

export type SteeringCache = {
    selfFactionSeekLastCacheSeconds: number | undefined;
    selfFactionSeekPoint: Vector2 | undefined;
    selfFactionFleeLastCacheSeconds: number | undefined;
    selfFactionFleePoint: Vector2 | undefined;
    alignmentCacheSeconds: number | undefined;
    alignmentVector: Vector2 | undefined;
    avoidObstaclesCacheSeconds: number | undefined;
    avoidObstaclesVector: Vector2 | undefined;
    otherFactionFleePoint: Vector2 | undefined;
    otherFactionFleeLastCacheSeconds: number | undefined;
    avoidAgentDirections: Vector2[] | undefined;
    avoidAgentLastCacheSeconds: number | undefined;
}

export type EngagementCache = {
    reservedSlot: EngagementSlot | undefined;
}

export type SteeringStateMachineCache = {
    currentState: string | undefined;
    lastStateChange: number | undefined;
    delaySeconds: number | undefined;
}
