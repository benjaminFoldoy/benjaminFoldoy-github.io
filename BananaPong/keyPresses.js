document.addEventListener("keydown", checkKeyPressed, false)
document.addEventListener("keyup", checkKeyReleased, false)

window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
  }
}, false);

var keys = {};

function checkKeyPressed(evt){
  //console.log(evt.keyCode)
  keys[evt.keyCode]=true;
}

function checkKeyReleased(evt){
  keys[evt.keyCode]=false;
}

