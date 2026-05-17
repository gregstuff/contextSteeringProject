export enum DistanceBand {
    TOO_CLOSE = 'TOO_CLOSE',
    CLOSE = 'CLOSE',
    MID = 'MID',
    FAR = 'FAR',
    TOO_FAR = 'TOO_FAR'
}

export const DistanceForDistanceBand = {
    [DistanceBand.TOO_CLOSE]: 50,
    [DistanceBand.CLOSE]: 100,
    [DistanceBand.MID]: 200,
    [DistanceBand.FAR]: 350,
    [DistanceBand.TOO_FAR]: 999
} as Record<DistanceBand, number>;

export function distanceToDistanceBand(dist: number): DistanceBand {
    if (dist <= DistanceForDistanceBand[DistanceBand.TOO_CLOSE]) return DistanceBand.TOO_CLOSE;
    if (dist <= DistanceForDistanceBand[DistanceBand.CLOSE]) return DistanceBand.CLOSE;
    if (dist <= DistanceForDistanceBand[DistanceBand.MID]) return DistanceBand.MID;
    if (dist <= DistanceForDistanceBand[DistanceBand.FAR]) return DistanceBand.FAR;

    return DistanceBand.TOO_FAR;
}