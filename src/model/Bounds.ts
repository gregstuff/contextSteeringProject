export class Bounds {

    width: number;
    height: number;
    widthBoundsMax: number;
    widthBoundsMin: number;
    heightBoundsMax: number;
    heightBoundsMin: number;

    constructor(width: number, height: number, boundsBuffer: number){
        this.width = width;
        this.height = height;

        this.widthBoundsMax = width * boundsBuffer;
        this.widthBoundsMin = width - this.widthBoundsMax;

        this.heightBoundsMax = height * boundsBuffer;
        this.heightBoundsMin = height - this.heightBoundsMax;
    }
}