var MessageToSolver = {
    FILL_CELL: "fillCell",
    START: "start",
    CLEAN: "clean",
    STOP: "stop",
    STEP_TIME: "stepTime"
};

var MessageFromSolver = {
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
    ERROR: "error",
};

function objectToString(obj) {
    var str = "{";
    
    Object.keys(obj).forEach(function(key, index, array) {
        var value = obj[key];
        str += (key + "="
        + ((typeof value === "object")? objectToString(value): value)
        + (index < (array.length - 1)? ", ": "}"));
    });
    return str;
}