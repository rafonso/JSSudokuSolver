// SUDOKU SOLVER METHODS
"use strict";

let actionByMessageToSolver = new Map();
let puzzle = {};
let stepTime = 0;
let accumulatedTime;
let startTme;
let cycle;
let extrasFromSolver = {};
let tabs = 0;

function getRunningTime () {
    return (Date.now() - startTme) + accumulatedTime;
}

function validatePuzzle () {
    
    function s(c) {
        return {row: c.row, col: c.col};
    }

    function validate (cells, pos, description) {
        let found = [];
        cells.forEach(cell => {
            if (cell.filled) {
                let value = cell.value;
                if (found[value]) {
                    let invalidCells = cells.map(s);
                    throw _.extend(new Error(`${description} ${pos}. Repeated value: ${value}`), {
                        invalidCells,
                        isSolverError: true
                    });
                } else {
                    found[value] = true;
                }
            }
        });
    }

    function val (func, description) {
        _.range(1, 10).forEach(i => validate(puzzle[["getCells" + func]](i), i, description));
    }

    puzzle.status = PuzzleStatus.VALIDATING;

    if (puzzle.cells.every(Cell.isEmptyCell)) {
        throw _.extend(new Error("All Cells are empty!"), {
            isSolverError: true
        });
    }

    val("Row", "Row");
    val("Col", "Column");
    val("Sector", "Sector");

    puzzle.status = PuzzleStatus.READY;
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
            return puzzle[["getCells" + func]](pos).filter(c => c.filled).map(c => c.value);
        }

        let diff = _.difference(_.range(1, 10), getValues("Row", cell.row));
        diff = _.difference(diff, getValues("Col", cell.col));
        diff = _.difference(diff, getValues("Sector", cell.sector));

        return diff;
    }

    function solveNextCell (emptyCells, pos) {
        if (puzzle.status === PuzzleStatus.STOPPED) {
            return;
        } else if (pos >= emptyCells.length) {
            setTimeout(() => solveCycle(emptyCells));
        } else {
            let cell = emptyCells[pos];
            if(DEBUG) console.debug(cell.toString());
            cell.status = CellStatus.EVALUATING;
            setTimeout(() => solveCell(cell, emptyCells, pos), stepTime);
        }
    }

    function solveCell (cell, emptyCells, pos) {
        let diff = getPendentValues(cell);

        if (diff.length === 0) {
            if (memento.length === 0) {
                extrasFromSolver = {
                        message: "Cell with no values remaining. Probably the puzzle was mistaken written.",
                        cells: cell
                };
                puzzle.status = PuzzleStatus.INVALID;
                return;
            } else {
                // Get top Memento ...
            }
        }

        if (diff.length === 1) {
            cell.value = diff[0];
            cell.status = CellStatus.FILLED;
        } else {
            cell.status = null;
        }
        solveNextCell(emptyCells, pos + 1);
    }

    function solveCycle (priorEmptyCells) {

        function incrementCycle () {
            cycle++;
            if(DEBUG) console.debug(`CYCLE ${cycle}`);
        }

        function tryGuess (pendents, guessCell, pendentValues) {
            if(DEBUG) console.debug(`PENDENT CELL: ${guessCell.toString()} - ${pendentValues}`);
            let cell = puzzle.getCell(guessCell.row, guessCell.col);
            incrementCycle();
            _.rest(pendentValues).reverse().forEach(v =>
                memento.push({
                    cell: guessCell,
                    pendentValue: v,
                    cells: pendents
                })
            );
            cell.value = pendentValues[0];
            cell.status = CellStatus.GUESSING;
            if(DEBUG) console.debug(memento);
            solveNextCell(puzzle.cells.filter(Cell.isEmptyCell), 0);
        }

        function undoGuess () {
            let memo = memento.pop();
            memo.cells.forEach(cell => {
                let puzzleCell = puzzle.getCell(cell.row, cell.col);
                puzzleCell.value = cell.value;
                puzzleCell.status = cell.status;
            });
            incrementCycle();
            let guessCell = puzzle.getCell(memo.cell.row, memo.cell.col);
            guessCell.value = memo.pendentValue;
            guessCell.status = CellStatus.GUESSING;
            if(DEBUG) console.debug(memento);
            solveNextCell(puzzle.cells.filter(Cell.isEmptyCell), 0);
        }

        if(DEBUG) console.info(`solveCycle(${priorEmptyCells})`);
        let emptyCells = puzzle.cells.filter(Cell.isEmptyCell);
        if (emptyCells.length === 0) {
            extrasFromSolver = {
                    cycle: cycle,
                    time: getRunningTime()
                };
            puzzle.status = PuzzleStatus.SOLVED;
        } else if (emptyCells.length === priorEmptyCells.length) {
            let pendentCells = puzzle.cells.filter(Cell.isEmptyCell).map(c => c.clone());
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
                extrasFromSolver = {
                        message: "There is no solution! :"
                };
                puzzle.status = PuzzleStatus.INVALID;
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
            break;
        case PuzzleStatus.STOPPED:
            break;
        default :
            throw _.extend(new Error("Puzzle not ready to run! Status: " + puzzle.status), {
                isSolverError: true
            });
        }

        startTme = Date.now();
        extrasFromSolver = {
                cycle: cycle,
                time: getRunningTime()
        }; 
        puzzle.status = PuzzleStatus.RUNNING;

        setTimeout(() => solveCycle([]));
    }

    start();
}

