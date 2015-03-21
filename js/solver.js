"use strict";

var actionByMessageToSolver = [];

// See http://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined
if ('function' === typeof importScripts) {
    importScripts("worker-messages.js", "underscore.js");
    addEventListener('message', function(e) {
        actionByMessageToSolver[e.data.type](e.data);
    });
    initializeActions();
}

function initializeActions() {
    actionByMessageToSolver[MessageToSolver.START] = function(data) {
        // Validate
        // Run Puzzle
        postMessage({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: PuzzleStatus.RUNNING,
            time: Date.now()
        });
    };
    actionByMessageToSolver[MessageToSolver.CLEAN] = function(data) {
        // clean all filled Cells
        postMessage({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: PuzzleStatus.WAITING,
            time: Date.now()
        });
    };
    actionByMessageToSolver[MessageToSolver.STOP] = function(data) {
        postMessage({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: PuzzleStatus.STOPPED,
            time: Date.now()
        });
    };
    actionByMessageToSolver[MessageToSolver.FILL_CELL] = function(data) {
        // Fill Cell Value        
        console.debug("FILL_CELL: " + objectToString(data));
        postMessage({
            type: MessageFromSolver.CELL_STATUS,
            status: (!!data.value)? CellStatus.ORIGINAL: null,
            row: data.row,
            col: data.col,
            value: data.value
        });
    };
    actionByMessageToSolver[MessageToSolver.STEP_TIME] = function(data) {
        console.debug("STEP_TIME: " + data.value);
    };
}


function Solver(_puzzle) {

    var stepTime = 0;
    var starTime = 0;
    var cycle = 0;

    // PRIVATE METHODS - BEGIN

    function validate(cells, pos, description) {
        // The found array has 10 positions to avoid always subtract 1. The 0th position is simply not used.
        var found = [false, false, false, false, false, false, false, false, false, false];
        cells.forEach(function(cell) {
            if (cell.filled) {
                var value = cell.value;
                if (found[value]) {
                    _puzzle.status = PuzzleStatus.INVALID;
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

    function isEmptyCell(c) {
        return !c.filled;
    }

    function solveCell(cell) {

        function getValues(func, pos) {
            return func(pos).filter(function(c) {
                return c.filled;
            }).map(function(c) {
                return c.value;
            });
        }

        console.debug(getFormattedHour() + "\tEvaluating cell " + cell);
        cell.cellStatus = CellStatus.EVALUATING;

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
            cell.value = diff[0];
            cell.cellStatus = CellStatus.FILLED;
        } else {
            cell.cellStatus = null;
        }

        if (stepTime > 0) {
            setTimeout(_.noop, stepTime);
        }
    }

    function solveCicle() {
        var cellsToSolve = _puzzle.cells.filter(isEmptyCell);
        var quantCellsToSolve = cellsToSolve.length;
        cellsToSolve.forEach(solveCell);
        var quantNotSolvedCells = _puzzle.cells.filter(isEmptyCell).length;

        if (quantCellsToSolve == quantNotSolvedCells) {
            puzzle.status = PuzzleStatus.INVALID;
            throw new Error("Guesses not implemented yet!");
        }

        return quantNotSolvedCells == 0;
    }

    // PRIVATE METHODS - END

    // PUBLIC PROPERTIES

    Object.defineProperty(this, "puzzle", {
        get: function() {
            return _puzzle;
        }
    });

    Object.defineProperty(this, "stepTime", {
        configurable: true,
        get: function() {
            return stepTime;
        },
        set: function(value) {
            var stepTime = value;
        }
    });

    Object.defineProperty(this, "starTime", {
        get: function() {
            return starTime;
        }
    });

    Object.defineProperty(this, "cycle", {
        get: function() {
            return cycle;
        }
    });

    // PUBLIC METHODS

    this.validatePuzzle = function() {
        this.puzzle.status = PuzzleStatus.VALIDATING;

        val(this.puzzle.getCellsRow, "Row");
        val(this.puzzle.getCellsCol, "Column");
        val(this.puzzle.getCellsSector, "Sector");

        this.puzzle.status = PuzzleStatus.READY;
    }

    this.solve = function() {
        this.puzzle.status = PuzzleStatus.RUNNING;
        starTime = Date.now();
        cycle = 1;

        var allCellsFilled = false;
        while (!allCellsFilled && this.puzzle.status != PuzzleStatus.STOPPED) {
            console.debug(getFormattedHour() + "Cycle " + cycle);
            allCellsFilled = solveCicle();
            cycle++;
            console.debug(" ");
        }

        this.puzzle.status = PuzzleStatus.SOLVED;
    }

}
