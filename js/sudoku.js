"use strict";

var puzzle = {};
var solver = {};
var worker = new Worker('js/solver.js');

function getFormattedHour() {

    function format(value, size, end) {
        var string = value.toString();

        while (string.length < size) {
            string = '0' + string;
        }

        return string + end;
    }

    var d = new Date();
    return "[" + format(d.getHours(), 2, ":") + format(d.getMinutes(), 2, ":") + format(d.getSeconds(), 2, '.') + format(d.getMilliseconds(), 3, ']') + " ";
}

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

var cellRegex = /^cell(\d)(\d)$/;

function moveTo(e, movement, preventDefault) {
    var pos = Cell.getCellPos(e.target);
    var nextPos = movement(pos.row, pos.col);
    $("#cell" + nextPos.row + nextPos.col).focus();
    if (preventDefault) {
        e.preventDefault();
    }
}

function notifyCellChange(cellId, number) {
    var pos = cellRegex.exec(cellId);
    worker.postMessage({
        type: MessageToSolver.FILL_CELL, //
        row: parseInt(pos[1]), //
        col: parseInt(pos[2]), //
        value: number //
    });
}

function createMovementAction(movement) {
    return function(e) {
        moveTo(e, movement, false);
    }
}

function gotoNextCell(e) {
    moveTo(e, Movement.TO_RIGHT, true);
    notifyCellChange(e.target.id, null);
}

function changeInputValue(e, number) {
    e.target.value = number;
    notifyCellChange(e.target.id, number);
}

var noAction = function(e) {};
var numberAction = function(e) {
    if (e.shiftKey) {
        e.preventDefault();
    } else {
        changeInputValue(e, e.keyCode - 48);
    }
};
var numberPadAction = function(e) {
    changeInputValue(e, e.keyCode - 96)
};
var cleanAndGotoPrevious = function(e) {
    if (!e.target.value) {
        moveTo(e, Movement.TO_LEFT, true);
        notifyCellChange(e.target.id, null);
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
    105: numberPadAction // numpad 9 
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


function unfocus() {
    $(this).blur();
}

function changePuzzleStatus(oldClass, newClass) {
    $(this).removeClass(oldClass).addClass(newClass);

    switch (newClass) {
        case PuzzleStatus.RUNNING:
            $("#btnRun, #btnClean").button("disable");
            $("#btnStop").button("enable");
            break;
        case PuzzleStatus.INVALID:
            $("#btnRun, #btnStop").button("disable");
            $("#btnClean").button("enable");
            break;
        default:
            $("#btnRun, #btnClean").button("enable");
            $("#btnStop").button("disable");
    }
}

function changeCellClass(oldClass, newClass, element) {
    $(this).removeClass(oldClass).addClass(newClass);

    switch (newClass) {
        case PuzzleStatus.RUNNING:
            $(this).bind("focus", unfocus);
            break;
        case CellStatus.EVALUATING:
            $("#messages").html("TOTAL TIME: " + (Date.now() - solver.starTime) + "<br/>CYCLES: " + solver.cycle); // + " ms");
            break;
        default:
            if (oldClass == PuzzleStatus.RUNNING) {
                $(this).unbind("focus", unfocus);
            }
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

function initSudoku() {
    console.info(getFormattedHour() + "Initializing");

    $("#puzzle input")
        .attr("size", 1)
        .attr("maxlength", 1)
        .keydown(handleKey)
        .keyup(handleKeyUp)
        // .change(function() {
        //     console.debug($(this).val() + " - " + this.id);
        // })
    ;
    // .each(function(index, element) {
    //     $(element).change(function() {
    //         console.debug(this);
    //     });
    //     // element.changePuzzleStatus = changePuzzleStatus;
    //     // element.changeCellClass = changeCellClass;
    // });

    $("button").button();
    $("#btnRun")
        .button("option", "icons", {
            primary: "ui-icon-play"
        })
        .button("option", "label", "Run")
        .attr("accesskey", "r")
        .click(function() {
            worker.postMessage({
                type: MessageToSolver.START
            });
            /*
                        try {
                            solver.validatePuzzle();
                            $("#messages").removeClass("ui-state-error").text("");
                            solver.solve();
                        } catch (err) {
                            handleError(err);
                        }
            */
        });
    $("#btnClean")
        .button("option", "icons", {
            primary: "ui-icon-document"
        })
        .button("option", "label", "Clean")
        .attr("accesskey", "c")
        .click(function() {
            worker.postMessage({
                type: MessageToSolver.CLEAN
            });
            // puzzle.status = PuzzleStatus.WAITING;
            // $("#messages").removeClass("ui-state-error").text("");
        }); // 
    $("#btnStop")
        .button("option", "icons", {
            primary: "ui-icon-stop"
        })
        .button("option", "label", "Stop")
        .click(function() {
            worker.postMessage({
                type: MessageToSolver.CLEAN
            });
            // puzzle.status = PuzzleStatus.STOPPED;
            // $("#messages").removeClass("ui-state-error").text("");
        }).button("disable");
    $("#steptime").selectmenu({
        select: function(event, ui) {
            solver.stepTime = parseInt(ui.item.value);
        }
    });
    $("#cell11").focus();

    puzzle = new Puzzle($("#puzzle"));
    solver = new Solver(puzzle);


    console.info(getFormattedHour() + "Initializing finished");
}


$(document).ready(initSudoku);
/*
(function(global) {
    // http://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
    var is_worker = !global.document;
    var script_path = is_worker ? null : (function() {
        // append random number and time to ID
        var id = (Math.random()+''+(new Date()).substring(2);
        document.write('<script id="wts' + id + '"></script>');
        return document.getElementById('wts' + id).
            previousSibling.src;
    })();
    function msg_parent(e) {
        // event handler for parent -> worker messages
    }
    function msg_worker(e) {
        // event handler for worker -> parent messages
    }
    function new_worker() {
        var w = new Worker(script_path);
        w.addEventListener('message', msg_worker, false);
        return w;
    }
    if (is_worker)
        global.addEventListener('message', msg_parent, false);

    // put the rest of your library here
    // to spawn a worker, use new_worker()
var worker =  new_worker();

})(this);
3461-1722
9 6792-7182
neusa
*/
