let weatherCondition; 
let previousCondition; 

//wind
let windParticles = [];
let numWindParticles = 10;
let maxWindParticles = 15;
let spawnRate = 0;
let lastSpawnTime = 0;

let font;
let particles = []; //clock
let baseSize = 4;
let sizeRange = 3;
let drops = [];
let sunX;
let transitionDuration = 3600; 
let sunAlpha = 255;
let moonAlpha = 0;
let clouds = [];
let stars = [];
let maxStars = 200;

function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(100);
  
  clouds = [];
  stars = [];
  drops = [];
  windParticles = [];
  particles = [];
  weatherCondition = Math.floor(random(3)); 
  
  previousCondition = weatherCondition; 
  setInterval(setup, 10000); 
  
    
  // 새 날씨 조건에 따라 초기화
  if (weatherCondition === 0) {
    createRain();
    
  } else if(weatherCondition === 1) {
    createWind();
  }
 
    
  createParticles();
  sunX = width; // 햇빛 초기 위치 (화면 오른쪽)
  createClouds();
  createStars();
}

function draw() {
  let currentTime = millis();
  updateSunPosition();
  
  drawBackground(); // 그라디언트 배경 그리기
  
  displaySunOrMoon();

  
   if (weatherCondition === 0) {
      updateRain();
      displayRain();
      createParticles();
  } else if(weatherCondition === 1) {
     if (currentTime - lastSpawnTime > spawnRate) {
      if (windParticles.length < maxWindParticles) {
        createWind();
        lastSpawnTime = currentTime;
      }
    }
      updateWind();
      displayWind();
  }
 

  updateParticles();
  displayParticles();
  
  updateClouds();
  displayClouds();
  displayStars();
}

function time() {
  let h = nf(hour(), 2, 0); // 현재 시간 (2자리수, 24시간 형식)
  let m = nf(minute(), 2, 0); // 현재 분 (2자리수)
  return h + ':' + m;
}

function getColorForTimeOfDay() {
  let h = hour();
  if (h >= 6 && h < 12) {
    return color(255, 223, 186); // 아침 (밝은 주황)
  } else if (h >= 12 && h < 18) {
    return color(255, 255, 224); // 낮 (밝은 노랑)
  } else if (h >= 18 && h < 21) {
    return color(255, 165, 0); // 저녁 (오렌지)
  } else {
    return color(20, 24, 82); // 밤 (어두운 파랑)
  }
}

function getOppositeColor(c) {
  return color(255 - red(c), 255 - green(c), 255 - blue(c));
}

function lerpSunColor() {
  let h = hour();
  let m = minute();
  let s = second();
  let totalSeconds = (h * 3600) + (m * 60) + s;

  let color1, color2;
  let lerpFactor;


  if (h >= 6 && h < 12) {
    color1 = color(255, 100, 0); // 아침 (밝은 오렌지)
    color2 = color(255, 255, 0); // 낮 (밝은 노랑)
    lerpFactor = map(totalSeconds, 6 * 3600, 12 * 3600, 0, 1);
  } else if (h >= 12 && h < 18) {
    color1 = color(255, 255, 0); // 낮 (밝은 노랑)
    color2 = color(255, 69, 0); // 저녁 (짙은 오렌지)
    lerpFactor = map(totalSeconds, 12 * 3600, 18 * 3600, 0, 1);
  } else if (h >= 18 && h < 21) {
    color1 = color(255, 69, 0); // 저녁 (짙은 오렌지)
    color2 = color(20, 24, 82); // 밤 (어두운 파랑)
    lerpFactor = map(totalSeconds, 18 * 3600, 21 * 3600, 0, 1);
  } else if (h >= 21 || h < 6) {
    color1 = color(20, 24, 82); // 밤 (어두운 파랑)
    color2 = color(255, 100, 0); // 아침 (밝은 오렌지)
    if (h >= 21) {
      lerpFactor = map(totalSeconds, 21 * 3600, 24 * 3600, 0, 1);
    } else {
      lerpFactor = map(totalSeconds, 0, 6 * 3600, 0, 1);
    }
  }

  return lerpColor(color1, color2, lerpFactor);
}

function updateSunPosition() {
  let h = hour();
  let totalDayHours = 24;
  sunX = map(h, 0, totalDayHours, 0, width); // 햇빛 위치를 시간에 따라 매핑
}

