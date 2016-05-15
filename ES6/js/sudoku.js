// UI FUNCTIONS
"use strict";

let worker = {};
let actionByMessageFromSolver = [];

function getCell (row, cell) {
    return $(`#cell${row}${cell}`);
}

function notifyCellValue (row, col, value) {
    worker.postMessage({
        type: MessageToSolver.FILL_CELL, //
        row: row, //
        col: col, //
        value: value
    //
    });
}

/**
 * Inject the values in a String in the Puzzle. This puzzle should contains just
 * 0 to 9 and ".". The "." value will be ignored. The "0" values will correspond
 * to empty cells.
 * 
 * @param puzzle
 *            String which will fill the puzzle.
 */
function insertPuzzle (puzzle) {
    puzzle = puzzle.replace(/\./g, "");
    if (!/^\d{81}$/.test(puzzle)) {
        throw new Error("Invalid Puzzle!");
    }

    $("#btnClean").click();
    let row = 1, col = 1;
    for (let i = 0; i < 81; i++) {
        let d = parseInt(puzzle.charAt(i), 10);
        if (d) {
            notifyCellValue(row, col, d);
        }
        if (col == 9) {
            row++;
            col = 1;
        } else {
            col++;
        }
    }
}

/**
 * Export a puzzle as a String.
 * 
 * @param justOriginals
 *            if just the original cells (class="original") will be read or all
 *            cells.
 * @return exported puzzle.
 */
function exportPuzzle (justOriginals) {
    let extractOriginals = function () {
        return ($(this).attr("class") === CellStatus.ORIGINAL) ? $(this).val()
                : 0;
    };
    let extractAll = function () {
        return $(this).val() || 0;
    };

    let cellToValue = justOriginals ? extractOriginals : extractAll;
    let concatValues = (str, value, idx) => {
        let dot = (idx == 80) ? "" : (((idx + 1) % 9 == 0) ? "." : "");
        return str + value + dot;
    };

    let values = $("#puzzle :text").map(cellToValue);
    return _.reduce(values, concatValues, "");
}

/**
 * Convert a Puzzle to a call to the insertPuzzle function.
 * 
 * @param justOriginals
 *            if just the original cells (class="original") will be read or all
 *            cells.
 * @return call to insertPuzzle
 */
function puzzleToinsertPuzzle (justOriginals) {
    return "insertPuzzle(\"" + exportPuzzle(justOriginals) + "\");";
}

/**
 * Initialize HTML components.
 */
