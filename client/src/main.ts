import Phaser from 'phaser';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

class MainScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.player = this.add.rectangle(100, 100, 16, 16, 0x00ff00);
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'w') this.move(0, -10);
      if (event.key === 's') this.move(0, 10);
      if (event.key === 'a') this.move(-10, 0);
      if (event.key === 'd') this.move(10, 0);
    });

    socket.on('character-moved', (data: any) => {
      // here you will handle other characters (not implemented yet)
    });
  }

  move(dx: number, dy: number) {
    this.player.x += dx;
    this.player.y += dy;
    socket.emit('move', { x: this.player.x, y: this.player.y });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MainScene],
  parent: 'game-container',
  backgroundColor: '#1d212d'
};

new Phaser.Game(config);
