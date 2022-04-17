boardWidth = window.innerWidth*(10/12)
boardHeight = window.innerWidth*(10/12)*0.6
var popSFX = new Audio('/Assets/bananpong-plopp.wav');
let loopHasStarted = false;
var inMenu = true;
let loser = null;
let ST = 0;
let ticks = 0;
let ballDefaultVelocity = boardWidth*0.006;

var actx = new (AudioContext || webkitAudioContext)(),
src = "/Assets/song_menu_banana.mp3",
audioData, srcNode;  // global so we can access them from handlers

function updateST(i){
  ST = i;
  themes[ST].setTheme();
}
function updateSong(){
  if(game.is_active){
    src = themes[ST].gameMusicPath
  }
  else{
    src = themes[ST].menuMusicPath
  }
}

// Load some audio (CORS need to be allowed or we won't be able to decode the data)
fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);

// Decode the audio file, then start the show
function decode(buffer) {
  actx.decodeAudioData(buffer, playLoop);
}

// Sets up a new source node as needed as stopping will render current invalid
function playLoop(abuffer) {
  srcNode = actx.createBufferSource();  // create audio source
  srcNode.buffer = abuffer;             // use decoded buffer
  srcNode.connect(actx.destination);    // create output
  srcNode.loop = false;                  // takes care of perfect looping
  srcNode.addEventListener('ended', () => {
    fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);
  })
  srcNode.start();                      // play...
}

class Theme{
  constructor(backgroundColor, sideColors, heart, linePath, ballPath, leftPath, RightPath, selectSFXPath, reflectionSFXPath, menuMusicPath, gameMusicPath){
    this.backgroundColor = backgroundColor;
    this.sideColors = sideColors;
    this.heart = heart;
    this.linePath = linePath;
    this.ballPath = ballPath;
    this.leftPath = leftPath;
    this.RightPath = RightPath;
    this.selectSFXPath = selectSFXPath;
    this.reflectionSFXPath = reflectionSFXPath;
    this.menuMusicPath = menuMusicPath;
    this.gameMusicPath = gameMusicPath;
    this.setTheme = function(){
      document.getElementById("board").style.backgroundColor = themes[ST].backgroundColor;
      popSFX = new Audio(themes[ST].reflectionSFXPath);
      for(let i = 0; i < 10; i++){
        document.getElementById("H" + i).src = themes[ST].heart;
      }
      ["multiplayer", "against-ai"].forEach(e => {
        document.getElementById(e).style.color = themes[ST].sideColors;
        document.getElementById(e).style.borderColor = themes[ST].sideColors;
        document.getElementById(e).style.backgroundColor = themes[ST].backgroundColor;
      })
    }
  }  
}
var themes = [new Theme("#fe6b89", "#fc4067", "/Assets/Heart1.png", "/Assets/Line1.png", "/Assets/Ball1.png", "/Assets/Left1.png", "/Assets/Right1.png", "/Assets/pop.mp3", "/Assets/pop.mp3", "/Assets/song_menu_banana.mp3", "/Assets/song_game_banana.mp3"),
              new Theme("#000000", "#00d700", "/Assets/Heart2.png", "/Assets/Line2.png", "/Assets/Ball2.png", "/Assets/Left2.png", "/Assets/Right2.png", "/Assets/pop.mp3", "/Assets/pop.mp3", "/Assets/song_menu_banana2.mp3", "/Assets/song_game_banana2.mp3")];

