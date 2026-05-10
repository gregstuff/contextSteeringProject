import {Faction} from "../constants/Faction.ts";
import {SteeringBehaviourType} from "../steering/constants/SteeringBehaviourType.ts";
import {BoidModuleType} from "../constants/BoidModuleType.ts";

export const GAME_CONFIG : GameConfig = {
    boidsControllers: [
        {
            id: 'boids',
            initialCount: 100,
            size: 5,
            color: 0xffffff,
            maximumSpeed: 4,
            maximumForce: 0.05,
            faction: Faction.DEFENDER,
            steeringBehaviourConfigs: [
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
            modules: []
        },
        {
            id: 'predator',
            initialCount: 0,
            size: 15,
            color: 0xff0000,
            maximumSpeed: 4,
            maximumForce: 0.2,
            faction: Faction.AGGRESSOR,
            steeringBehaviourConfigs: [
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
            modules: [
                {
                    moduleType: BoidModuleType.PREDATOR
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
    color: number;
    initialCount: number;
    size: number;
    maximumSpeed: number;
    maximumForce: number;
    faction: Faction,
    steeringBehaviourConfigs: SteeringBehaviourConfig[]
    modules: BoidModuleConfig[]
}

export interface BoidModuleConfig {
    moduleType: BoidModuleType
}

export interface SteeringBehaviourConfig {
    steeringBehaviour: SteeringBehaviourType,
    weight: number,
    useDebug: boolean
}

export interface ObstacleConfig {
    size: number;
}