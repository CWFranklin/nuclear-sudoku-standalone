var http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server, { log: false });

require('dotenv').config();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/play.html');
});

app.get('/board', function(req, res) {
    res.sendFile(__dirname + '/board.html');
});

app.get('/test', function(req, res) {
    res.sendFile(__dirname + '/test.html');
});

server.listen(process.env.PORT);
console.log('Server started on Port', process.env.PORT);

var games = [];
var cities = [
    { name: "Algiers, Algeria", lat: 36.75, lng: 3.06 },
    { name: "Ankara, Turkey", lat: 39.55, lng: 32.55 },
    { name: "Auckland, New Zealand", lat: -36.52, lng: 174.45 },
    { name: "Bangkok, Thailand", lat: 13.45, lng: 100.30 },
    { name: "Barcelona, Spain", lat: 41.23, lng: 2.9 },
    { name: "Beijing, China", lat: 39.55, lng: 116.25 },
    { name: "Bombay, India", lat: 19.0, lng: 72.48 },
    { name: "Cairo, Egypt", lat: 30.2, lng: 31.21 },
    { name: "Cape Town, South Africa", lat: -33.55, lng: 18.22 },
    { name: "Caracas, Venezuela", lat: 10.28, lng: -67.2 },
    { name: "Cayenne, French Guiana", lat: 4.49, lng: -52.18 },
    { name: "Chengdu, China", lat: 30.65, lng: 104.07 },
    { name: "Dakar, Senegal", lat: 14.40, lng: -17.28 },
    { name: "Dhaka, Bangladesh", lat: 23.81, lng: 90.42 },
    { name: "Guayaquil, Ecuador", lat: -2.1, lng: -79.56 },
    { name: "Havana, Cuba", lat: 23.8, lng: -82.23 },
    { name: "Helsinki, Finland", lat: 60.10, lng: 25.0 },
    { name: "Hong Kong, China", lat: 22.20, lng: 114.11 },
    { name: "Honolulu, USA", lat: 21.18, lng: -157.5 },
    { name: "Jakarta, Indonesia", lat: -6.16, lng: 106.48 },
    { name: "Juneau, USA", lat: 58.30, lng: -134.42 },
    { name: "Kabul, Afghanistan", lat: 34.56, lng: 69.21 },
    { name: "Khartoum, Sudan", lat: 15.50, lng: 32.56 },
    { name: "Kinshasa, Congo", lat: -4.18, lng: 15.17 },
    { name: "La Paz, Bolivia", lat: -16.27, lng: -68.22 },
    { name: "Lisbon, Portugal", lat: 38.44, lng: -9.9 },
    { name: "London, England", lat: 51.32, lng: -0.5 },
    { name: "Los Angeles, USA", lat: 34.3, lng: -118.15 },
    { name: "Lusaka, Zambia", lat: -15.39, lng: 28.33 },
    { name: "Manila, Philippines", lat: 14.35, lng: 120.57 },
    { name: "Marrakesh, Morocco", lat: 31.63, lng: -7.98 },
    { name: "Mecca, Saudi Arabia", lat: 21.29, lng: 39.45 },
    { name: "Melbourne, Australia", lat: -37.47, lng: 144.58 },
    { name: "Mexico City, Mexico", lat: 19.26, lng: -99.7 },
    { name: "Mogadishu, Somalia", lat: 2.05, lng: 45.32 },
    { name: "Montevideo, Uruguay", lat: -34.53, lng: -56.1 },
    { name: "Moscow, Russia", lat: 55.45, lng: 37.36 },
    { name: "Muscat, Oman", lat: 23.59, lng: 58.41 },
    { name: "N'Djamena, Chad", lat: 12.12, lng: 15.054 },
    { name: "Nairobi, Kenya", lat: -1.25, lng: 36.55 },
    { name: "Niamey, Niger", lat: 13.51, lng: 2.13 },
    { name: "Nur-Sultan, Kazakhstan", lat: 51.16, lng: 71.47 },
    { name: "Nuuk, Greenland", lat: 64.18, lng: -51.69 },
    { name: "Oslo, Norway", lat: 59.57, lng: 10.42 },
    { name: "Port Moresby, Papua New Guinea", lat: -9.25, lng: 147.8 },
    { name: "Pyongyang, North Korea", lat: 39.04, lng: 125.77 },
    { name: "Quebec, Canada", lat: 46.49, lng: -71.11 },
    { name: "Reykjavík, Iceland", lat: 64.4, lng: -21.58 },
    { name: "Rio de Janeiro, Brazil", lat: -22.57, lng: -43.12 },
    { name: "Rio Grande, Argentina", lat: -53.79, lng: -67.70 },
    { name: "Rome, Italy", lat: 41.54, lng: 12.27 },
    { name: "San Salvador, El Salvador", lat: 13.69, lng: -89.22 },
    { name: "Santiago, Chile", lat: -33.28, lng: -70.45 },
    { name: "Tananarive, Madagascar", lat: -18.5, lng: 47.33 },
    { name: "Teheran, Iran", lat: 35.45, lng: 51.45 },
    { name: "Tokyo, Japan", lat: 35.40, lng: 139.45 },
    { name: "Tripoli, Libya", lat: 32.57, lng: 13.12 },
    { name: "Ulaanbaatar, Mongolia", lat: 47.89, lng: 106.91 },
    { name: "Warsaw, Poland", lat: 52.14, lng: 21.0 },
    { name: "Yamoussoukro, Ivory Coast", lat: 6.83, lng: -5.29 },
];

