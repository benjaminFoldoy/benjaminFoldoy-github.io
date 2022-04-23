boardWidth = window.innerWidth*(10/12)
boardHeight = window.innerWidth*(10/12)*0.6
var popSFX = new Audio('/Assets/bananpong-plopp.wav');
let loopHasStarted = false;
var inMenu = true;
let loser = null;
let ST = 0;
let ticks = 0;
let ballDefaultVelocity = boardWidth*0.006;
let rootDir = "https://benjaminfoldoy.github.io/BananaPong"
let images = {};
let time = 1;
var game;
var cooldown = 0;
let allPowerUps = [];
let theme = 1;
var actx = new (AudioContext || webkitAudioContext)(),
src = "/Assets/song_menu_banana.mp3",
audioData, srcNode;  // global so we can access them from handlers
loopDuration = 10; //milliseconds between each loop.

function addPowerUp(game){
  let tempList = [];
  for (let i = 0; i < allPowerUps.length; i++){
    tempList.push(Object.assign({},allPowerUps[i]))
  }
  for ([index, pU] of game.powerUpsOnBoard.entries()){
    tempList.splice(tempList.indexOf(pU),1)
  } 
  let powerUp = Object.assign({}, tempList[Math.floor(Math.random()*allPowerUps.length)]);
  spawnPowerUp(powerUp);
  game.powerUpsOnBoard.push(powerUp);
}

function spawnPowerUp(powerUp){
  let x_pos = boardWidth*0.3 + Math.random()*boardWidth*0.4;
  let y_pos = boardHeight*0.15 + Math.random()*boardHeight*0.70;
  while (true){
    let number = 0;
    for ([i, element] of game.powerUpsOnBoard.entries()){
      if (Math.abs(element.x_pos - x_pos) > boardWidth*0.1
      && Math.abs(element.y_pos - y_pos) > boardHeight*0.1
      && number != 2){
        number = 1;
      }
      else{
        x_pos = boardWidth*0.3 + Math.random()*boardWidth*0.4;
        y_pos = boardHeight*0.15 + Math.random()*boardHeight*0.70;
        number = 2
      }
    }
    if (number != 2){
      break;
    }
  }
  images[powerUp.id].x_pos = x_pos;
  images[powerUp.id].y_pos = y_pos;
  powerUp.x_pos = x_pos;
  powerUp.y_pos = y_pos;
  images[powerUp.id].id = powerUp.id;
  images[powerUp.id].style.position = "absolute"
  images[powerUp.id].style.marginLeft = x_pos + "px";
  images[powerUp.id].style.marginTop = y_pos + "px";
  images[powerUp.id].style.width = powerUp.size + "px";
  images[powerUp.id].style.display = "block"
  images[powerUp.id].classList.add("powerUp")
  document.getElementById("board").appendChild(images[powerUp.id]);
}

//POWER UP
class PowerUp{
  constructor(duration, isGood, id, iconPath, inputFunction, finishMethod){
    this.timeUntilActivation = 100;
    this.isActive = false;
    this.duration = duration;
    this.ticksLeft = Math.floor((duration*(1000/loopDuration)));
    this.method = inputFunction;
    this.finished = finishMethod;
    this.img_src = rootDir + iconPath;
    this.id = id;
    this.x_pos;
    this.y_pos;
    this.size = boardWidth*0.05
    this.isGood = isGood;
    
    this.countDown = function(player){
      if(this.ticksLeft-- <= 0){
        return false;
      }
      return true;
    }
  }
}

