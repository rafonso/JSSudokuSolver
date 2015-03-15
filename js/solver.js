"use strict";

function Solver(_puzzle) {

    var stepTime = 0;
    var starTime = 0;
    var cycle = 0;

    // PRIVATE METHODS - BEGIN

    function validate(cells, pos, description) {
        // The found array has 10 positions to not always subtract 1. The 0th position is simply not used.
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

        // if (quantCellsToSolve == quantNotSolvedCells) {
        //     throw new Error("Guesses not implemented yet!");
        // }

        return quantNotSolvedCells == 0;
    }

    // PRIVATE METHODS - END

    return {
        get puzzle() {
            return _puzzle;
        },
        get stepTime() {
            return stepTime;
        },
        set stepTime(value) {
            stepTime = value;
        },
        get starTime() {
            return starTime;
        },
        validatePuzzle: function() {
            this.puzzle.status = PuzzleStatus.VALIDATING;

            val(this.puzzle.getCellsRow, "Row");
            val(this.puzzle.getCellsCol, "Column");
            val(this.puzzle.getCellsSector, "Sector");

            this.puzzle.status = PuzzleStatus.READY;
        },
        solve: function() {
            this.puzzle.status = PuzzleStatus.RUNNING;
            starTime = Date.now();
            cycle = 1;

            var allCellsFilled = false;
            while (!allCellsFilled && this.puzzle.status != PuzzleStatus.STOPPED) {
                console.debug(getFormattedHour() + "Cycle " + cycle);
                allCellsFilled = solveCicle();
                cycle++;
                if (cycle > 10) {
                    break;
                }
                console.debug(" ");
            }


            // All Cells become readonly
            // _.each(_puzzle.cells, function(c) {
            //    c.getElement().prop('readonly', true);
            // });

            this.puzzle.status = PuzzleStatus.SOLVED;
        },

    };
}
