// # Quintus platformer example
//
// [Run the example](../quintus/examples/platformer/index.html)
// WARNING: this game must be run from a non-file:// url
// as it loads a level json file.
//
// This is the example from the website homepage, it consists
// a simple, non-animated platformer with some enemies and a 
// target for the player.
window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({ audioSupported: [ 'wav','mp3','ogg' ] })
		.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
		// Maximize this game to whatever the size of the browser is
		.setup({ maximize: true })
		// And turn on default input controls and touch input (for UI)
		.controls().touch()
		// Enable sounds.
		.enableSound();

// Load and init audio files.
Q.SPRITE_PLAYER = 1;
Q.SPRITE_COLLECTABLE = 2;
Q.SPRITE_TRAP = 4;
Q.SPRITE_ENEMY = 5;
Q.SPRITE_DOOR = 8;

// Load variables for playing
Q.PLAYER_LEVEL = 1;
Q.PLAYER_POINTS = 0;
Q.PLAYER_HEALTH = 100;

Q.SOUND_I = 0;
Q_SOUND_I2 = 0;

Q.Sprite.extend("Player", {
	
	init: function(p) {

		this._super(p, {
// Setting a sprite sheet sets sprite width and height
			sheet: "player",
			sprite: "player",
			direction: "right",
			standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
			duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
			jumpSpeed: -600,
			speed: 400,
			type: Q.SPRITE_PLAYER,
			collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE
		});

		this.p.points = this.p.standingPoints;
		this.add('2d, platformerControls, animation, tween');

		// this.on("bump.top","breakTile");
		// Q.input.on("down", this, "checkDoor");

		this.on("sensor.tile","checkLadder");
		this.on("sensor.tile","checkExit");
		this.on("sensor.tile","checkThisWay");
		this.on("enemy.hit","enemyHit");

		this.on("jump");
		this.on("jumped");
		
 	},

	jump: function(obj) {
// Only play sound once.
		if (!obj.p.playedJump) {
			Q.audio.play('jump1.mp3');
			obj.p.playedJump = true;
			obj.p.thisway = true;
		}
	},

	jumped: function(obj) {
		obj.p.playedJump = false;
	},

// Checks if player on ladder
	checkLadder: function(colObj) {
		if(colObj.p.ladder) { 
			this.p.onLadder = true;
			this.p.ladderX = colObj.p.x;
		}
	},

// Checks if player on this way tile
	checkThisWay: function(colObj) {
		if(colObj.p.thisway) {
			this.p.onThisWay = true;
			if(this.p.onThisWay == true) {
				Q.audio.stop("thisway_imlost.mp3");
				Q.audio.stop("thisway_whatisthisplace.mp3");
				Q.audio.stop("thisway_wipii.mp3");
				var random = Math.floor( (Math.random() * 3) + 1 );
				switch(random) {
					case 1:
						Q.audio.play("thisway_imlost.mp3");
						break;
					case 2:
						Q.audio.play("thisway_whatisthisplace.mp3");
						break;
					case 3:
						Q.audio.play("thisway_wipii.mp3");
						break;
				}
			}
		}
	},

// Checks if player on exit tile
	checkExit: function(colObj) {
		if(colObj.p.exit) { 
			var next_level = Q.PLAYER_LEVEL + 1;
			var level_change_limit = 0;
// Level change limits
			switch(next_level) {
				case 2:
					level_change_limit = 0;
					break;
				case 3:
					level_change_limit = 0;
					break;
				case 4:
					window.location = "finish.html";
					break;
				default:
					return;
			}
// If can change level
			if(Q.PLAYER_POINTS >= level_change_limit) {
				Q.PLAYER_LEVEL = next_level;
				// console.log("Changed level to " + Q.PLAYER_LEVEL);
				showLvlIntro(Q.PLAYER_LEVEL);
				colObj.p.exit = false;
			}
		}
	},

// Function that resets current level
	resetLevel: function() {
		// console.log("Reset to level: " + Q.PLAYER_LEVEL);
		Q.stageScene("level" + Q.PLAYER_LEVEL);
		Q.PLAYER_HEALTH = 100;
		Q.PLAYER_POINTS = 0;
		this.animate({ opacity: 1 });
		Q.stageScene('hud', 3);
		Q.audio.play('game-start.mp3', 1 );
	},

// Function that resets whole game
	resetGame: function() {
		Q.stageScene("level1");
		Q.PLAYER_HEALTH = 100;
		Q.PLAYER_POINTS = 0;
		this.animate({ opacity: 1 });
		Q.stageScene('hud', 3);
		Q.audio.play('game-start.mp3', 1 );
	},

	enemyHit: function(data) {
		var col = data.col;
		var enemy = data.enemy;
		this.p.vy = -150;
		if (col.normalX == 1) {
// Hit from left.
			this.p.x -=15;
			this.p.y -=15;
		}
		else {
// Hit from right;
			this.p.x +=15;
			this.p.y -=15;
		}
		this.p.immune = true;
		this.p.immuneTimer = 0;
		this.p.immuneOpacity = 1;
		// Q.PLAYER_HEALTH -= 25;
		// Q.stageScene('hud', 3);
		// if (Q.PLAYER_HEALTH <= 0) {
		this.resetLevel();
		// }
	},

	continueOverSensor: function() {
		this.p.vy = 0;
		if(this.p.vx != 0) {
			this.play("walk_" + this.p.direction);
		} else {
			this.play("stand_" + this.p.direction);
		}
	},

	step: function(dt) {
		var processed = false;
		if (this.p.immune) {
// Swing the sprite opacity between 50 and 100% percent when immune.
	  		if ((this.p.immuneTimer % 12) == 0) {
				var opacity = (this.p.immuneOpacity == 1 ? 0 : 1);
				this.animate({"opacity":opacity}, 0);
				this.p.immuneOpacity = opacity;
			}
			this.p.immuneTimer++;
		if (this.p.immuneTimer > 144) {
// 3 seconds expired, remove immunity.
			this.p.immune = false;
			this.animate({"opacity": 1}, 1);
		}
	}

	if(!processed) { 
		this.p.gravity = 1;
		if(Q.inputs['down'] && !this.p.door) {
			this.p.ignoreControls = true;
			this.play("duck_" + this.p.direction);
			if(this.p.landed > 0) {
				this.p.vx = this.p.vx * (1 - dt*2);
			}
			this.p.points = this.p.duckingPoints;
		} else {
			this.p.ignoreControls = false;
			this.p.points = this.p.standingPoints;
			if(this.p.vx > 0) {
				if(this.p.landed > 0) {
					this.play("walk_right");
				} else {
					this.play("jump_right");
				}
				this.p.direction = "right";
			} else if(this.p.vx < 0) {
				if(this.p.landed > 0) {
					this.play("walk_left");
				} else {
					this.play("jump_left");
				}
				this.p.direction = "left";
			} else {
				this.play("stand_" + this.p.direction);
			}
		}
	}

// Initialize some variables
	this.p.onLadder = false;
	this.p.door = false;
	this.p.checkDoor = false;
	this.p.checkExit = false;
	this.p.onThisWay = false;

// Stop following player character
	if(this.p.y > 10000) { 
		this.stage.unfollow(); 
	}

// Reset level if user dropped
	if(this.p.y > 12000) {
		this.resetLevel();
	}

  	}

});

