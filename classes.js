
function BG(canvas, v){
	
	this.vx = v;
	this.img = null;    
    
    this.xpos = 0;
    this.context = canvas.getContext('2d');
	
	this.numImages = 0;
	
	this.init = function(width, image){
		this.img = image;
		this.numImages = Math.ceil(width / image.width) + 1;
	}
	
	this.draw = function(){
		for(var i=0; i<this.numImages; ++i){
			this.context.drawImage(this.img, -this.xpos + i * this.img.width, 0);
		}

		this.xpos += this.vx;
		this.xpos %= this.img.width;
		

	}
}

function Player(){

	this.init = function(image, y, numFrames ,maxFrames, maxNumOfFrames){
		this.score = 0;
		this.image = image;
		this.land = y;
		this.y = y;
		this.dy = 0;
		this.maxdist = y - 0.7*y;
		this.xpos = 100;
		this.height = this.image.height/2;
		this.numOfFrames = maxNumOfFrames || numFrames;
		this.frameWidth = this.image.width / numFrames;
		this.framePos = 0;
		this.maxFrames = maxFrames;
		this.framesCounter = 0;
		this.jumped = false;
	}

	this.draw = function(context, pos){
		if(this.jumped){
			pos = 10;
		}
		context.drawImage(this.image, pos*this.frameWidth || this.framePos*this.frameWidth, 0, this.frameWidth, 2*this.height, this.xpos, this.y, this.frameWidth/2, this.height);
		this.update();
	}

	this.update = function(){
		this.framesCounter++;
		if(this.framesCounter == this.maxFrames){
			this.framesCounter = 0;
			this.framePos++;
			this.framePos %= this.numOfFrames;

			this.score++;

		}

		this.y -= this.dy;

		if(this.y <= this.maxdist){
			this.dy = -5;
		}
		else if (this.y >= this.land){
			this.dy = 0;
			this.jumped = false;
		}

	}

	this.jump = function(){
		this.dy = 5;
		this.jumped = true;
	}

	this.check = function(block){
		if(this.y + this.height <= block.y){
			return false;
		}
		return true;
	}
}

function Block(){
	this.init = function(x, y, img, width, height){
		this.x = x;
		this.y = y;
		this.img = img;
		this.width = width;
		this.height = height;
	}

	this.update = function(dx){
		this.x -= dx;
	}

	this.draw = function(context, dx){
		context.drawImage(this.img, this.x, this.y, this.width, this.height);
		this.update(dx);
	}
}

function Game(){
	var self = this;
	this.init = function(){
		window.requestAnimationFrame = window.requestAnimationFrame
	               						 || window.webkitRequestAnimationFrame
	              						 || window.mozRequestAnimationFrame
	            						 || function(callback) { window.setTimeout(callback, 1000 / 60); };


		this.canvas = document.getElementById('bg');
		this.canvas.width = $("#canvasContainer").width();
		this.canvas.height = $("#canvasContainer").height();
		this.context = this.canvas.getContext('2d');

		this.bg =  new BG(this.canvas, 5);
		this.player = new Player();
		this.blocks = [];
		this.BGimg = new Image();
		this.BlockImage = new Image();
		this.PlayerImage = new Image();

		this.gameReady = 0;

		this.BGimg.src = 'img/27496414_1545190962268767_656332171_n.jpg';
		this.PlayerImage.src = 'img/player-sprites1.png';
		this.BlockImage.src = "img/block.png";
		
		this.BGimg.onload = function(){
			self.bg.init(self.canvas.width, self.BGimg);
			if(++self.gameReady == 3){
				self.ready();
			}
		}

		this.PlayerImage.onload = function(){
			self.player.init(self.PlayerImage, 260, 14, 5, 7);
			if(++self.gameReady == 3){
				self.ready();
			}
		}

		this.BlockImage.onload = function(){

			for(var i=0; i<4; ++i){
				self.generateBlocks();
			}
			if(++self.gameReady == 3){
				self.ready();
			}
		}

	}

	this.ready = function(){
		this.bg.draw(this.context);
		this.player.draw(this.context);
		
		this.context.font = "60px Arial";
		this.context.lineWidth = 1;
		this.context.fillStyle = "#fff";
		this.context.textAlign = "center";
		this.context.fillText("Press space to start", this.canvas.width/2, this.canvas.height/2);
		this.context.strokeText("Press space to start", this.canvas.width/2, this.canvas.height/2);
		
		window.addEventListener('keypress', self.getStart);
	}


	this.generateBlocks = function(){
		var newBlock = new Block();
		newBlock.init(this.canvas.width, 250, this.BlockImage, 70, 140);
		var lastDist = this.blocks[this.blocks.length-1] || {x:this.canvas.width};
		newBlock.x = lastDist.x + 500 + Math.random()* 300;
		console.log(lastDist);
		// if(this.blocks.length && this.blocks[this.blocks.length-1].x + 500 > this.canvas.width){
		// 	newBlock.x = this.blocks[this.blocks.length-1].x + 500;
		// }
		this.blocks.push(newBlock);
	}
	
	this.removeBlocks = function(){
		for(var i=this.blocks.length-1; i>=0; --i){
			if(this.blocks[i].x<0){
				this.blocks.splice(i, 1);
				this.generateBlocks();
				break;
			}
		}
	}

	this.Start = function(){
		window.removeEventListener('keypress', self.getStart);
		window.addEventListener('keypress', self.jump);

		this.interval = setInterval(function(){

			// if(Math.random() >= 0.995){
			// 	self.generateBlocks();
			// }

			self.removeBlocks();
			self.bg.draw();
			self.player.draw(self.context);
			var xpos = self.player.xpos + self.player.frameWidth/2;
			for(var i=0; i<self.blocks.length; ++i){
				self.blocks[i].draw(self.context, 5);
				if(xpos >= self.blocks[i].x+50 && self.player.xpos <= self.blocks[i].x){
					if(self.player.check(self.blocks[i])){
						self.bg.draw(self.context);
						self.player.draw(self.context, 2);
						self.blocks[i].draw(self.context, 5);
						clearInterval(self.interval);
						$("#restartbtn").css("display" , "block");
					}
				}
			}
			self.context.font = "40px Arial";
			self.context.lineWidth = 2;
			self.context.fillText("Score: " + self.player.score, 100, 30);
			self.context.strokeText("Score: " + self.player.score, 100, 30);
		}, 10);

	}

	this.getStart = function(e){
		if(e.code == "Space" || e.key == " " || e.charCode == 32){
			self.Start();
		}
	}

	this.jump = function(e){
		if((e.code == "Space" || e.key == " " || e.charCode == 32) && !game.player.jumped){
			self.player.jump();
		}
	}

}