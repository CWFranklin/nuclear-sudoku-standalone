google.maps.visualRefresh = true;

var map;
function initialize() {
    var mapOptions = {
        zoom: Math.round(Math.log( $(window).width() / 512 )) + 1, // 2
        center: new google.maps.LatLng(40, 0),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: [
            {
                "elementType": "labels",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#00ffff"
                    },
                    {
                        "visibility": "off"
                    },
                    {
                        "weight": 1
                    }
                ]
            },
            {
                "featureType": "administrative.country",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "off"
                    }
              ]
            },
            {
                "featureType": "administrative.locality",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative.neighborhood",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative.province",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "administrative.province",
                "elementType": "geometry",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "hue": "#00ffbb"
                    },
                    {
                        "lightness": -85
                    }
                ]
            },
            {
                "featureType": "landscape.natural.landcover",
                "elementType": "geometry.stroke",
                "stylers": [
                    {
                        "color": "#ff8080"
                    },
                    {
                        "visibility": "on"
                    },
                    {
                        "weight": 6.5
                    }
                ]
            },
            {
                "featureType": "poi",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [
                    {
                        "color": "#000000"
                    }
                ]
            }
        ]
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

var softPlayers = [];
var leader;

var cities = {};
var paths = [];
var clouds = [];

var cloudIcon = new google.maps.MarkerImage('/img/cloud.png',
                new google.maps.Size(447, 257),
                new google.maps.Point(0, 0),
                new google.maps.Point(223, 128));

