"use strict";

var canvasWidth = 600;
var canvasHeight = 600;
var blackSpaceFill = 0;
var points = 0;
var textColor;

var soundMgr;
var debugMode = true;
var frameDebug = false;

var gameObjects = [];

var points_string = '';
var points_string_location;
var FPS_string  = '';
var FPS_string_location;
var Game_Over_string = 'Game Over. Press [Enter] to start again.';
var Game_Over_string_location;
var nextAlienSpawnTime = 0;
const alienSpawnRateInSeconds = 70;
var playerShipDead;
var playerShipGameObjectPos;
var playerShipShotQueued;
var asteroidCount;

var defaultShipColor;

function reset() {
    var canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('sketch-holder');

    frameRate(60);
    background(blackSpaceFill);
    nextAlienSpawnTime = 0;

    textSize(14);
    //textStyle(BOLD);
    textColor = 255;
    textFont('Courier New');

    points = 0;

	  defaultShipColor = color(0,255,0);

    gameObjects = [];
    gameObjects.push(new Ship(defaultShipColor));

    gameObjects.push(new Asteroid());

    soundMgr = new SoundManager();
    soundMgr.mute = true;


    setInterval(halfSecondUpdateLoop,500);
    setInterval(oneSecondUpdateLoop,1000);

    points_string_location = createVector(canvasWidth*(19/24),20);
    FPS_string_location = createVector(10,20);

    Game_Over_string_location = createVector(canvasWidth/5,canvasHeight/2);
    playerShipDead = false;
    playerShipGameObjectPos = 0;
    playerShipShotQueued = false;
    asteroidCount = 0;
}


function setup() {
  reset();
}

function draw()
{
    asteroidCount = 0;


    background(blackSpaceFill);

    renderText();

    console.log("gameObjects.length:" + gameObjects.length.toString())
    if(gameObjects.length>0)
    {
      for(var i = gameObjects.length -1; i >= 0; i--)
      {
        if(!gameObjects[i] ||
          gameObjects[i] == undefined ||
          gameObjects[i].deleteFlag)
        {
          gameObjects.splice(i,1);
        }

        if(gameObjects[i] instanceof Ship)
        {
          playerShipGameObjectPos = i;

          let ship = gameObjects[i];

          //handle player input
          handleKeyInput(ship);

          if(playerShipShotQueued)
            gameObjects.push(new Proton(ship.gunPos.x,ship.gunPos.y,radians(ship.gunOrientation)));
            soundMgr.queueSound('proton_bolt');
            playerShipShotQueued = false;
        }



        if(gameObjects[i] instanceof Asteroid)
        {
          asteroidCount += 1;
        }

        gameObjects[i]? gameObjects[i].update()  : console.log("undefined object at "+i.toString())
        gameObjects[i]? gameObjects[i].render() : console.log("undefined object at "+i.toString())

        //check for collisions
        if(gameObjects.length > 0)
        {
          for(var j = gameObjects.length - 1; j >= 0; j--)
          {
            manageCollision(gameObjects[j],gameObjects[i])
          }
        }
      }
    }


    if(playerShipDead)
    {
      textColor = color(255,0,0);
      text(Game_Over_string,Game_Over_string_location.x,Game_Over_string_location.y);
    }

    //play all the sounds we've built up this frame
    soundMgr.playAllQueuedSounds();

    //freeze for analysis
    if(frameDebug)
    {
      throw 'freeze';
    }
}

function manageCollision(a,b)
{
  if(a instanceof Asteroid && b instanceof Proton)
  {
    if(a.collides(b.pos.x,b.pos.y))
        {
          //check if the rock breaks
          var smallRock = a.smallerAsteroidSize();
          if(smallRock > 12)
          {
            //record previous position
            var oldPos = a.pos

            //create two more on the high end of the array
            gameObjects.push(new Asteroid(oldPos.x,oldPos.y,smallRock));
            gameObjects.push(new Asteroid(oldPos.x,oldPos.y,smallRock));
          }
          //delete the old asteroid
          a.deleteFlag = true;
          b.deleteFlag = true;

          points += 10;
          soundMgr.queueSound('asteroid_break');
        }
    return;
  }

  if(a instanceof Alien && b instanceof Proton)
  {
    if(a.collides(b.pos.x,b.pos.y))
    {
          if(!a.angry)
          {
            soundMgr.queueSound('alien_angry');
          }
          a.hit();

          b.deleteFlag = true;
    }
    return;
  }

  if(a instanceof Alien && b instanceof Ship)
  {
    if(a.angry &&
      dist(a.pos.x,a.pos.y,b.pos.x,b.pos.y) < a.deathRayMaxRange-a.scl)
   {
     b.kill();
   }
  }
}