class Ball{
  constructor(x_pos, y_pos, angle_rad){
    this.rotation = 0;
    this.rotation_speed = 0;
    this.image = themes[ST].ballPath;
    this.size = 0;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.velocity = 0;
    this.angle_rad = angle_rad;
    this.is_rendered = false;
    this.outsideBanana = true;
    this.isVisible = true;
    this.is_going_left = function(){
      return this.x_vel > 0;
    }

    this.is_moving = function(){
      return this.x_vel != 0;
    }

    let minAngle = function(angle){
      //TL
      if (pi2Modulus(angle) >= Math.PI/2 && pi2Modulus(angle) <= 2*Math.PI/3){
        return 2*Math.PI/3;
      }
      //BL
      else if (pi2Modulus(angle) <= 3*Math.PI/2 && pi2Modulus(angle) >= 4*Math.PI/3){
        return 4*Math.PI/3;
      }
      //TR
      else if (pi2Modulus(angle) < Math.PI/2 && pi2Modulus(angle) >= 1*Math.PI/3){
        return 1*Math.PI/3;
      }
      //TL
      else if (pi2Modulus(angle) > 3*Math.PI/2 && pi2Modulus(angle) <= 5*Math.PI/3){
        return 5*Math.PI/3;
      }
      else{
        return angle
      }
    }

    let randomSFX = function(){
      popSFX.play()
    }

    this.angle_rad_to_degrees = function(rad){
      return (180/Math.PI)*rad;
    }

    this.set_position = function(x_pos, y_pos){
      this.x_pos = x_pos;
      this.y_pos = y_pos;
    }

    this.move = function(){
      this.angle_rad = pi2Modulus(minAngle(this.angle_rad))
      let x_vel = this.velocity*Math.cos(this.angle_rad)
      let y_vel = -this.velocity*Math.sin(this.angle_rad)
      this.x_pos += x_vel;
      this.y_pos += y_vel;
      this.rotation += this.rotation_speed;
    }

    let angleDiff = function(startingAngle, endAngle){
      if (pi2Modulus(startingAngle - endAngle) < Math.PI){
        var rotation =  floatSafeRemainder(Math.abs(pi2Modulus(startingAngle - endAngle)), Math.PI)
      }
      else{
        var rotation = -floatSafeRemainder(Math.abs(pi2Modulus(startingAngle - endAngle)), Math.PI)
      }
      return rotation*3;
    }
    
    this.checkPlayerColision = function(player_number, top, left, bottom, right){
      this.angle_rad %= 2*Math.PI
      if (this.y_pos >= top - this.size/3 && 
      this.y_pos <= bottom + this.size/3){
        let y_diff = (bottom - (bottom-top)/2) - this.y_pos;
        let pWidth = right - left
        let curve = -200*(Math.abs(y_diff)/boardWidth);
        if(player_number == "2"){
          if (this.x_pos < left + pWidth/3&&
          this.x_pos + this.velocity*Math.cos(this.angle_rad) >= left + pWidth/6 + curve){
            let reflection_angle = ((3*Math.PI)/2)+((y_diff)/boardWidth)*4;
            let outAngle = Math.PI + this.angle_rad - 2*((this.angle_rad)-(reflection_angle + Math.PI/2))
            this.rotation_speed = angleDiff(this.angle_rad, outAngle)
            this.angle_rad = pi2Modulus(outAngle)
            randomSFX()
          }
        }
        else{
          if (this.x_pos > right  - pWidth/3&&
          this.x_pos + this.velocity*Math.cos(this.angle_rad) <= right - pWidth/6 - curve){
            let reflection_angle = ((3*Math.PI)/2)-((y_diff)/boardWidth)*4;
            let outAngle = Math.PI + this.angle_rad - 2*((this.angle_rad)-(reflection_angle + Math.PI/2))
            this.angle_rad = pi2Modulus(outAngle)
            randomSFX()
          }
        }//du e kul.ting.sted.ihjertetmitt

      }
    }

    let floatSafeRemainder = function(val, step){
      var valDecCount = (val.toString().split('.')[1] || '').length;
      var stepDecCount = (step.toString().split('.')[1] || '').length;
      var decCount = valDecCount > stepDecCount? valDecCount : stepDecCount;
      var valInt = parseInt(val.toFixed(decCount).replace('.',''));
      var stepInt = parseInt(step.toFixed(decCount).replace('.',''));
      return (valInt % stepInt) / Math.pow(10, decCount);
    }

    let pi2Modulus = function(angle){
      if (angle < 0){
        angle = 20*Math.PI + angle
      }
      return floatSafeRemainder(angle, 2*Math.PI);
    }

    this.resetBall = function(){
      this.x_pos = boardWidth*0.5;
      this.y_pos = boardHeight*0.5;
      this.velocity = 0;
      this.rotation = 0;
    }
    this.checkBoundryColosion = function(){
      if(this.y_pos <= this.size/2){
        if (pi2Modulus(this.angle_rad) <= Math.PI && pi2Modulus(this.angle_rad) >= 0){
          let newAngle =  pi2Modulus(-this.angle_rad);
          this.rotation_speed = angleDiff(newAngle, angle_rad)
          this.angle_rad = newAngle
          randomSFX()
        }
      }
      else if (this.y_pos >= boardHeight - this.size/2){
        if (pi2Modulus(this.angle_rad) >= Math.PI && pi2Modulus(this.angle_rad) <= 2*Math.PI){
          let newAngle =  pi2Modulus(-this.angle_rad);
          this.rotation_speed = angleDiff(newAngle, angle_rad)
          this.angle_rad = newAngle
          randomSFX()
        }
      }
      if (this.x_pos <= this.size/2){
        this.resetBall();
        this.rotation_speed = 0;
        game.is_active = false;
        game.players[0].lives -= 1;
      }
      else if (this.x_pos >= boardWidth - this.size/2){
        this.resetBall();
        this.rotation_speed = 0;
        game.is_active = false;
        game.players[1].lives -= 1;
      }
    }
    this.render_ball = function(){
      if (this.is_rendered){
        document.getElementById("ball").style.transform = "rotate("+ this.rotation +  "deg)";
        document.getElementById("ball").style.marginLeft = this.x_pos - this.size/2 + "px";
        document.getElementById("ball").style.marginTop = this.y_pos - this.size/2 + "px";
      }
      else{
        let img = `<img id='ball' style='width:` + this.size + `px; height:` + this.size + `px' src='` + this.image + `'>`;
        document.getElementById("board").innerHTML += img;
        this.is_rendered = true;
      }
    }
  }
}

