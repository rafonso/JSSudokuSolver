"use strict";

var actionByMessageToSolver = [];
var puzzle = {};
var stepTime = 0;
var accumulatedTime;
var startTme;
var cycle;
var stopRequested = false;

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

    var message = {
        type: MessageFromSolver.PUZZLE_STATUS,
        status: puzzle.status
    };
    for(var key in extras) {
        message[key] = extras[key];
    }

    postMessage(message);
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
                    throw _.extend(new Error(description + " " + pos + ". Repeated value: " + value), { invalidCells: cells });
                } else {
                    found[value] = true;
                }
            }
        });
    }

    function val(func, description) {
        _.range(1, 10).forEach(function(i) {
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

    function getValues(func, pos) {
        return func(pos).filter(function(c) {
            return c.filled;
        }).map(function(c) {
            return c.value;
        });
    }

    function solveCell(cell) {

        function pause() {
            var t0 = Date.now();
            while((Date.now() - t0) < stepTime) {
                _.noop();
            }
        }
        
        if(puzzle.status === PuzzleStatus.STOPPED) {
            return;
        }
        
        changeCellStatus(cell, CellStatus.EVALUATING);

        
        // Here I compare with other cells
        var diff = _.difference(_.range(1, 10), getValues(puzzle.getCellsRow, cell.row));
        diff = _.difference(diff, getValues(puzzle.getCellsCol, cell.col));
        diff = _.difference(diff, getValues(puzzle.getCellsSector, cell.sector));

        if (diff.length === 0) {
            throw _.extend(new Error("Alghoritm error: Cell with no values remaining."), { invalidCells: [cell] });
        } else if (diff.length == 1) {
            changeCellValue(cell, diff[0], CellStatus.FILLED);
            // NEXT CELL
        } else {
            changeCellStatus(cell, null);
            // NEXT CELL
        }
        
        pause();
    }

    function solveCicle() {
        cycle ++;
        var cellsToSolve = puzzle.cells.filter(isEmptyCell);
        var quantCellsToSolve = cellsToSolve.length;
        
        cellsToSolve.forEach(solveCell);
        
        var quantNotSolvedCells = puzzle.cells.filter(isEmptyCell).length;

        if(quantNotSolvedCells === 0) {
            changePuzzleStatus(PuzzleStatus.SOLVED, { cycle: cycle, time: getRunningTime() });
        } else if ((quantCellsToSolve === quantNotSolvedCells) && (puzzle.status !== PuzzleStatus.STOPPED)) {
            throw new Error("Guesses not yet implemented!");
        } else if(puzzle.status !== PuzzleStatus.STOPPED) {
            setTimeout(solveCicle);
        }
    }


    function solveCell1(emptyCells, pos) {
        if(pos >= emptyCells.length) {
            setTimeout(function() {
                solveCycle1(emptyCells);
            });
        }

        var cell = emptyCells[pos];

        changeCellStatus(cell, CellStatus.EVALUATING);
        
        // Here I compare with other cells
        var diff = _.difference(_.range(1, 10), getValues(puzzle.getCellsRow, cell.row));
        diff = _.difference(diff, getValues(puzzle.getCellsCol, cell.col));
        diff = _.difference(diff, getValues(puzzle.getCellsSector, cell.sector));

        if (diff.length === 0) {
            throw _.extend(new Error("Alghoritm error: Cell with no values remaining."), { invalidCells: [cell] });
        } 

        else if (diff.length == 1) {
            changeCellValue(cell, diff[0], CellStatus.FILLED);
        } else {
            changeCellStatus(cell, null);
        }
        setTimeout(function() {
            solveCell1(emptyCells, pos + 1);
        }, stepTime);
    }

    function solveCicle1(priorEmptyCells) {
        var emptyCells = puzzle.cells.filter(isEmptyCell);
        if(emptyCells.length === 0) {
            changePuzzleStatus(PuzzleStatus.SOLVED, { cycle: cycle, time: getRunningTime() });
        } else if(emptyCells.length === priorEmptyCells.length) {
            throw new Error("Guesses not yet implemented!");
        } else if(puzzle.status !== PuzzleStatus.STOPPED) {
            cycle ++;
            solveCell1(emptyCells, 0);
        }
    }

    if (puzzle.status !== PuzzleStatus.READY) {
        throw new Error("Puzzle not ready to run! Status: " + puzzle.status);
    }
    
    cycle = 0;
    accumulatedTime = 0;
    startTme = Date.now();
    changePuzzleStatus(PuzzleStatus.RUNNING, {cycle: cycle, time: getRunningTime()});
    
    setTimeout(solveCicle);
}


function initializeActions() {
    actionByMessageToSolver[MessageToSolver.START] = function(data) {
        try {
            validatePuzzle();
            solve();
        } catch(e) {
            changePuzzleStatus(PuzzleStatus.INVALID, {
                message: e.message,
                cells: (!!e.invalidCells)? e.invalidCells.map(function(c) { return {col: c.col, row: c.row}; }): null
            });
            console.error(e);
        }
    };
    actionByMessageToSolver[MessageToSolver.CLEAN] = function(data) {
        // clean all filled Cells
        puzzle.cells.forEach(function(cell) {changeCellValue(cell, null); });
        changePuzzleStatus(PuzzleStatus.WAITING);
    };
    actionByMessageToSolver[MessageToSolver.STOP] = function(data) {
        console.warn("STOP REQUESTED!!!!");
        accumulatedTime = getRunningTime();
        changePuzzleStatus(PuzzleStatus.STOPPED, {cycle: cycle, time: getRunningTime()});
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

// See http://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined
if ('function' === typeof importScripts) {
    importScripts("underscore.js", "utils.js", "worker-messages.js", "puzzle.js", "cell.js");
    addEventListener('message', function(e) {
        actionByMessageToSolver[e.data.type](e.data);
//        console.debug(puzzle.cells.toString());
    });
    initializeActions();
    
    puzzle = new Puzzle();
    console.info(puzzle);
}
