class Proton extends GameObject  //the bullets of the game
{
  constructor(startx,starty,radianDirection,inputvel)
  {
    let pos = createVector(startx,starty);
    let vel;
    if(inputvel)
    {
      vel = p5.Vector.fromAngle(radianDirection)
      vel.add(inputvel)
    } else
    {
      vel = p5.Vector.fromAngle(radianDirection)
    }

    let protonSpeedMult = 5;
    vel.mult(protonSpeedMult);

    super(pos,vel,0);

    this.deleteFlag = false;
    this.numberOfXCrossings = 0;
    this.numberOfYCrossings = 0;
  }


  update()
  {
      this.pos.add(this.vel);

      // transition to other side of screen if crossed,
      // but we might delete it if it has flown too far.
      if(this.pos.x < 0 || this.pos.x > canvasWidth ||
         this.pos.y < 0 || this.pos.y > canvasHeight)
      {
        //appear on other edge if we go offscreen
        if(this.pos.x > canvasWidth)
        {
          this.pos.x = 0;
          this.numberOfXCrossings += 1;
        }
        if(this.pos.x < 0)
        {
          this.pos.x = canvasWidth;
          this.numberOfXCrossings += 1;
        }
        if(this.pos.y > canvasHeight)
        {
          this.pos.y = 0;
          this.numberOfYCrossings += 1;
        }
        if(this.pos.y < 0)
        {
          this.pos.y = canvasHeight;
          this.numberOfYCrossings += 1;
        }
      }

      if(this.numberOfXCrossings > 1 || this.numberOfYCrossings > 1)
      {
        this.deleteFlag = true;
      }
  }

  render()
  {
    stroke(255);
    strokeWeight(4);
    point(this.pos.x,this.pos.y);
  }
}