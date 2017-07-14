var game = new Phaser.Game(900, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update});


function preload(){
  var img1 = game.load.image('phaser', 'assets/backgrounds/phaser_img.png');

};
function create(){
  //game.stage.backgroundColor = "#FFFFF";
  game.add.sprite(0,0,'phaser');

};
function update(){

};
