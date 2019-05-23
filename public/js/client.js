$(function() {
    var socket = io.connect();
    var me;
    var isLeader = false;
    
    var bannedWords = new Array("arse", "ballsack", "bastard", "bitch", "blowjob", "bollock", "cock", "crap", "cunt", "dildo", "fuck", "nigger", "nigga", "penis", "prick", "queer", "scrotum", "sex", "shit", "tosser", "twat", "vagina", "wank", "whore");
    var nameRegex = new RegExp('(' + bannedWords.join('|') + ')', 'i');

    setTimeout(function() {
      window.scrollTo(0, 1);
    }, 100);

    $('.grid').on('change', '.launch', function() {
        var $this = $(this);
        var target = $this.val();
        
        $this.remove();
        socket.emit('pFire', target);
    });

    socket.on('connect', function() {
        setName();
    });

    function setName() {
        var name = prompt("What's your name?");
        
        if (!name || name === '') {
            alert("You must choose a name. Please try again.");
            setName();
        } else if (nameRegex.test(name)) {
            alert("I don't like that name. Please pick another one.");
            setName();
        } else {
            window.document.title = window.document.title + ' - ' + name;
            socket.emit('pJoin', { gid:1, name:name });
        }
    }

    socket.on('showLeader', function() {
        $('#startGame').removeClass('hidden');
        isLeader = true;
    });

    $('#startGame button').click(function() {
        socket.emit('startGame', function(cb) {
            if (cb === true) {
                $('#startGame').addClass('hidden');
            }
        });
    });

    socket.on('pReset', function(data) {
        me = data.id;

        initSudoku();
        $('#city').text(data.city.name);
        $('#gameover').hide();

        var $lives = $('#lives');
        $lives.empty();
        for (var i = 0; i < 3; i++) {
            $lives.append('<li>');
        }
    });

    socket.on('pUpdateTargets', function(targets) {
        var $targets = $('<select><option>Select a target</option></select>');
        for (var i in targets) {
            if (i !== me) {
                $targets.append('<option value="' + i + '">' + targets[i] + '</option>');
            }
        }

        $('#targets, .launch').html($targets.html());
    });

    socket.on('kill', function(data) {
        var html = 'You were killed by <strong>' + data.killer + '</strong>'
            +'<small>Please wait for the next round to begin</small>'
            +'<a href="https://twitter.com/intent/tweet" class="twitter-hashtag-button" data-lang="en" data-text="I got nuked playing" data-button-hashtag="nuclearsudoku" data-related="philhaz,hackbmth,odlbmth,meetdraw" data-size="large" data-dnt="true" data-via="meetdraw">Tweet #nuclearsudoku</a>'
            +'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';

        if (isLeader) {
            html += '<div id="startGame" class=""><button>Start Game</button></div>';
        } else {
            html += '<div id="startGame" class="hidden"><button>Start Game</button></div>'
        }

        $('#gameover').html(html).show();
    });

    socket.on('pIncoming', function(data) {
        alert('Incoming warhead from ' + data.attacker + '!!!');
    });

    socket.on('pHit', function() {
        $('#lives li:not(.dead)').last().addClass('dead');
    });

    socket.on('pWin', function() {
        var html = 'Congratulations, you survived nuclear sudoku!'
            +'<small>Please wait for the next round to begin</small>'
            +'<a href="https://twitter.com/intent/tweet" class="twitter-hashtag-button" data-lang="en" data-text="I survived" data-button-hashtag="nuclearsudoku" data-related="philhaz,hackbmth,odlbmth,meetdraw" data-size="large" data-dnt="true" data-via="meetdraw">Tweet #nuclearsudoku</a>'
            +'<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>';

        if (isLeader) {
            html += '<div id="startGame" class=""><button>Start Game</button></div>';
        } else {
            html += '<div id="startGame" class="hidden"><button>Start Game</button></div>'
        }

        $('#gameover').html(html).show();
    });
});
