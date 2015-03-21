var MessageToSolver = {
    FILL_CELL: "fillCell",
    START:     "start",
    CLEAN:     "clean", 
    STOP:      "stop",
    STEP_TIME: "stepTime"
};

var MessageFomSolver = {
    INVALID_SOLVER: "puzzleInvalid",
    PUZZLE_STATUS:  "puzzleStatus",
    CELL_STATUS:    "cellStatus", 
    CELL_VALUE:     "cellValue", 
    ERROR:          "error"
};

var PuzzleStatus = {
    WAITING: "waiting",
    VALIDATING: "validating",
    READY: "ready",
    INVALID: "invalid",
    RUNNING: "running",
    STOPPED: "stopped",
    SOLVED: "solved",
}
