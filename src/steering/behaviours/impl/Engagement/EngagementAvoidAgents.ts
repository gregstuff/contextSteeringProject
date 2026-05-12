import type {SteeringBehaviour} from "../../SteeringBehaviour.ts";
import type {SteeringContext} from "../../../model/SteeringContext.ts";
import type {Boid} from "../../../../boids/Model/Boid.ts";
import Vector2 = Phaser.Math.Vector2;

const CACHE_SECONDS: number = 0.1;
const AVOIDANCE_RADIUS: number = 200;

export class EngagementAvoidAgents implements SteeringBehaviour {
    steer(steeringContext: SteeringContext, boid: Boid,
          secondsSinceStart: number, weight: number,
          debugOutput: boolean): void {

        this.resolveAvoidDirs(boid, secondsSinceStart);

        const avoidDirs: Vector2[] | undefined = boid.blackboard.steeringCache.avoidAgentDirections;

        if(!avoidDirs || avoidDirs.length === 0) return;

        for(let i: number = 0; i < avoidDirs.length; ++i) {
            steeringContext.putInterestForVelocity(avoidDirs[i], weight);
            steeringContext.putDangerForVelocity(avoidDirs[i].clone().scale(-1), weight);
        }
    }

    resolveAvoidDirs(boid: Boid, secondsSinceStart: number): void {

        const lastCacheSeconds = boid.blackboard.steeringCache.avoidAgentLastCacheSeconds;

        if(lastCacheSeconds && lastCacheSeconds + CACHE_SECONDS > secondsSinceStart) return;

        boid.blackboard.steeringCache.avoidAgentLastCacheSeconds = secondsSinceStart;

        const relevantAgents = [
            ...boid.closeDistanceEnemies,
            ...boid.closeDistanceFriendlies,
            ...boid.mediumDistanceEnemies,
            ...boid.mediumDistanceFriendlies
        ]

        const resolvedAvoidDirs: Vector2[] = [];

        for(let i: number =0; i < relevantAgents.length; ++i){
            const relevantAgent = relevantAgents[i];
            const dist = relevantAgent.toThis.length();
            const strength = Math.max(0, 1 - dist / AVOIDANCE_RADIUS);

            if(strength <= 0) continue;

            const avoidDir = boid.pos.clone().subtract(relevantAgent.boid.pos).normalize().scale(strength);
            resolvedAvoidDirs.push(avoidDir);
        }

        boid.blackboard.steeringCache.avoidAgentDirections = resolvedAvoidDirs;
    }

}