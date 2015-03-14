var CellStatus = {
    IDLE: "idle",
    ORIGINAL: "original",
    FILLED: "filled",
    EVALUATING: "evaluating",
    GUESSING: "guessing",
    ERROR: "error",
};

/**
 *
 */
function Cell(input) {

    var pos = Cell.getCellPos(input);
    var row = pos.row;
    var col = pos.col;
    var sector =
        ((row > 6) ? 6 : ((row > 3) ? 3 : 0)) +
        ((col > 6) ? 3 : ((col > 3) ? 2 : 1));
    var puzzleStatus = PuzzleStatus.WAITING;
    var cellStatus = CellStatus.IDLE;
    var element = $(input);

    element.addClass(puzzleStatus).addClass(cellStatus);
    input.changeClass = changeClass;

    return {
        get row() {
            return row;
        },
        get col() {
            return col;
        },
        get sector() {
            return sector;
        },
        get puzzleStatus() {
            return puzzleStatus;
        },
        set puzzleStatus(newStatus) {
            var oldStatus = puzzleStatus;
            puzzleStatus = newStatus;

            input.changeClass(oldStatus, newStatus);
        },
        get cellStatus() {
            return cellStatus;
        },
        set cellStatus(newStatus) {
            var oldStatus = puzzleStatus;
            cellStatus = newStatus;

            input.changeClass(oldStatus, newStatus);
        },
        get value() {
            return parseInt(element.val());
        },
        set value(v) {
            element.val((!!v) ? v : "");
        },
        get element() {
            return element;
        },
        get filled() {
            return !!this.value;
        },
        /**
         * Verifies if a Cell is in the same Row and Column. i.e. if this this the same Cell.
         *
         * @param c Cell to be evaluated
         * @return true if c is in the same Row and Column
         */
        sameCell: function(c) {
            return (this.row === c.row) &&
                (this.col === c.col);
        },
        toString: function() {
            return "[" + this.row + ", " + this.col + ", " + this.sector + ", " + (this.filled ? this.value : "-") + "]";
        }

    }
}

Cell.getCellPos = function(element) {
    var pos = /^cell(\d)(\d)$/.exec(element.id);
    return {
        row: parseInt(pos[1]),
        col: parseInt(pos[2])
    };
}

Object.freeze(Cell);
