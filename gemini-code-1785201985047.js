const STORES_DATA = [
  {
    id: 'eco',
    name: 'EcoAlliance Hub',
    category: '🌱 Environmental & Sustainability',
    roofColor: '#43a047',
    roofDark: '#2e7d32',
    x: 180, y: 150,
    description: 'Focused on urban gardening, beach cleanups, and local food waste reduction initiatives. Join us to build a greener neighborhood!',
    link: 'https://example.org/eco'
  },
  {
    id: 'tech',
    name: 'CodeForGood Lab',
    category: '💻 Tech & Digital Literacy',
    roofColor: '#1e88e5',
    roofDark: '#1565c0',
    x: 580, y: 150,
    description: 'Empowering senior citizens and youth with digital skills, coding workshops, and refurbishing tech devices for families in need.',
    link: 'https://example.org/tech'
  },
  {
    id: 'youth',
    name: 'Youth Reach Guild',
    category: '🎨 Community & Arts Outreach',
    roofColor: '#8e24aa',
    roofDark: '#6a1b9a',
    x: 180, y: 430,
    description: 'Creating community art murals, hosting youth mentorship programs, and organizing neighborhood festivals to promote inclusivity.',
    link: 'https://example.org/youth'
  },
  {
    id: 'paws',
    name: 'Paws & Care Shelter',
    category: '🐾 Animal Welfare',
    roofColor: '#fb8c00',
    roofDark: '#e65100',
    x: 580, y: 430,
    description: 'Dedicated to animal rescue, fostering stray pets, and educating the public about responsible pet ownership.',
    link: 'https://example.org/paws'
  }
];

const touchInput = { up: false, down: false, left: false, right: false };

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, wasd, activeModalStore = null;

function preload() {
  generateDetailedTextures(this);
}

