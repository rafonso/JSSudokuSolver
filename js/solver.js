// SUDOKU SOLVER METHODS
"use strict";

var actionByMessageToSolver = [];
var puzzle = {};
var stepTime = 0;
var accumulatedTime;
var startTme;
var cycle;

function serializeCell(c) {
    return {
        col : c.col,
        row : c.row
    };
}

function getRunningTime() {
    return (Date.now() - startTme) + accumulatedTime;
}

function isEmptyCell(c) {
    return !c.filled;
}

function changePuzzleStatus(status, extras) {
    if (puzzle.status === status) {
        return;
    }

    puzzle.status = status;

    var message = _.extend({
            type : MessageFromSolver.PUZZLE_STATUS,
            status : puzzle.status
        }, extras);

    // console.warn("changePuzzleStatus(): " + objectToString(message));
    postMessage(message);
}

function changeCellStatus(cell, status) {
    if (!!!cell) {
        console.error("Empty cell!");
    }
    if (cell.status === status) {
        return;
    }

    cell.status = status;

    postMessage({
        type : MessageFromSolver.CELL_STATUS,
        status : cell.status,
        row : cell.row,
        col : cell.col,
        value : cell.value,
        time : getRunningTime(),
        cycle : cycle
    });
}

function changeCellValue(cell, value, status, tabs) {
    if (cell.value === value) {
        return;
    }

    cell.value = (!!value) ? value : null;
    cell.status = (!!value) ? status : null;

    if (status == CellStatus.FILLED || status == CellStatus.GUESSING) {
        var tbs = "";
        for (var i = 0; i < tabs; i++) {
            tbs += "\t";
        }
        console.debug(tbs + cell.toString());
    }

    postMessage({
        type : MessageFromSolver.CELL_STATUS,
        status : cell.status,
        row : cell.row,
        col : cell.col,
        value : cell.value,
        time : getRunningTime(),
        cycle : cycle
    });
}

function validatePuzzle() {

    function validate(cells, pos, description) {
        // The found array has 10 positions to avoid always subtract 1. The 0th position is simply not used.
        var found = [false, false, false, false, false, false, false, false, false, false];
        cells.forEach(function (cell) {
            if (cell.filled) {
                var value = cell.value;
                if (found[value]) {
                    throw _.extend(new Error(description + " " + pos + ". Repeated value: " + value), {
                        invalidCells : cells
                    });
                } else {
                    found[value] = true;
                }
            }
        });
    }

    function val(func, description) {
        _.range(1, 10).forEach(function (i) {
            validate(func(i), i, description);
        });
    }

    changePuzzleStatus(PuzzleStatus.VALIDATING);

    if (_.every(puzzle.cells, isEmptyCell)) {
        throw new Error("All Cells are empty!");
    }

    val(puzzle.getCellsRow, "Row");
    val(puzzle.getCellsCol, "Column");
    val(puzzle.getCellsSector, "Sector");

    changePuzzleStatus(PuzzleStatus.READY);
}

