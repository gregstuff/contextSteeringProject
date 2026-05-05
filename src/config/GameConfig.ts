import {Faction} from "../constants/Faction.ts";
import {SteeringBehaviourType} from "../steering/constants/SteeringBehaviourType.ts";

export const GAME_CONFIG : GameConfig = {
    boidsControllers: [
        {
            id: 'boids controller one',
            initialCount: 500,
            size: 5,
            maximumSpeed: 6,
            maximumForce: 0.05,
            faction: Faction.DEFENDER,
            steeringBehaviourConfigs: [
                {
                    steeringBehaviour: SteeringBehaviourType.SELF_FACTION_FLEE,
                    weight: 1,
                    useDebug: false
                },
                {
                    steeringBehaviour: SteeringBehaviourType.SELF_FACTION_SEEK,
                    weight: 0.8,
                    useDebug: false
                },
                {
                    steeringBehaviour: SteeringBehaviourType.ALIGNMENT,
                    weight: 0.8,
                    useDebug: false
                },
                {
                    steeringBehaviour: SteeringBehaviourType.SIMPLE_FORWARDS,
                    weight: 0.2,
                    useDebug: false
                },
            ]
        }
    ]
};

export interface GameConfig {
    boidsControllers: BoidsControllerConfig[];
}

export interface BoidsControllerConfig {
    id: string;
    initialCount: number;
    size: number;
    maximumSpeed: number;
    maximumForce: number;
    faction: Faction,
    steeringBehaviourConfigs: SteeringBehaviourConfig[]
}

export interface SteeringBehaviourConfig {
    steeringBehaviour: SteeringBehaviourType,
    weight: number,
    useDebug: boolean
}