$(function() {
    var socket = io.connect();

    socket.on('connect', function() {
        socket.emit('bJoin');
        $('#timer').html('Acquiring targets...');
        // TODO: refresh player list
    });

    socket.on('startCountdown', function(delay) {
        $('#playerList').html('');
        softPlayers = [];
        $('#timer').removeClass('nearly');
        tickCountdown(delay - 300); /* lag compensation */

        for (var i in cities) {
            cities[i].setMap(null);
        }

        for (var i in clouds) {
            clouds[i].setMap(null);
        }

        for (var i in paths) {
            paths[i].setMap(null);
        }

        $('#music')[0].play();
    });

    function tickCountdown(remain) {
        var interval = 100;
        $('#timer').html('Next round in <span>' + (remain / 1000).toFixed(1) + '</span>');

        if (remain === 10000) {
            $('#timer').addClass('nearly');
        }

        if (remain > 0) {
            window.setTimeout(function() {
                tickCountdown(remain - interval);
            }, interval);
        } else {
            endCountdown();
        }
    }

    function endCountdown() {
        $('#timer').html('Targets acquired');
        $('#leaderboard').fadeOut(3000, function() {
            $('#scores .player').remove();
        });
        
        $('#music')[0].pause();
        playsound('start');
    }

    socket.on('softJoin', function(player) {
        softPlayers.push(player.id);
        $('#playerList').append('<div class="player ' + player.id + '">' + player.name + '</div>');
    });

    socket.on('softLeave', function(id) {
        softPlayers.splice(softPlayers.indexOf(id), 1);
        $('.' + id).remove();
    });

    socket.on('leaderChange', function(id) {
        $('#playerList .' + id).addClass('leader');
        leader = id;
    });

    socket.on('playerJoined', function(player) {
        var $player = $('<div class="player" id="' + player.id + '">' + player.name + '</div>');
        var $lives = $('<ul class="lives">');
        for (var i = 0; i < 3; i++) {
            $lives.append('<li>');
        }

        $player.append($lives);
        $('#players').append($player);

        var city = new MarkerWithLabel({
            position: new google.maps.LatLng(player.city.lat, player.city.lng),
            map: map,
            title: player.city.name,
            icon: {},
            labelContent: player.name,
            labelAnchor: new google.maps.Point(3, 16),
            labelClass: "label"
        });

        cities[player.id] = city;
    });

    socket.on('playerLeft', function(data) {
        $('#players #' + data.player).remove();
        if (cities[data.player]) {
            cities[data.player].setMap(null);
        }
    });

    socket.on('launch', function(data) {
        var startCity = data.startCity;
        var targetCity = data.targetCity;
        var targetId = data.targetId;
        var duration = data.duration;

        var llStart = new google.maps.LatLng(startCity.lat, startCity.lng);
        var llTarget = new google.maps.LatLng(targetCity.lat, targetCity.lng)

        var missileSymbol = {
            path: 'M65.3 1.5 c-3.1 2.2 -13 14.6 -18.7 23.3 -13.2 20.4 -22.8 46.7 -25.1 69.2 -0.5 5.2 -0.4 6.9 0.8 7.8 1.1 0.9 12.5 1.2 47.3 1l45.9 -0.3 0.3 -4.6c0.4 -6.4 -4.1 -27.7 -8.2 -39.1 -6.9 -19.3 -18.4 -38.8 -30.7 -52.2 -6.3 -6.9 -8 -7.6 -11.6 -5.1zM21.2 114.2 c-0.9 0.9 -1.2 14.4 -1.2 54.5l0 53.4 12 12.9c6.6 7 12 13 12 13.3 0 0.3 -6.8 5.1 -15.2 10.8 -17.5 12 -21.1 15.3 -24.4 22.3 -2.4 5.1 -2.4 5.1 -2.4 44.6 0 21.7 0.4 40 0.8 40.7 1.2 1.9 5.5 3.1 7.7 2.2 1.7 -0.6 30.7 -20.2 48.1 -32.4 4.8 -3.4 6.4 -4 10.8 -4 4.7 0.1 5.8 0.6 13.6 6.5 8.9 6.8 35.2 24.9 41.7 28.7 4.2 2.5 6.8 2.2 9.6 -0.9 1.5 -1.8 1.7 -5.2 1.7 -39.2 0 -41.3 -0.3 -43.9 -6.3 -51.8 -2 -2.6 -8.9 -8.2 -17.7 -14.3 -8 -5.5 -15.6 -10.8 -16.9 -11.7l-2.5 -1.7 9.7 -9.9c5.3 -5.4 10.8 -11.3 12.2 -13.2l2.5 -3.4 0 -53.1c0 -40 -0.3 -53.4 -1.2 -54.3 -1.7 -1.7 -92.9 -1.7 -94.6 -0z',
            anchor: new google.maps.Point(68, 185),
            fillColor: '#FF0000',
            fillOpacity: 1.0,
            scale: 0.08,
            strokeWeight: 0,
            strokeOpacity: 0
        };

        // TODO: Vapour trails

        var lineOptions = {
            path: [llStart, llTarget],
            strokeColor: '#00FFFF',
            strokeOpacity: 1.0,
            strokeWeight: 1,
            geodesic: true,
            icons: [{
                icon: missileSymbol,
                offset: '0%'
            }],
            map: map
        };
        var path = new google.maps.Polyline(lineOptions);
        paths.push(path);

        var icons = path.get('icons');

        var $ani = $('<div style="display:none"></div>');
        $ani.appendTo('body');

        playsound('launch');

        $ani.animate({
            textIndent: 100
        }, {
            duration: duration,
            easing: 'linear',
            step: function(now) {
                icons[0].offset = now + '%';
                path.set('icons', icons);
            },
            complete: function() {
                $ani.remove();
                path.set('icons', null);
                path.set('strokeOpacity', 0.3);
                path.set('strokeWeight', 2);

                var cloud = new google.maps.Marker({
                    position: llTarget,
                    map: map,
                    title: '',
                    icon: cloudIcon
                });
                clouds.push(cloud);

                playsound('hit');

                $('#overlay').stop(true, true).show().fadeOut(3000);
                $('#' + targetId).find('.lives li:not(.dead)').last().addClass('dead');
            }
        });
    });

    socket.on('kill', function(data) {
        var $player = $('#' + data.player);
        var markerImage = new google.maps.MarkerImage('/img/dead.png',
            new google.maps.Size(50, 50),
            new google.maps.Point(0, 0),
            new google.maps.Point(25, 25));

        cities[data.player].setIcon(markerImage);
        cities[data.player].set('labelContent', '');
        cities[data.player].set('labelClass', '');

        $player.addClass('dead');
    });

    socket.on('endgame', function(data) {
        var leaderboard = data.leaderboard;

        for (var i = 0, l = leaderboard.length; i < l; i++) {
            var player = $('#' + leaderboard[i]);
            player.appendTo('#scores');

            if (leaderboard[i] === leader) {
                $('#' + leaderboard[i]).addClass('leader');
            }
        }

        $('#scores').css('-webkit-column-count', Math.ceil(leaderboard.length / 10));
        $('#scores').css('-moz-column-count', Math.ceil(leaderboard.length / 10));
        $('#scores').css('column-count', Math.ceil(leaderboard.length / 10));
        $('#timer').html('All targets destroyed');
        $('#leaderboard').fadeIn(3000);

        playsound('gameover');

        window.setTimeout(function() {
            $('#timer').html('Acquiring targets...');
        }, 9000);
    });

    socket.on('message', function(data) {
        var $message = $('<p>' + data + '</p>');
        $('#messages').append($message);
        $message.delay(6000).slideUp(3000, function() {
            $message.remove();
        });
    });

    function playsound(sound) {
        var $sound = $('<audio preload="auto" autoPlay="autoplay"><source type="audio/wav" src="/sounds/' + sound + '.wav"/></audio>');
        $sound.appendTo('body');
        window.setTimeout(function() {
            $sound.remove();
        }, 5000);
    }
});
