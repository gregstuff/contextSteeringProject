import type {SteeringStateMachine} from "../SteeringStateMachine.ts";
import {type Boid} from "../../../boids/Model/Boid.ts";
import type {SteeringBehaviour} from "../../behaviours/SteeringBehaviour.ts";
import {EngagementAvoidAgents} from "../../behaviours/impl/Engagement/EngagementAvoidAgents.ts";
import {EngagementMaintainIdealRangeForTarget} from "../../behaviours/impl/Engagement/EngagementMaintainIdealRangeForTarget.ts";
import {EngagementOrbitTarget} from "../../behaviours/impl/Engagement/EngagementOrbitTarget.ts";
import type {SteeringBehaviourConfig} from "../../../config/GameConfig.ts";
import {SteeringBehaviourType} from "../../constants/SteeringBehaviourType.ts";

const MOVE_SECONDS_MIN: number = 1;
const MOVE_SECONDS_MAX: number = 1.5;

const PAUSE_SECONDS_MIN: number = 1;
const PAUSE_SECONDS_MAX: number = 1.5;

const ENGAGEMENT_STATES = ['ORBIT_CW', 'ORBIT_CCW', 'STATIC', 'PAUSED'] as const;
type EngagementState = typeof ENGAGEMENT_STATES[number];

const engagementStateToPipeline = {
    'ORBIT_CW': [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_IDEAL_RANGE
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
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_IDEAL_RANGE
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
    'STATIC' : [
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_MAINTAIN_IDEAL_RANGE
        },
        {
            weight: 0.5,
            useDebug: false,
            steeringBehaviour: SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS
        }
    ],
    'PAUSED': [],

} satisfies Record<EngagementState, SteeringBehaviourConfig[]>;

export class EngagementStateMachine implements SteeringStateMachine {
    getPipelineForState(boid: Boid): SteeringBehaviourConfig[] {

        const currState: EngagementState | undefined =
            boid.blackboard.steeringStateMachine.currentState as EngagementState | undefined;

        if(currState === undefined) return [];

        return engagementStateToPipeline[currState];
    }

    computeState(boid: Boid, secondsSinceStart: number): void {
        const currState: EngagementState | undefined =
            boid.blackboard.steeringStateMachine.currentState as EngagementState | undefined;

        const lastChangeTick: number | undefined =
            boid.blackboard.steeringStateMachine.lastStateChange;

        const delaySeconds: number | undefined =
            boid.blackboard.steeringStateMachine.delaySeconds;

        const isPause: boolean = currState === 'PAUSED';

        const decisionExpired: boolean = ((lastChangeTick ?? 0) + (delaySeconds ?? 0)) < secondsSinceStart;

        if(!decisionExpired) return;

        const newDelaySeconds = isPause
            ? Phaser.Math.FloatBetween(PAUSE_SECONDS_MIN, PAUSE_SECONDS_MAX)
            : Phaser.Math.FloatBetween(MOVE_SECONDS_MIN, MOVE_SECONDS_MAX);

        boid.blackboard.steeringStateMachine.lastStateChange = secondsSinceStart;
        boid.blackboard.steeringStateMachine.delaySeconds = newDelaySeconds;

        const newState: EngagementState = isPause
            ? ENGAGEMENT_STATES[Phaser.Math.Between(0, ENGAGEMENT_STATES.length-2)]
            : 'PAUSED';

        boid.blackboard.steeringStateMachine.currentState = newState;
    }

}