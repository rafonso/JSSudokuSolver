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
    var status = CellStatus.IDLE;
    var element = $(input);

    element.addClass(status);

    function unfocus() {
        $(this).blur();
    }

    function changeStatus(newStatus) {
        var oldStatus = status;
        status = newStatus;

        element.removeClass(oldStatus).addClass(newStatus);

        if (newStatus == PuzzleStatus.RUNNING) {
            element.bind("focus", unfocus);
        }
        if (oldStatus == PuzzleStatus.RUNNING && newStatus != PuzzleStatus.RUNNING) {
            element.unbind("focus", unfocus);
        }
    }

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
            return status;
        },
        set puzzleStatus(s) {
            changeStatus(s);
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