function updateThemeNumber(n){
  theme = n;
}
function reloadPowerUps(){
  allPowerUps = [
    //SLOW
    new PowerUp(
    duration = 15,
    isGood = true,
    id = "slow",
    iconPath = "/Assets/Slow"+ theme +".png",
    function(player){
      let dir = 1
      if(player.player_number == 1){
        dir = -1;
      }
      if (game.ball.x_pos*dir > (boardWidth/2)*dir){
        game.ball.velocity = ballDefaultVelocity*time
        if(srcNode.playbackRate.value > 0.8){
          srcNode.playbackRate.value -= 0.005;
        }
        if (time > 0.5){
          time -= 0.05
        }
      }
      else if(game.ball.x_pos*dir < (boardWidth/2)*dir){
        game.ball.velocity = ballDefaultVelocity*time;
        if(srcNode.playbackRate.value < 1){
          srcNode.playbackRate.value += 0.005;
        }
        if (time < 1){
          time += 0.05
        }
      }
    },
    function(player){
      if(game.is_active){
        game.ball.velocity = ballDefaultVelocity
      }
      else{
        game.ball.velocity = 0;
      }
      time = 1;
      srcNode.playbackRate.value = 1;
    }
  ),

  //FAST
  new PowerUp(
    duration = 10,
    isGood = false,
    id = "fast",
    iconPath = "/Assets/Fast"+ theme +".png",
    function(player){
      let dir = 1
      if(player.player_number == 1){
        dir = -1;
      }
      if (game.ball.x_pos*dir > (boardWidth/2)*dir){
        game.ball.velocity = ballDefaultVelocity*time
        if(srcNode.playbackRate.value < 1.2 ){
          srcNode.playbackRate.value += 0.005;
        }
        if (time < 1.7){
          time += 0.05
        }
      }
      else if(game.ball.x_pos*dir < (boardWidth/2)*dir){
        game.ball.velocity = ballDefaultVelocity*time;
        if(srcNode.playbackRate.value > 1){
          srcNode.playbackRate.value -= 0.005;
        }
        if (time > 1){
          time -= 0.05
        }
      }
    },
    function(player){
      if(game.is_active){
        game.ball.velocity = ballDefaultVelocity
      }
      else{
        game.ball.velocity = 0;
      }
      time = 1;
      srcNode.playbackRate.value = 1;
    }
  ),

  //1+ Life
  new PowerUp(
    duration = 0.1,
    isGood = true,
    id = "pluss1",
    iconPath = "/Assets/OneUp"+ theme +".png",
    function(player){
      console.log("life matters")
    },
    function(player){
      if(player.lives < 9){
        player.lives++;
      }
    }
  ),

  //Stretch
  new PowerUp(
    duration = 15,
    isGood = true,
    id = "stretch",
    iconPath = "/Assets/Stretch"+ theme +".png",
    function(player){
      player.height = boardHeight*0.3
      if(player.y_pos < player.height/2){
        player.y_pos = player.height/2
      }
      else if(player.y_pos > boardHeight - player.height/2){
        player.y_pos = boardHeight - player.height/2
      }
    },
    function(player){
      player.height = boardHeight*0.2
    }
  ),

  //BiggerBall
  new PowerUp(
    duration = 15,
    isGood = true,
    id = "bigballs",
    iconPath = "/Assets/BigBalls"+ theme +".png",
    function(player){
      let dir = 1
      if(player.player_number == 1){
        dir = -1;
      }
      if (game.ball.x_pos*dir > (boardWidth/2)*dir){
        if(game.ball.size < boardWidth*0.07){
          game.ball.size += boardWidth*0.0005;
        }
      }
      else if(game.ball.x_pos*dir < (boardWidth/2)*dir){
        if(game.ball.size > boardWidth*0.05){
          game.ball.size -= boardWidth*0.0005;
        }
      }
      
    },
    function(player){
      game.ball.size = boardWidth*0.05;
    }
  ),

  //Gittering
  new PowerUp(
    duration = 10,
    isGood = false,
    id = "gittering",
    iconPath = "/Assets/Gittering"+ theme +".png",
    function(player){
      player.y_pos += (1 - Math.random()*2)*boardHeight*0.015
      if(player.y_pos + player.height/2 > boardHeight){
        player.y_pos = boardHeight - player.height/2;
      }
      else if(player.y_pos - player.height/2 < 0){
        player.y_pos = player.height/2;
      }
    },
    function(player){
    }
  ),

  //Squish
  new PowerUp(
    duration = 10,
    isGood = false,
    id = "squish",
    iconPath = "/Assets/Shrink"+ theme +".png",
    function(player){
      player.height = boardHeight*0.1
      player.width = boardHeight*0.06
    },
    function(player){
      player.height = boardHeight*0.2
      player.width = boardHeight*0.1
    }
  ),

  //Switcheroo
  new PowerUp(
    duration = 15,
    isGood = false,
    id = "switcheroo",
    iconPath = "/Assets/Switcheroo"+ theme +".png",
    function(player){
      if(player.player_number == 1){
        player.upKey = "83";
        player.downKey = "87"
      }
      else{
        player.upKey = "40";
        player.downKey = "38";
      }
    },
    function(player){
      if(player.player_number == 1){
        player.upKey = "87";
        player.downKey = "83";
      }
      else{
        player.upKey = "38";
        player.downKey = "40";
      }
    }
    ),
    
    //Invisible
    new PowerUp(
    duration = 3,
    isGood = false,
    id = "invisible",
    iconPath = "/Assets/Invisible"+ theme +".png",
    function(player){
      player.opacity = 0;
    },
    function(player){
      player.opacity = 1;
    }
    )
  ]
}
reloadPowerUps();

