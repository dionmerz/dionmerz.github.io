
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse, loopCount) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
    this.count = 1;
    this.totalLoops = loopCount;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {

    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;

    if (this.loop || this.count < this.totalLoops) {
        if (this.isDone()) {
            this.elapsedTime = this.elapsedTime - this.totalTime;
            this.count++;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;

    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


//Entity Area


function Hero(game, x, y) {
  this.type = "hero";
  this.animationRight = new Animation(AM.getAsset("./img/horz_walk_right.png"), 0, 0, 104, 128, .01 , 31, true, false);
  this.animationLeft = new Animation(AM.getAsset("./img/horz_walk_left.png"), 0, 0, 80, 128, .03 , 31, true, false);
  this.animationFindHookshot = new Animation(AM.getAsset("./img/found_hookshot.png"), 0, 0, 54, 125, .05, 30, false, false, 2);
  this.animationOpenChest = new Animation(AM.getAsset("./img/left_facing_open_chest.png"), 0, 0, 44, 59, .05, 30, false, false);
  this.game = game;
  this.x = x;
  this.y = y;
  this.speed = 200;
  this.jumpSpeed = 6;
  this.fallSpeed = 12;
  this.jumpMax = this.jumpSpeed * 20;
  this.jumpCurrent = 0;
  this.hooked = false;
  this.removeFromWorld = false;
  this.ctx = game.ctx;
  this.width = 40;
  this.height = 70;
  this.scale = .65;
  this.openedChest = false;


}

Hero.prototype.update = function() {

  if (this.game.scene === 1) {

    if (this.x > 125 && this.x > 400) {
      this.x -= this.game.clockTick * this.speed;

    }
    else if (this.x >= 125 && this.x <= 400) {
      this.x -= this.game.clockTick * (this.speed / 2);
    }

  }

  else if(this.game.scene === 2) {
    if (this.x < 800) {
      this.x += this.game.clockTick * (this.speed + 150);
      if (this.x >= 765) {
        this.removeFromWorld = true;
      }

    }

  }

  if (this.y < 800) {
      this.y += this.fallSpeed ;
      if (this.jumpCurrent > 0) {
        this.jumpCurrent -= this.fallSpeed;
      }
      if (this.jumpCurrent < 0) {
        this.jumpCurrent = 0;
      }
    }



  collisionCheck(this.game, this);

};

Hero.prototype.draw = function(ctx) {

  if (this.game.scene === 1) {

    if (this.x > 125) {
      this.animationLeft.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }


    else if (this.x < 125 && !this.openedChest) {
      this.animationOpenChest.drawFrame(this.game.clockTick, ctx, this.x - 15, this.y - 8, 1.3);
      if (this.animationOpenChest.isDone()) {
        this.openedChest = true;
      }
    }
    else if (this.x < 125 && this.openedChest) {
      this.game.screenShake = true;

      this.animationFindHookshot.drawFrame(this.game.clockTick, ctx, this.x, this.y - 90, 1.3);


      if (this.animationFindHookshot.isDone()){
          this.game.scene = 2;
          this.game.screenShake = false;

      }

    }
    else {
      ctx.drawImage(AM.getAsset("./img/horz_walk_left.png"),
                  330 , 0,  // source from sheet
                  85, 128,
                  this.x, this.y,
                  85 * this.scale,
                  128 * this.scale);
    }
  }

  if (this.game.scene === 2) {

    if (this.x < 750) {
      this.animationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

    }
    else  {
      ctx.drawImage(AM.getAsset("./img/horz_walk_right.png"),
                  0 , 0,  // source from sheet
                  85, 128,
                  this.x, this.y,
                  85 * this.scale,
                  128 * this.scale);
    }




  }



/*
  if (this.game.moveRight) {
    this.animationRight.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
  }

*/

};



function Boulder(game, x, y) {
  this.x = x;
  this.y = y;
  this.fallSpeed = 800;
  this.speed = 450;
  this.width=140;
  this.height =160;
  this.game = game;
  this.falling = true;
  this.rolling = false;
  this.animationRoll = new Animation(AM.getAsset("./img/boulder.png"), 0, 0, 128, 128, .1, 16, true, true);

}

Boulder.prototype.update = function() {
  if (this.game.scene === 2){
    if (this.y < 800 && this.falling) {
      this.y += this.fallSpeed * this.game.clockTick;
      collide = collisionCheck(this.game, this);
      if (collide.bottom === true) {
        this.falling = false;
        this.rolling = true
      }
    }
    //Rollings
    if (!this.falling && this.rolling) {
      this.x += this.speed * this.game.clockTick;
      console.log(this.x + "      " + this.y);

      if (this.x >= 700) {
       this.rolling = false;
      }

    }
  }

}

Boulder.prototype.draw = function(ctx) {

  if (this.game.scene === 2){
    if (this.falling) {
      ctx.drawImage(AM.getAsset("./img/boulder.png"), 0, 0, 128, 128, this.x, this.y, 165, 165);
    }
    else if (this.rolling) {
      this.animationRoll.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.3);
    }
    else if (!this.rolling && !this.falling){
      ctx.drawImage(AM.getAsset("./img/boulder.png"), 0, 0, 128, 128, this.x, this.y, 165, 165);

    }
  }

}


function Background(game) {
    this.x = 0;
    this.y = 400;
    this.radius = 200;
    this.count = 0;
    this.game = game;
}


Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
  if (this.game.screenShake) {
    var shakeSize = 5;

      if (this.count % 3 === 0) {
        ctx.drawImage(AM.getAsset("./img/stonebackground.png"),
                  0 , 0,
                  1190, 785,
                  -shakeSize, -shakeSize,
                  1200,
                  800);
                }
      else {
        ctx.drawImage(AM.getAsset("./img/stonebackground.png"),
                  0 , 0,
                  1190, 785,
                  shakeSize, shakeSize,
                  1200,
                  800);
                }
                this.count++;
    }

  else {
    ctx.drawImage(AM.getAsset("./img/stonebackground.png"),
                0 , 0,
                1190, 785,
                0, 0,
                1200,
                800);
              }
}

function Map(game, map) {
  this.game = game;
  this.type = "map";
  this.rows = 13;
  this.cols = 38;
  this.map = map;
  this.mapBlocks = new Array(this.rows);

  for (var i = 0; i < this.rows; i++) {
    this.mapBlocks[i] = new Array(this.cols / 2);
  }
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      this.mapBlocks[i][j] = new Block(game, j * 64, i * 64, map[i][j]);
    }
  }
}

