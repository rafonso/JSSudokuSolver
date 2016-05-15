/*jshint -W079 */
// TYPE OF MESSAGES TO BE EXCHANGED BETWEEN UI AND SOLVER THREADS
"use strict";

let MessageToSolver = {
    FILL_CELL: "fillCell",
    START: "start",
    CLEAN: "clean",
    STOP: "stop",
    RESET: "reset",
    STEP_TIME: "stepTime"
};

let MessageFromSolver = {
    INVALID_SOLVER: "puzzleInvalid",
    PUZZLE_STATUS: "puzzleStatus",
    CELL_STATUS: "cellStatus",
    CELL_VALUE: "cellValue",
    ERROR: "error"
};

var PuzzleStatus = {
    WAITING: "waiting",
    VALIDATING: "validating",
    READY: "ready",
    INVALID: "invalid",
    RUNNING: "running",
    STOPPED: "stopped",
    SOLVED: "solved"
};

var CellStatus = {
    IDLE: "idle",
    ORIGINAL: "original",
    FILLED: "filled",
    EVALUATING: "evaluating",
    GUESSING: "guessing",
    ERROR: "error"
};