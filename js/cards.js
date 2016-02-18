// GLOBALS
var CLICKABLES = [];
var DECK = [];
var DEFAULT_ALLOWED_FLIPPED = 2;
var ALLOWED_FLIPPED = DEFAULT_ALLOWED_FLIPPED;
var ATTEMPTS  = 0;
var GAME_OVER = false;
var NUM_OF_CARDS = 18; // must be even

// Add a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 50;
camera.updateProjectionMatrix();
scene.add(camera);

// Add a light
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 100;
scene.add(pointLight);

// Test object
var geometry = new THREE.SphereGeometry(0.5, 32, 32 );
var BALL = new THREE.Mesh(geometry);
BALL.position.x = scene.position.x;
BALL.position.y = scene.position.y;
scene.add( BALL );


var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

setupGame();
render();

function render() {
    requestAnimationFrame( render );

    flipCard();
    resetCards();
    if(DECK.length == 0 && !GAME_OVER) {
        gameOver();  // function that would create end of game screen with attempt counter and button to restart
    } else {
        renderer.render( scene, camera );
    }


}

function flipCard() { // flips a clicked card
    DECK.forEach(function(c){
        if(c.flipCard) {
            c.isFlipping=true;
            if(!c.flipped) {
                if(c.rotation.y>0) {
                    c.rotation.y-=0.2;
                }
            } else {
                if(c.rotation.y<3.14159) {
                    c.rotation.y+=0.2;
                }
            }
            if(c.rotation.y>3.14159) c.rotation.y=3.14159;
            if(c.rotation.y<0) c.rotation.y=0;
            if(c.rotation.y==0||c.rotation.y==3.14159) {
                c.flipCard=false;
                c.isFlipping=false;
            }
        }
    });
}

function resetCards() { // resets cards numbers down when the allowed flipped number has been reached
    var numFlipped = 0;
    var flipped = [];
    DECK.forEach(function(c){
        if(c.flipped&&!c.isFlipping) numFlipped++;
    });
    if(numFlipped==ALLOWED_FLIPPED) {
        ATTEMPTS++;
        DECK.forEach(function(c){
            if(c.flipped) {
                flipped.push(c);
                c.flipCard = true;
                c.flipped=!c.flipped;
            }
        });
        if(flipped[0].number == flipped[1].number) {
            scene.remove(flipped[0]);
            scene.remove(flipped[1]);
            DECK.splice(DECK.indexOf(flipped[0]),1);
            DECK.splice(DECK.indexOf(flipped[1]),1);
        }
    }
}

function getRandomNum(min,max) {
    min = typeof min !== 'undefined' ? min : 0;
    max = typeof max !== 'undefined' ? max : 100;
    if(min==max) {return min;} else {
        return Math.floor((Math.random() * max));
    }
}

//noinspection JSUnusedGlobalSymbols
function flipAll() { // flips all cards numbers up
    ALLOWED_FLIPPED = 999;
    DECK.forEach(function(c){
        if(!c.flipped) {
            c.flipCard = true;
            c.flipped = true
        }
    });
}

function setupGame() { // flips all cards numbers down and resets the allowed flipped number
    if(DECK.length>0){
        DECK.forEach(function(c){
            scene.remove(c);
        });
    }
    if(document.getElementsByClassName('game-over').length>0) document.getElementsByTagName('body')[0].removeChild(document.getElementsByClassName('game-over')[0]);
    ATTEMPTS = 0;
    DECK = [];
    ALLOWED_FLIPPED = DEFAULT_ALLOWED_FLIPPED;
    // numbers for the cards
    var numbers = [];
    var tmp = null;
    var i; var k;
    for(i = 1;i<=NUM_OF_CARDS/2;i++) {
        tmp = THREE.ImageUtils.loadTexture('img/'+i+'.png');
        tmp.minFilter = THREE.NearestFilter;
        tmp = new THREE.MeshLambertMaterial({
            map: tmp
        });
        numbers.push([tmp,i]);
    }
    numbers.forEach(function(n){
        numbers.push(n);
    });
    // creates matrix of cards
    var CARD_SIZE = 16;
    var INCR = CARD_SIZE + 4;
    var ROWS = Math.sqrt(NUM_OF_CARDS).toFixed() * 1 -1;
    var COLUMNS = NUM_OF_CARDS / ROWS;
    while(COLUMNS % 2 != 0) {
        ROWS++;
        COLUMNS = NUM_OF_CARDS / ROWS;
    }
    if(ROWS > COLUMNS) {
        tmp = COLUMNS;
        COLUMNS = ROWS;
        ROWS = tmp;
    }
    var test = [];
    for(i = 0;i<COLUMNS;i++) {
        for(k = 0;k<ROWS;k++) {
            var posX = -INCR * (ROWS - i);
            var posY = -INCR * (1 - k);
            test.push([posX,posY]);
            tmp = THREE.ImageUtils.loadTexture('img/ball-texture.jpg');
            tmp.minFilter = THREE.NearestFilter;
            var textures = [
                new THREE.MeshLambertMaterial({
                    map: tmp
                }),
                new THREE.MeshLambertMaterial({
                    map: tmp
                }),
                new THREE.MeshLambertMaterial({
                    map: tmp
                }),
                new THREE.MeshLambertMaterial({
                    map: tmp
                }),
                new THREE.MeshLambertMaterial({
                    map: tmp
                })
            ];
            var numIndex = getRandomNum(0,numbers.length);
            var num = numbers[numIndex];
            textures.push(num[0]);
            if(numbers.length!=1) {
                numbers.splice(numIndex,1);
            }
            var geometry = new THREE.BoxGeometry( 16, 16, 0.001 );
            var t = new THREE.MeshFaceMaterial( textures );
            var card = new THREE.Mesh( geometry, t );
            card.position.x = posX;
            card.position.y = posY;
            card.number = num[1];
            card.flipped = false;
            card.flipCard = false;
            card.isFlipping = false;
            card.callback = function() {
                if(!this.flipped) {
                    if(!this.isFlipping) {
                        if(this.flipped) {
                            this.flipped = !this.flipped;
                            this.flipCard = true;
                        } else {
                            var numFlipped = 0;
                            DECK.forEach(function(c){
                                if(c.flipped)numFlipped++;
                            });
                            if(numFlipped<ALLOWED_FLIPPED) {
                                this.flipped = !this.flipped;
                                this.flipCard = true;
                            }
                        }
                    }
                }
            };
            DECK.push(card);
            scene.add( card );
        }
    }
    console.log(test);
    GAME_OVER = false;
}

function gameOver() {
    GAME_OVER = true;
    var gameOver = document.createElement('div');
    gameOver.className = 'game-over';
    gameOver.innerHTML = 'Game Over!<br />Attempts taken: '+ATTEMPTS+'<br /><a href="#">Restart</a>';
    document.body.appendChild(gameOver);
}


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
window.addEventListener('click', function(event){
    event.preventDefault();
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( DECK );
    if ( intersects.length > 0 ) {
        intersects[0].object.callback();
    }
    intersects = raycaster.intersectObjects( CLICKABLES );
    if ( intersects.length > 0 ) {
        intersects[0].object.callback();
    }
},false);