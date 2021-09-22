
const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d'); // context - ctx
canvas.width = 900;
canvas.height = 600;

// Global variables | de er på topp for de er globale.
const cellSize = 100; //alle cellene er på 100 hver
const cellGap = 3;
let goldCoins = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 50;
let chosenDefender = 1;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPosition = [];
const projectiles = [];
const resources = [];



// Mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
    
}
canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect(); //Denne returnerer en dom rectangle object som har info om size og plass av en celle
// console.log(canvasPosition)
canvas.addEventListener('mousemove', function(event){
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;


});
canvas.addEventListener('mouseleave', function(){
    mouse.x = undefined;
    mouse.y = undefined;

})



// Game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
        context.strokeStyle = 'black';
        context.strokeRect(this.x, this.y, this.width, this.height); //strokeRect er inne bygdt og trenger 4 verdier.
        }
    
    }
}

function createGrid(){ // her merkes opp cellene i canvas
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

// Denne lager hver celle
function handleGameGrid(){ // [i] = vil representere object 0, 1, 2 ,3 ,4.
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}

// Projectiles
const defenderBlueAmmo = new Image();
  defenderBlueAmmo.src = 'defenderAmmo1.png'
class Projectile {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.power = 30;
        this.speed = 5;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteHeight = 64;
        this.spriteWidth = 64;
        
    }
    update(){
        this.x += this.speed;
    }
    draw(){
        // context.fillStyle = 'black';
        // context.beginPath();
        // context.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        // context.fill();
        context.drawImage(defenderBlueAmmo, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)


    }
}
function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j]))
             {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
        }
    }


        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){ // Da blir ikke folk truffet uttafor banen. på høyre side.
            projectiles.splice(i, 1);
            i--;
        }
        // console.log('projectiles ' + projectiles.length);
    }
}

// Towers
const defender1 = new Image();
defender1.src = 'defender1.png'
const defender2 = new Image();
defender2.src = 'defender2.png'
class Defender {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteHeight = 194;
        this.spriteWidth = 194;
        this.minFrame = 0;
        this.maxFrame = 16;
        this.chosenDefender = chosenDefender;
        
    }


    draw(){
        // context.fillStyle = 'blue';
        // context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'black';
        context.font = '30px Orbitron';
        context.fillText(Math.floor(this.health), this.x + 15, this.y + 25); // husk Math med stor M!

        if (this.chosenDefender === 1){
            context.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        } else if  (this.chosenDefender === 2) {
            context.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
            
        }
        
        
    
    }
    update(){
        if (frame % 10 ===0){
        if (this.frameX < this.maxFrame) this.frameX++;
        else this.frameX = this.minFrame;
        if (this.frameX === 15) this.shootNow = true;
    }
    if (this.shooting){
        this.minFrame = 0;
        this.maxFrame = 15;
    } else {
        this.minFrame = 17;
        this.maxFrame = 23;
    }
        if (this.shooting && this.shootNow){ // om defender ser en mob på sin bane og frame er 15 så sender den ny projectile.
            // this.timer++;
            // if (this.timer % 100 === 0){// hver 100 frame pusher ny projectile 
                projectiles.push(new Projectile(this.x + 70, this.y + 18));
                this.shootNow = false;
        //     }

        // } else {
            // this.timer = 0;
        }

    }
}

function handleDefenders(){ // Denne vil cycle igjennom alle elementene i defenders array
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if (enemyPosition.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true

        }else {
            defenders[i].shooting = false;
        }

        for (let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){ // Sjekker alle defenders mot alle enemies.
                enemies[j].movement = 0;
                defenders[i].health -= 1; // Om de kræsjer så mister defendereren 0.2hp synkende.

            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1) // Defenderen blir removed etter at hp'n går til 0.
                i--;
                enemies[j].movement = enemies[j].speed; // Etter enemy har drept defender, så fortsetter den å gå.
            }
        }
    }
}

const card1 = {
    x: 10,
    y: 10,
    width: 70,
    height: 85
}
const card2 = {
    x: 90,
    y: 10,
    width: 70,
    height: 85
}


function chooseDefender(){
    let card1stroke = 'black';
    let card2stroke = 'black';
    if(collision(mouse, card1) && mouse.clicked){
        chosenDefender  = 1;

    }else if (collision(mouse, card2) && mouse.clicked){
        chosenDefender = 2;
    }
    if (chosenDefender === 1){
        card1stroke = 'gold';
        card2stroke = 'black'; 

    }else if (chosenDefender === 2){
        card1stroke = 'black';
        card2stroke = 'gold';

    } else {
        card1stroke = 'black';
        card2stroke = 'black';
    }


    context.lineWidth = 1;
    context.fillStyle = 'rgba(0,0,0,0.2)';
    context.fillRect(card1.x, card1.y, card1.width, card1.height);
    context.strokeStyle = card1stroke;
    context.strokeRect(card1.x, card1.y, card1.width, card1.height);
    context.drawImage(defender1, 0, 0, 194, 194, 0, 5, 194/2, 194/2);
    context.fillRect(card2.x, card2.y, card2.width, card2.height);
    context.drawImage(defender2, 0, 0, 194, 194, 80, 5, 194/2, 194/2);
    context.strokeStyle = card2stroke;
    context.strokeRect(card2.x, card2.y, card2.width, card2.height);
}
// Floating Messages
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, color){
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifeSpan = 0;
        this.color = color;
        this.opacity = 1;
    }
    update(){
        this.y -= 0.3;
        this.lifeSpan += 1;
        if (this.opacity > 0.05) this.opacity -= 0.05;
    }
    draw(){
        context.globalAplha = this.opacity;
        context.fillStyle = this.color;
        context.font = this.size + 'px Orbitron';
        context.fillText(this.value, this.x, this.y)
        context.globalAplha = 1;
    }
}
function handleFloatingMessages(){
    for (let i = 0; i < floatingMessages.length; i++){ 
        floatingMessages[i].update();
        floatingMessages[i].draw();
        if (floatingMessages[i].lifeSpan >= 50){
            floatingMessages.splice(i, 1);
            i--;
        }
    }
}
const enemyTypes = [];
const enemy1 = new Image();
enemy1.src = 'enemy1.png';
enemyTypes.push(enemy1);
const enemy2 = new Image();
enemy2.src = 'enemy2.png';
enemyTypes.push(enemy2);

