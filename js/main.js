var game = new Phaser.Game(1000, 700, Phaser.CANVAS, '', { preload: preload, create: create, update: update});

var platforms,
    towers,
    things,
    explosions,
    player,
    controls,
    keyboard;

function preload(){
  game.load.image('background1', 'assets/backgrounds/background1.png');
  game.load.image('grass_platform_large', "assets/backgrounds/grass_platform_large.png");
  game.load.image('grass_platform_small', "assets/backgrounds/grass_platform_small.png")
  game.load.spritesheet('littleRed', 'assets/sprites/littleRedSpritesheet.png',44,48);
  game.load.image('ground', 'assets/backgrounds/ground.png');
  game.load.spritesheet('player', 'assets/sprites/player_spritesheet.png', 75, 83.7, 12);
  game.load.spritesheet('boom', 'assets/effects/boom.png', 256, 256, 64);

};
function create(){
  keyboard = game.input.keyboard;
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.setBoundsToWorld();


  game.add.image(0,0,'background1');

  createPlayer();
  things = game.add.group();
  things.enableBody = true;

  explosions = game.add.group();
  explosions.scale.setTo(1,1);
  explosions.immovable = true;



  createMap();

};
function update(){
  var hitPlatform = game.physics.arcade.collide(things, platforms);
  var towerPlatform = game.physics.arcade.collide(towers, platforms);
  var playerGround = game.physics.arcade.collide(player, platforms);
  var enemiesCollide = game.physics.arcade.collide(things, things);
  var boomPlatform = game.physics.arcade.collide(explosions, platforms);

  performPlayerControl(playerGround);
  animateThings();



};


function createPlayer() {
  //********ATTRIBUTES********//
  player = game.add.sprite(200,200,'player');
  game.physics.arcade.enable(player);
  player.anchor.setTo(0,1);
  player.body.gravity.y = 400;
  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;
  player.runSpeed = 150;
  player.direction = ["left", "right"][Math.floor(Math.random() * 2)];
  player.reloadTimer = 0;

  //******ANIMATIONS*****//
  player.animations.add("moveRight", [8,9,10,11],10,true);
  player.animations.add("moveLeft",[4,5,6,7], 10, true);
  player.animations.add("standRight",[2,3],3,true);
  player.animations.add("standLeft",[0,1],3,true);



  //***** CONTROLS ******//
  leftKey = keyboard.addKey(Phaser.Keyboard.A);
  rightKey = keyboard.addKey(Phaser.Keyboard.D);
  jumpKey = keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  fireKey = keyboard.addKey(Phaser.Keyboard.SHIFT);







};

function performPlayerControl(playerGround){
  player.body.velocity.x = 0;

  if (player.reloadTimer > 0) player.reloadTimer--;

  if (rightKey.isDown) {
    player.body.velocity.x = player.runSpeed;
    player.animations.play("moveRight");
    player.direction = "right";

  }
  else if (leftKey.isDown) {
    player.body.velocity.x = -player.runSpeed;
    player.animations.play("moveLeft");
    player.direction = "left";
  }


  else {
    if (player.direction === "right") {
      player.animations.play("standRight");
    }
    else {
      player.animations.play("standLeft");

    }
  }

  if (jumpKey.isDown && player.body.touching.down && playerGround){

    player.body.velocity.y = -350;
  }
  if (fireKey.isDown && player.reloadTimer === 0) {
    createThing(player.x, player.y, player.body.velocity.x, player.body.velocity.y, player);
    player.reloadTimer = 60;
  }
};

function createMap() {

  platforms = game.add.group();
  platforms.enableBody = true;
  var ground = platforms.create(0, game.world.height - 100, 'ground');
  platforms.scale.setTo(1,1);
  ground.body.immovable = true;

//*******CREATE PLATFORMS*******//
  var plat_one = platforms.create(80, 450, 'grass_platform_large');
  var plat_two = platforms.create(game.width - 400, 450, 'grass_platform_large');
  var plat_three_small = platforms.create(140, 350, 'grass_platform_small');
  var plat_four_small = platforms.create(220, 250, 'grass_platform_small');
  var plat_five_small = platforms.create(game.width - 280, 350, 'grass_platform_small');
  var plat_six_small = platforms.create(game.width - 360, 250, 'grass_platform_small');
  var plat_seven_large = platforms.create(game.width / 3, 120, 'grass_platform_large');

//********PLATFORMS SETTINGS********//
  plat_one.scale.setTo(1,1);
  plat_one.body.immovable = true;
  plat_two.scale.setTo(1,1);
  plat_two.body.immovable = true;
  plat_three_small.scale.setTo(1,1);
  plat_three_small.body.immovable = true;
  plat_four_small.scale.setTo(1,1);
  plat_four_small.body.immovable = true;
  plat_five_small.scale.setTo(1,1);
  plat_five_small.body.immovable = true;
  plat_six_small.scale.setTo(1,1);
  plat_six_small.body.immovable = true;
  plat_seven_large.scale.setTo(1,1);
  plat_seven_large.body.immovable = true;


};

function createThing(x, y, xVel, yVel, player) {
  var littleThing;
  if (player.direction === "right") {
    littleThing = things.create(x + 50 ,y - 50, 'littleRed');

  }
  else{
    littleThing = things.create(x - 50 ,y - 50, 'littleRed');
  }


  game.physics.arcade.enable(littleThing);

  littleThing.body.gravity.y = 300;

  littleThing.speed = 5;
  littleThing.body.velocity.x = player.body.velocity.x;

  littleThing.checkWorldBounds = true;
  littleThing.anchor.setTo(0, 1);
  littleThing.animations.add('move', [0, 1], 10, true);
  littleThing.body.collideWorldBounds = true;
  littleThing.body.bounce.x = 1;
  littleThing.body.bounce.y = .5;
  littleThing.lifeTimer = 240;

};

function animateThings() {

  things.callAll('play', null, 'move');


  things.forEachAlive(function(boomer) {
    boomer.lifeTimer--;
    if (boomer.lifeTimer <= 0) {
      expl = explosions.create(boomer.x ,boomer.y, 'boom');
      expl.anchor.setTo(.4,.6);
      expl.animations.add('explode');
      game.physics.arcade.enable(expl);


      boomer.kill();
    }
  }, this);

  explosions.forEachAlive(function(explosion) {
    explosion.animations.play('explode',30,false,true);

  }, this);

  explosions.forEachDead(function(explosion) {
    explosion.kill();
  }, this);





}