Map.prototype.update = function() {

  if(this.game.rightEdge === true) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 19; j < this.cols; j++) {
        var newX = j - 19;
        this.mapBlocks[i][newX] = new Block(this.game, newX * 64, i * 64, this.map[i][j]);
      }
    }
    this.game.rightEdge = false;
  } else if (this.game.leftEdge === true) {
    for (var i = 0; i < this.rows; i++) {
      for (var j = 0; j < 19; j++) {
        this.mapBlocks[i][j] = new Block(this.game, j * 64, i * 64, this.map[i][j]);
      }
    }
    this.game.leftEdge = false;
  }

};

Map.prototype.draw = function(ctx) {

  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      var tile = this.mapBlocks[i][j];
      tile.draw(ctx);
    }
  }
};

function Block(game, x , y, type) {
  this.type = type;
  this.game = game;
  this.x = x;
  this.y = y;
  this.spriteHeight = 32;
  this.spriteWidth = 32;
  //this.scale = 2;
  this.height= 64;
  this.width = 64;
  this.torch = new Animation(AM.getAsset("./img/torch.png"), 0, 0, 59, 148, .03 , 50, true, false);
  this.opening = null;
  this.chestAnimation = new Animation(AM.getAsset("./img/chest_open_rightside.png"), 0, 0, 47, 44, .05, 50, false, false);
}

Block.prototype.update = function() {

};

Block.prototype.draw = function(ctx) {

  if (this.type === 1) {
    ctx.drawImage(AM.getAsset("./img/background_tile.png"),
                0 , 0,  // source from sheet
                512, 512,
                this.x, this.y,
                this.width,
                this.width);
  }
  else if (this.type === 9) {
    ctx.drawImage(AM.getAsset("./img/door.png"),
                0 , 0,  // source from sheet
                94, 60,
                this.x, this.y - 28,
                94 * 1.5,
                60 * 1.5);  }



  else if (this.type === 8) {
        this.torch.drawFrame(this.game.clockTick, ctx, this.x, this.y, .5);
  }

  else if (this.type === 6) {
    if (this.game.scene === 1){
      if (this.opening) {
        this.chestAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.6);
        if (this.chestAnimation.isDone()) {
          this.opening = false;
        }
      }
      else {
        ctx.drawImage(AM.getAsset("./img/chest_open_rightside.png"),
                    0 , 0,  // source from sheet
                    44, 44,
                    this.x, this.y,
                    44 * 1.6,
                    44 * 1.6);
      }
    }
    else if (this.game.scene === 2) {
      ctx.drawImage(AM.getAsset("./img/chest_open_rightside.png"),
                  0 , 0,  // source from sheet
                  44, 44,
                  this.x, this.y,
                  44 * 1.6,
                  44 * 1.6);
    }


  }

};

