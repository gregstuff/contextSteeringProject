import {TargetSteeringBehaviour} from './behaviours/impl/TargetSteeringBehaviour.js';
import {SteeringContext} from './model/SteeringContext.js';
import type {SteeringBehaviourConfig, SteeringConfig} from "../config/GameConfig.ts";
import {Boid} from "../boids/Model/Boid.ts";
import {SteeringBehaviourType} from "./constants/SteeringBehaviourType.ts";
import type {SteeringBehaviour} from "./behaviours/SteeringBehaviour.ts";
import Phaser from "phaser";
import {WanderingBehaviour} from "./behaviours/impl/WanderingBehaviour.ts";
import {SelfFactionSeek} from "./behaviours/impl/SelfFactionSeek.ts";
import {Alignment} from "./behaviours/impl/Alignment.ts";
import {SelfFactionFlee} from "./behaviours/impl/SelfFactionFlee.ts";
import {SimpleForwards} from "./behaviours/impl/SimpleForwards.ts";
import {AvoidObstacles} from "./behaviours/impl/AvoidObstacles.ts";
import {ChaseTarget} from "./behaviours/impl/ChaseTarget.ts";
import {OtherFactionFleeingBehaviour} from "./behaviours/impl/OtherFactionFleeingBehaviour.ts";
import {SteeringPipelineType} from "../constants/SteeringPipelineType.ts";
import Vector2 = Phaser.Math.Vector2;
import type {SteeringStateMachine} from "./stateMachine/SteeringStateMachine.ts";
import {StateMachineType} from "./stateMachine/constants/StateMachineType.ts";
import {EngagementStateMachine} from "./stateMachine/impl/EngagementStateMachine.ts";
import {OtherFactionSeekingBehaviour} from "./behaviours/impl/OtherFactionSeekingBehaviour.ts";
import {EngagementAvoidAgents} from "./behaviours/impl/Engagement/EngagementAvoidAgents.ts";
import {EngagementOrbitTarget} from "./behaviours/impl/Engagement/EngagementOrbitTarget.ts";
import {
    EngagementMaintainIdealRangeForTarget
} from "./behaviours/impl/Engagement/EngagementMaintainIdealRangeForTarget.ts";

export class SteeringController {

    steeringConfig: SteeringConfig;
    mappedSteeringBehaviours: Record<SteeringBehaviourType, SteeringBehaviour>;
    mappedStateMachines: Record<StateMachineType, SteeringStateMachine>;

    constructor(steeringConfig: SteeringConfig) {
        this.steeringConfig = steeringConfig;
        this.mappedStateMachines = {
          [StateMachineType.ENGAGEMENT]: new EngagementStateMachine()
        };
        this.mappedSteeringBehaviours = {

            // pipeline behaviours
            [SteeringBehaviourType.TARGET_SEEK]: new TargetSteeringBehaviour(),
            [SteeringBehaviourType.WANDER]: new WanderingBehaviour(),
            [SteeringBehaviourType.SELF_FACTION_SEEK]: new SelfFactionSeek(),
            [SteeringBehaviourType.SELF_FACTION_FLEE]: new SelfFactionFlee(),
            [SteeringBehaviourType.ALIGNMENT]: new Alignment(),
            [SteeringBehaviourType.SIMPLE_FORWARDS]: new SimpleForwards(),
            [SteeringBehaviourType.AVOID_OBSTACLES]: new AvoidObstacles(),
            [SteeringBehaviourType.CHASE_TARGET]: new ChaseTarget(),
            [SteeringBehaviourType.OTHER_FACTION_FLEE]: new OtherFactionFleeingBehaviour(),
            [SteeringBehaviourType.OTHER_FACTION_SEEK]: new OtherFactionSeekingBehaviour(),
            //

            // engagement state machine
            [SteeringBehaviourType.ENGAGEMENT_AVOID_AGENTS]: new EngagementAvoidAgents(),
            [SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CCW]: new EngagementOrbitTarget('CCW'),
            [SteeringBehaviourType.ENGAGEMENT_ORBIT_TARGET_CW]: new EngagementOrbitTarget('CW'),
            [SteeringBehaviourType.ENGAGEMENT_MAINTAIN_IDEAL_RANGE]: new EngagementMaintainIdealRangeForTarget()
            //


        };
    }

    updateBoid(boid: Boid, secondsSinceStart:number, target?: Vector2): SteeringContext {
        const ctx = new SteeringContext(target);

        switch(this.steeringConfig.pipelineType){
            case SteeringPipelineType.SEQUENTIAL_STATELESS_PIPELINE:
                this.sequentialStateless(ctx, boid, secondsSinceStart);
                break;
            case SteeringPipelineType.STATE_MACHINE:
                this.stateMachine(ctx, boid, secondsSinceStart);
                break;
        }

        const desiredVelocity: Vector2 = ctx.desiredVelocity();

        const clampedDesiredVelocity: Vector2 = desiredVelocity.clone().limit(boid.maximumSpeed);

        const newVelocity: Vector2 = boid.velocity.clone().lerp(clampedDesiredVelocity, boid.maximumForce);

        boid.move(newVelocity);

        return ctx;
    }

    stateMachine(ctx: SteeringContext, boid: Boid, secondsSinceStart: number): void {
        const relevantStateMachine: StateMachineType | undefined = this.steeringConfig.stateMachine;
        if(!relevantStateMachine) throw new Error("Misconfiguration for state machine");

        const stateMachine: SteeringStateMachine = this.mappedStateMachines[relevantStateMachine];

        stateMachine.computeState(boid, secondsSinceStart);

        const statefulSteeringBehaviours: SteeringBehaviourConfig[] = stateMachine.getPipelineForState(boid);

        for(let i: number = 0; i< statefulSteeringBehaviours.length; ++i){
            const { steeringBehaviour, weight, useDebug } = statefulSteeringBehaviours[i];

            const mappedBehaviour: SteeringBehaviour = this.mappedSteeringBehaviours[steeringBehaviour];

            mappedBehaviour.steer(ctx, boid, secondsSinceStart, weight, useDebug);
        }
    }

    sequentialStateless(ctx: SteeringContext, boid: Boid, secondsSinceStart: number): void{
        const behaviourConfigs: SteeringBehaviourConfig[] | undefined = this.steeringConfig.behaviourConfigs;
        if(!behaviourConfigs) throw new Error("Misconfiguration for steering behaviours");

        for(let i: number = 0; i < behaviourConfigs.length; ++i){

            const { steeringBehaviour, weight, useDebug } = behaviourConfigs[i];

            const mappedBehaviour: SteeringBehaviour = this.mappedSteeringBehaviours[steeringBehaviour];

            mappedBehaviour.steer(ctx, boid, secondsSinceStart, weight, useDebug);
        }
    }

}