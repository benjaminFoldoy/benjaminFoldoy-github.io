function createStoryCard(image, order, texts){
  let appender = "";
  let div = document.createElement("div");
  div.style.width = "100%"
  if (image != ""){
    appender += "<img src=" + image + " width=100% class='storyBoardImage'>";
  }
  appender += "<table>"
  for (var i = 0; i < order.length; i++){
    if (order[i] != ""){
      appender += "<tr><td class='name' style='color:" + order[i].color +  "'>" + order[i].nickname + ":</td><td class='speech' style='color:" + order[i].color +  "'>" + '"' + texts[i] + '"' + "</td></tr>";
    }
    else{
      appender += "<tr><td colspan='2' class='text'>" + texts[i] + "</td></tr>";
    }
  }
  appender += "</table>";
  div.innerHTML = appender;
  return div;
}