Q.Sprite.extend("Trap", {
	init: function(p,defaults) {
		this._super(p,Q._defaults(defaults||{},{
			sheet: p.sprite,
			vx: 70,
			defaultDirection: 'left',
			type: Q.SPRITE_ENEMY,
			collisionMask: Q.SPRITE_DEFAULT
		}));
		this.add("animation");
		this.on("hit.sprite",this,"hit");
	},
	hit: function(col) {
		if(col.obj.isA("Player")) {
			col.obj.resetGame();
		}
	},
});

Q.Sprite.extend("Enemy", {
	
	init: function(p,defaults) {
		this._super(p,Q._defaults(defaults||{},{
			sheet: p.sprite,
			vx: 50,
			defaultDirection: 'left',
			type: Q.SPRITE_ENEMY,
			collisionMask: Q.SPRITE_DEFAULT
		}));
		this.add("2d, aiBounce, animation");
		this.on("bump.top",this,"die");
		this.on("hit.sprite",this,"hit");
	},

	step: function(dt) {
		if(this.p.dead) {
			this.del('2d, aiBounce');
			this.p.deadTimer++;
			if (this.p.deadTimer > 24) {
// Dead for 24 frames, remove it.
				this.destroy();
			}
			return;
		}
		var p = this.p;
		p.vx += p.ax * dt;
		p.vy += p.ay * dt;
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		this.play('walk');
	},

	hit: function(col) {
		if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
			col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
			Q.audio.play('hit.mp3');
		}
	},

	die: function(col) {
		if(col.obj.isA("Player")) {
			Q.audio.play('enemy-die.mp3');
			this.p.vx=this.p.vy=0;
			this.play('dead');
			this.p.dead = true;
			var that = this;
			col.obj.p.vy = -300;
			this.p.deadTimer = 0;
			// Q.PLAYER_POINTS += 25;
			Q.stageScene('hud', 3);
		}
	}
});