function mousePressed()
{

}

//handles continuous presses
var handleKeyInput = function(ship)
{
    //key handling
    if(keyIsDown(UP_ARROW) || keyIsDown(87) /* w */)
    {
      ship.thrust();
    }
    if(keyIsDown(DOWN_ARROW) || keyIsDown(83) /* s */)
    {
      ship.retro();
    }
    if(keyIsDown(LEFT_ARROW) || keyIsDown(65) /* a */)
    {
      ship.rotateCounterClockwise();
    }
    if(keyIsDown(RIGHT_ARROW) || keyIsDown(68) /* d */)
    {
      ship.rotateClockwise();
    }
    resumeSoundIfContextBlocked();
};

function keyPressed() {
  resumeSoundIfContextBlocked();

  if(key == ' ' && !playerShipDead)
  {
    playerShipShotQueued = true;
  }

  if(key == 'L' && debugMode)
  {
    gameObjects.push(new Alien());
    soundMgr.queueSound('alien_approach');
  }

  if(key == 'K' && debugMode)
  {
    addAlien()
  }


  if(key=='I' && debugMode)
  {
     print("ship pos "+str(ship.pos.x.toFixed(1))+','+str(ship.pos.y.toFixed(1)));
     frameDebug = true;

  }

  if(keyCode == ENTER || keyCode == RETURN)
  {
    reset();
  }

  if(key=='M')
  {
    soundMgr.mute = !soundMgr.mute
  }

  if(key=='T')
  {
    for(let i = 0; i< gameObjects.length; i++)
    {
      if(gameObjects[i])
      {
        console.log(gameObjects[i].toString());
      } else
      {
        console.log('unknown:',i.toString())
      }

    }
    throw 'freeze requested:'
  }
};

var addAsteroidsIfNeeded = function()
{
  if(asteroidCount <= 0)
  {
    var toAdd = 3 + (millis()/1000/60); //3 + number of minutes you have been playing
    for(var i=0; i < toAdd;i++)
    {
      gameObjects.push(new Asteroid())
    }
  }
}

var addAliensIfNeeded = function()
{
  var currentMillis = millis();
  if(nextAlienSpawnTime < 1)
  {
    nextAlienSpawnTime = currentMillis + 20*1000;
  }
  if (currentMillis > nextAlienSpawnTime)
  {
    addAlien()
    nextAlienSpawnTime = currentMillis + alienSpawnRateInSeconds*1000;
  }
}

function addAlien()
{
  gameObjects.push(new Alien());
  soundMgr.queueSound('alien_approach');
}

function randomFromInterval(min,max){
    return Math.random()*(max-min+1)+min;
}

function coinFlip()
{
  return (int(Math.random() * 2) == 0);
}

function UI_text_update()
{
  var fps = frameRate();
  FPS_string = "FPS:" + fps.toFixed(0);

  points_string = "Points: " + points;
}

function renderText()
{
    stroke(textColor);
    fill(textColor);
    text(FPS_string, FPS_string_location.x,FPS_string_location.y);
    text(points_string,points_string_location.x,points_string_location.y);
}

function oneSecondUpdateLoop() {
  addAsteroidsIfNeeded();
  addAliensIfNeeded();
  if(playerShipDead)
  {
    for(var i = gameObjects.length - 1; i >= 0; i--)
    {
      if(gameObjects[i] instanceof Alien) gameObjects[i].calm();
    }
  }
}

function halfSecondUpdateLoop(){
  UI_text_update();
}

function resumeSoundIfContextBlocked()
{
  if (getAudioContext().state !== 'running')
  {
        getAudioContext().resume();
  }
}