"use strict";

var worker = {};
var actionByMessageFromSolver = [];

function getCell(row, cell) {
    return $("#cell" + row + cell);
}

function initComponents() {

    function centralize() {
        $("#main").position({
            of : "body"
        });
    }

    var Movement = {
        TO_ROW_END : function (currentRow, currentCol) {
            return {
                row : currentRow,
                col : 9
            };
        },
        TO_ROW_START : function (currentRow, currentCol) {
            return {
                row : currentRow,
                col : 1
            };
        },
        TO_LEFT : function (currentRow, currentCol) {
            return {
                row : (currentCol > 1) ? currentRow : ((currentRow > 1) ? (currentRow - 1) : 9),
                col : (currentCol > 1) ? (currentCol - 1) : 9
            };
        },
        TO_UP : function (currentRow, currentCol) {
            return {
                row : (currentRow > 1) ? (currentRow - 1) : 9,
                col : (currentRow > 1) ? currentCol : ((currentCol > 1) ? (currentCol - 1) : 9)
            };
        },
        TO_RIGHT : function (currentRow, currentCol) {
            return {
                row : (currentCol < 9) ? currentRow : ((currentRow < 9) ? (currentRow + 1) : 1),
                col : (currentCol < 9) ? (currentCol + 1) : 1
            };
        },
        TO_DOWN : function (currentRow, currentCol) {
            return {
                row : (currentRow < 9) ? (currentRow + 1) : 1,
                col : (currentRow < 9) ? currentCol : ((currentCol < 9) ? (currentCol + 1) : 1)
            };
        }
    };

    var cellRegex = /^cell(\d)(\d)$/;

    function moveTo(e, movement, preventDefault) {
        var pos = cellRegex.exec(e.target.id);
        var nextPos = movement(parseInt(pos[1], 10), parseInt(pos[2], 10));
        getCell(nextPos.row, nextPos.col).focus();
        if (preventDefault) {
            e.preventDefault();
        }
    }

    function notifyCellChange(cellId, number) {
        var pos = cellRegex.exec(cellId);
        worker.postMessage({
            type : MessageToSolver.FILL_CELL, //
            row : parseInt(pos[1], 10), //
            col : parseInt(pos[2], 10), //
            value : number //
        });
    }

    function createMovementAction(movement) {
        return function (e) {
            moveTo(e, movement, false);
        };
    }

    function gotoNextCell(e) {
        moveTo(e, Movement.TO_RIGHT, true);
    }

    function changeInputValue(e, number) {
        e.target.value = number;
        notifyCellChange(e.target.id, number);
    }

    var noAction = function (e) {};
    var numberAction = function (e) {
        if (e.shiftKey) {
            e.preventDefault();
        } else {
            changeInputValue(e, e.keyCode - 48);
        }
    };
    var numberPadAction = function (e) {
        changeInputValue(e, e.keyCode - 96);
    };
    var cleanAndGotoPrevious = function (e) {
        if (e.target.value) {
            e.target.value = null;
            notifyCellChange(e.target.id, null);
        } else {
            moveTo(e, Movement.TO_LEFT, true);
        }
    };
    var cleanAndGotoNext = function (e) {
        if (e.target.value) {
            e.target.value = null;
            notifyCellChange(e.target.id, null);
        }
        gotoNextCell(e);
    };

    var actionByKeyCode = {
        8 : cleanAndGotoPrevious, // Backspace
        9 : noAction, // Tab
        13 : noAction, // Enter
        27 : noAction, // Esc
        32 : cleanAndGotoNext, // space
        35 : createMovementAction(Movement.TO_ROW_END), // end
        36 : createMovementAction(Movement.TO_ROW_START), // home
        37 : createMovementAction(Movement.TO_LEFT), // left arrow
        38 : createMovementAction(Movement.TO_UP), // up arrow
        39 : gotoNextCell, // right arrow
        40 : createMovementAction(Movement.TO_DOWN), // down arrow
        46 : noAction, // Delete
        48 : cleanAndGotoNext, // 0
        49 : numberAction, // 1
        50 : numberAction, // 2
        51 : numberAction, // 3
        52 : numberAction, // 4
        53 : numberAction, // 5
        54 : numberAction, // 6
        55 : numberAction, // 7
        56 : numberAction, // 8
        57 : numberAction, // 9
        96 : cleanAndGotoNext, // numpad 0
        97 : numberPadAction, // numpad 1
        98 : numberPadAction, // numpad 2
        99 : numberPadAction, // numpad 3
        100 : numberPadAction, // numpad 4
        101 : numberPadAction, // numpad 5
        102 : numberPadAction, // numpad 6
        103 : numberPadAction, // numpad 7
        104 : numberPadAction, // numpad 8
        105 : numberPadAction // numpad 9
    };

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

    function handleKeyboardShortcut(e) {
        if (e.altKey && e.ctrlKey) {
            switch (e.keyCode) {
            case 67: // (C)lean
                $("#btnClean").click();
                $("#puzzle input:first").focus();
                break;
            case 82: // (R)un
                $("#btnRun").click();
                $("#puzzle input:focus").blur();
                break;
            case 83: // (S)top
                $("#btnStop").click();
                break;
            case 84: // Step (T)ime
                $("#steptime-button").focus();
                break;
            }
        }
    }

    $(window)
    .resize(centralize)
    .keyup(handleKeyboardShortcut);

    $("#puzzle input")
    .attr("size", 1)
    .attr("maxlength", 1)
    .keydown(handleKey)
    .keyup(handleKeyUp);

    $("#runningMessages").hide();

    $("button").button();
    $("#btnRun")
    .button("option", "icons", {
        primary : "ui-icon-play"
    })
    .button("option", "label", "Run")
    .attr("accesskey", "r")
    .click(function () {
        worker.postMessage({
            type : MessageToSolver.START
        });
    });
    $("#btnClean")
    .button("option", "icons", {
        primary : "ui-icon-document"
    })
    .button("option", "label", "Clean")
    .attr("accesskey", "c")
    .click(function () {
        worker.postMessage({
            type : MessageToSolver.CLEAN
        });
    }); //
    $("#btnStop")
    .button("option", "icons", {
        primary : "ui-icon-stop"
    })
    .button("option", "label", "Stop")
    .button("disable")
    .click(function () {
        worker.postMessage({
            type : MessageToSolver.STOP
        });
    });
    $("#steptime").selectmenu({
        select : function (event, ui) {
            worker.postMessage({
                type : MessageToSolver.STEP_TIME,
                value : parseInt(ui.item.label, 10)
            });
        }
    });
    getCell(1, 1).focus();
    centralize();
}