Q.Enemy.extend("Fly", {

});

Q.Enemy.extend("Slime", {
	init: function(p) {
		this._super(p,{
			w: 55,
			h: 34
		});
	}
});

Q.Enemy.extend("Snail", {
	init: function(p) {
		this._super(p,{
			w: 55,
			h: 36
		});
	}
});

Q.Trap.extend("CircularSaw", {
	init: function(p) {
		this._super(p,{
			w: 70,
			h: 70
		});
	},
	step: function(dt) {
		this.play('roll');
	}
});

Q.Sprite.extend("Collectable", {
	init: function(p) {
		this._super(p,{
			sheet: p.sprite,
			type: Q.SPRITE_COLLECTABLE,
			collisionMask: Q.SPRITE_PLAYER,
			sensor: true,
			vx: 0,
			vy: 0,
			gravity: 0
		});
		this.add("animation");
		this.on("sensor");
	},

// When a Collectable is hit.
	sensor: function(colObj) {
// Increment the score.
		if(this.p.amount) {
			Q.PLAYER_POINTS += this.p.amount;
			Q.stageScene('hud', 3);
		}
		var random_drink_sound = Math.floor((Math.random() * 3) + 1);
		switch(random_drink_sound) {
			case 1:
				Q.audio.play('drink.mp3');
				break;
			case 2:
				Q.audio.play('drink2.mp3');
				break;
			case 3:
				Q.audio.play('drink3.mp3');
				break;
		}
		
		this.destroy();
	}
});

Q.Sprite.extend("Door", {
	init: function(p) {
		this._super(p,{
			sheet: p.sprite,
			type: Q.SPRITE_DOOR,
			collisionMask: Q.SPRITE_NONE,
			sensor: true,
			vx: 0,
			vy: 0,
			gravity: 0
		});
		this.add("animation");
		this.on("sensor");
	},
	findLinkedDoor: function() {
		return this.stage.find(this.p.link);
	},
// When the player is in the door.
	sensor: function(colObj) {
// Mark the door object on the player.
		colObj.p.door = this;
	}
});

// LEVEL 1 initialization
Q.scene("level1", function(stage) {
	Q.audio.stop();
	stage.insert(new Q.Repeater({ asset: "bg_clouds.png", speedX: 0.5, speedY: 0.5, type: 1 }));
	Q.stageTMX("level1.tmx", stage);
	stage.add("viewport").follow(Q("Player").first());
	stage.viewport.scale = 0.7;
	Q.audio.play('game-start.mp3', 1 );
	Q.audio.play('lvl1_music.mp3', { loop: true });
});

