import Phaser from "phaser";

export enum Direction {
    RIGHT= 'RIGHT',
    DOWN_RIGHT = 'DOWN_RIGHT',
    DOWN = 'DOWN',
    DOWN_LEFT = 'DOWN_LEFT',
    LEFT = 'LEFT',
    UP_LEFT = 'UP_LEFT',
    UP = 'UP',
    UP_RIGHT = 'UP_RIGHT'
}

export const DIRECTION_COUNT = Object.keys(Direction).length;

export const DIRECTION_TO_VECTOR: Record<Direction, Phaser.Math.Vector2> = {
    RIGHT: new Phaser.Math.Vector2(1, 0),
    DOWN_RIGHT: new Phaser.Math.Vector2(1, 1),
    DOWN: new Phaser.Math.Vector2(0, 1),
    DOWN_LEFT: new Phaser.Math.Vector2(-1, 1),
    LEFT: new Phaser.Math.Vector2(-1, 0),
    UP_LEFT: new Phaser.Math.Vector2(-1, -1),
    UP: new Phaser.Math.Vector2(0, -1),
    UP_RIGHT: new Phaser.Math.Vector2(1, -1)
}

export const DIRECTIONS: Direction[] = [
    Direction.RIGHT,
    Direction.DOWN_RIGHT,
    Direction.DOWN,
    Direction.DOWN_LEFT,
    Direction.LEFT,
    Direction.UP_LEFT,
    Direction.UP,
    Direction.UP_RIGHT
];