io.sockets.on('connection', function(socket) {

    socket.on('disconnect', function() {
        console.log(socket.id + ' disconnected');

        if (socket.player === true) {
            if (socket.game === undefined) {
                console.log('Game not found');
            } else {
                if (socket.game.players[socket.id] === undefined) {
                    console.log('Player not found');
                } else {
                    var player = socket.game.players[socket.id];
                    player.disconnect();
                }
            }
        }
    });

    ///////////
    // BOARD //
    ///////////

    socket.on('bJoin', function() {
        socket.player = false;

        // TODO: multiple games
        socket.game = new Game(socket, 1);
        games[1] = socket.game;
    });

    socket.on('bRestart', function() {
        if (socket.game === undefined) {
            console.log('Game not found');
        } else {
            socket.game.restart();
        }
    });

    ////////////
    // CLIENT //
    ////////////

    socket.on('pJoin', function(data) {
        socket.player = true;

        if (games[data.gid] === undefined) {
            console.log('Game not found');
        } else {
            socket.game = games[data.gid];
            socket.game.players[socket.id] = new Player(socket, data.name, socket.game);
            socket.game.checkLeader();
            //socket.game.start();
        }
    });

    socket.on('startGame', function(fn) {
        if (socket.game.leader === socket.id) {
            fn(socket.game.start());
        }
    });

    socket.on('pFire', function(targetId) {
        if (socket.game === undefined) {
            console.log('Game not found');
        } else {
            if (socket.game.players[socket.id] === undefined) {
                console.log('Player not found');
            } else {
                if (socket.game.players[targetId] === undefined) {
                    console.log('Target not found');
                } else {
                    var player = socket.game.players[socket.id];
                    player.fire(targetId);
                }
            }
        }
    });
});

