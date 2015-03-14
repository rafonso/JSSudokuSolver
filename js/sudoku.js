var puzzle = {};
var solver = {};

var Movement = {
    TO_ROW_END: function(currentRow, currentCol) {
        return {
            row: currentRow,
            col: 9
        };
    },
    TO_ROW_START: function(currentRow, currentCol) {
        return {
            row: currentRow,
            col: 1
        };
    },
    TO_LEFT: function(currentRow, currentCol) {
        return {
            row: (currentCol > 1) ? currentRow : ((currentRow > 1) ? (currentRow - 1) : 9),
            col: (currentCol > 1) ? (currentCol - 1) : 9
        };
    },
    TO_UP: function(currentRow, currentCol) {
        return {
            row: (currentRow > 1) ? (currentRow - 1) : 9,
            col: (currentRow > 1) ? currentCol : ((currentCol > 1) ? (currentCol - 1) : 9)
        };
    },
    TO_RIGHT: function(currentRow, currentCol) {
        return {
            row: (currentCol < 9) ? currentRow : ((currentRow < 9) ? (currentRow + 1) : 1),
            col: (currentCol < 9) ? (currentCol + 1) : 1
        };
    },
    TO_DOWN: function(currentRow, currentCol) {
        return {
            row: (currentRow < 9) ? (currentRow + 1) : 1,
            col: (currentRow < 9) ? currentCol : ((currentCol < 9) ? (currentCol + 1) : 1)
        };
    },
};

function moveTo(e, movement, preventDefault) {
    var pos = Cell.getCellPos(e.target);
    var nextPos = movement(pos.row, pos.col);
    $("#cell" + nextPos.row + nextPos.col).focus();
    if (preventDefault) {
        e.preventDefault();
    }
}

function createMovementAction(movement) {
    return function(e) {
        moveTo(e, movement, false);
    }
}

function gotoNextCell(e) {
    moveTo(e, Movement.TO_RIGHT, true);
}

var noAction = function(e) {};
var numberAction = function(e) {
    if (e.shiftKey) {
        e.preventDefault();
    } else {
        e.target.value = (e.keyCode - 48);
    }
};
var numberPadAction = function(e) {
    e.target.value = (e.keyCode - 96);
};
var cleanAndGotoPrevious = function(e) {
    if (!e.target.value) {
        moveTo(e, Movement.TO_LEFT, true);
    }
};

var actionByKeyCode = {
    8: cleanAndGotoPrevious, // Backspace
    9: noAction, // Tab
    13: noAction, // Enter
    27: noAction, // Esc
    32: gotoNextCell, // space
    35: createMovementAction(Movement.TO_ROW_END), // end
    36: createMovementAction(Movement.TO_ROW_START), // home
    37: createMovementAction(Movement.TO_LEFT), // left arrow 
    38: createMovementAction(Movement.TO_UP), // up arrow 
    39: gotoNextCell, // right arrow
    40: createMovementAction(Movement.TO_DOWN), // down arrow
    46: noAction, // Delete
    48: gotoNextCell, // 0
    49: numberAction, // 1
    50: numberAction, // 2
    51: numberAction, // 3
    52: numberAction, // 4
    53: numberAction, // 5
    54: numberAction, // 6
    55: numberAction, // 7
    56: numberAction, // 8
    57: numberAction, // 9
    96: gotoNextCell, // numpad 0
    97: numberPadAction, // numpad 1 
    98: numberPadAction, // numpad 2
    99: numberPadAction, // numpad 3 
    100: numberPadAction, // numpad 4
    101: numberPadAction, // numpad 5 
    102: numberPadAction, // numpad 6 
    103: numberPadAction, // numpad 7 
    104: numberPadAction, // numpad 8 
    105: numberPadAction, // numpad 9 
}

function handleKey(e) {
    var action = actionByKeyCode[e.keyCode];
    if (action) {
        action(e);
    } else {
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    if (((e.keyCode >= 49) && (e.keyCode <= 57)) ||
        ((e.keyCode >= 97) && (e.keyCode <= 105))) {
        gotoNextCell(e);
    }
}

function handleError(err) {
    if (!!err.stack) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    $("#messages").addClass("ui-state-error").text((!!err.msg) ? err.msg : err);
    if (!!err.invalidCells) {
        err.invalidCells.forEach(function(c) {
            c.element.effect("pulsate");
        });
    }
}


$(document).ready(function() {
    console.debug("Initializing");
    $("#puzzle input")
        .attr("size", 1)
        .attr("maxlength", 1)
        .keydown(handleKey)
        .keyup(handleKeyUp);

    $("button").button();
    $("#btnRun")
        .button("option", "icons", {
            primary: "ui-icon-play"
        })
        .button("option", "label", "Run")
        .attr("accesskey", "r")
        .click(function() {
            try {
                solver.validatePuzzle();
                $("#messages").removeClass("ui-state-error").text("");
                solver.solve();
            } catch (err) {
                handleError(err);
            }
        });
    $("#btnClean")
        .button("option", "icons", {
            primary: "ui-icon-document"
        })
        .button("option", "label", "Clean")
        .attr("accesskey", "c")
        .click(function() {
            puzzle.cells.forEach(function(c) {
                c.value = null;
            });
            puzzle.status = PuzzleStatus.WAITING;
            $("#messages").removeClass("ui-state-error").text("");
        });
    $("#btnStop")
        .button("option", "icons", {
            primary: "ui-icon-stop"
        })
        .button("option", "label", "Stop").hide();
    $("#steptime").selectmenu()
    $("#cell11").focus();

    puzzle = new Puzzle($("#puzzle"));
    solver = Solver(puzzle);


    console.debug("Initializing finished");
});
