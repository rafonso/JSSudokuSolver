"use strict";

var actionByMessageToSolver = [];
var puzzle = {};
var stepTime = 0;
var accumulatedTime;
var startTme;
var cycle;

// See http://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined
if ('function' === typeof importScripts) {
    importScripts("worker-messages.js", "underscore.js", "puzzle.js", "cell.js");
    addEventListener('message', function(e) {
        actionByMessageToSolver[e.data.type](e.data);
//        console.debug(puzzle.cells.toString());
    });
    initializeActions();
    
    puzzle = new Puzzle();
    console.info(puzzle);
}

function getRunningTime() {
    return (Date.now() - startTme) + accumulatedTime;
}

function isEmptyCell(c) {
    return !c.filled;
}

function changeCellStatus(cell, status) {
    if (cell.status === status) {
        return;
    }
    
    cell.status = status;

    postMessage({
        type: MessageFromSolver.CELL_STATUS,
        status: cell.status,
        row: cell.row,
        col: cell.col,
        value: cell.value,
        time: getRunningTime(),
        cycle: cycle
    });
}

function changeCellValue(cell, value, status) {
    if (cell.value === value) {
        return;
    }

    if (!!value) {
        cell.value = value;
        cell.status = status;
    } else {
        cell.value = null;
        cell.status = null;
    }

    postMessage({
        type: MessageFromSolver.CELL_STATUS,
        status: cell.status,
        row: cell.row,
        col: cell.col,
        value: cell.value,
        time: getRunningTime(),
        cycle: cycle
    });
}

function validatePuzzle() {
    
    function validate(cells, pos, description) {
        // The found array has 10 positions to avoid always subtract 1. The 0th position is simply not used.
        var found = [false, false, false, false, false, false, false, false, false, false];
        cells.forEach(function(cell) {
            if (cell.filled) {
                var value = cell.value;
                if (found[value]) {
                    puzzle.status = PuzzleStatus.INVALID;
                    throw {
                        msg: description + " " + pos + ". Repeated value: " + value,
                        invalidCells: cells
                    }
                } else {
                    found[value] = true;
                }
            }
        });
    }

    function val(func, description) {
        _.range(1, 10).forEach(function(i) {
            validate(func(i), i, description);
        })
    }

    puzzle.status = PuzzleStatus.VALIDATING;
    
    if (_.every(puzzle.cells, isEmptyCell)) {
        throw {
            msg: "All Cells are empty!"
        }
    }

    val(puzzle.getCellsRow, "Row");
    val(puzzle.getCellsCol, "Column");
    val(puzzle.getCellsSector, "Sector");

    puzzle.status = PuzzleStatus.READY;
}

function solve() {

    function solveCell(cell) {

        function getValues(func, pos) {
            return func(pos).filter(function(c) {
                return c.filled;
            }).map(function(c) {
                return c.value;
            });
        }

        function pause() {
            var t0 = Date.now();
            while((Date.now() - t0) < stepTime) {
                _.noop();
            }
        }
        
        if(puzzle.status === PuzzleStatus.STOPPED) {
            return;
        }
        
//        console.debug(getFormattedHour() + "\tEvaluating cell " + cell);
        changeCellStatus(cell, CellStatus.EVALUATING);

        
        // Here I compare with other cells
        var diff = _.difference(_.range(1, 10), getValues(puzzle.getCellsRow, cell.row));
        diff = _.difference(diff, getValues(puzzle.getCellsCol, cell.col));
        diff = _.difference(diff, getValues(puzzle.getCellsSector, cell.sector));

        if (diff.length == 0) {
            throw {
                msg: "Alghoritm error: Cell with no values remaining.",
                invalidCells: [cell]
            };
        } else if (diff.length == 1) {
            changeCellValue(cell, diff[0], CellStatus.FILLED);
        } else {
            changeCellStatus(cell, null);
        }
        
        // console.debug(getFormattedHour() + "STEP TIME " + stepTime);
        pause();

         // setTimeout(revertStatus, 100);
    }

    function solveCicle() {
        var cellsToSolve = puzzle.cells.filter(isEmptyCell);
        var quantCellsToSolve = cellsToSolve.length;
        cellsToSolve.forEach(solveCell);
        
//        return false;
        
        var quantNotSolvedCells = puzzle.cells.filter(isEmptyCell).length;

        if (quantCellsToSolve == quantNotSolvedCells) {
            puzzle.status = PuzzleStatus.INVALID;
            throw new Error("Guesses not implemented yet!");
        }

        return quantNotSolvedCells == 0;
        
    }
    
    if (puzzle.status === PuzzleStatus.READY) {
        cycle = 0;
        accumulatedTime = 0;
        startTme = Date.now();
    }
    puzzle.status = PuzzleStatus.RUNNING;
    
    postMessage({
        type: MessageFromSolver.PUZZLE_STATUS,
        status: puzzle.status,
        time: getRunningTime(),
        cycle: cycle
    });

    var allCellsFilled = false;
    
    while (!allCellsFilled && (puzzle.status != PuzzleStatus.STOPPED)) {
        cycle++;
        // console.debug(getFormattedHour() + "Cycle " + cycle);
        allCellsFilled = solveCicle();
        // console.debug(" ");
    }
    
    if (puzzle.status !== PuzzleStatus.STOPPED) {
        puzzle.status = PuzzleStatus.SOLVED;
        postMessage({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: puzzle.status,
            time: getRunningTime(),
            cycle: cycle
        });
    }
}


function initializeActions() {
    actionByMessageToSolver[MessageToSolver.START] = function(data) {
        try {
            validatePuzzle();
            solve();
        } catch(e) {
            if (!!e.msg) {
                postMessage({
                    type: MessageFromSolver.PUZZLE_STATUS,
                    status: PuzzleStatus.INVALID,
                    message: e.msg,
                    cells: (!!e.invalidCells)? e.invalidCells.map(function(c) { return {col: c.col, row: c.row}; }): null
                });
            } else {
                throw e;
            }
        }
    };
    actionByMessageToSolver[MessageToSolver.CLEAN] = function(data) {
        // clean all filled Cells
        puzzle.cells.forEach(function(cell) {changeCellValue(cell, null); });
//        accumulatedTime = 0;
//        startTme = null;
        postMessage({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: PuzzleStatus.WAITING
        });
    };
    actionByMessageToSolver[MessageToSolver.STOP] = function(data) {
        puzzle.status = PuzzleStatus.STOPPED;
        accumulatedTime = getRunningTime();
        postMessage({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: PuzzleStatus.STOPPED,
            time: accumulatedTime
        });
    };
    actionByMessageToSolver[MessageToSolver.FILL_CELL] = function(data) {
        var cell = puzzle.getCell(data.row, data.col);
        changeCellValue(cell, data.value, CellStatus.ORIGINAL);
    };
    actionByMessageToSolver[MessageToSolver.STEP_TIME] = function(data) {
        stepTime = data.value;
        console.debug("STEP_TIME: " + stepTime);
    };
}
