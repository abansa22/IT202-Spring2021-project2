var startButton = document
  .querySelector("#startGame")
  .addEventListener("click", () => {
    this.gameStart();
});

const PLAYER_RADIUS = 30; // player character radius size
const HALF_RADIUS = Math.floor(PLAYER_RADIUS/2); //for offsets
const JUMP_HEIGHT = 40; // jump height in y velocity
const FRICTION_FACTOR = 0.1; // friction factor float
const GRAVITY = 1.5; // gravity velocity factor
const MOVE_DIST = 5;
const BOMB_RADIUS = 20;
const BOMB_IMAGE_DIM = 55;
const CHAR_IMAGE_DIM = 55;
const HALF_CHAR_IMAGE_DIM = Math.floor(CHAR_IMAGE_DIM/2); // for char image offsets
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
  
  randomBombx = Math.floor(Math.random() * 900) + 500;
  
  const bombImage = new Image();
  bombImage.src = './assets/bomb.png';
  bombImage.position = { x: randomBombx, y: CANVAS_HEIGHT-BOMB_IMAGE_DIM, width: BOMB_IMAGE_DIM, height: BOMB_IMAGE_DIM};

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
  let life = 2;
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

      document.getElementById("level").innerHTML = "Level: " + level;
      document.getElementById("lives").innerHTML = "Lives left: " + life;
      document.getElementById("score").innerHTML = "Score: " + score;
      
      if (life === 0){ // out of lives then game over
          document.getElementById("demo").innerHTML = "Game Over";
          return;
      }
      
      
      if (areColliding(player.x, player.y, PLAYER_RADIUS, bombImage.position.x, bombImage.position.y, BOMB_RADIUS)){ // collided with bomb, lose life
        life -= 1;
        bombImage.position.x = -BOMB_IMAGE_DIM-1; // hide from screen
      }
      
      ctx.drawImage(bombImage, bombImage.position.x, bombImage.position.y,      bombImage.position.width, bombImage.position.height);
      bombImage.position.x -= gamespeed;

      drawCircle(player.x, player.y, PLAYER_RADIUS, 5, player.colour, PLAYER_COLOR);
      ctx.drawImage(charImage, charImage.position.x, charImage.position.y,      charImage.position.width, charImage.position.height);
      
      // if bomb moves out of canvas towards left then reset
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
          charImage.position.x = HALF_CHAR_IMAGE_DIM;
      }
      else if (player.x > CANVAS_WIDTH) {
          player.x = CANVAS_WIDTH-HALF_RADIUS;
          charImage.position.x = CANVAS_HEIGHT-HALF_CHAR_IMAGE_DIM;
      }
      
      window.addEventListener("keydown", controller.keyListener)
      window.addEventListener("keyup", controller.keyListener);
      window.requestAnimationFrame(renderLoop); // animate render loop
  }

  renderLoop(); // START GAME LOOP
}