function updateST(i){
  ST = i;
  themes[ST].setTheme();
  loadAllAssets();
  fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);
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
  try{
    srcNode.stop()
  }
  catch{}
  srcNode = actx.createBufferSource();  // create audio source
  srcNode.buffer = abuffer;             // use decoded buffer
  srcNode.connect(actx.destination);    // create output
  srcNode.loop = true;                  // takes care of perfect looping
  srcNode.start();                      // play...
}

class Opponent{
  constructor(){
    this.icon;
    this.speed = 1;
    this.reactionTime = 1;
    this.distanceFromBall;
    this.goal;
    this.ticksToNextUpdate = 0;
    this.updateFrequency = 20;

    this.updateOpponent = function(){
      if(this.updateFrequency < this.ticksToNextUpdate){
        this.ticksToNextUpdate = 0;
        //this.goal = game.ball.y_pos + Math.sin(game.ball.angle_rad)*boardHeight*0.1;
        this.goal = game.ball.y_pos;

      }
      else{
        this.ticksToNextUpdate++;
      }
      if(game.ball.x_pos < boardWidth*0.5){
        this.updateFrequency = 100;
      }
      else{
        this.updateFrequency = 15;
      }
      if(this.goal >= game.players[1].y_pos + this.speed*boardWidth*0.02
        && game.ball.x_pos > boardWidth*0.4
        && boardHeight - game.players[1].height/2 > game.players[1].y_pos
        && !(game.ball.angle_rad > Math.PI/2 && game.ball.angle_rad < (3*Math.PI)/2)){
        game.players[1].y_pos+= this.speed*boardWidth*0.006;
      }
      else if(this.goal <= game.players[1].y_pos - this.speed*boardWidth*0.02
        && game.ball.x_pos > boardWidth*0.4
        && game.players[1].height/2 < game.players[1].y_pos){
        game.players[1].y_pos -= this.speed*boardWidth*0.006;
      }
    }
  }
}

