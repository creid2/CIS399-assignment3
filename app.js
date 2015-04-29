"use strict"; // nice to do this if we can

// Tell Canvas what we're going to be dealing with?
var gamestage = new createjs.Stage("gamecanvas");

// Here's a generic collision detection thing. This is whenever the hitboxes overlap
function checkCollision(object1, object2) {
  return !(
    object1.y + object1.spriteSheet._frameHeight <= object2.y ||
    object1.y > object2.y + object2.spriteSheet._frameHeight ||
    object1.x > object2.x + object2.spriteSheet._frameWidth ||
    object1.x + object1.spriteSheet._frameWidth <= object2.x
    );
}

var Ball = function(i) {
    this.animations = new createjs.Sprite(new createjs.SpriteSheet({
        "images": ["./ball.png"],
        "frames": {
            "width": 16,
            "height": 16,
            "count": 4 // Total number of frames contained in the image
        },
        "animations": {
            "ball": {
                "frames": [0, 1, 2, 3, 0, 0, 0], // most frames are of the backside
                "speed": 0.25
            }
        }
    }), "ball");
    this.animations.x = 32 * i; // set location
    this.animations.y = 32;
    this.xdirection = 1;    // set starting direction (towrds bottom right)
    this.ydirection = 1;

    // When a new ball is instantiated, it puts it right into the gamestage.
    gamestage.addChild(this.animations);

    // the ball checks collisions for any walls, then updates movement
    // the paddle object is still global, so we can access it 
    this.checkCollisions = function() {
        if (this.animations.x < 0) {
            location.reload();
        } else if (this.animations.x + this.animations.spriteSheet._frameWidth
              > gamestage.canvas.width) {
            this.xdirection *= -1
        }
        if (this.animations.y < 0) {
            this.ydirection *= -1;
        } else if (this.animations.y + this.animations.spriteSheet._frameHeight
                  > gamestage.canvas.height) {
            this.ydirection *= -1;
        }
        if (checkCollision(this.animations, paddle1.animations) || 
                checkCollision(this.animations, paddle2.animations)) {
            this.xdirection *= -1;
        }
    };

    this.updatePosition = function() {
        this.animations.x += this.xdirection;
        this.animations.y += this.ydirection;
    };
}


// Takes an argument of width from edge
var Paddle = function(i) {
    this.animations = new createjs.Sprite(new createjs.SpriteSheet({
        "images": ["./paddle.png"],
        "frames": {
            "width": 8,
            "height": 32,
            "count": 1 // Total number of frames in the image
        },
        "animations": {
            "paddle": {
                "frames": [0] // only 1 frame
            }
        }
    }), "paddle");

    this.animations.x = i; // set location
    this.animations.y = 32;
    this.downwardMovement = false;
    this.upwardMovement = false;

    gamestage.addChild(this.animations);

    // To prevent the paddle going up off the screen or down off the screen
    this.checkCollisions = function() {
        if (this.animations.y < 0) {
            this.upwardMovement = false;
        } else if (this.animations.y >
                gamestage.canvas.height - this.animations.spriteSheet._frameHeight) {
            this.downwardMovement = false;
        }
    }

    this.updatePosition = function() {
        if (this.downwardMovement) {
            this.animations.y += 1;
        } else if (this.upwardMovement) {
            this.animations.y -= 1;
        }
    };

}


var ball = new Ball(1);
var paddle1 = new Paddle(16);
var paddle2 = new Paddle(gamestage.canvas.width - 16);

// We only want to draw when we have to, when 
// we have a full frame with everything at once
var frameTick = function() {
    ball.checkCollisions();
    ball.updatePosition();
    paddle1.checkCollisions();
    paddle1.updatePosition();
    paddle2.checkCollisions();
    paddle2.updatePosition();

    gamestage.update(); // force a redraw on the canvas
}


document.onkeydown = function (event) {
    // make paddle1 move up and down
    if (event.keyCode === 40) {
        paddle1.downwardMovement = true;
        paddle1.upwardMovement = false;
    } else if (event.keyCode ===  38) {
        paddle1.upwardMovement = true;
        paddle1.downwardMovement = false;
    }
}

// This sets upwardMovement and downwardMovement rather than following cursor
// because if it followed the cursor, the mouse player would have an unfair
// advantage (being able to move the paddle quicker)
document.onmousemove = function(event) {
    // Make sure the units match
    var mouseY = event.clientY / window.innerHeight;
    var paddleTop = paddle2.animations.y / gamestage.canvas.height;
    var paddleBot = (paddle2.animations.y + paddle2.animations.spriteSheet._frameHeight)
                    / gamestage.canvas.height;

    if (mouseY > paddleBot) {
        paddle2.downwardMovement = true;
        paddle2.upwardMovement = false;
    } else if (mouseY < paddleTop) {
        paddle2.downwardMovement = false;
        paddle2.upwardMovement = true;
    } else {
        paddle2.downwardMovement = false;
        paddle2.upwardMovement = false;
    }
}

// Alternatively, could just stop all key movement regardless of key code
document.onkeyup = function(event) {
  if (event.keyCode === 40) {
    paddle1.downwardMovement = false;
  } else if (event.keyCode ===  38) {
    paddle1.upwardMovement = false;
  }
}

createjs.Ticker.addEventListener("tick", frameTick);
createjs.Ticker.setFPS(60);