function initWorkerHandlers() {

    function fillRunningMessages(time, cycle, puzzleStatus) {
        if (!!time) {
            $("#timeText").text(time);
        }
        if (!!cycle) {
            $("#cycleText").text(cycle);
        }
        if (!!puzzleStatus) {
            $("#statusText").text(puzzleStatus);
        }
    }

    function unfocus() {
        $(this).blur();
    }

    var actionByPuzzleStatus = [];
    actionByPuzzleStatus[PuzzleStatus.WAITING] = function (data) {
        $("#puzzle input").val("").unbind("focus", unfocus);
        $("#btnRun").button("enable");
        $("#errorMessages, #runningMessages").hide();
        $("#puzzle input:first").focus();
    };
    actionByPuzzleStatus[PuzzleStatus.VALIDATING] = function (data) {
        console.info("PuzzleStatus.VALIDATING: " + objectToString(data));
    };
    actionByPuzzleStatus[PuzzleStatus.INVALID] = function (err) {
        console.warn(objectToString(err));
        $("#btnClean").button("enable");
        $("#btnStop").button("disable");
        $("#btnRun").button("enable"); // Just for debug!
        $("#runningMessages").hide();
        $("#errorMessages").show();
        $("#errorText").text((!!err.message) ? err.message : err);
        if (!!err.cells) {
            if (_.isArray(err.cells)) {
                err.cells
                .map(function (c) {
                    return getCell(c.row, c.col);
                })
                .forEach(function (id, index) {
                    if (index === 0) {
                        $(id).focus();
                    }
                    $(id).effect("pulsate");
                });
            } else {
                var c = err.cells;
                getCell(c.row, c.col).removeClass().focus().effect("pulsate");
            }
        }
    };
    actionByPuzzleStatus[PuzzleStatus.READY] = function (data) {}
    actionByPuzzleStatus[PuzzleStatus.RUNNING] = function (data) {
        $("#btnRun, #btnClean").button("disable");
        $("#btnStop").button("enable");
        $("#puzzle input").bind("focus", unfocus);
        $("#errorMessages").hide();
        $("#runningMessages").show();
        $("#errorText").text("");
        fillRunningMessages(data.time, data.cycle, data.status);
    };
    actionByPuzzleStatus[PuzzleStatus.STOPPED] = function (data) {
        $("#btnRun, #btnClean").button("enable");
        $("#btnStop").button("disable");
        fillRunningMessages(data.time, data.cycle, data.status);
    };
    actionByPuzzleStatus[PuzzleStatus.SOLVED] = function (data) {
        console.info("PuzzleStatus.SOLVED: " + objectToString(data));
        $("#btnStop").button("disable");
        $("#btnClean").button("enable");
        fillRunningMessages(data.time, data.cycle, data.status);
    };

    actionByMessageFromSolver[MessageFromSolver.INVALID_SOLVER] = function (data) {
        console.error("INVALID_SOLVER: " + objectToString(data));
    };
    actionByMessageFromSolver[MessageFromSolver.PUZZLE_STATUS] = function (data) {
        // console.debug("MessageFromSolver.PUZZLE_STATUS: " + objectToString(data));
        $("#puzzle").removeClass().addClass(data.status);
        actionByPuzzleStatus[data.status](data);
    };
    actionByMessageFromSolver[MessageFromSolver.CELL_STATUS] = function (data) {
        // console.info("CELL_STATUS: " + objectToString(data) );
        var cell = getCell(data.row, data.col);
        cell.removeClass().addClass(data.status).val(data.value);
        fillRunningMessages(data.time, data.cycle, null);
    };
    actionByMessageFromSolver[MessageFromSolver.CELL_VALUE] = function (data) {
        // console.info("CELL_VALUE: " +  objectToString(data));
    };
    actionByMessageFromSolver[MessageFromSolver.ERROR] = function (data) {
        console.error("ERROR: " + objectToString(data));
        fillRunningMessages(data.time, data.cycle, data.status);
    };
}

function initWorker() {
    if (!!window.Worker) {
        worker = new Worker('js/solver.js');
        worker.onmessage = function (e) {
            try {
                if (!!e.data.type) {
                    actionByMessageFromSolver[e.data.type](e.data);
                } else {
                    console.info(e.toString());
                }
            } catch (err) {
                console.error(err);
            }
        };
        initWorkerHandlers();
    } else {
        console.warn("Browser not compatible. Web Worker is not present.");
        $("input").prop('disabled', true);
        $("#buttons").hide();
        $("#versionMessage").show();
    }
}

function initSudoku() {
    console.debug(getFormattedHour() + "Initializing");
    initComponents();
    initWorker();
    console.debug(getFormattedHour() + "Initializing finished");
}

$(document).ready(initSudoku);