function diff(n1, n2){
  return Math.abs(n1 - n2)
}
class Player{
  constructor(player_number, lives, sm, width, height, x_pos, y_pos, upKey, downKey){
    this.player_number = player_number;
    this.lives = lives;
    this.sm = sm; //speed multiplier
    this.image = "Assets/Banana.png";
    this.width = width
    this.height = height;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.is_rendered = false;
    this.upKey = upKey;
    this.downKey = downKey;
    this.powerUps = new PowerUps()

    this.render_player = function(){
      if (this.is_rendered){
        document.getElementById("p" + this.player_number).style.marginLeft = this.x_pos - this.width/2 + "px";
        document.getElementById("p" + this.player_number).style.marginTop = this.y_pos - this.height/2 + "px";
      }
      else{
        if(this.player_number == "1"){
          var img = `<img id='p` + this.player_number + `' style='width:` + this.width + `px; height:` + this.height + `px; position:absolute;' src='` + themes[ST].leftPath + `'>`;
        }
        else{
          var img = `<img id='p` + this.player_number + `' style='width:` + this.width + `px; height:` + this.height + `px; position:absolute' src='` + themes[ST].RightPath + `'>`;
        }
        document.getElementById("board").innerHTML += img;
        this.is_rendered = true;
      }
    }

    this.updatePos = function(){
      if (keys[this.upKey]){
        if (this.y_pos - this.height/2 > 0){
          this.y_pos-= this.sm
        }
        if(this.y_pos -this.height/2 < 0){
          this.y_pos = this.height/2
        }
      }
      if (keys[this.downKey]){
        if (this.y_pos + this.height/2 < boardHeight){
        this.y_pos+=this.sm
        }
        if(this.y_pos + this.height/2 >boardHeight){
          this.y_pos = boardHeight - this.height/2;
        }
      }
    }
  }
}

class Game{
  constructor(is_multiplayer, difficulty, n_of_lives){
    this.is_multiplayer = is_multiplayer;
    this.difficulty = difficulty;
    this.lives = n_of_lives;
    this.game_on = false
    this.ball;
    this.players;
    this.is_active = false;
    this.gameloop;
    this.players = [];
    
    this.whipeAll = function(){
      document.getElementById("board").innerHTML = ""
    }
    this.initializeGame = function(){
      document.getElementById("board").innerHTML = 
            `<div id="Lfall" style="background-color:` + themes[ST].sideColors + `"></div>
            <img src="` + themes[ST].linePath + `" id="line" alt="">
            <div id="Rfall" style="background-color:` + themes[ST].sideColors + `"></div>`
      //add hearts
      let img = "";
      for (let i = 0; i <= game.lives; i++){
        img += '<img src="' + themes[ST].heart + '" id="L' + i + '" style="margin-left:' + (15 + i*3) + '%" class="life"></img>';
        img += '<img src="' + themes[ST].heart + '" id="R' + i + '" style="margin-left:' + (98-(15 + i*3)) + '%" class="life"></img>'
      }
      document.getElementById("board").innerHTML += img
      
      //add players
      this.players = [
        new Player(
          1, 
          this.lives, 
          boardWidth*0.006, 
          boardHeight*0.1,
          boardHeight*0.2, 
          boardWidth*0.07, 
          boardHeight*0.5,
          "87", 
          "83"), 
          new Player(
            2, 
            this.lives, 
            boardWidth*0.006, 
            boardHeight*0.1,
            boardHeight*0.2, 
            boardWidth*0.93, 
            boardHeight*0.5,
            "38", 
            "40")];
      this.ball = new Ball(boardWidth*0.5, boardHeight*0.5, 0);
      this.ball.size = boardWidth*0.06;
    }
  }
}

