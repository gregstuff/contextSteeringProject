import {Faction} from "../constants/Faction.ts";
import {SteeringBehaviourType} from "../steering/constants/SteeringBehaviourType.ts";
import {BoidModuleType} from "../constants/BoidModuleType.ts";
import {SteeringPipelineType} from "../constants/SteeringPipelineType.ts";
import {StateMachineType} from "../steering/stateMachine/constants/StateMachineType.ts";

export const GAME_CONFIG : GameConfig = {
    boidsControllers: [
        {
            id: 'boids',
            enabled: false,
            initialCount: 0,
            size: 5,
            color: 0xffffff,
            maximumSpeed: 4,
            maximumForce: 0.05,
            faction: Faction.DEFENDER,
            modules: [],
            steeringConfig: {
                pipelineType: SteeringPipelineType.SEQUENTIAL_STATELESS_PIPELINE,
                behaviourConfigs: [
                    {
                        steeringBehaviour: SteeringBehaviourType.SELF_FACTION_SEEK,
                        weight: 0.3,
                        useDebug: false
                    },
                    {
                        steeringBehaviour: SteeringBehaviourType.SELF_FACTION_FLEE,
                        weight: 0.45,
                        useDebug: false
                    },
                    {
                        steeringBehaviour: SteeringBehaviourType.ALIGNMENT,
                        weight: 0.5,
                        useDebug: false
                    },
                    {
                        steeringBehaviour: SteeringBehaviourType.SIMPLE_FORWARDS,
                        weight: 0.1,
                        useDebug: false
                    },
                    {
                        steeringBehaviour: SteeringBehaviourType.AVOID_OBSTACLES,
                        weight: 1,
                        useDebug: false
                    },
                    {
                        steeringBehaviour: SteeringBehaviourType.OTHER_FACTION_FLEE,
                        weight: 1,
                        useDebug: false
                    }
                ],
            }
        },
        {
            id: 'predator',
            enabled: false,
            initialCount: 0,
            size: 15,
            color: 0xff0000,
            maximumSpeed: 4,
            maximumForce: 0.2,
            faction: Faction.AGGRESSOR,
            steeringConfig: {
                pipelineType: SteeringPipelineType.SEQUENTIAL_STATELESS_PIPELINE,
                behaviourConfigs:[
                    {
                        steeringBehaviour: SteeringBehaviourType.SIMPLE_FORWARDS,
                        weight: 0.1,
                        useDebug: false
                    },
                    {
                        steeringBehaviour: SteeringBehaviourType.CHASE_TARGET,
                        weight: 1,
                        useDebug: false
                    },
                ],
            },
            modules: [
                {
                    moduleType: BoidModuleType.PREDATOR
                }
            ]
        },
        {
            id: 'defence engager',
            enabled: true,
            initialCount: 0,
            size: 15,
            color: 0xff0000,
            maximumSpeed: 4,
            maximumForce: 0.2,
            faction: Faction.DEFENDER,
            steeringConfig: {
                pipelineType: SteeringPipelineType.STATE_MACHINE,
                stateMachine: StateMachineType.ENGAGEMENT
            },
            modules: [
                {
                    moduleType: BoidModuleType.ENGAGEMENT
                }
            ]
        },
        {
            id: 'aggressor engager',
            enabled: true,
            initialCount: 0,
            size: 15,
            color: 0xff0000,
            maximumSpeed: 4,
            maximumForce: 0.2,
            faction: Faction.AGGRESSOR,
            steeringConfig: {
                pipelineType: SteeringPipelineType.STATE_MACHINE,
                stateMachine: StateMachineType.ENGAGEMENT
            },
            modules: [
                {
                    moduleType: BoidModuleType.ENGAGEMENT
                }
            ]
        }
    ],
    obstacleController: {
        size: 20
    }
};

export interface GameConfig {
    boidsControllers: BoidsControllerConfig[];
    obstacleController: ObstacleConfig;
}

export interface BoidsControllerConfig {
    id: string;
    enabled: boolean;
    color: number;
    initialCount: number;
    size: number;
    maximumSpeed: number;
    maximumForce: number;
    faction: Faction,
    modules: BoidModuleConfig[]
    steeringConfig: SteeringConfig;
}

export interface BoidModuleConfig {
    moduleType: BoidModuleType
}

export interface SteeringBehaviourConfig {
    steeringBehaviour: SteeringBehaviourType,
    weight: number,
    useDebug: boolean
}

export interface SteeringConfig {
    pipelineType: SteeringPipelineType;
    behaviourConfigs?: SteeringBehaviourConfig[];
    stateMachine?: StateMachineType;
}

export interface ObstacleConfig {
    size: number;
}