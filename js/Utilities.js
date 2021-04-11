class Vector2D{
    constructor(X, Y){
        this.X = X;
        this.Y = Y;
    }
};

class CanvasObject extends Vector2D{

    constructor(Name, Position, Size){
        this.Name = Name;
        this.Position = Position;
        this.Size = Size;
    }
};