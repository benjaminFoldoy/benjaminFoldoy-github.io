function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);

    let txt = ""
    rawFile.onreadystatechange = function(txt)
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                //INSERT CODE HERE//
                lines = allText.split("\n")
                scFirstLine = []
                for (var line = 0; line < lines.length; line++){
                    if (lines[line].match("NSC%%")){
                        scFirstLine.push(line);
                    }
                }
                    scFirstLine.push(lines.length)
                    for (var i = 0; i<scFirstLine.length;i++){
                        inputLines = [];
                        for (var start = scFirstLine[i] + 1;start < scFirstLine[i+1]; start++){
                            try{
                                inputLines.push(lines[start])
                            }
                            catch{}
                        }
                        if(inputLines.length != 0){
                            textToCard(inputLines)
                        }
                }
                        /*
                */
            }
        }
    }
    rawFile.send(null);
}

readTextFile("Story/chapter1.txt");

function textToCard(lines){
   // lines = text.split("\n")

    let order = [];
    let texts = [];
    let image = ""

    for (var line = 0; line < lines.length; line++){
        if(lines[line].match("IMG%%")){
            image = 'Assets/' + lines[line].slice(5) + 'gskdjfhskdjhskdjfh';
            console.log(image)
        }
        else if(lines[line].match("TXT%%")){
            order.push("")
            if(lines[line].substr(lines[line].length-1, lines[line].length) == "\r"){
                texts.push(lines[line].substr(5).slice(0,-1));
            }
            else{
                texts.push(lines[line].substr(5));
            }
        }
        else if(characters.find(element => element.initials == lines[line].substr(0,3)) != null){
            let character = characters.find(element => element.initials == lines[line].substr(0,3))
            order.push(character)
            if(lines[line].substr(lines[line].length-1, lines[line].length) == "\r"){
                texts.push(lines[line].substr(5).slice(0,-1));
            }
            else{
                texts.push(lines[line].substr(5));
            }
        }
        
    }
    document.getElementById("storyBoard").appendChild(createStoryCard(image, order, texts))
}