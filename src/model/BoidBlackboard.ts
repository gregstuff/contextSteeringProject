import Vector2 = Phaser.Math.Vector2;

export type BoidBlackboard = {
    wanderAngle: number;
    selfFactionSeekLastCacheSeconds: number | undefined;
    selfFactionSeekPoint: Vector2 | undefined;
    selfFactionFleeLastCacheSeconds: number | undefined;
    selfFactionFleePoint: Vector2 | undefined;
    alignmentCacheSeconds: number | undefined;
    alignmentVector: Vector2 | undefined;
}