class PowerUps{
  constructor(){
    this.isSlowed = false;
    this.slowedTicksLeft = 0;
    this.updatePowerUps = function(player){
      if(this.isSlowed){
        updateSlow(player)
      }
    }
    let updateSlow = function(player){
      let dir = 1
      if(player.player_number == 1){
        dir = -1;
      }
      if (game.ball.x_pos*dir > (boardWidth/2)*dir){
        game.ball.velocity = ballDefaultVelocity/2
        if(srcNode.playbackRate.value > 0.8){
          srcNode.playbackRate.value -= 0.005;
        }
      }
      else if(game.ball.x_pos*dir < (boardWidth/2)*dir){
        game.ball.velocity = ballDefaultVelocity;
        if(srcNode.playbackRate.value < 1){
          srcNode.playbackRate.value += 0.005;
        }
      }
    }
  }
}

function heartSelectHover(id){
  for (let i = 9; i >= 0; i--){
    document.getElementById("H"+i).style.opacity = 1;
  }
  for (let i = 9; i > parseInt(id); i--){
    document.getElementById("H"+i).style.opacity = 0.5;
  }
}

function heartSelect(id){
  game.lives = parseInt(id)
}

function updateHearts(player){
  for (let i = game.lives; i >= player.lives + 1; i--){
    let side = "R"
    if (player.player_number == 1){
      side = "L"
    }
    document.getElementById(side + i).style.opacity = 0.5;
  }
}

function displayHearts(){
  for (let i = 9; i >= 0; i--){
    document.getElementById("H"+i).style.opacity = 1;
  }
  for (let i = 9; i > game.lives; i--){
    document.getElementById("H"+i).style.opacity = 0.5;
  }
}

var game = new Game(false, 0, 10)
function startGame(){
  inMenu = false;
  game.initializeGame()
  game.players[0].powerUps.isSlowed = true;
  game.gameloop = setInterval(gameLoop, 10);
}

function stopGame(){
  clearInterval(game.gameloop)
}

function determine_winner(loser){
  if (loser == 1){
    return 2
  }
  else{
    return 1
  }
}
function main(){
  game.whipeAll()
  if(loser != null){
    document.getElementById("board").innerHTML += '<h1 class="winner"> Player ' + determine_winner(loser) + ' won!</h1>'
  }
  document.getElementById("board").innerHTML += "<button id='multiplayer' class='menu-button' onclick='startGame()'>1 vs 1</button>";
  document.getElementById("board").innerHTML += "<button id='against-ai' class='menu-button'>vs AI</button>";
  let hearts="";
  for (let i = 0; i < 10; i++){
    hearts += '<img src="' + themes[ST].heart + '" id="H' + i + '" style="margin-left:' + (30 + i*4) + '%" class="life-menu" onmouseover="heartSelectHover(' + i + ')" onmouseout="displayHearts()" onclick="(heartSelect(' + i + '))"></img>';
  }
  document.getElementById("board").innerHTML += hearts;

  let themeIcons = ""
  for (let i = 0; i <= themes.length; i++){
    themeIcons += '<div onclick="updateST(' + i + ')" class="ThemeBox" id="T' + i + '" style="margin-left:' + (40 + i*8) + '%""></div>'
  }
  document.getElementById("board").innerHTML += themeIcons;
}
main()

function game_over(player){
  if(player.lives < 0){
    loser = player.player_number;
    stopGame();
    main();
  }
}

function gameLoop(){
  try{
    if(game.is_active == false && !inMenu){
      if(keys["32"]){
        game.ball.angle_rad = Math.PI*2*Math.random();
        game.ball.velocity = ballDefaultVelocity;
        game.is_active = true;
        inMenu = false;
      }
      updateSong();
    }
  }
  catch{}
  //rendering
  game.ball.render_ball();
  game.players.forEach(player => {
    player.updatePos();
    player.render_player();
  });
  
  //physics
  game.players.forEach(player => {
    updateHearts(player);
    game_over(player);
    player.powerUps.updatePowerUps(player);
    game.ball.checkPlayerColision(
      player_number = player.player_number,
      top = player.y_pos-player.height/2,
      left = player.x_pos-player.width/2,
      bottom = player.y_pos+player.height/2,
      right = player.x_pos+player.width/2)
    });
    game.ball.move();
    game.ball.checkBoundryColosion();

    ticks++;
  }