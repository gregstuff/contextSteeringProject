import Phaser from 'phaser'
import { Start } from './scenes/Start.ts'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    title: 'Steering One',
    parent: 'app',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [Start],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
}

new Phaser.Game(config)