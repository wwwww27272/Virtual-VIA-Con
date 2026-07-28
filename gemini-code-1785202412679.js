const STORES_DATA = [
  {
    id: 'eco',
    name: 'EcoAlliance Hub',
    category: '🌱 Environmental VIA',
    color: 0x2e7d32,
    roofColor: 0x43a047,
    x: 180, y: 150,
    description: 'Focused on urban gardening, beach cleanups, and local food waste reduction initiatives. Join us to build a greener neighborhood!',
    link: 'https://example.org/eco'
  },
  {
    id: 'tech',
    name: 'CodeForGood Lab',
    category: '💻 Tech & Digital Literacy',
    color: 0x1565c0,
    roofColor: 0x1e88e5,
    x: 580, y: 150,
    description: 'Empowering senior citizens and youth with digital skills, coding workshops, and refurbishing tech devices for families in need.',
    link: 'https://example.org/tech'
  },
  {
    id: 'youth',
    name: 'Youth Reach Guild',
    category: '🎨 Community & Arts Outreach',
    color: 0x6a1b9a,
    roofColor: 0x8e24aa,
    x: 180, y: 430,
    description: 'Creating community art murals, hosting youth mentorship programs, and organizing neighborhood festivals to promote inclusivity.',
    link: 'https://example.org/youth'
  },
  {
    id: 'paws',
    name: 'Paws & Care Shelter',
    category: '🐾 Animal Welfare',
    color: 0xef6c00,
    roofColor: 0xfb8c00,
    x: 580, y: 430,
    description: 'Dedicated to animal rescue, fostering stray pets, and educating the public about responsible pet ownership.',
    link: 'https://example.org/paws'
  }
];

const touchInput = { up: false, down: false, left: false, right: false };
let player, cursors, wasd, activeModalStore = null;

const config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: { create, update }
};

const game = new Phaser.Game(config);

function create() {
  const scene = this;

  // 1. Draw Town Ground & Roads
  const bg = scene.add.graphics();
  bg.fillStyle(0x4a7c29, 1);
  bg.fillRect(0, 0, 800, 600);

  // Pathways
  bg.fillStyle(0xc2b280, 1);
  bg.fillRect(360, 0, 80, 600);
  bg.fillRect(0, 270, 800, 60);

  // Central Fountain
  bg.fillStyle(0x8d6e63, 1);
  bg.fillCircle(400, 300, 38);
  bg.fillStyle(0x0288d1, 1);
  bg.fillCircle(400, 300, 30);

  // Decor Trees
  const treePositions = [[50,40], [100,40], [50,540], [100,540], [700,40], [750,40], [700,540], [750,540]];
  treePositions.forEach(([tx, ty]) => {
    bg.fillStyle(0x3e2723, 1);
    bg.fillRect(tx - 3, ty, 6, 12);
    bg.fillStyle(0x1b5e20, 1);
    bg.fillCircle(tx, ty - 6, 14);
  });

  // 2. Physics & Building Setup
  const buildings = scene.physics.add.staticGroup();

  STORES_DATA.forEach(store => {
    // Render Building Graphics
    const bGraph = scene.add.graphics();
    bGraph.fillStyle(store.color, 1);
    bGraph.fillRect(store.x - 60, store.y - 40, 120, 80);
    
    // Roof
    bGraph.fillStyle(store.roofColor, 1);
    bGraph.fillRect(store.x - 64, store.y - 50, 128, 16);
    
    // Door
    bGraph.fillStyle(0x3e2723, 1);
    bGraph.fillRect(store.x - 12, store.y + 10, 24, 30);

    // Label Above Store
    scene.add.text(store.x, store.y - 62, store.name, {
      font: 'bold 12px sans-serif',
      fill: '#ffffff',
      backgroundColor: '#1a221f',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    // Physics Barrier
    const dummy = scene.add.rectangle(store.x, store.y, 120, 80);
    scene.physics.add.existing(dummy, true);
    buildings.add(dummy);

    // Interaction Zone at Front Door
    const doorZone = scene.add.zone(store.x, store.y + 35, 40, 30);
    scene.physics.add.existing(doorZone, true);
    doorZone.setData('info', store);

    scene.physics.add.overlap(playerTriggerZone, doorZone, () => {
      if (activeModalStore !== store.id) {
        activeModalStore = store.id;
        openModal(store);
      }
    });
  });

  // 3. Character Setup
  const playerGraphic = scene.add.graphics();
  playerGraphic.fillStyle(0x1565c0, 1);
  playerGraphic.fillRect(-10, -10, 20, 20);
  playerGraphic.fillStyle(0xffdbac, 1);
  playerGraphic.fillCircle(0, -4, 6);

  player = scene.add.container(400, 300, [playerGraphic]);
  scene.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  player.body.setSize(20, 20);

  const playerTriggerZone = scene.add.zone(400, 300, 20, 20);
  scene.physics.add.existing(playerTriggerZone);

  scene.events.on('postupdate', () => {
    playerTriggerZone.x = player.x;
    playerTriggerZone.y = player.y;
  });

  scene.physics.add.collider(player, buildings);

  // 4. Keyboard Controls
  cursors = scene.input.keyboard.createCursorKeys();
  wasd = {
    up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };

  setupTouchControls();

  // Close Modal Handler
  document.getElementById('modal-close').onclick = closeModal;
}

function update() {
  if (!player || !player.body) return;

  const speed = 170;
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
}

function setupTouchControls() {
  const bindBtn = (id, dir) => {
    const el = document.getElementById(id);
    if (!el) return;
    const start = (e) => { e.preventDefault(); touchInput[dir] = true; };
    const end = (e) => { e.preventDefault(); touchInput[dir] = false; };
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