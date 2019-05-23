String.prototype.splice = function(i, rem, s) {
    return (this.slice(0, i) + s + this.slice(i + Math.abs(rem)));
};

String.prototype.swap = function(a, b) {
    var a1 = this.substring(a, a+1);
    var b1 = this.substring(b, b+1);
    var result = this;
    result = result.splice(a, 1, b1);
    result = result.splice(b, 1, a1);
    return result;
};

function shuffle(puzzle) {
    var solution = puzzle.solution;
    var configuration = puzzle.configuration;

    // Perform an arbitrary number of translations
    var a, b, aPos, bPos;
    for (var i = 0; i < 10; i++) {
        a = Math.ceil(Math.random() * 9).toString();
        b = Math.ceil(Math.random() * 9).toString();
        
        if (a !== b) {
            for (var j = 0; j < 9; j++) {
                aPos = solution.indexOf(a, j*9);
                bPos = solution.indexOf(b, j*9);
                solution = solution.swap(aPos, bPos);
                configuration = configuration.swap(aPos, bPos);
            }
        }
    }

    puzzle.configuration = configuration;
    puzzle.solution = solution;
    return puzzle;

    // TODO: Row swaps
    // TODO: Column swaps
}

var inputLocations = [];
var config = {
    difficulty: 1
};

/*
 * configuration = string, the starting grid
 * solution = string, the completed puzzle
 * difficulty = integer, lower is easier
 */
var puzzles = [
    {
        configuration: "450700320962000000080290160002000010740051620806030040130000960200300080000070300",
             solution: "451786329962134578783295164592674813743851629816932547137248965296315487458679321",
        difficulty: 1
    },
    {
        configuration: "840900000015006002020147000310008450904000600205090000080600732000307100070010400",
             solution: "843925176715836492926147538317268459984571623265394781581694732249357168673812459",
        difficulty: 1
    },
    {
        configuration: "501700020008094001027030000302895000500000000601000070600100000985002600000890300",
             solution: "541768923368294751927135468372895416549176823681243579634157289985432617712896354",
        difficulty: 1
    }
];

// Remove puzzles which aren't of the correct difficulty level
for (var i = 0, l = puzzles.length; i < l; i++) {
    if (puzzles[i] && puzzles[i].difficulty !== config.difficulty) {
        puzzles.splice(i, 1), i--;
    }
}

var puzzle;

function initSudoku() {
    // Select one of the remaining puzzles at random, shuffled
    puzzle = shuffle(puzzles[Math.floor(Math.random() * puzzles.length)]);

    $('.grid').removeClass('complete');
    $('.launch').remove();

    for (var i = 1; i <= 81; i++) {
		var $input = $('#input' + i);
		var initial = puzzle.configuration.substring(i-1, i);
		if (initial !== '0') {
			$input.val(initial)
                .prop('disabled', true)
                .addClass("starting");
        } else {
            $input.val('')
                .prop('disabled', false)
                .removeClass("starting");
        }

		(inputLocations[Math.floor((i-1)/9)] = inputLocations[Math.floor((i-1)/9)] || []).push(i);
	}
}

$(document).ready(function() {
	// Validate the input
    $('.grid input').on('keypress', function(e) {
        e.preventDefault();
        if (47 < e.which && e.which < 58) {
            $(this).val(String.fromCharCode(e.which));
            checkForFull();
        /*} else if (e.which === 35) { // DEBUG
            var p = $(this).attr('id').substring(5) * 1;
            $(this).val(puzzle.solution.substring(p-1, p));
            checkForFull();*/
        } else {
            return false;
        }
    });

    // If the input has escaped validation, clear it
    $('.grid input').on('blur', function() {
        var inputtext = $(this).val();
        var regexp = new RegExp("[1-9]");

        if (!regexp.test(inputtext) || inputtext.length !== 1) {
            $(this).val('');
        }
    });
});

function checkForFull() {
	for (var i = 0, l = window.inputLocations.length; i < l; i++) {
		if (window.inputLocations[i] !== "") {
			var bool = false;

			for (var j = 0; j < 9; j++) {
				var inputNo = window.inputLocations[i][j];
				var value = document.getElementById("input" + inputNo).value;
				if (value === "") bool = true;
			}

			if (!bool) {
                lockBox(i);
            }
		}
	}
}

function lockBox(groupLocation) {
	var min = inputLocations[groupLocation][0];
	var max = inputLocations[groupLocation][8];

	if (check(min, max)) {
		for (var i = min; i <= max; i++) {
            $("#input" + i).prop('disabled', true).removeClass("starting");
        }

		window.inputLocations[groupLocation] = "";

		var $grid = $('.grid').eq(groupLocation);
        $grid.addClass('complete');

        var targets = $('#targets').html();
        $('<select class="launch"></select>').html(targets).appendTo($grid);
	}
}

function check(min, max) {
	var input = "";
	var solution = puzzle.solution.substring(min-1, max);

	for (var i = min; i <= max; i++) {
        input += $('#input' + i).val().toString();
    }

	if (input == solution) {
        return true;
    } else {
        return false;
    }
}
