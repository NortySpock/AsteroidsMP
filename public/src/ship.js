"use strict";
class Ship extends GameObject
{
    constructor(color)
    {
        let pos = createVector(canvasWidth/2,canvasHeight/2);
        let vel = createVector(0,0);
        super(pos,vel,0);
        this.rotation = 0;
        this.gunOrientation = 0;
        this.gunPos = createVector();
        this.gunRotationOffset = -90;
        this.rotationRate = 4; //degrees
        this.thrustRate = 0.1;
        this.retroMult = 0.98;
        this.showThrusterFiring = false;
        this.coords = [];
        this.scl = min(canvasHeight,canvasWidth) / 30;
        this.dead = false;
		this.color = defaultShipColor;
		if(color)
		{
		  this.color = color;
		}
        //this.lines = [];
    }

    render()
    {
        var scl = this.scl;
        push();

        translate(this.pos.x,this.pos.y);
        rotate(radians(this.rotation));

        fill(0);
        strokeWeight(1);

        if(this.showThrusterFiring)
        {
          this.setColorAlpha(255)
        }
        else if(this.dead)
        {
          this.setColorAlpha(100)
        }
        else
        {
          this.setColorAlpha(200)
        }
		stroke(this.color);

        //I had to adjust the draw location to get
        //the Center of Rotation to feel right for this shape.
        //Center of Rotation is better known as
        //the Center of Gravity
        var CoG_offset = (scl/2)+(scl/10);
        this.coords = [0,        0-scl+CoG_offset,
                       0+(scl/2),0+CoG_offset,
                       0,        0-(scl/2)+CoG_offset,
                       0-(scl/2),0+CoG_offset ];


        quad(this.coords[0],this.coords[1],
             this.coords[2],this.coords[3],
             this.coords[4],this.coords[5],
             this.coords[6],this.coords[7]);

        pop();
        noFill()

        //reset flag for next cycle
        this.showThrusterFiring = false;
    }

    update()
    {
      this.pos.add(this.vel);

      //appear on other edge if we go offscreen
      if(this.pos.x > canvasWidth)
      {
        this.pos.x = 0;
      }
      if(this.pos.x < 0)
      {
        this.pos.x = canvasWidth;
      }
      if(this.pos.y > canvasHeight)
      {
        this.pos.y = 0;
      }
      if(this.pos.y < 0)
      {
        this.pos.y = canvasHeight;
      }

      this.gunOrientation = this.rotation + this.gunRotationOffset;
      this.gunPos = createVector(this.pos.x,this.pos.y);
    }

    thrust()
    {
      if(!this.dead)
      {
        var xcomponent = this.thrustRate * Math.sin(radians(this.rotation));
        var ycomponent = this.thrustRate * -Math.cos(radians(this.rotation));

        this.vel.add(xcomponent,ycomponent);

        this.showThrusterFiring = true;
      }
    }

    retro()
    {
      if(!this.dead)
      {
        this.vel.mult(this.retroMult);
      }
    }

    rotateClockwise()
    {
      if(!this.dead)
      {
        this.rotation += this.rotationRate;
      }
    }

    rotateCounterClockwise()
    {
      if(!this.dead)
      {
        this.rotation -= this.rotationRate;
      }
    }

    kill()
    {
      this.dead = true;
      playerShipDead = true;
    }

	setColor(color)
	{
		this.color = color;
	}

	changeColorPreservingAlpha(colorIn)
    {
      this.color = color(red(colorIn), green(colorIn),blue(colorIn),alpha(this.color));
    }

    setColorAlpha(newAlpha)
    {
      this.color = color(red(this.color), green(this.color),blue(this.color),newAlpha);
    }


    toString()
    {
      return "Ship x:"+this.pos.x.toString()+" y:"+this.pos.y.toString();
    }


}