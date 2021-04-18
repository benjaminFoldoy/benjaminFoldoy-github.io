class Vector2D{
    constructor(X, Y){
        this.X = X;
        this.Y = Y;
    }
};

class CanvasObject extends Vector2D{

    constructor(Name, xPos, yPos, xSize, ySize){
        this.Name = Name;
        this.xPos = xPos;
        this.yPos = yPos;
        this.xSize = xSize;
        this.ySize = ySize;
    }
};