function solve() {

    var memento = [];

    // Here I compare with other cells
    function getPendentValues(cell) {

        /**
         * Extract the values from filled cells.
         *
         * @param Function which extract the Cells from the puzzle
         * @param
         */
        function getValues(func, pos) {
            return func(pos).filter(function (c) {
                return c.filled;
            }).map(function (c) {
                return c.value;
            });
        }

        var diff = _.difference(_.range(1, 10), getValues(puzzle.getCellsRow, cell.row));
        diff = _.difference(diff, getValues(puzzle.getCellsCol, cell.col));
        diff = _.difference(diff, getValues(puzzle.getCellsSector, cell.sector));

        return diff;
    }

    function solveCell(cell, emptyCells, pos) {
        var diff = getPendentValues(cell);

        if (diff.length === 0) {
            if (memento.length == 0) {
                changePuzzleStatus(PuzzleStatus.INVALID, {
                    message : "Cell with no values remaining. Probably the puzzle was mistaken written.",
                    cells : serializeCell(cell)
                });
                return;
            } else {
                // Get top Memento ...
            }
        }

        if (diff.length === 1) {
            changeCellValue(cell, diff[0], CellStatus.FILLED, memento.length);
        } else {
            changeCellStatus(cell, null);
        }
        solveNextCell(emptyCells, pos + 1)
    }

    function solveNextCell(emptyCells, pos) {
        if (puzzle.status === PuzzleStatus.STOPPED) {
            return;
        } else if (pos >= emptyCells.length) {
            setTimeout(function () {
                solveCycle(emptyCells);
            });
        } else {
            var cell = emptyCells[pos];
            // console.debug(cell);
            changeCellStatus(cell, CellStatus.EVALUATING);
            setTimeout(function () {
                solveCell(cell, emptyCells, pos);
            }, stepTime);
        }
    }

    function solveCycle(priorEmptyCells) {

        function incrementCycle() {
            cycle++;
            console.debug("CYCLE " + cycle);
        }

        function tryGuess(pendents, guessCell, pendentValues) {
            var cell = puzzle.getCell(guessCell.row, guessCell.col);
            incrementCycle();
            _.rest(pendentValues).reverse().forEach(function (v) {
                memento.push({
                    cell : guessCell,
                    pendentValue : v,
                    cells : pendents
                });
            })
            changeCellValue(cell, pendentValues[0], CellStatus.GUESSING, memento.length);
            //            console.debug(objectToString(memento));
            solveNextCell(puzzle.cells.filter(isEmptyCell), 0);
        }

        function undoGuess() {
            var memo = memento.pop();
            memo.cells.forEach(function (cell) {
                var puzzleCell = puzzle.getCell(cell.row, cell.col);
                changeCellValue(puzzleCell, cell.value, cell.status);
            });
            incrementCycle();
            changeCellValue(puzzle.getCell(memo.cell.row, memo.cell.col), memo.pendentValue, CellStatus.GUESSING, memento.length);
            //            console.debug(objectToString(memento));
            solveNextCell(puzzle.cells.filter(isEmptyCell), 0);
        }

        // console.info("solveCycle(" + priorEmptyCells + ")")
        var emptyCells = puzzle.cells.filter(isEmptyCell);
        if (emptyCells.length === 0) {
            changePuzzleStatus(PuzzleStatus.SOLVED, {
                cycle : cycle,
                time : getRunningTime()
            });
        } else if (emptyCells.length === priorEmptyCells.length) {

            var pendentCells = puzzle.cells.filter(isEmptyCell).map(_.clone);
            var firstEmptyCell = pendentCells[0];
            var pendentValues = getPendentValues(firstEmptyCell);
            if (pendentValues.length) {
                tryGuess(pendentCells, firstEmptyCell, pendentValues);
            } else if (memento.length) {
                undoGuess();
            } else {
                changePuzzleStatus(PuzzleStatus.INVALID, {
                    message : "There is no solution! :"
                });
            }
        } else if (puzzle.status !== PuzzleStatus.STOPPED) {
            incrementCycle();
            solveNextCell(emptyCells, 0);
        }
    }

    function start() {
        switch (puzzle.status) {
        case PuzzleStatus.READY:
            cycle = 0;
            accumulatedTime = 0;
        case PuzzleStatus.STOPPED:
            break;
        default:
            throw new Error("Puzzle not ready to run! Status: " + puzzle.status);
        }

        startTme = Date.now();
        changePuzzleStatus(PuzzleStatus.RUNNING, {
            cycle : cycle,
            time : getRunningTime()
        });

        setTimeout(function () {
            solveCycle([])
        });
    }

    start();
}

function initializeActions() {
    actionByMessageToSolver[MessageToSolver.START] = function (data) {
        try {
            if (puzzle.status == PuzzleStatus.WAITING || puzzle.status == PuzzleStatus.INVALID) {
                validatePuzzle();
            }
            solve();
        } catch (e) {
            changePuzzleStatus(PuzzleStatus.INVALID, {
                message : e.message,
                cells : (!!e.invalidCells) ? e.invalidCells.map(serializeCell) : null
            });
            console.error(e);
        }
    };
    actionByMessageToSolver[MessageToSolver.CLEAN] = function (data) {
        // clean all filled Cells
        puzzle.cells.forEach(function (cell) {
            changeCellValue(cell, null);
        });
        changePuzzleStatus(PuzzleStatus.WAITING);
    };
    actionByMessageToSolver[MessageToSolver.STOP] = function (data) {
        console.warn("STOP REQUESTED!!!!");
        accumulatedTime = getRunningTime();
        changePuzzleStatus(PuzzleStatus.STOPPED, {
            cycle : cycle,
            time : getRunningTime()
        });
    };
    actionByMessageToSolver[MessageToSolver.FILL_CELL] = function (data) {
        var cell = puzzle.getCell(data.row, data.col);
        changeCellValue(cell, data.value, CellStatus.ORIGINAL);
    };
    actionByMessageToSolver[MessageToSolver.STEP_TIME] = function (data) {
        stepTime = data.value;
        console.debug("STEP_TIME: " + stepTime);
    };
}

// See http://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined
if ('function' === typeof importScripts) {
    importScripts("https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js", "utils.js", "worker-messages.js", "puzzle.js", "cell.js");
    addEventListener('message', function (e) {
        actionByMessageToSolver[e.data.type](e.data);
        //        console.debug(puzzle.cells.toString());
    });
    initializeActions();

    puzzle = new Puzzle();
    // console.info(puzzle);
}