function displaySunOrMoon() {
  let h = hour();
  let m = minute();
  let s = second();
  let totalSeconds = (h * 3600) + (m * 60) + s;
  
  if (6 <= h && h < 18) {
    // 아침과 낮에는 해를 표시
    let sunColor = lerpSunColor();
    blendMode(ADD);
    noStroke();
    fill(sunColor.levels[0], sunColor.levels[1], sunColor.levels[2], sunAlpha);
    ellipse(sunX, height / 2, 150, 150); // 햇빛을 원으로 그리기
    blendMode(BLEND);

    if (17 <= h && h < 18) {
      let t = map(totalSeconds, 17 * 3600, 18 * 3600, 0, 1);
      moonAlpha = lerp(0, 255, t);
    } else if (h >= 18) {
      moonAlpha = 255;
    } else {
      moonAlpha = 0;
    }
  } else {
    // 저녁과 밤에는 달을 표시
    let moonColor = color(255, 255, 255); // 달의 색상 (흰색)
    blendMode(ADD);
    noStroke();
    fill(moonColor.levels[0], moonColor.levels[1], moonColor.levels[2], moonAlpha);
    ellipse(sunX, height / 2, 150, 150); // 달을 원으로 그리기
    blendMode(BLEND);

    if (h >= 5 && h < 6) {
      let t = map(totalSeconds, 5 * 3600, 6 * 3600, 0, 1);
      sunAlpha = lerp(0, 255, t);
    } else if (h >= 6) {
      sunAlpha = 255;
    } else {
      sunAlpha = 0;
    }
  }

  // 두 번째 객체를 그리기
  if (moonAlpha > 0) {
    let moonColor = color(255, 255, 255); // 달의 색상 (흰색)
    blendMode(ADD);
    noStroke();
    fill(moonColor.levels[0], moonColor.levels[1], moonColor.levels[2], moonAlpha);
    ellipse(sunX, height / 2, 150, 150); // 달을 원으로 그리기
    blendMode(BLEND);
  }
  
  if (sunAlpha > 0) {
    let sunColor = lerpSunColor();
    blendMode(ADD);
    noStroke();
    fill(sunColor.levels[0], sunColor.levels[1], sunColor.levels[2], sunAlpha);
    ellipse(sunX, height / 2, 150, 150); // 햇빛을 원으로 그리기
    blendMode(BLEND);
  }
}

