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
    ERROR: "error"
};

function getFormattedHour() {

    function format(value, size, end) {
        var string = value.toString();

        while (string.length < size) {
            string = '0' + string;
        }

        return string + end;
    }

    var d = new Date();
    return "[" + format(d.getHours(), 2, ":") + 
    	format(d.getMinutes(), 2, ":") + format(d.getSeconds(), 2, '.') + 
    	format(d.getMilliseconds(), 3, ']') + " ";
}

function objectToString(obj) {
    var str = "{";
    if (!!obj) {
        Object.keys(obj).forEach(function(key, index, array) {
            var value = obj[key];
            str += (key + "=" +
            	((typeof value === "object")? objectToString(value): value) +
            	(index < (array.length - 1)? ", ": "}"));
        });
    } else {
        str += "}";
    }
    return str;
}