function Game(socket, id) {
    var startDelay = 10 * 1000;

    this.s = socket;
    this.id = id;
    this.players = [];
    this.leaderboard = [];
    this.state = 'waiting';
    this.cities = cities;
    this.leader;

    console.log('New game with id #' + id);

    this.start = function() {
        var playerCount = this.getPlayerCount();

        if (this.state === 'waiting' && playerCount > 1) {
            this.reset();
            return true;
        } else {
            return false;
        }
    };

    this.reset = function() {
        this.leaderboard = [];
        this.cities = cities;
        this.s.emit('startCountdown', startDelay);
        this.state = 'starting';

        var game = this;
        setTimeout(function() {
            console.log('Game #' + game.id + ' is starting a new round');

            for (var i in game.players) {
                game.players[i].reset();
            }

            game.updateTargets();
            game.state = 'active';
        }, startDelay);
    };

    this.getPlayerCount = function() {
        var playerCount = 0;

        for (var i in this.players) {
            playerCount++;
        }

        return playerCount;
    };

    this.checkLeader = function() {
        var playerCount = this.getPlayerCount();

        if (!this.leader && playerCount > 0) {
            var firstKey = Object.keys(this.players)[0];
            this.leader = this.players[firstKey].id;
            this.players[firstKey].makeLeader();
        }
    };

    this.updateTargets = function() {
        var targets = {};
        var survivors = [];

        for (var i in this.players)
            if (this.players[i].lives > 0) {
                targets[this.players[i].id] = this.players[i].name;
                survivors.push(this.players[i].id);
            }

        if (survivors.length <= 1 && this.state === 'active') {
            this.endgame(survivors[0]);
        } else {
            for (var i in this.players) {
                this.players[i].s.emit('pUpdateTargets', targets);
            }
        }
    };

    this.disconnect = function() {
        console.log('Game ' + this.id + ' has disconnected');
    };

    this.endgame = function(winnerId) {
        var winner = this.players[winnerId];

        if (winner) {
            winner.s.emit('pWin');
        }

        this.state = 'ended';
        this.leaderboard.unshift(winner.id);
        this.s.emit('endgame', { leaderboard: this.leaderboard });

        var game = this;
        setTimeout(function() {
            game.state = 'waiting';
        }, 10000);

        console.log(winner.name + ' won game with id #' + this.id);
        console.log(this.leaderboard);
    };
}

function Player(socket, name, game) {
    this.s = socket;
    this.id = socket.id;
    this.name = name;
    this.game = game;
    this.lives = 0;
    this.city = null;
    this.leader = false;

    this.game.s.emit('message', "<strong>" + this.name + "</strong> has joined the game");
    console.log(name + ' has joined game #' + game.id + ' with ID ' + socket.id);
    this.game.s.emit('softJoin', { id: this.id, name: this.name });

    this.getCity = function() {
        var r = Math.floor(Math.random() * this.game.cities.length);
        return this.game.cities.splice(r, 1)[0];
    };

    this.reset = function() {
        this.lives = 3;
        this.city = this.getCity();
        this.s.emit('pReset', { id: this.id, city: this.city });

        console.log(name + ' joined the round');

        this.game.s.emit('playerJoined', { id: this.id, name: this.name, city: this.city });
    };

    this.fire = function(targetId) {
        var player = this;
        var target = this.game.players[targetId];
        console.log(player.name + ' has fired at ' + target.name);

        var distance = getDistance(player.city.lat, player.city.lng, target.city.lat, target.city.lng);
        var duration = Math.floor(distance * 3);

        this.game.s.emit('launch', {
            targetCity: target.city,
            targetId: target.id,
            startCity: player.city,
            duration: duration
        });

        target.s.emit('pIncoming', { attacker: player.name });

        setTimeout(function() {
            player.game.s.emit('message', "<strong>" + player.name + "</strong> hit " + target.name);
            target.s.emit('pHit');
            target.lives--;

            if (target.lives === 0) {
                target.die(player);
            }

        }, duration);
    };

    this.die = function(killer) {
        console.log(killer.name + ' has killed ' + this.name);
        if (killer.id == this.id) {
            this.game.s.emit('message', "<strong>" + this.name + "</strong> killed themself!");
        } else {
            this.game.s.emit('message', "<strong>" + killer.name + "</strong> killed <strong>" + this.name + "</strong>");
        }

        this.game.leaderboard.unshift(this.id);
        this.game.updateTargets();

        this.s.emit('kill', { killer: killer.name });
        this.game.s.emit('kill', { player: this.id });
    };

    this.disconnect = function() {
        console.log(this.name + ' has left the game');

        delete this.game.players[this.id];

        if (this.game.leader === this.id) {
            this.game.leader = undefined;
            this.game.checkLeader();
        }

        this.game.updateTargets();
        this.game.s.emit('softLeave', this.id);
        this.game.s.emit('playerLeft', { player: socket.id });
        this.game.s.emit('message', "<strong>" + this.name + "</strong> has left the game");
    };

    this.makeLeader = function() {
        this.leader = true;

        this.game.s.emit('leaderChange', this.id);
        this.s.emit('showLeader');
    };
}

function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}
