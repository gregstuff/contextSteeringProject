import { TargetSteeringBehaviour } from './behaviours/impl/TargetSteeringBehaviour.js';
import { SteeringContext } from './model/SteeringContext.js';
import type {SteeringBehaviourConfig} from "../config/GameConfig.ts";
import Vector2 = Phaser.Math.Vector2;
import { Boid } from "../model/Boid.ts";
import {SteeringBehaviourType} from "./constants/SteeringBehaviourType.ts";
import type {SteeringBehaviour} from "./behaviours/SteeringBehaviour.ts";
import Phaser from "phaser";
import {WanderingBehaviour} from "./behaviours/impl/WanderingBehaviour.ts";
import {SelfFactionSeek} from "./behaviours/impl/SelfFactionSeek.ts";
import {Alignment} from "./behaviours/impl/Alignment.ts";
import {SelfFactionFlee} from "./behaviours/impl/SelfFactionFlee.ts";

export class SteeringController {

    steeringBehaviourConfigs: SteeringBehaviourConfig[];
    mappedSteeringBehaviours: Partial<Record<SteeringBehaviourType, SteeringBehaviour>>;

    constructor(steeringBehaviourConfigs: SteeringBehaviourConfig[]) {
        this.steeringBehaviourConfigs = steeringBehaviourConfigs;
        this.mappedSteeringBehaviours = {
            [SteeringBehaviourType.TARGET_SEEK]: new TargetSteeringBehaviour(),
            [SteeringBehaviourType.WANDER]: new WanderingBehaviour(),
            [SteeringBehaviourType.SELF_FACTION_SEEK]: new SelfFactionSeek(),
            [SteeringBehaviourType.SELF_FACTION_FLEE]: new SelfFactionFlee(),
            [SteeringBehaviourType.ALIGNMENT]: new Alignment(),
        };
    }

    updateBoid(boid: Boid, secondsSinceStart:number, target?: Vector2): SteeringContext {
        const ctx = new SteeringContext(target);

        for(let i: number = 0; i < this.steeringBehaviourConfigs.length; ++i){

            const { steeringBehaviour, weight, useDebug } = this.steeringBehaviourConfigs[i];

            const mappedBehaviour = this.mappedSteeringBehaviours[steeringBehaviour];

            if(!mappedBehaviour) throw Error(`No behaviour mapped for: ${steeringBehaviour}`);

            mappedBehaviour.steer(ctx, boid, secondsSinceStart, weight, useDebug);
        }

        const desiredVelocity: Vector2 = ctx.desiredVelocity();

        const clampedDesiredVelocity: Vector2 = desiredVelocity.clone().limit(boid.maximumSpeed);

        const newVelocity: Vector2 = boid.velocity.clone().lerp(clampedDesiredVelocity, boid.maximumForce);

        boid.move(newVelocity);

        return ctx;
    }

}