// LEVEL 2 initialization
Q.scene("level2", function(stage) {
	Q.audio.stop();
	stage.insert(new Q.Repeater({ asset: "bg_lvl2.png", speedX: 0.5, speedY: 0.5, type: 1 }));
	Q.stageTMX("level2.tmx", stage);
	stage.add("viewport").follow(Q("Player").first());
	stage.viewport.scale = 0.7;
	Q.audio.play('game-start.mp3', 1 );
	Q.audio.play('lvl2_music.mp3', { loop: true });
});

// LEVEL 3 initialization
Q.scene("level3", function(stage) {
	Q.audio.stop();
	stage.insert(new Q.Repeater({ asset: "bg_lvl3.png", speedX: 0.5, speedY: 0.5, type: 1 }));
	Q.stageTMX("level3.tmx", stage);
	stage.add("viewport").follow(Q("Player").first());
	stage.viewport.scale = 0.7;
	Q.audio.play('game-start.mp3', 1 );
	Q.audio.play('lvl1_music.mp3', { loop: true });
});

// Load scores to the left top
Q.scene('hud',function(stage) {
	var container = stage.insert(new Q.UI.Container({ x: 50, y: 0 }));
	// var strength = container.insert(new Q.UI.Text({ x: 50, y: 20, label: "Health: " + Q.PLAYER_HEALTH, color: "#000" }));
	var label = container.insert(new Q.UI.Text({ x: 70, y: 20, label: "Drunkness: " + (Q.PLAYER_POINTS / 100) + " ‰ ", color: "#000" }));
	container.fit(20);
});

// Loads everything for ready to use
// Remember to add comma after every but not last line !!!
var load_files = "level1.tmx, level2.tmx, level3.tmx, ";
var json_files = "collectables.json, doors.json, traps.json, enemies.json, player.json, "
var sound_files = "lvl1_music.mp3, lvl2_music.mp3, jump1.mp3, hit.mp3, game-start.mp3, drink.mp3, drink2.mp3, drink3.mp3, enemy-die.mp3, thisway_imlost.mp3, thisway_whatisthisplace.mp3, thisway_wipii.mp3, ";
var image_files = "player.png, bush.png, bg_castle.png, bg_clouds.png, bg_lvl2.png, bg_lvl3.png";

Q.loadTMX(load_files + json_files + sound_files + image_files, function() {

	Q.compileSheets("player.png","player.json");
	Q.compileSheets("collectables.png","collectables.json");
	Q.compileSheets("enemies.png","enemies.json");
	Q.compileSheets("doors.png","doors.json");
	Q.compileSheets("traps.png","traps.json");   

	Q.animations("player", {
		walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip: false, loop: true },
		walk_left: { frames:  [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip:"x", loop: true },
		jump_right: { frames: [13], rate: 1/10, flip: false },
		jump_left: { frames:  [13], rate: 1/10, flip: "x" },
		stand_right: { frames:[14], rate: 1/10, flip: false },
		stand_left: { frames: [14], rate: 1/10, flip:"x" },
		duck_right: { frames: [15], rate: 1/10, flip: false },
		duck_left: { frames:  [15], rate: 1/10, flip: "x" },
		climb: { frames:  [16, 17], rate: 1/3, flip: false }
	});

	var EnemyAnimations = {
		walk: { frames: [0,1], rate: 1/3, loop: true },
		dead: { frames: [2], rate: 1/10 }
	}

	var animateTraps = {
		roll: { frames: [0,1], rate: 1/3, loop: true }
	}

	Q.animations("fly", EnemyAnimations);
	Q.animations("slime", EnemyAnimations);
	Q.animations("snail", EnemyAnimations);
	Q.animations("circularsaw", animateTraps);

	Q.stageScene("level1");

	Q.stageScene('hud', 3, Q('Player').first().p);

}, {
	progressCallback: function(loaded,total) {
		var element = document.getElementById("loading_progress");
		element.style.width = Math.floor(loaded/total * 100) + "%";
		if (loaded == total) {
			document.getElementById("loading").remove();
		}
	}
});

});