function collisionCheck(game, sprite) {
  var collide = {
    right: false,
    left: false,
    top: false,
    bottom: false
  };

  // Get the Map out of the Games Entity list
  var map = null;
  for (var i = 0; i < game.entities.length; i++) {
    var e = game.entities[i];
    if (e.type === "map") {
      map = e;
    }
  }


  var gridY = Math.round(map.rows * (sprite.y  / (64 * map.rows)));
  var gridX = Math.round(map.cols * (sprite.x / (64 * map.cols)));

  if (gridX < 0) gridX = 0;
  if (gridY < 0) gridY = 0;
  if (gridX >= map.cols) gridX = map.cols - 1;
  if (gridY >= map.rows) gridY = map.rows - 1;

  // Detection for hitting a Block
  for (var i = 0; i < map.rows; i++) {
    for (var j = 0; j < map.cols; j++) {
      var block = map.mapBlocks[i][j];

      // If its block type 1

      if (block.type === 1) {


        //If Hero hits a block from the top with Hero's Feet
        if (sprite.y + sprite.height  <= block.y + sprite.fallSpeed &&
            sprite.y + sprite.height >= block.y &&
            ((sprite.x <= block.x + block.width && sprite.x >= block.x) ||
            (sprite.x + sprite.width >= block.x &&
            sprite.x  <= block.x + block.width))) {

                collide.bottom = true;
                sprite.y = block.y - sprite.height;

        }

       // Head
       if (sprite.y <= block.y + block.height &&
           sprite.y >= (block.y + block.height) - sprite.jumpSpeed * 2 &&
         ((sprite.x <= block.x + block.width && sprite.x >= block.x) ||
          (sprite.x + sprite.width > block.x &&
           sprite.x  < block.x + block.width))) {

                collide.top = true;
                sprite.y = block.y + block.height;
       }

       // left
        if (sprite.x + sprite.width > block.x  &&
            sprite.x < (block.x + block.width) &&
            sprite.x >= (block.x + block.width) - sprite.game.clockTick * sprite.speed &&
            sprite.y  < block.y + block.height &&
            sprite.height + sprite.y > block.y) {

            collide.left = true;
            sprite.x = (block.x + block.width) + 1;

       }


       // right
       if (sprite.x < block.x &&
            sprite.x + sprite.width > block.x &&
            sprite.x + sprite.width <= block.x + sprite.game.clockTick * sprite.speed &&
            sprite.y  < block.y + block.height &&
            sprite.height + sprite.y > block.y) {

            collide.right = true;
            sprite.x = (block.x - sprite.width) - 3;

       }
     }

     else if (block.type === 6) {
       // left
        if (sprite.x + sprite.width > block.x  &&
            sprite.x < (block.x + block.width) &&
            sprite.x >= (block.x + block.width) - sprite.game.clockTick * sprite.speed &&
            sprite.y  < block.y + block.height &&
            sprite.height + sprite.y > block.y) {

            if (block.opening === null) {
              block.opening = true;

            }
       }
     }
    }
  }
  return collide;
}


var mapArray = [[1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,8,1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,0,0,0,0,8,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,6,0,8,0,8,0,8,0,8,0,9,0,8,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
              ];


var AM = new AssetManager();


AM.queueDownload("./img/boulder.png");
AM.queueDownload("./img/stonebackground.png");
AM.queueDownload("./img/background_tile.png");


AM.queueDownload("./img/horz_walk_left.png");
AM.queueDownload("./img/horz_walk_right.png");
AM.queueDownload("./img/torch.png");
AM.queueDownload("./img/door.png");
AM.queueDownload("./img/chest_open_rightside.png");
AM.queueDownload("./img/found_hookshot.png");
AM.queueDownload("./img/left_facing_open_chest.png");

AM.downloadAll(function () {

    var canvas = document.getElementById("GameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.ctx = ctx;


    var bg = new Background(gameEngine);
    var boulder = new Boulder(gameEngine, 150,-200);
    var map = new Map(gameEngine, mapArray);
    var hero = new Hero(gameEngine, 800,610);
    hero.game.direction = "left";

    gameEngine.init(ctx);
    gameEngine.addEntity(bg);
    gameEngine.addEntity(map);
    gameEngine.addEntity(boulder);
    gameEngine.addEntity(hero);
    gameEngine.start();

});