function drawBackground() {
  let h = hour();
  let m = minute();
  let s = second();
  let totalSeconds = (h * 3600) + (m * 60) + s;

  let color1, color2;
  let lerpFactor;

  if (h >= 1 && h < 10) {
    color1 = color(0, 0, 50); // 새벽
    color2 = color(135, 206, 235); // 아침
    lerpFactor = map(totalSeconds, 6 * 3600, 12 * 3600, 0, 1);
  } else if (10 <= h && h < 18) {
    color1 = color(135, 206, 235); // 아침
    color2 = color(255, 223, 186); // 낮
    lerpFactor = map(totalSeconds, 12 * 3600, 18 * 3600, 0, 1);
  } else if (h >= 18 && h < 21) {
    color1 = color(255, 223, 186); // 낮
    color2 = color(20, 24, 82); // 저녁
    lerpFactor = map(totalSeconds, 18 * 3600, 21 * 3600, 0, 1);
  } else {
    color1 = color(20, 24, 82); // 저녁
    color2 = color(0, 0, 20); // 밤
    if (h >= 21) {
      lerpFactor = map(totalSeconds, 21 * 3600, 24 * 3600, 0, 1);
    } else {
      lerpFactor = map(totalSeconds, 0, 6 * 3600, 0, 1);
    }
  }

  // 그라디언트 배경 그리기
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color1, color2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function createParticles() {
  let timeString = nf(hour(), 2) + ':' + nf(minute(), 2);
  particles = []; // 기존 파티클 초기화

  // 각 글자에 대해 파티클 생성
  for (let i = 0; i < timeString.length; i++) {
    let char = timeString.charAt(i);
    let xOffset = map(i, 0, timeString.length, width / 4, (3 * width) / 4);
    let charPoints = font.textToPoints(char, xOffset, height / 2, 100, {
      sampleFactor: 0.1,
    });

    for (let pt of charPoints) {
      let particle = new Particle(pt.x, pt.y);
      particles.push(particle);
    }
  }
}

function updateParticles() {
  if(weatherCondition != 1){
    for (let particle of particles) {
      particle.update();
    }
  }
  else{
    for (let i = particles.length - 1; i >= 0; i--) {
      let particle = particles[i];
      particle.update();
      if (particle.isOffScreen()) {
        particles.splice(i, 1);
        createParticles();
      }
    }
  }
}

function displayParticles() {
  let bgColor = getColorForTimeOfDay();
  let oppositeColor = getOppositeColor(bgColor);
  
  for (let particle of particles) {
    particle.show(oppositeColor);
  }
  if(weatherCondition == 1){
    for (let windParticle of windParticles) {
      windParticle.show();
    }
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.target = createVector(x, y);
    this.maxSpeed = 5;
    this.maxForce = 0.3;
    this.size = baseSize;
    this.sizeOffset = random(TWO_PI); // 파티클마다 고유의 진동수 오프셋
    this.sizeSpeed = random(0.05, 0.15); // 파티클마다 고유의 애니메이션 속도
  }

  update() {
    let force = p5.Vector.sub(this.target, this.pos);
    let d = force.mag();
    let speed = this.maxSpeed;
   
  
    // 크기 애니메이션
    if(weatherCondition == 0){
       if (d < 100) {
        speed = map(d, 0, 100, 0, this.maxSpeed);
      }
      force.setMag(speed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      this.acc.add(force);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.size = baseSize + sin(frameCount * this.sizeSpeed + this.sizeOffset) * sizeRange;
    }
    else if (weatherCondition == 1){
      
      if (d < 100) {
        speed = map(d, 0, 100, 0, this.maxSpeed);
      }
      force.setMag(speed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      this.acc.add(force);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.size = baseSize + sin(frameCount * this.sizeSpeed ) * 1;
      //this.size = baseSize*1.5;
    }
    else{ 
      speed = 0;
      force.setMag(speed);
      force.sub(0);
      force.limit(0);
      this.acc.add(force);
      this.vel.add(0);
      this.pos.add(0);
      this.acc.mult(0);
      this.size = baseSize;
    }
  }
  isOffScreen() {
    return this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height;
  }
  applyForce(force) {
    this.acc.add(force);
  }
  show(color) {
    stroke(color);
    strokeWeight(this.size);
    point(this.pos.x, this.pos.y);
  }
}

function createRain() {
  for (let i = 0; i < 500; i++) {
    drops.push(new Drop());
  }
}

function updateRain() {
  for (let drop of drops) {
    drop.update();
    drop.checkCollision(particles);
  }
}

function displayRain() {
  for (let drop of drops) {
    drop.show();
  }
}

class Drop {
  constructor() {
    this.pos = createVector(random(width), random(-500, -50));
    this.vel = createVector(0, random(4, 10));
    this.z = random(0, 20);
    this.len = map(this.z, 0, 20, 10, 20);
    this.yspeed = map(this.z, 0, 20, 4, 10);
    this.angle = PI;
    this.gravity = createVector(0, 0.1); 
    this.brightness = 138;
    this.color = color(255,255,255); 
  }

  update() {
    this.vel.add(this.gravity);
    this.pos.add(this.vel);
    let grav = map(this.z, 0, 20, 0, 0.2);
    this.vel.y += grav;

    if (this.pos.y > height) {
      this.pos = createVector(random(width), random(-200, -100));
      this.vel = createVector(0, this.yspeed);
      this.angle = PI;
      this.hasReflected = false; // 반사 여부 초기화
      this.brightness = 138; 
      this.color = color(255,255,255); 
   }
  }

  checkCollision(particles) {
    if (this.hasReflected) return; // 이미 반사된 경우 충돌 검사 중지

    for (let particle of particles) {
      let d = dist(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
      if (d < particle.size) {
        let normal = p5.Vector.sub(this.pos, particle.pos).normalize();
        let reflection = p5.Vector.sub(this.vel, p5.Vector.mult(normal, 2 * this.vel.dot(normal)));
        
        // 반사 벡터를 적용하여 속도 줄이기
        reflection.mult(0.5); // 반사 속도를 줄이기 위해 곱하기 연산 사용
        this.vel = reflection;
        this.angle = PI / 2 + atan2(reflection.y, reflection.x); 
        this.rotationSpeed = 0.1 * (1 + random()); // 회전 속도 무작위 설정
        this.hasReflected = true; // 반사 여부 설정
        // 밝기 및 색상 변경
        this.brightness = 255; 
        this.color = getColorForTimeOfDay(); // 시간대에 따른 색상 변경

        // 반사 후 위치 재조정 (particle 경계 바깥으로)
        this.pos.add(this.vel); 
        break;
      }
    }
  }

  show() {
    let thick = map(this.z, 0, 20, 1, 3);
    strokeWeight(thick);
    stroke(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.brightness); // 색상 및 밝기 적용
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    line(0, 0, 0, this.len);
    pop();
  }
}

function createClouds() {
  for (let i = 0; i < 5; i++) {
    clouds.push(new Cloud());
  }
}

function updateClouds() {
  let h = hour();
  if (6 <= h && h < 18) {
    for (let cloud of clouds) {
      cloud.update();
    }
  }
}

function displayClouds() {
  let h = hour();
  if (6 <= h && h < 18) {
    for (let cloud of clouds) {
      cloud.show();
    }
  }
}

class Cloud {
  constructor() {
    this.pos = createVector(random(width), random(height / 2));
    this.vel = createVector(random(1, 3), 0);
    this.size = random(100, 200);
  }

  update() {
    this.pos.add(this.vel);
    if (this.pos.x > width) {
      this.pos.x = -this.size;
      this.vel = createVector(random(1, 3), 0); // 속도 초기화
    }
  }

  show() {
    fill(255, 255, 255, 200);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size, this.size / 2);
  }
}

function createStars() {
  for (let i = 0; i < maxStars; i++) {
    stars.push(new Star());
  }
}

function displayStars() {
  let h = hour();
  if (h >= 18 || h < 6) {
    for (let star of stars) {
      star.show();
    }
  }
}

class Star {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.size = random(1, 3);
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}


function mousePressed() {
  createParticles();
}


function createWind() {
  let y = random(height); 
  windParticles.push(new WindParticle(0, y));
}

function updateWind() {
  for (let windParticle of windParticles) {
    windParticle.update();
    windParticle.checkCollision(particles);
  }
}

function displayWind() {
  for (let windParticle of windParticles) {
    windParticle.show();
  }
}

class WindParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(2, 5), 0); // 속도 설정
    this.trail = []; // 트레일을 저장할 배열
    this.maxTrail = int(random(30, 100));
    this.angle = 0; // 초기 각도
    this.initialColor = color(173, 216, 230, 255); //초기색상
    this.color = this.initialColor; 
    this.hasCollided = false; // 충돌 여부 플래그
    this.size = random(2, 8); 
  }

  update() {
    this.angle += 0.1; // 각도 업데이트
    let yOffset = sin(this.angle / 10); // sin 형태로 움직임

    this.trail.push(createVector(this.pos.x, this.pos.y + yOffset));
    if (this.trail.length > this.maxTrail) {
      this.trail.shift(); // 트레일 길이 유지
    }

    this.pos.x += this.vel.x;
    this.pos.y += yOffset;

    if (this.pos.x > width) {
      this.pos.x = 0;
      this.pos.y = random(height);
      this.trail = []; // 파티클이 처음으로 돌아가면 트레일 초기화
      this.color = this.initialColor; // 색상을 초기화
      this.hasCollided = false; // 충돌 상태 초기화
    }
  }

  checkCollision(particles) {
    if (this.hasCollided) return; // 이미 충돌한 경우 충돌 검사 중지

    for (let particle of particles) {
      let d = dist(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
      if (d < 5) { // 충돌 감지 범위
        this.color = color(255, random(150, 200), random(150, 200), 150); // 충돌 시 색상 변경 
        this.hasCollided = false; // 충돌 상태 플래그 설정
        particle.applyForce(this.vel.copy().mult(0.25)); // 시계 파티클에 힘 가하기
      }
    }
  }

  show() {
    noFill();
    stroke(this.color);
    strokeWeight(this.size);
    beginShape();
    for (let trailPos of this.trail) {
      vertex(trailPos.x, trailPos.y);
    }
    endShape();
  }
}
