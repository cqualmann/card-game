// GLOBALS
var CLICKABLES = [];
var DECK = [];
var CARD_COORDS = [];
var REMOVE = [];
var DEFAULT_ALLOWED_FLIPPED = 2;
var ALLOWED_FLIPPED = DEFAULT_ALLOWED_FLIPPED;
var ATTEMPTS  = 0;
var GAME_OVER = false;
var NUM_OF_CARDS;
var CLOCK = null;
var AVAILBLE_CARDS = 9;

var options = function(){
    this.cards = 18;
};

var GUI = new dat.GUI();
var opts = new options();
var cardUpdate = GUI.add(opts, 'cards',2,18).step(2);
cardUpdate.onFinishChange(function(value) {
  setupGame(value);
});

var geometry, material;

// Add a camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 50;

// Add a light
var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position.x = 0;
pointLight.position.y = 0;
pointLight.position.z = 100;
scene.add(pointLight);

// Test object
geometry = new THREE.SphereGeometry(0.5, 32, 32 );
var BALL = new THREE.Mesh(geometry);
BALL.position.x = scene.position.x;
BALL.position.y = scene.position.y;
//scene.add( BALL );


geometry = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight, 32 );
//tmp = THREE.ImageUtils.loadTexture('img/bkg-texture.jpg'); // background image. uncomment these lines and comment the other material to enable background.
//tmp.minFilter = THREE.NearestFilter;
//material = new THREE.MeshBasicMaterial( {map:tmp, side: THREE.DoubleSide} );
material = new THREE.MeshBasicMaterial( {color:0x33ffff} );
var background = new THREE.Mesh( geometry, material );
background.position.z = -100;
scene.add(background);

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


CLOCK = new THREE.Clock(false);
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
                    c.rotation.y-=0.3;
                }
            } else {
                if(c.rotation.y<Math.PI) {
                    c.rotation.y+=0.3;
                }
            }
            if(c.rotation.y>Math.PI) c.rotation.y=Math.PI;
            if(c.rotation.y<0) c.rotation.y=0;
            if(c.rotation.y==0||c.rotation.y==Math.PI) {
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
        DECK.forEach(function(c){
            if(c.flipped) {
                flipped.push(c);
                c.delayFlip++;
                if(c.delayFlip>=10) {
                    ATTEMPTS++;
                    c.flipCard = true;
                    c.flipped=!c.flipped;
                    c.delayFlip = 0;
                }
            }
        });
        if(flipped[0].number == flipped[1].number) { // matches cards
            flipped.forEach(function(c){
                //scene.remove(c);
                DECK.splice(DECK.indexOf(c),1);
                REMOVE.push(c);
                c.material.materials.forEach(function(m){
                    m.opacity = 0.5;
                });
            });
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

function setupGame(setupCards) { // flips all cards numbers down and resets the allowed flipped number
    CLOCK.stop();
    clearScene();

    if(!setupCards) setupCards = 18;
    NUM_OF_CARDS = setupCards;
    if(NUM_OF_CARDS % 2 != 0) NUM_OF_CARDS++;
    if(NUM_OF_CARDS>AVAILBLE_CARDS*2) NUM_OF_CARDS=AVAILBLE_CARDS*2;
    CARD_COORDS = [];
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
    var CARD_SIZE = 18;
    var INCR = CARD_SIZE + 4;
    var ROWS = Math.sqrt(NUM_OF_CARDS).toFixed() * 1 -1;
    var COLUMNS = NUM_OF_CARDS / ROWS;
    while(COLUMNS % 2 != 0) {
        ROWS++;
        COLUMNS = NUM_OF_CARDS / ROWS;
    }
    if(ROWS >= COLUMNS) {
        tmp = COLUMNS;
        COLUMNS = ROWS;
        ROWS = tmp;
    }
    if(window.innerHeight > window.innerWidth) {
        tmp = COLUMNS;
        COLUMNS = ROWS;
        ROWS = tmp;
    }
    for(i = 0;i<COLUMNS;i++) {
        for(k = 0;k<ROWS;k++) {
            var posX = INCR * i;
            var posY = INCR * k;
            CARD_COORDS.push([posX,posY]);
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
            var geometry = new THREE.BoxGeometry( CARD_SIZE, CARD_SIZE, 0.001 );
            var t = new THREE.MeshFaceMaterial( textures );
            var card = new THREE.Mesh( geometry, t );
            card.position.x = posX;
            card.position.y = posY;
            card.number = num[1];
            card.flipped = false;
            card.flipCard = false;
            card.isFlipping = false;
            card.delayFlip = 0;
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
    var highX = 0, highY = 0;
    CARD_COORDS.forEach(function(p){
        if(p[0]>highX) highX = p[0];
        if(p[1]>highY) highY = p[1];
    });
    camera.position.x = highX / 2;
    camera.position.y = highY / 2;
    pointLight.position.x = camera.position.x;
    pointLight.position.y = camera.position.y;
    GAME_OVER = false;
    CLOCK.start();
}

function clearScene() {
    if(DECK.length>0){
        DECK.forEach(function(c){
            scene.remove(c);
        });
    }
    if(REMOVE.length>0){
        REMOVE.forEach(function(c){
            scene.remove(c);
        });
    }
    if(CLICKABLES.length>0){
        CLICKABLES.forEach(function(c){
            scene.remove(c);
        });
    }
    REMOVE = [];
    CLICKABLES = [];
}

function gameOver() {
    GAME_OVER = true;
    var time = CLOCK.getDelta();
    CLOCK.stop();
    var score = (ATTEMPTS * time) / 10;
    score = Math.abs(score.toFixed()*1);

    var geometry = new THREE.TextGeometry('Completed!',{
        size:10,
        height:1,
        curveSegments: 20
    });
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var go = new THREE.Mesh(geometry,material);
    var highX = 0, highY = 0;
    CARD_COORDS.forEach(function(p){
        if(p[0]>highX) highX = p[0];
        if(p[1]>highY) highY = p[1];
    });
    go.position.x = CARD_COORDS[0][0];
    go.position.y = highY / 1.5;

    geometry = new THREE.TextGeometry('Score: '+score,{
        size:8,
        height:1,
        curveSegments: 20
    });
    material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var scoreText = new THREE.Mesh(geometry,material);
    scoreText.position.x = CARD_COORDS[0][0];
    scoreText.position.y = highY / 2.5;

    geometry = new THREE.TextGeometry('Restart',{
        size:8,
        height:1,
        curveSegments: 20
    });
    material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var restart = new THREE.Mesh(geometry,material);
    restart.position.x = CARD_COORDS[0][0];
    restart.position.y = 0;
    restart.callback = function(){
        setupGame(NUM_OF_CARDS);
    };
    CLICKABLES.push(restart);
    REMOVE.push(go);
    REMOVE.push(scoreText);
    REMOVE.push(restart);
    scene.add(go);
    scene.add(scoreText);
    scene.add(restart);
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