function create() {
  this.input.keyboard.disableGlobalCapture();

  this.add.tileSprite(0, 0, 800, 600, 'grassTile').setOrigin(0, 0);

  drawCobblestonePaths(this);
  drawFountainPlaza(this);
  createTownDecorations(this);

  const buildings = this.physics.add.staticGroup();

  STORES_DATA.forEach(store => {
    const bSprite = this.add.sprite(store.x, store.y, 'building_' + store.id);
    buildings.add(bSprite);
    bSprite.body.setSize(128, 96);

    this.add.text(store.x, store.y - 68, store.name, {
      font: 'bold 12px Segoe UI, sans-serif',
      fill: '#fdf6e3',
      backgroundColor: '#232b28',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    const doorZone = this.add.zone(store.x, store.y + 48, 40, 24);
    this.physics.add.existing(doorZone, true);
    doorZone.setData('info', store);

    this.physics.add.overlap(playerZoneTrigger, doorZone, (pz, zone) => {
      const info = zone.getData('info');
      if (activeModalStore !== info.id) {
        activeModalStore = info.id;
        openModal(info);
      }
    });
  });

  player = this.physics.add.sprite(400, 300, 'playerTile');
  player.setCollideWorldBounds(true);
  player.body.setSize(20, 20);
  player.body.setOffset(6, 12);

  const playerZoneTrigger = this.add.zone(0, 0, 24, 24);
  this.physics.add.existing(playerZoneTrigger);

  this.events.on('postupdate', () => {
    playerZoneTrigger.x = player.x;
    playerZoneTrigger.y = player.y;
  });

  this.physics.add.collider(player, buildings);

  this.input.on('pointerdown', () => window.focus());

  cursors = this.input.keyboard.createCursorKeys();
  wasd = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  setupTouchControls();
}

function update() {
  const speed = 160;
  player.body.setVelocity(0);

  const moveLeft = cursors.left.isDown || wasd.left.isDown || touchInput.left;
  const moveRight = cursors.right.isDown || wasd.right.isDown || touchInput.right;
  const moveUp = cursors.up.isDown || wasd.up.isDown || touchInput.up;
  const moveDown = cursors.down.isDown || wasd.down.isDown || touchInput.down;

  if (moveLeft) player.body.setVelocityX(-speed);
  else if (moveRight) player.body.setVelocityX(speed);

  if (moveUp) player.body.setVelocityY(-speed);
  else if (moveDown) player.body.setVelocityY(speed);

  player.body.velocity.normalize().scale(speed);

  if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
    player.angle = Math.sin(this.time.now / 80) * 4;
  } else {
    player.angle = 0;
  }
}

function generateDetailedTextures(scene) {
  const g = scene.make.graphics({x:0, y:0, add:false});
  g.fillStyle(0x5b8c38, 1);
  g.fillRect(0, 0, 32, 32);
  g.fillStyle(0x4d7a2d, 1);
  g.fillRect(2, 6, 4, 6);
  g.fillRect(18, 20, 4, 6);
  g.fillRect(24, 4, 4, 6);
  g.fillStyle(0x6ba842, 1);
  g.fillRect(4, 4, 2, 4);
  g.fillRect(20, 18, 2, 4);
  g.generateTexture('grassTile', 32, 32);

  const p = scene.make.graphics({x:0, y:0, add:false});
  p.fillStyle(0x2c3e50, 1);
  p.fillRect(10, 22, 5, 8);
  p.fillRect(17, 22, 5, 8);
  p.fillStyle(0xe74c3c, 1);
  p.fillRect(8, 10, 16, 13);
  p.fillStyle(0xffdbac, 1);
  p.fillRect(9, 2, 14, 10);
  p.fillStyle(0x5c3a21, 1);
  p.fillRect(8, 0, 16, 4);
  p.fillRect(7, 3, 4, 5);
  p.fillStyle(0x1a252f, 1);
  p.fillRect(11, 6, 2, 3);
  p.fillRect(19, 6, 2, 3);
  p.generateTexture('playerTile', 32, 32);

  STORES_DATA.forEach(store => {
    const b = scene.make.graphics({x:0, y:0, add:false});
    b.fillStyle(0xded3b8, 1);
    b.fillRect(4, 28, 120, 68);
    b.fillStyle(0x5c3a21, 1);
    b.fillRect(4, 28, 6, 68);
    b.fillRect(118, 28, 6, 68);
    b.fillRect(4, 90, 120, 6);

    const primary = Phaser.Display.Color.HexStringToColor(store.roofColor).color;
    const dark = Phaser.Display.Color.HexStringToColor(store.roofDark).color;
    
    b.fillStyle(primary, 1);
    b.fillRect(0, 0, 128, 28);
    b.fillStyle(dark, 1);
    for (let rx = 0; rx < 128; rx += 16) {
      b.fillRect(rx, 14, 8, 14);
    }

    b.fillStyle(0x3e2723, 1);
    b.fillRect(52, 58, 24, 34);
    b.fillStyle(0xffb74d, 1);
    b.fillRect(70, 75, 3, 3);

    b.fillStyle(0x81d4fa, 1);
    b.fillRect(18, 44, 22, 22);
    b.fillRect(88, 44, 22, 22);
    b.fillStyle(0x5c3a21, 1);
    b.fillRect(28, 44, 2, 22);
    b.fillRect(18, 54, 22, 2);
    b.fillRect(98, 44, 2, 22);
    b.fillRect(88, 54, 22, 2);

    b.generateTexture('building_' + store.id, 128, 96);
  });

  const t = scene.make.graphics({x:0, y:0, add:false});
  t.fillStyle(0x4a3525, 1);
  t.fillRect(12, 24, 8, 16);
  t.fillStyle(0x2e7d32, 1);
  t.fillCircle(16, 14, 14);
  t.fillStyle(0x1b5e20, 1);
  t.fillCircle(12, 10, 8);
  t.generateTexture('treeTile', 32, 40);

  const fl = scene.make.graphics({x:0, y:0, add:false});
  fl.fillStyle(0xf48fb1, 1);
  fl.fillCircle(4, 4, 3);
  fl.fillStyle(0xffeb3b, 1);
  fl.fillCircle(12, 8, 3);
  fl.fillStyle(0x90caf9, 1);
  fl.fillCircle(6, 12, 3);
  fl.generateTexture('flowerPatch', 16, 16);
}

function drawCobblestonePaths(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xc2b280, 1);
  g.fillRect(360, 0, 80, 600);
  g.fillRect(0, 270, 800, 60);

  g.fillStyle(0xa8996e, 1);
  for (let y = 10; y < 600; y += 24) {
    g.fillRect(372, y, 16, 10);
    g.fillRect(408, y + 12, 16, 10);
  }
  for (let x = 10; x < 800; x += 24) {
    g.fillRect(x, 280, 10, 14);
    g.fillRect(x + 12, 302, 10, 14);
  }
}

function drawFountainPlaza(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0x8d6e63, 1);
  g.fillCircle(400, 300, 38);
  g.fillStyle(0x4fc3f7, 1);
  g.fillCircle(400, 300, 32);
  g.fillStyle(0x0288d1, 1);
  g.fillCircle(400, 300, 16);
}

function createTownDecorations(scene) {
  const trees = [[50,40], [100,40], [50,540], [100,540], [700,40], [750,40], [700,540], [750,540]];
  trees.forEach(([x, y]) => scene.add.image(x, y, 'treeTile'));

  const flowers = [[330, 240], [450, 240], [330, 350], [450, 350]];
  flowers.forEach(([x, y]) => scene.add.image(x, y, 'flowerPatch'));
}

function setupTouchControls() {
  const bindBtn = (id, direction) => {
    const el = document.getElementById(id);
    const start = (e) => { e.preventDefault(); touchInput[direction] = true; window.focus(); };
    const end = (e) => { e.preventDefault(); touchInput[direction] = false; };
    el.addEventListener('pointerdown', start);
    el.addEventListener('pointerup', end);
    el.addEventListener('pointerleave', end);
  };
  bindBtn('btn-up', 'up');
  bindBtn('btn-down', 'down');
  bindBtn('btn-left', 'left');
  bindBtn('btn-right', 'right');
}

function openModal(data) {
  document.getElementById('modal-title').innerText = data.name;
  document.getElementById('modal-category').innerText = data.category;
  document.getElementById('modal-desc').innerText = data.description;
  document.getElementById('modal-link').href = data.link;
  document.getElementById('org-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('org-modal').classList.remove('active');
  activeModalStore = null;
}