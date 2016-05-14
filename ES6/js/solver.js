// SUDOKU SOLVER METHODS
"use strict";

let actionByMessageToSolver = [];
let puzzle = {};
let stepTime = 0;
let accumulatedTime;
let startTme;
let cycle;

function serializeCell (c) {
    return {
        col: c.col,
        row: c.row
    };
}

function getRunningTime () {
    return (Date.now() - startTme) + accumulatedTime;
}

function isEmptyCell (c) {
    return !c.filled();
}

function changePuzzleStatus (status, extras) {
    if (puzzle.status === status) {
        return;
    }

    puzzle.status = status;

    let message = _.extend({
        type: MessageFromSolver.PUZZLE_STATUS,
        status: puzzle.status
    }, extras);

    log(() => `changePuzzleStatus(): ${JSON.stringify(message)}`, FINER);
    postMessage(message);
}

function changeCellStatus (cell, status) {
    if (!!!cell) {
        console.error("Empty cell!");
    }
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

function changeCellValue (cell, value, status, tabs) {
    if (cell.value === value) {
        return;
    }

    cell.value = (!!value) ? value : null;
    cell.status = (!!value) ? status : null;

    if (status == CellStatus.FILLED || status == CellStatus.GUESSING) {
        let tbs = "";
        for (let i = 0; i < tabs; i++) {
            tbs += "\t";
        }
        log(() => (tbs + cell.toString()));
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

function validatePuzzle () {

    function validate (cells, pos, description) {
        // The found array has 10 positions to avoid always subtract 1. The 0th
        // position is simply not used.
        let found = [ false, false, false, false, false, false, false, false,
                false, false ];
        cells.forEach(cell => {
            if (cell.filled()) {
                let value = cell.value;
                if (found[value]) {
                    throw _.extend(new Error(`${description} ${pos}. Repeated value: ${value}`), {
                        invalidCells: cells,
                        isSolverError: true
                    });
                } else {
                    found[value] = true;
                }
            }
        });
    }

    function val (func, description) {
        _.range(1, 10).forEach(i => validate(puzzle[func](i), i, description));
    }

    changePuzzleStatus(PuzzleStatus.VALIDATING);

    if (_.every(puzzle.cells, isEmptyCell)) {
        throw _.extend(new Error("All Cells are empty!"), {
            isSolverError: true
        });
    }

    val("getCellsRow", "Row");
    val("getCellsCol", "Column");
    val("getCellsSector", "Sector");

    changePuzzleStatus(PuzzleStatus.READY);
}

function solve () {

    let memento = [];

    // Here I compare with other cells
    function getPendentValues (cell) {

        /**
         * Extract the values from filled cells.
         * 
         * @param Function
         *            which extract the Cells from the puzzle
         * @param
         */
        function getValues (func, pos) {
            return puzzle[func](pos).filter(c => c.filled()).map(c => c.value);
        }

        let diff = _.difference(_.range(1, 10), getValues("getCellsRow", cell.row));
        diff = _.difference(diff, getValues("getCellsCol", cell.col));
        diff = _.difference(diff, getValues("getCellsSector", cell.sector));

        return diff;
    }

    function solveNextCell (emptyCells, pos) {
        if (puzzle.status === PuzzleStatus.STOPPED) {
            return;
        } else if (pos >= emptyCells.length) {
            setTimeout(() => solveCycle(emptyCells));
        } else {
            let cell = emptyCells[pos];
            log(() => cell.toString());
            changeCellStatus(cell, CellStatus.EVALUATING);
            setTimeout(() => solveCell(cell, emptyCells, pos), stepTime);
        }
    }

    function solveCell (cell, emptyCells, pos) {
        let diff = getPendentValues(cell);

        if (diff.length === 0) {
            if (memento.length == 0) {
                changePuzzleStatus(
                        PuzzleStatus.INVALID,
                        {
                            message: "Cell with no values remaining. Probably the puzzle was mistaken written.",
                            cells: serializeCell(cell)
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

    function solveCycle (priorEmptyCells) {

        function incrementCycle () {
            cycle++;
            log(() => `CYCLE ${cycle}`);
        }

        function tryGuess (pendents, guessCell, pendentValues) {
            log(() => `PENDENT CELL: ${guessCell.toString()} - ${pendentValues}`);
            let cell = puzzle.getCell(guessCell.row, guessCell.col);
            incrementCycle();
            _.rest(pendentValues).reverse().forEach(v =>
                memento.push({
                    cell: guessCell,
                    pendentValue: v,
                    cells: pendents
                })
            );
            changeCellValue(cell, pendentValues[0], CellStatus.GUESSING, memento.length);
            log(() => memento);
            solveNextCell(puzzle.cells.filter(isEmptyCell), 0);
        }

        function undoGuess () {
            let memo = memento.pop();
            memo.cells.forEach(cell => {
                let puzzleCell = puzzle.getCell(cell.row, cell.col);
                changeCellValue(puzzleCell, cell.value, cell.status);
            });
            incrementCycle();
            changeCellValue(puzzle.getCell(memo.cell.row, memo.cell.col),
                    memo.pendentValue, CellStatus.GUESSING, memento.length);
            log(() => memento);
            solveNextCell(puzzle.cells.filter(isEmptyCell), 0);
        }

        log(() => `solveCycle(${priorEmptyCells})`)
        let emptyCells = puzzle.cells.filter(isEmptyCell);
        if (emptyCells.length === 0) {
            changePuzzleStatus(PuzzleStatus.SOLVED, {
                cycle: cycle,
                time: getRunningTime()
            });
        } else if (emptyCells.length === priorEmptyCells.length) {
            let pendentCells = puzzle.cells.filter(isEmptyCell).map(_.clone);
            // Selects the first cell with less possible values among the empty
            // ones.
            let emptyCell = pendentCells.reduce((prev, curr) => {
                let prevValues = getPendentValues(prev);
                let currValues = getPendentValues(curr);
                return (prevValues.length <= currValues.length) ? prev : curr;
            });
            let pendentValues = getPendentValues(emptyCell);
            if (pendentValues.length) {
                tryGuess(pendentCells, emptyCell, pendentValues);
            } else if (memento.length) {
                undoGuess();
            } else {
                changePuzzleStatus(PuzzleStatus.INVALID, {
                    message: "There is no solution! :"
                });
            }
        } else if (puzzle.status !== PuzzleStatus.STOPPED) {
            incrementCycle();
            solveNextCell(emptyCells, 0);
        }
    }

    function start () {
        switch (puzzle.status) {
        case PuzzleStatus.READY:
            cycle = 0;
            accumulatedTime = 0;
        case PuzzleStatus.STOPPED:
            break;
        default :
            throw _.extend(new Error("Puzzle not ready to run! Status: " + puzzle.status), {
                isSolverError: true
            });
        }

        startTme = Date.now();
        changePuzzleStatus(PuzzleStatus.RUNNING, {
            cycle: cycle,
            time: getRunningTime()
        });

        setTimeout(() => solveCycle([]));
    }

    start();
}

function initializeActions () {

    function cleanCells (whichCells) {
        puzzle.cells.filter(whichCells).forEach(cell => changeCellValue(cell, null));
        changePuzzleStatus(PuzzleStatus.WAITING);
    }

    actionByMessageToSolver[MessageToSolver.START] = data => {
        try {
            if (puzzle.status == PuzzleStatus.WAITING
                    || puzzle.status == PuzzleStatus.INVALID) {
                validatePuzzle();
            }
            solve();
        } catch (e) {
            changePuzzleStatus(PuzzleStatus.INVALID, {
                message: e.message,
                cells: (!!e.invalidCells) ? e.invalidCells.map(serializeCell)
                        : null
            });
            if(!e.isSolverError) {
                console.error(e.stack);
            }
        }
    };
    actionByMessageToSolver[MessageToSolver.CLEAN] = data => {
        // clean all filled Cells
        cleanCells(_.constant(true));
    };
    actionByMessageToSolver[MessageToSolver.STOP] = data => {
        log(() => "STOP REQUESTED!!!!", FINE);
        accumulatedTime = getRunningTime();
        changePuzzleStatus(PuzzleStatus.STOPPED, {
            cycle: cycle,
            time: getRunningTime()
        });
    };
    actionByMessageToSolver[MessageToSolver.FILL_CELL] = data => {
        let cell = puzzle.getCell(data.row, data.col);
        changeCellValue(cell, data.value, CellStatus.ORIGINAL);
    };
    actionByMessageToSolver[MessageToSolver.STEP_TIME] = data => {
        stepTime = data.value;
        log(() => "STEP_TIME: " + stepTime, FINE);
    };
    actionByMessageToSolver[MessageToSolver.RESET] = data => {
        log(() => "RESET PUZZLE", FINE);
        // clean all not ORIGINAL Cells
        cleanCells(cell => cell.status !== CellStatus.ORIGINAL);
    };
}

/*
 * See
 * http://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined
 */
if ('function' === typeof importScripts) {
    importScripts(
            "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js",
            "utils.js", "worker-messages.js", "puzzle.js", "cell.js");
    addEventListener('message', e => {
        actionByMessageToSolver[e.data.type](e.data);
        log(() => puzzle.cells.toString());
    });
    initializeActions();

    puzzle = new Puzzle();
    log(() => puzzle, FINE);
}