function initComponents () {

    /**
     * Centralize components in the middle of page.
     */
    function centralize () {
        $("#main").position({
            of: "body"
        });
    }

    /**
     * Cursor movements according typed key.
     */
    let Movement = {
        TO_ROW_END: function (currentRow, currentCol) {
            return {
                row: currentRow,
                col: 9
            };
        },
        TO_ROW_START: function (currentRow, currentCol) {
            return {
                row: currentRow,
                col: 1
            };
        },
        TO_LEFT: function (currentRow, currentCol) {
            return {
                row: (currentCol > 1) ? currentRow
                        : ((currentRow > 1) ? (currentRow - 1) : 9),
                col: (currentCol > 1) ? (currentCol - 1) : 9
            };
        },
        TO_UP: function (currentRow, currentCol) {
            return {
                row: (currentRow > 1) ? (currentRow - 1) : 9,
                col: (currentRow > 1) ? currentCol
                        : ((currentCol > 1) ? (currentCol - 1) : 9)
            };
        },
        TO_RIGHT: function (currentRow, currentCol) {
            return {
                row: (currentCol < 9) ? currentRow
                        : ((currentRow < 9) ? (currentRow + 1) : 1),
                col: (currentCol < 9) ? (currentCol + 1) : 1
            };
        },
        TO_DOWN: function (currentRow, currentCol) {
            return {
                row: (currentRow < 9) ? (currentRow + 1) : 1,
                col: (currentRow < 9) ? currentCol
                        : ((currentCol < 9) ? (currentCol + 1) : 1)
            };
        }
    };

    let cellRegex = /^cell(\d)(\d)$/;

    /**
     * Function which decides to where the cursor will move after key typing.
     * 
     * @param e
     *            JQuery key event
     * @param movement
     *            kind of movement, according Movement array
     * @param preventDefault
     */
    function moveTo (e, movement, preventDefault) {
        let pos = cellRegex.exec(e.target.id);
        let nextPos = movement(parseInt(pos[1], 10), parseInt(pos[2], 10));
        getCell(nextPos.row, nextPos.col).focus();
        if (preventDefault) {
            e.preventDefault();
        }
    }

    function notifyCellChange (cellId, number) {
        let pos = cellRegex.exec(cellId);
        notifyCellValue(parseInt(pos[1], 10), parseInt(pos[2], 10), number)
    }

    function createMovementAction (movement) {
        return e => moveTo(e, movement, false);
    }

    function gotoNextCell (e) {
        moveTo(e, Movement.TO_RIGHT, true);
    }

    function changeInputValue (e, number) {
        e.target.value = number;
        notifyCellChange(e.target.id, number);
    }

    let noAction = e => {};
    let numberAction = e => {
        if (e.shiftKey) {
            e.preventDefault();
        } else {
            changeInputValue(e, e.keyCode - 48);
        }
    };
    let numberPadAction = e => changeInputValue(e, e.keyCode - 96);
    let cleanAndGotoPrevious = e => {
        if (e.target.value) {
            e.target.value = null;
            notifyCellChange(e.target.id, null);
        } else {
            moveTo(e, Movement.TO_LEFT, true);
        }
    };
    let cleanAndGotoNext = e => {
        if (e.target.value) {
            e.target.value = null;
            notifyCellChange(e.target.id, null);
        }
        gotoNextCell(e);
    };

    let actionByKeyCode = {
        8: cleanAndGotoPrevious, // Backspace
        9: noAction, // Tab
        13: noAction, // Enter
        27: noAction, // Esc
        32: cleanAndGotoNext, // space
        35: createMovementAction(Movement.TO_ROW_END), // end
        36: createMovementAction(Movement.TO_ROW_START), // home
        37: createMovementAction(Movement.TO_LEFT), // left arrow
        38: createMovementAction(Movement.TO_UP), // up arrow
        39: gotoNextCell, // right arrow
        40: createMovementAction(Movement.TO_DOWN), // down arrow
        46: noAction, // Delete
        48: cleanAndGotoNext, // 0
        49: numberAction, // 1
        50: numberAction, // 2
        51: numberAction, // 3
        52: numberAction, // 4
        53: numberAction, // 5
        54: numberAction, // 6
        55: numberAction, // 7
        56: numberAction, // 8
        57: numberAction, // 9
        96: cleanAndGotoNext, // numpad 0
        97: numberPadAction, // numpad 1
        98: numberPadAction, // numpad 2
        99: numberPadAction, // numpad 3
        100: numberPadAction, // numpad 4
        101: numberPadAction, // numpad 5
        102: numberPadAction, // numpad 6
        103: numberPadAction, // numpad 7
        104: numberPadAction, // numpad 8
        105: numberPadAction
    // numpad 9
    };

    function handleKey (e) {
        let action = actionByKeyCode[e.keyCode];
        if (action) {
            action(e);
        } else {
            e.preventDefault();
        }
    }

    /**
     * Key up action
     * 
     * @param e
     *            Key Event.
     */
    function handleKeyUp (e) {
        if (((e.keyCode >= 49) && (e.keyCode <= 57))
                || ((e.keyCode >= 97) && (e.keyCode <= 105))) {
            gotoNextCell(e);
        }
    }

    function handleKeyboardShortcut (e) {
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

    /**
     * Show Import/export dialog.
     * 
     * @param title
     *            title dialog
     * @param onOpen
     *            action when opening dialog.
     * @param onOk
     *            Action when clicking Ok Button.
     * @param tooltip
     *            Dialog tooltip
     */
    function puzzleDialog (title, onOpen, onOk, tooltip) {
        $("#puzzleToExport").tooltip({
            content: tooltip
        });
        $("#exportDialog").dialog({
            modal: true,
            width: 800,
            title: title,
            open: onOpen,
            close: (event, ui) => ($("#puzzleToExport").val("")),
            buttons: {
                Ok: onOk
            }
        }).focus();
    }

    $(window).resize(centralize).keyup(handleKeyboardShortcut);

    $("#puzzle input").attr("size", 1).attr("maxlength", 1).keydown(handleKey)
            .keyup(handleKeyUp);

    $("#runningMessages").hide();

    $("button").button();
    $("#btnRun").button("option", "icons", {
        primary: "ui-icon-play"
    }).button("option", "label", "Run").attr("accesskey", "r").click(() =>
                worker.postMessage({
                    type: MessageToSolver.START
                }));
    $("#btnClean").button("option", "icons", {
        primary: "ui-icon-document"
    }).button("option", "label", "Clean").attr("accesskey", "c").click(() => {
                worker.postMessage({
                    type: MessageToSolver.CLEAN
                });
                $("#puzzle input:first").focus();
            }); //
    $("#btnStop").button("option", "icons", {
        primary: "ui-icon-stop"
    }).button("option", "label", "Stop").button("disable").click(() =>
        worker.postMessage({
            type: MessageToSolver.STOP
        })
    );

    $("#btnReset").button("option", "icons", {
        primary: "ui-icon ui-icon-arrowrefresh-1-w"
    }).button("option", "label", "Reset").click(() =>
        worker.postMessage({
            type: MessageToSolver.RESET
        })
    ).hide();

    $("#steptime").selectmenu({
        select: (event, ui) => 
            worker.postMessage({
                type: MessageToSolver.STEP_TIME,
                value: parseInt(ui.item.label, 10)
            })
    });
    $(document) //
    .bind(
            'keydown',
            'shift+e',
            function () {
                puzzleDialog("Export Puzzle", function () {
                    $("#puzzleToExport").val(exportPuzzle(true)).attr(
                            "readonly", "true").select().focus();
                }, function () {
                    $(this).dialog("close");
                });
            }, "Export a puzzle") //
    .bind('keydown', 'shift+i', function () {
        if ($("#btnRun").button("option", "disabled")) {
            // If it is running, don't allow to import
            return;
        }

        puzzleDialog("Import Puzzle", function () {
            $("#puzzleToExport").removeAttr("readonly");
        }, function () {
            try {
                insertPuzzle($("#puzzleToExport").val());
                $(this).dialog("close");
            } catch (e) {
                alert(e);
            }
        }, "Insert a puzzle.");
    });
    getCell(1, 1).focus();
    centralize();
}

/**
 * Initialize WebWorker handlers.
 */
function initWorkerHandlers () {

    function fillRunningMessages (time, cycle, puzzleStatus) {
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

    /**
     * Blur input text component when focused.
     */
    function unfocus () {
        $(this).blur();
    }

    let actionByPuzzleStatus = [];
    actionByPuzzleStatus[PuzzleStatus.WAITING] = data => {
        $("#puzzle input").unbind("focus", unfocus);
        $("#btnRun").button("enable");
        $("#btnStop").button("disable").show();
        $("#btnReset").hide();

        $("#errorMessages, #runningMessages").hide();
        $("#puzzle input:first").focus();
        fillRunningMessages(0, 0, "");
    };
    actionByPuzzleStatus[PuzzleStatus.VALIDATING] = data => 
        console.info(`PuzzleStatus.VALIDATING: ${JSON.stringify(data)}`);
    actionByPuzzleStatus[PuzzleStatus.INVALID] = (err) => {
        console.warn(JSON.stringify(err));
        $("#btnClean").button("enable");
        $("#btnStop").button("disable");
        $("#btnRun").button("enable"); // Just for debug!
        $("#btnReset").hide();
        $("#runningMessages").hide();
        $("#errorMessages").show();
        $("#errorText").text((!!err.message) ? err.message : err);
        if (!!err.cells) {
            if (_.isArray(err.cells)) {
                err.cells.map(c => getCell(c.row, c.col)).
                forEach((id, index) => {
                    if (index === 0) {
                        $(id).focus();
                    }
                    $(id).effect("pulsate");
                });
            } else {
                let c = err.cells;
                getCell(c.row, c.col).removeClass().focus().effect("pulsate");
            }
        }
    };
    actionByPuzzleStatus[PuzzleStatus.READY] = data => {};
    actionByPuzzleStatus[PuzzleStatus.RUNNING] = data => {
        $("#btnRun, #btnClean").button("disable");
        $("#btnStop").button("enable").show();
        $("#btnReset").hide();
        $("#puzzle input").bind("focus", unfocus);
        $("#errorMessages").hide();
        $("#runningMessages").show();
        $("#errorText").text("");
        fillRunningMessages(data.time, data.cycle, data.status);
    };
    actionByPuzzleStatus[PuzzleStatus.STOPPED] = data =>  {
        $("#btnClean").button("enable");
        $("#btnRun").button("disable");
        $("#btnStop").hide();
        $("#btnReset").show();
        fillRunningMessages(data.time, data.cycle, data.status);
    };
    actionByPuzzleStatus[PuzzleStatus.SOLVED] = data => {
        $("#btnClean").button("enable");
        $("#btnStop").button("disable").hide();
        $("#btnReset").button("enable").show();

        fillRunningMessages(data.time, data.cycle, data.status);
    };

    actionByMessageFromSolver[MessageFromSolver.INVALID_SOLVER] = data => 
        console.error("INVALID_SOLVER: " + JSON.stringify(data));
    actionByMessageFromSolver[MessageFromSolver.PUZZLE_STATUS] = data =>  {
        $("#puzzle").removeClass().addClass(data.status);
        actionByPuzzleStatus[data.status](data);
    };
    actionByMessageFromSolver[MessageFromSolver.CELL_STATUS] = data => {
        let cell = getCell(data.row, data.col);
        cell.removeClass().addClass(data.status).val(data.value);
        fillRunningMessages(data.time, data.cycle, null);
    };
    actionByMessageFromSolver[MessageFromSolver.CELL_VALUE] = data => {}
    actionByMessageFromSolver[MessageFromSolver.ERROR] = data => {
        console.error("ERROR: " + JSON.stringify(data));
        fillRunningMessages(data.time, data.cycle, data.status);
    };
}

/**
 * Initialize WebWorker.
 */
function initWorker () {
    if (!!window.Worker) {
        worker = new Worker('js/solver.js');
        worker.onmessage = e => {
            try {
                console.info(JSON.stringify(e));
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

/**
 * Initialize the page.
 */
function initSudoku () {
    console.debug(getFormattedHour() + "Initializing");
    initComponents();
    initWorker();
    console.debug(getFormattedHour() + "Initializing finished");
}

$(document).ready(initSudoku);
