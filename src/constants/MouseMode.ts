export enum MouseMode {
    TARGET,
    SPAWN,
    OBSTACLE
}

export const MOUSE_MODE_LENGTH: number = Object.values(MouseMode).filter(v => typeof v === 'number').length;