var allOpponents = [
  new Opponent()
]
let cO = 0;
class Theme{
  constructor(backgroundColor, sideColors, heartPath, linePath, ballPath, leftPath, RightPath, selectSFXPath, reflectionSFXPath, menuMusicPath, gameMusicPath){
    this.backgroundColor = backgroundColor;
    this.sideColors = sideColors;
    this.heartPath = rootDir + "/Assets" + heartPath;
    this.linePath = rootDir + "/Assets" + linePath;
    this.ballPath = rootDir + "/Assets" + ballPath;
    this.leftPath = rootDir + "/Assets" + leftPath;
    this.RightPath = rootDir + "/Assets" + RightPath;
    this.selectSFXPath = rootDir + "/Assets" + selectSFXPath;
    this.reflectionSFXPath = rootDir + "/Assets" + reflectionSFXPath;
    this.menuMusicPath = rootDir + "/Assets" + menuMusicPath;
    this.gameMusicPath = rootDir + "/Assets" + gameMusicPath;
    this.setTheme = function(){
      document.getElementById("board").style.backgroundColor = themes[ST].backgroundColor;
      popSFX = new Audio(themes[ST].reflectionSFXPath);
      ["multiplayer", "against-ai"].forEach(e => {
        document.getElementById(e).style.color = themes[ST].sideColors;
        document.getElementById(e).style.borderColor = themes[ST].sideColors;
        document.getElementById(e).style.backgroundColor = themes[ST].backgroundColor;
      })
      src = this.menuMusicPath;
    }
  }  
}
var themes = [new Theme("#fe6b89", "#fc4067", "/Heart1.png", "/Line1.png", "/Ball1.png", "/Left1.png", "/Right1.png", "/pop.mp3", "/pop.mp3", "/song_menu_banana.mp3", "/song_game_banana.mp3"),
              new Theme("#000000", "#00d700", "/Heart2.png", "/Line2.png", "/Ball2.png", "/Left2.png", "/Right2.png", "/pop.mp3", "/pop.mp3", "/song_menu_banana3.wav", "/song_game_banana3.wav")];
