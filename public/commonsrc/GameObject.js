class GameObject
{
    constructor(pos,vel,netCreated)
    {
        this.pos = pos;
        this.vel = vel;
        this.netPriority = 1;
        this.netCreated = netCreated;
        this.deleteFlag = false;
    }

    update()
    {
      throw new Error('You have to implement the method "update"!');
    }

    render()
    {
      throw new Error('You have to implement the method "render"!');
    }
}