// Enemies
class Enemy {
    constructor(verticalPosition){
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 0.2 + 0.4; 
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health; 
        this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        if (this.enemyType === enemy1){ // her bytter jeg frames så addsa ikke "lagger"
            this.maxFrame = 7;
        } else if (this.enemyType === enemy2){
            this.maxFrame = 7;
        }
        this.maxFrame = 3;
        this.spriteWidth = 194; // Bytt her om enemy ikon er feil størrelse.
        this.spriteHeight = 226; // Bytt her om enemy ikon er feil størrelse.
    }

    update(){
        this.x -= this.movement;
        if (frame % 8 === 0){ 
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = this.minFrame;

        }
    }
    draw(){
        // context.fillStyle = 'red';
        // context.fillRect(this.x, this.y, this.width, this. height)
        context.fillStyle = 'red';
        context.font = '35px Orbitron';
        context.fillText(Math.floor(this.health), this.x + 15, this.y + 25);
        context.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        // context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
    }
}

function handleEnemies(){ // sjekker igjennom hver object med enemy om noen har horisontal position x = 0
    for (let i = 0; i < enemies.length; i++){
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0){
            gameOver = true;
        }
        if (enemies[i].health <= 0){
            let goldGained = enemies[i].maxHealth/10;
            floatingMessages.push(new floatingMessage('+' + goldGained, enemies[i].x, enemies[i].y, 30, 'black' ));
            floatingMessages.push(new floatingMessage('+' + goldGained, 470, 85, 30, 'gold' ));
            goldCoins += goldGained;
            score += goldGained;
            const findThisIndex = enemyPosition.indexOf(enemies[i].y);
            enemyPosition.splice(findThisIndex, 1);
            enemies.splice(i, 1);
            i--;
            
        }
    }
    if (frame % enemiesInterval === 0 && score < winningScore){ // hver 600 frame kommer det ny add.
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
        enemies.push(new Enemy(verticalPosition))
        enemyPosition.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 50; // Om frame er mer enn 120 vil enemies bli kortere med 100. så 600, 500 ,400 osv. gir player tid til å bygge seg opp.
        
    }
}

// Resources 
const amounts = [20, 30, 40];
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        context.fillStyle = 'yellow';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = 'black';
        context.font = '20px Orbitron';
        context.fillText(this.amount, this.x + 15, this.y + 25);
        }
    }
function handleResources(){
    if (frame % 500 === 0 && score < winningScore){
            resources.push(new Resource());
        
    }
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            goldCoins += resources[i].amount;
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 470, 85, 30, 'gold' ));
            resources.splice(i, 1);
            i--;
        }
    }
}

// Utilities
function handleGameStatus(){
    context.fillStyle = 'rgb(34, 31, 20)';
    context.font = '40px Orbitron';
    context.fillText('Score: ' + score, 180, 40);
    context.fillStyle= 'gold';
    
    context.fillText('Gold: ' + goldCoins, 180, 85);
    if (gameOver){
    context.fillStyle = 'black';
    context.font = '90px Orbitron';
    context.fillText('GAME OVER', 135, 330);
    }
    if (score >= winningScore && enemies.length === 0){
        context.fillStyle = 'black';
        context.font = '60px Orbitron';
        context.fillText('LEVEL COMPLETE', 130, 300);
        context.font = '30px Orbitron';
        context.fillText('You win with ' + score + 'points!', 134,340);
    }
}

canvas.addEventListener('click', function(){
    const gridPositionX = mouse.x  - (mouse.x % cellSize) + cellGap; // == 250 - 50 = 200 blir value av nærmeste horisontal grid poss to the left.
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap; // samme bare horisontalt ned.
    if (gridPositionY < cellSize) return; // blir noe plassert på blå linje så skjer det ikke noe.
    for (let i = 0; i < defenders.length; i++){ // Her sjekkes det om det blir plassert 2 towers på samme sted.
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) 
        return;
    }
    let towerCost = 100; // lage flere towers senere med forskjellige kostnader.
    if (goldCoins >= towerCost){ // >= sjekke om dem er mer eller samme verdi, med dette får man plassert 3 towers for 300 coins.
        defenders.push(new Defender(gridPositionX, gridPositionY)); //Her pusher den ny "tower"
        goldCoins -= towerCost;  // Her tar man det det kostet å kjøpe "tower".
    }else {
        floatingMessages.push(new floatingMessage('need more GOLD!', mouse.x, mouse.y, 20, 'blue'));
    }
});


function animate(){ // Denne funksjonen kalles: recursion
    context.clearRect(0, 0, canvas.width, canvas.height); // Denne clearer borders på forrige rute når du tar musa på en annen rute
    context.fillStyle = 'rgba(134, 122, 80, 0.459)';
    context.fillRect(0,0,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources()
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();
    frame++;
    // console.log(frame) // frame++ gjør så frames øker.
   if (!gameOver) requestAnimationFrame(animate);
}
animate();

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)

    ) {
        return true;
    };

};

window.addEventListener('resize', function(){  // Denne fikser mouse position når du resizing vinduet.
    canvasPosition = canvas.getBoundingClientRect();
})