function initializeActions () {

    function cleanCells (whichCells) {
        puzzle.cells.filter(whichCells).forEach(cell => cell.value = null);
        puzzle.status = PuzzleStatus.WAITING;
    }
    

    actionByMessageToSolver
    .set(MessageToSolver.START, ({row, col, value}) => {
        try {
            if (puzzle.status == PuzzleStatus.WAITING ||
                    puzzle.status == PuzzleStatus.INVALID) {
                validatePuzzle();
            }
            solve();
        } catch (e) {
            extrasFromSolver = {
                    message: e.message,
                    cells: (!!e.invalidCells) ? e.invalidCells : null
            };
            puzzle.status = PuzzleStatus.INVALID;
            if(!e.isSolverError) {
                if(DEBUG) console.error(e.stack);
            }
        }
    })
    .set(MessageToSolver.CLEAN, ({row, col, value}) => {
        // clean all filled Cells
        cleanCells(() => (true));
    })
    .set(MessageToSolver.STOP, ({row, col, value}) => {
        if(DEBUG) console.warn("STOP REQUESTED!!!!");
        accumulatedTime = getRunningTime();
        extrasFromSolver = {
                cycle: cycle,
                time: getRunningTime()
        };
        puzzle.status = PuzzleStatus.STOPPED;
    })
    .set(MessageToSolver.FILL_CELL, ({row, col, value}) => {
        let cell = puzzle.getCell(row, col);
        cell.value = value;
        cell.status = CellStatus.ORIGINAL;
    })
    .set(MessageToSolver.STEP_TIME, ({row, col, value}) => {
        stepTime = value;
        if(DEBUG) console.debug("STEP_TIME: " + stepTime);
    })
    .set(MessageToSolver.RESET, ({row, col, value}) => {
        // clean all not ORIGINAL Cells
        if(DEBUG) console.warn("RESET PUZZLE");
        // clean all not ORIGINAL Cells
        cleanCells(cell => cell.status !== CellStatus.ORIGINAL);
    });
}

function puzzleStatusChanged(changes) {
    changes.forEach(ch => {
//        console.debug(ch, ch.object.status);
        postMessage(_.extend({
            type: MessageFromSolver.PUZZLE_STATUS,
            status: ch.object.status
        }, extrasFromSolver));
    });
    extrasFromSolver = null;
}

function cellChanged(changes) {
    changes.forEach(ch => {
        let cell = ch.object;
        let type = ch.name.includes("value")? MessageFromSolver.CELL_VALUE: MessageFromSolver.CELL_STATUS;
//        console.debug(ch, cell[ch.name]);

        if ((type == MessageFromSolver.CELL_STATUS) && 
                ((cell.status == CellStatus.FILLED) || (cell.status == CellStatus.GUESSING))){
            if(DEBUG) console.debug("\t".repeat(tabs) + cell.toString());
        }

        postMessage({
            type,
            status: cell.status,
            row: cell.row,
            col: cell.col,
            value: cell.value,
            time: getRunningTime(),
            cycle
        });
    });
}

function initializeObjects() {
    // Prepare Puzzle & Cells
    Object.observe(puzzle,
            puzzleStatusChanged, 
            ["update"]);
    puzzle.cells.forEach(c => 
    Object.observe(c,
            cellChanged, 
            ["update"])
    );
}

/*
 * See
 * http://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined
 */
if ('function' === typeof importScripts) {
    importScripts(
            "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/object-observe/0.2.6/object-observe-lite.min.js",
            "https://raw.githubusercontent.com/MaxArt2501/array-observe/master/array-observe.min.js",
            "utils.js", "worker-messages.js", "puzzle.js", "cell.js");
    addEventListener('message', e => {
        actionByMessageToSolver.get(e.data.type)(e.data);
        if(DEBUG) console.debug(puzzle.cells.toString());
    });
    initializeActions();

    puzzle = new Puzzle();
    initializeObjects();

    if(DEBUG) console.info(puzzle);
}
