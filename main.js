var startButton = document
  .querySelector("#startGame")
  .addEventListener("click", () => {
    this.gameStart();
});

const PLAYER_RADIUS = 30; // player character radius size
const HALF_RADIUS = Math.floor(PLAYER_RADIUS/2); //for offsets
const JUMP_HEIGHT = 30; // jump height in y velocity
const FRICTION_FACTOR = 0.1; // friction factor float
const GRAVITY = 1.5; // gravity velocity factor
const MOVE_DIST = 5;
const BOMB_RADIUS = 20;
const FRUIT_RADIUS = 20;
const FRUIT_IMAGE_DIM = 55;
const BOMB_IMAGE_DIM = 55;
const CHAR_IMAGE_DIM = 55;
const HALF_CHAR_IMAGE_DIM = Math.floor(CHAR_IMAGE_DIM/2); // for char image offsets
const GAME_SPEED_UPDATE = 1; // on level change
var PLAYER_COLOR = "#d6a53e"; // circle player color
var CANVAS_WIDTH = 0;
var CANVAS_HEIGHT = 0;


function gameStart() { // MAIN GAME LOOP

  const canvas = document.getElementById("render-canvas");
  CANVAS_WIDTH = canvas.width; // set width heigh dynamically
  CANVAS_HEIGHT = canvas.height;
  const ctx = canvas.getContext('2d');
  
  function drawCircle(x, y, radius, border, border_colour, fill_colour) { 
    // draw player on canvas context
    ctx.beginPath();
    ctx.arc(x,y,radius,0,2*Math.PI);
    ctx.strokeStyle = border_colour;
    ctx.fillStyle = fill_colour;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function areColliding(x1, y1, r1, x2, y2, r2) { // circle 1 x y r and circle 2 as well
    let dx = x1 - x2;
    let dy = y1 - y2;
    let distance = Math.sqrt(dx * dx + dy * dy);
    // true if collision detected
    return distance < r1 + r2;
  }

  const bg = new Image();
  bg.src = './assets/BG.png';
  bg.position = { x: 0, y: 0 };
  const bg2 = new Image();
  bg2.src = './assets/BG.png';
  bg2.position = { x: canvas.width, y: 0 };
  const bg3 = new Image();
  bg3.src = './assets/m1.png';
  bg3.position = { x: 0, y: 0 };
  const bg4 = new Image();
  bg4.src = './assets/m1.png';
  bg4.position = { x: canvas.width, y: 0 };
  const bg5 = new Image();
  bg5.src = './assets/m3.png';
  bg5.position = { x: 0, y: 0 };
  var backgroundImages = [bg, bg2, bg3, bg4, bg5];
  

  randomBombx = Math.floor(Math.random() * 900) + 500;
  randomFruitx = Math.floor(Math.random() * 900) + 500;

  const bombImage = new Image();
  bombImage.src = './assets/bomb.png';
  bombImage.position = { x: randomBombx, y: CANVAS_HEIGHT-BOMB_IMAGE_DIM, width: BOMB_IMAGE_DIM, height: BOMB_IMAGE_DIM};

  const fruitImage = new Image();
  fruitImage.src = './assets/fruit.png'; // banana is too long for a var name
  fruitImage.position = { x: randomFruitx, y: CANVAS_HEIGHT-FRUIT_IMAGE_DIM, width: FRUIT_IMAGE_DIM, height: FRUIT_IMAGE_DIM};

  const charImage = new Image();
  charImage.src = './assets/character.png';
  charImage.position = { x: -HALF_CHAR_IMAGE_DIM+5, y: CANVAS_HEIGHT-CHAR_IMAGE_DIM, width: CHAR_IMAGE_DIM, height: CHAR_IMAGE_DIM};

  console.log(randomBombx, bombImage.position);
  
  player = { 
      y: CANVAS_HEIGHT-CHAR_IMAGE_DIM,
      x: 10, 
      jumping: false,
      xVelocity: 0,
      yVelocity: 0
  };
  
  let score = 0;
  let lives = 2;
  let gamespeed = 5;
  let level = 1;
  
  const controller = { // keyboard player controller object
      right: false,
      up: false,
      keyListener: function (event) {
          var key_state = (event.type == "keydown") ? true : false;
          switch (event.keyCode) {
              case 37: // left key
              controller.left = key_state;
              break;
              case 38: // up key
              controller.up = key_state;
              break;
              case 39: // right key
              controller.right = key_state;
              break;
          }
      }
  };    
  
  function renderLoop() { // RENDER GAME LOOP
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      document.getElementById("level").innerText = "Level: " + level;
      document.getElementById("lives").innerText = "Lives left: " + lives;
      document.getElementById("score").innerText = "Score: " + score;
      
      if (lives === 0){ // out of lives then game over
          document.getElementById("demo").innerText = "Game Over";
          return;
      }
      
      // collided with bomb, lose life
      if (areColliding(player.x, player.y, PLAYER_RADIUS, bombImage.position.x, bombImage.position.y, BOMB_RADIUS)){
        lives -= 1;
        bombImage.position.x = -BOMB_IMAGE_DIM-100; // hide from screen
      }

      // collided with banana
      if(areColliding(player.x, player.y, PLAYER_RADIUS, fruitImage.position.x, fruitImage.position.y, FRUIT_RADIUS)){
          score += 5;
          if (score % 10 != 0){
              gamespeed += GAME_SPEED_UPDATE;
              level += 1;
          }
          fruitImage.position.x = -FRUIT_IMAGE_DIM-100;
      }
      
      // update background positions (first render)
      backgroundImages.forEach(bg => {
        ctx.drawImage(bg, bg.position.x, bg.position.y, canvas.width, canvas.height);
        bg.position.x -= gamespeed;
      })

      // update fruit position
      ctx.drawImage(fruitImage, fruitImage.position.x, fruitImage.position.y,      fruitImage.position.width, fruitImage.position.height);
      fruitImage.position.x -= gamespeed;
    
      // update bomb position
      ctx.drawImage(bombImage, bombImage.position.x, bombImage.position.y,      bombImage.position.width, bombImage.position.height);
      bombImage.position.x -= gamespeed;

      // update player position
      drawCircle(player.x, player.y, PLAYER_RADIUS, 5, player.colour, PLAYER_COLOR);
      ctx.drawImage(charImage, charImage.position.x, charImage.position.y,      charImage.position.width, charImage.position.height);

      // reset background if out of bounds      
      backgroundImages.forEach(bg => {
        if(bg.position.x <= -CANVAS_WIDTH){
          bg.position.x = CANVAS_WIDTH;
        }
      })

      // reset fruit if out of bounds
      if (fruitImage.position.x <= -CANVAS_WIDTH){
        fruitImage.position.x = CANVAS_WIDTH;
      }

      // reset bomb if out of bounds   
      if(bombImage.position.x <= -CANVAS_WIDTH){ 
          bombImage.position.x = CANVAS_WIDTH;
      }

      if (controller.up && player.jumping == false) { // jump and debounce if already jumping
          player.yVelocity -= JUMP_HEIGHT;
          player.jumping = true;
      }
      
      if (controller.left) { // move left
          player.xVelocity -= 0.5;
          player.x -= MOVE_DIST;
          charImage.position.x -= MOVE_DIST;
      }
      else if (controller.right) { // move right
          player.xVelocity += 0.5;
          player.x += MOVE_DIST;
          charImage.position.x += MOVE_DIST;
      }
      
      player.yVelocity += GRAVITY; // gravity
      player.y += player.yVelocity;
      charImage.position.y += player.yVelocity;
      player.xVelocity *= (1.0-FRICTION_FACTOR);// friction
      player.yVelocity *= (1.0-FRICTION_FACTOR);// friction
      
      // floor physics, against gravity
      if (player.y > CANVAS_HEIGHT-PLAYER_RADIUS) {
          player.jumping = false;
          player.y = CANVAS_HEIGHT-PLAYER_RADIUS;
          charImage.position.y = CANVAS_HEIGHT-CHAR_IMAGE_DIM;
          player.yVelocity = 0;
      }

      // if the player attempts to leave canvas bounds restrict them
      if (player.x < 0) {
          player.x = HALF_RADIUS;
          charImage.position.x = player.x-HALF_CHAR_IMAGE_DIM+5;
      }
      else if (player.x > CANVAS_WIDTH) {
          player.x = CANVAS_WIDTH-HALF_RADIUS;
          charImage.position.x = player.x-HALF_CHAR_IMAGE_DIM+5;
      }
      
      window.addEventListener("keydown", controller.keyListener)
      window.addEventListener("keyup", controller.keyListener);
      window.requestAnimationFrame(renderLoop); // animate render loop
  }

  renderLoop(); // START GAME LOOP
}