loadAllAssets();
class Ball{
  constructor(x_pos, y_pos, angle_rad){
    this.rotation = 0;
    this.rotation_speed = 0;
    this.image = themes[ST].ballPath;
    this.size = 0;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.x_posLog = [];
    this.y_posLog = [];
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
      this.x_posLog.push(x_pos);
      this.y_posLog.push(y_pos);
      if(this.x_posLog.length >= 101){
        this.x_posLog.shift();
        this.y_posLog.shift();
      }
      this.rotation += this.rotation_speed * time;
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

    this.checkPowerUpColision = function(){
      for (const [index, powerUp] of game.powerUpsOnBoard.entries()) {
        //console.log(this.y_pos, this.size/2, this.powerUp.y_pos, powerUp.size)
        if (this.y_pos - this.size/2 <= powerUp.y_pos + powerUp.size/2
        && this.y_pos + this.size/2 >= powerUp.y_pos - powerUp.size/2
        &&this.x_pos - this.size/2 <= powerUp.x_pos + powerUp.size/2
        && this.x_pos + this.size/2 >= powerUp.x_pos - powerUp.size/2){
          if(this.angle_rad > Math.PI/2 && this.angle_rad < 3*Math.PI/2){
            game.players[1].powerUps.push(Object.assign({}, powerUp))
            document.getElementById(powerUp.id).style.display = "none";
            game.powerUpsOnBoard.splice(index, 1)
          }
          else{
            game.players[0].powerUps.push(Object.assign({}, powerUp));
            document.getElementById(powerUp.id).style.display = "none";
            game.powerUpsOnBoard.splice(index, 1);
          }
        }
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
        removeAllPowerUps();
        this.rotation_speed = 0;
        game.is_active = false;
        game.players[0].lives -= 1;
        game.players.forEach(player => {
          player.powerUps.forEach(pu =>{
            pu.ticksLeft = 0;
            pu.finished(player);
          })
          player.powerUps = [];
        })
      }
      else if (this.x_pos >= boardWidth - this.size/2){
        this.resetBall();
        removeAllPowerUps()
        this.rotation_speed = 0;
        game.is_active = false;
        game.players[1].lives -= 1;
        game.players.forEach(player => {
          player.powerUps.forEach(pu =>{
            pu.finished(player);
            pu.ticksLeft = 0;
          })
          player.powerUps = [];
        })
      }
    }
    this.render_ball = function(){
      if (this.is_rendered){
        document.getElementById("ball").style.height = this.size + "px";
        document.getElementById("ball").style.width = this.size + "px";
        document.getElementById("ball").style.transform = "rotate("+ this.rotation +  "deg)";
        document.getElementById("ball").style.marginLeft = this.x_pos - this.size/2 + "px";
        document.getElementById("ball").style.marginTop = this.y_pos - this.size/2 + "px";
      }
      else{
        var image = images["ball"];
        image.id = "ball";
        image.style.width = this.size + "px"
        image.style.height = this.size + "px"
        image.style.marginLeft = this.x_pos - this.size/2;
        image.style.marginTop = this.y_pos - this.size/2;
        document.getElementById("board").appendChild(image);
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
    this.opacity = 1;
    this.y_pos = y_pos;
    this.is_rendered = false;
    this.upKey = upKey;
    this.downKey = downKey;
    this.powerUps = [];

    this.render_player = function(){
      if (this.is_rendered){
        document.getElementById("p" + this.player_number).style.opacity = this.opacity;
        document.getElementById("p" + this.player_number).style.height = this.height + "px";
        document.getElementById("p" + this.player_number).style.width = this.width + "px";
        document.getElementById("p" + this.player_number).style.marginLeft = this.x_pos - this.width/2 + "px";
        document.getElementById("p" + this.player_number).style.marginTop = this.y_pos - this.height/2 + "px";
      }
      else{
        if(this.player_number == "1"){
          var image = images["p1"]
          image.style.width = this.width + "px";
          image.style.height = this.height + "px";
          image.style.position = "absolute";
          image.style.marginLeft = game.players[0].y_pos + "px";
          image.id = "p" + this.player_number;
        }
        else{
          var image = images["p2"]
          image.style.width = this.width + "px";
          image.style.height = this.height + "px";
          image.style.position = "absolute";
          image.style.marginLeft = game.players[1].y_pos + "px";
          image.id = "p" + this.player_number;
        }
        document.getElementById("board").appendChild(image)
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

function loadAllAssets(){
  let keys = ["p1", "p2", "ball", "line"]
  keys.forEach(key => {
    images[key] = document.createElement("img");
  })
  images["p1"].src = themes[ST].leftPath;
  images["p2"].src = themes[ST].RightPath;
  images["ball"].src = themes[ST].ballPath;
  images["line"].src = themes[ST].linePath;

  for (let i = 0; i < 10; i++){
    ["H", "L", "R"].forEach(key =>{
      images[key + i] = document.createElement("img");
      images[key + i].src = themes[ST].heartPath;
    })
  }
  console.log(allPowerUps)
  for ([index, element] of allPowerUps.entries()){
    images[element.id] = document.createElement("img");
    images[element.id].src = element.img_src;
  }
}
class Game{
  constructor(is_multiplayer, n_of_lives){
    this.is_multiplayer = is_multiplayer;
    this.lives = n_of_lives;
    this.game_on = false
    this.ball;
    this.players;
    this.is_active = false;
    this.vsAI = false;
    this.gameloop;
    this.players = [];
    this.powerUpsOnBoard = [];
    
    this.whipeAll = function(){
      document.getElementById("board").innerHTML = ""
    }
    this.initializeGame = function(){
      document.getElementById("board").innerHTML = 
      `<div id="Lfall" style="background-color:` + themes[ST].sideColors + `"></div>
            <div id="Rfall" style="background-color:` + themes[ST].sideColors + `"></div>`
      let line = images["line"];
      line.id = "line"
      document.getElementById("board").appendChild(line);

      //add hearts
      for (let i = 0; i < 10; i++){
        let heart1 = images["L" + i];
        heart1.id = "L" + i;
        heart1.style.marginLeft = (15 + i*3) + "%";
        heart1.classList.add("life")
        document.getElementById("board").appendChild(heart1)
        let heart2 = images["R" + i];
        heart2.id = "R" + i;
        heart2.style.marginLeft = (98 - (15 + i*3)) + "%";
        heart2.classList.add("life")
        document.getElementById("board").appendChild(heart2)
      }

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
      this.ball.size = boardWidth*0.05;
      fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);
      reloadPowerUps();
    }
  }
}

game = new Game(false, 9)


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
  for (let i = 0; i < 10; i++){
    let side = "R"
    if (player.player_number == 1){
      side = "L"
    }
    if(i <= player.lives){
      document.getElementById(side + (i)).style.opacity = 1;
    }
    else{
      document.getElementById(side + (i)).style.opacity = 0.5;
    }
    if( i > game.lives && i > player.lives){
      document.getElementById(side + (i)).style.opacity = 0;
    }
  }
}

function removeAllPowerUps(){
  for (let n = 0; n <= 1; n++){
    for (const [i, powerUp] of game.players[n].powerUps.entries()){
      powerUp.ticksLeft = 0;
      powerUp.finished(game.players[n])
      try{
        document.getElementById(powerUp.id).style.display = "none";
      }
      catch{
        console.log("No - 839");
      }
    }
  }
  for (const [i, powerUp] of allPowerUps.entries()){
    try{
      document.getElementById(powerUp.id).style.display = "none";
    }
    catch{
      console.log("No - 848");
    }
  }
  game.powerUpsOnBoard = [];
}

function displayHearts(){
  for (let i = 9; i >= 0; i--){
    document.getElementById("H"+i).style.opacity = 1;
  }
  for (let i = 9; i > game.lives; i--){
    document.getElementById("H"+i).style.opacity = 0.5;
  }
}

function setPVPMode(){
  game.vsAI = false;
}

function setAiMode(){
  game.vsAI = true;
}

function startGame(){
  inMenu = false;
  game.initializeGame()
  game.gameloop = setInterval(gameLoop, loopDuration);
  src = themes[ST].gameMusicPath
  fetch(src, {mode: "cors"}).then(function(resp) {return resp.arrayBuffer()}).then(decode);
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
  document.getElementById("board").innerHTML += "<button id='multiplayer' class='menu-button' onclick='setPVPMode(); startGame()'>1 vs 1</button>";
  document.getElementById("board").innerHTML += "<button id='against-ai' class='menu-button' onclick='setAiMode(); startGame()'>vs AI</button>";
  let hearts="";
  for (let i = 0; i < 10; i++){
    hearts += '<img src="' + themes[ST].heartPath + '" id="H' + i + '" style="margin-left:' + (30 + i*4) + '%" class="life-menu" onmouseover="heartSelectHover(' + i + ')" onmouseout="displayHearts()" onclick="(heartSelect(' + i + '))"></img>';
  }
  document.getElementById("board").innerHTML += hearts;

  let themeIcons = ""
  for (let i = 0; i <= themes.length; i++){
    themeIcons += '<div onclick=" updateThemeNumber( ' + (i+1) + '); reloadPowerUps();updateST(' + i + '); main()" class="ThemeBox" id="T' + i + '" style="margin-left:' + (42 + i*8) + '%""></div>'
  }
  document.getElementById("board").innerHTML += themeIcons;
  ["multiplayer", "against-ai"].forEach(e => {
    document.getElementById(e).style.color = themes[ST].sideColors;
    document.getElementById(e).style.borderColor = themes[ST].sideColors;
    document.getElementById(e).style.backgroundColor = themes[ST].backgroundColor;
  })
  displayHearts();
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
    if(player.player_number == 1 || (player.player_number == 2 && game.vsAI == false)){
      player.updatePos();
    }
    else if(game.vsAI){
      allOpponents[cO].updateOpponent();
    }
    player.render_player();
  });
  
  //physics
  game.ball.checkPowerUpColision();
  game.players.forEach(player => {
    updateHearts(player);
    game_over(player);
    //power ups...
    for (const [index, element] of player.powerUps.entries()){
      element.method(player)
      if(!element.countDown()){
        element.finished(player);
        player.powerUps.splice(index, 1)
      }
    }

    if(Math.random() > 0.9
    && cooldown > 8*(1000/loopDuration) 
    && game.powerUpsOnBoard.length < 3
    && game.is_active){
      cooldown = 0;
      addPowerUp(game);
    }
    else if(game.is_active){
      cooldown++;
    }

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