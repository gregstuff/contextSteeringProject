import Vector2 = Phaser.Math.Vector2;

export enum EngagementSlotDirection {
    NORTH,
    EAST,
    SOUTH,
    WEST
}

export const DIRECTIONS: EngagementSlotDirection[] = [
    EngagementSlotDirection.NORTH,
    EngagementSlotDirection.EAST,
    EngagementSlotDirection.SOUTH,
    EngagementSlotDirection.WEST,
];

export function directionToVector(direction: EngagementSlotDirection): Vector2 {
    switch(direction) {
        case EngagementSlotDirection.EAST:
            return new Vector2(1, 0);
        case EngagementSlotDirection.WEST:
            return new Vector2(-1, 0);
        case EngagementSlotDirection.NORTH:
            return new Vector2(0, 1);
        case EngagementSlotDirection.SOUTH:
            return new Vector2(0, -1);
    }
}