// 设置画布

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 生成随机数的函数

function random(min,max) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return num;
}

// 生成随机颜色值的函数

function randomColor() {
  const color = 'rgb(' +
                random(0, 255) + ',' +
                random(0, 255) + ',' +
                random(0, 255) + ')';
  return color;
}

// 定义 Shape 构造器

function Shape(x, y, velX, velY, exists) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = true; // 新增属性，标记球是否存在于程序中
}

// 定义 Ball 构造器,从Shape继承

function Ball(x, y, velX, velY, color, size, exists) {
  Shape.call(this, x, y, velX, velY, exists); // 调用 Shape 构造器
  
  this.color = color;
  this.size = size;
}

// 设置 Ball 的 prototype 属性，使其继承 Shape 的 prototype
Ball.prototype = Object.create(Shape.prototype);
// 设置 constructor 属性
Ball.prototype.constructor = Ball; 

// 定义彩球绘制函数

Ball.prototype.draw = function() {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
};

// 定义彩球更新函数

Ball.prototype.update = function() {
  if((this.x + this.size) >= width) {
    this.velX = -(this.velX);
  }

  if((this.x - this.size) <= 0) {
    this.velX = -(this.velX);
  }

  if((this.y + this.size) >= height) {
    this.velY = -(this.velY);
  }

  if((this.y - this.size) <= 0) {
    this.velY = -(this.velY);
  }

  this.x += this.velX;
  this.y += this.velY;
};

// 定义碰撞检测函数

Ball.prototype.collisionDetect = function() {
  for(let j = 0; j < balls.length; j++) {
    if(this !== balls[j]) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        balls[j].color = this.color = randomColor();
      }
    }
  }
};

// 定义 EvilCircle 构造器，从 Shape 继承

function EvilCircle(x, y, exists) {
  Shape.call(this, x, y, 20, 20, exists); // 调用 Shape 构造器
  this.color = 'white';
  this.size = 10;
}

// 设置 EvilCircle 的 prototype 属性，使其继承 Shape 的 prototype
EvilCircle.prototype = Object.create(Shape.prototype);
EvilCircle.prototype.constructor = EvilCircle; // 设置 constructor 属性

// 定义 EvilCircle 绘制函数

EvilCircle.prototype.draw = function() {
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke();
}

// 定义 EvilCircle 边缘检测方法checkBounds()

EvilCircle.prototype.checkBounds = function() {
  if((this.x + this.size) >= width) {
    this.x -= this.size;
  }

  if((this.x - this.size) <= 0) {
    this.x += this.size;
  }

  if((this.y + this.size) >= height) {
    this.y -= this.size;
  }

  if((this.y - this.size) <= 0) {
    this.velY =+ this.size;
}
}

// 定义 EvilCircle 控制设置（setControls）方法

EvilCircle.prototype.setControls = function() {
  window.onkeydown = e => {
    switch(e.key) {
      case 'a':
      case 'A':
      case 'ArrowLeft':
        this.x -= this.velX;
        break;
      case 'd':
      case 'D':
      case 'ArrowRight':
        this.x += this.velX;
        break;
      case 'w':
      case 'W':
      case 'ArrowUp':
        this.y -= this.velY;
        break;
      case 's':
      case 'S':
      case 'ArrowDown':
        this.y += this.velY;
        break;
    }
  };
}

// 定义 EvilCircle 碰撞检测函数

EvilCircle.prototype.collisionDetect = function() {
  for(let j = 0; j < balls.length; j++) {
    if(balls[j].exists) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + balls[j].size) {
        balls[j].exists = false;
        balls.splice(j, 1); // 删除数组中的元素
      }
    }
  }
};

// 定义一个数组，生成并保存所有的球

let balls = [];

while(balls.length < 25) {
  const size = random(10,20);
  let ball = new Ball(
    // 为避免绘制错误，球至少离画布边缘球本身一倍宽度的距离
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomColor(),
    size
  );
  balls.push(ball);
}

// 定义一个循环来不停地播放
let evil = new EvilCircle(random(0, width), random(0, height), true);
evil.setControls();

function loop() {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0,0,width,height);
  
  // 创建一个变量存储段落的引用
  const remainingBallsParagraph = document.getElementById('remaining-balls');

  // 以同样的方式在屏幕上显示小球的数量
  remainingBallsParagraph.textContent = `还剩 ${balls.length} 个球`;
  for(let i = 0; i < balls.length; i++) {
    if(balls[i].exists) {
      balls[i].draw();
      balls[i].update();
      balls[i].collisionDetect();
    }
  }
  
  // 在每个 loop 的循环中调用恶魔圈实例的方法 draw(), checkBounds(), 和collisionDetect()
  evil.draw();
  evil.checkBounds();
  evil.collisionDetect();
  
  requestAnimationFrame(loop);
}

loop();