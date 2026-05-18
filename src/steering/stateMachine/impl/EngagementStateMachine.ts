import type {SteeringStateMachine} from "../SteeringStateMachine.ts";
import {type Boid} from "../../../boids/Model/Boid.ts";
import type {SteeringBehaviourConfig} from "../../../config/GameConfig.ts";
import {SteeringBehaviourType} from "../../constants/SteeringBehaviourType.ts";
import {SteeringIntent} from "../../intent/constants/SteeringIntent.ts";
import Phaser from "phaser";

const MOVE_SECONDS_MIN: number = 1;
const MOVE_SECONDS_MAX: number = 1.5;

const PAUSE_SECONDS_MIN: number = 1;
const PAUSE_SECONDS_MAX: number = 1.5;

const engagementStateToPipeline = {
    'ADVANCE': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_CLOSE_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'RETREAT': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_FAR_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'ORBIT_ADVANCE_CW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_CLOSE_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CW
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'ORBIT_RETREAT_CW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_FAR_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CW
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'ORBIT_ADVANCE_CCW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_CLOSE_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CCW
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'ORBIT_RETREAT_CCW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_FAR_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CCW
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'ORBIT_CW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_MEDIUM_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CW
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'ORBIT_CCW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_MEDIUM_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CCW
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'MAINTAIN_POSITION' : [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_MEDIUM_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'PAUSED': [],

} satisfies Record<SteeringIntent, SteeringBehaviourConfig[]>;

export class EngagementStateMachine implements SteeringStateMachine {

    getPipelineForState(boid: Boid): SteeringBehaviourConfig[] {

        const currState: SteeringIntent | undefined =
            boid.blackboard.steeringStateMachine.currentState as SteeringIntent | undefined;

        if(currState === undefined) return [];

        return engagementStateToPipeline[currState];
    }

    computeState(boid: Boid, secondsSinceStart: number): void {
        const lastCacheSeconds = boid.blackboard.steeringStateMachine.lastStateChange;
        const lastUpdateDelaySeconds = boid.blackboard.steeringStateMachine.delaySeconds;

        if(lastCacheSeconds && lastUpdateDelaySeconds &&
            lastCacheSeconds + lastUpdateDelaySeconds > secondsSinceStart) return;

        boid.blackboard.steeringStateMachine.lastStateChange = secondsSinceStart;

        const currState = boid.blackboard.steeringStateMachine.currentState as SteeringIntent | undefined;

        const isPaused = !currState || currState == 'PAUSED';

        boid.blackboard.steeringStateMachine.currentState =
            isPaused ? boid.blackboard.steeringIntentCache.currentState : 'PAUSED';

        boid.blackboard.steeringStateMachine.delaySeconds =
            isPaused
                ? Phaser.Math.FloatBetween(MOVE_SECONDS_MIN, MOVE_SECONDS_MAX)
                : Phaser.Math.FloatBetween(PAUSE_SECONDS_MIN, PAUSE_SECONDS_MAX);

    }

}