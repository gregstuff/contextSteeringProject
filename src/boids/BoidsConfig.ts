import type {Faction} from "../constants/Faction.ts";
import type {SteeringBehaviourConfig} from "../config/GameConfig.ts";

export class BoidsConfig {
    id: string;
    initialCount: number;
    size: number;
    faction: Faction;
    maximumSpeed: number;
    maximumForce: number;
    eventEmitter: Phaser.Events.EventEmitter;
    steeringBehaviourConfigs: SteeringBehaviourConfig[];

    constructor(
        id: string,
        initialCount: number,
        size: number,
        faction: Faction,
        maximumSpeed: number,
        maximumForce: number,
        steeringBehaviourConfigs: SteeringBehaviourConfig[],
        eventEmitter: Phaser.Events.EventEmitter) {
        this.id = id;
        this.initialCount = initialCount;
        this.size = size;
        this.faction = faction;
        this.maximumSpeed = maximumSpeed;
        this.maximumForce = maximumForce;
        this.eventEmitter = eventEmitter;
        this.steeringBehaviourConfigs = steeringBehaviourConfigs;
    }
}