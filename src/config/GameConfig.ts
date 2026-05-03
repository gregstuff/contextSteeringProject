import {Faction} from "../constants/Faction.ts";
import {SteeringBehaviourType} from "../steering/constants/SteeringBehaviourType.ts";

export const GAME_CONFIG : GameConfig = {
    boidsControllers: [
        {
            id: 'boids controller one',
            initialCount: 0,
            size: 30,
            maximumSpeed: 3,
            maximumForce: 0.05,
            faction: Faction.DEFENDER,
            steeringBehaviourConfigs: [
                {
                    steeringBehaviour: SteeringBehaviourType.TARGET_SEEK,
                    weight: 0.5,
                    useDebug: true
                }
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