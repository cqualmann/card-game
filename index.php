<html>
    <head>
        <title>Cards</title>
        <style>
            body { margin: 0; }
            canvas { width: 100%; height: 100% }
            .game-over {
                position: absolute;
                top:200px;
                left:200px;
                width: 50%;
                height: 25%;
                background: white;
                border: 3px solid #73AD21;
            }
        </style>
    </head>
    <body>



    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
    <script src="js/dat-gui.js"></script>
    <script src="js/three.min.js"></script>
    <script src="js/cards.js"></script>
    <script>
        $(function(){
            $('body').on('click','.game-over a',function(e){
                e.preventDefault();
                e.stopPropagation();
                setupGame();
            });
        });
    </script>
    <script src="fonts/helvetiker_regular.typeface.js"></script>

    </body>
</html>