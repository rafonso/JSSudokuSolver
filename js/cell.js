"use strict";

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
    var value = null;
    var element = $(input);

    element.addClass(puzzleStatus).addClass(cellStatus);

    // PUBLIC PROPERTIES

    Object.defineProperty(this, "row", {
        get: function() {
            return row;
        }
    });

    Object.defineProperty(this, "col", {
        get: function() {
            return col;
        }
    });

    Object.defineProperty(this, "sector", {
        get: function() {
            return sector;
        }
    });

    Object.defineProperty(this, "val", {
        configurable: true,
        get: function() {
            return value;
        },
        set: function(v) {
            var old = value;
            value = v;
            // input.changePuzzleStatus(old, v, element);
        }
    });

    Object.defineProperty(this, "puzzleStatus", {
        configurable: true,
        get: function() {
            return puzzleStatus;
        },
        set: function(newStatus) {
            var oldStatus = puzzleStatus;
            puzzleStatus = newStatus;
            input.changePuzzleStatus(oldStatus, newStatus, element);
        }
    });

    Object.defineProperty(this, "cellStatus", {
        configurable: true,
        get: function() {
            return cellStatus;
        },
        set: function(newStatus) {
            var oldStatus = cellStatus;
            cellStatus = newStatus;

            input.changePuzzleStatus(oldStatus, newStatus, element);
        }
    });

    Object.defineProperty(this, "value", {
        configurable: true,
        get: function() {
            return parseInt(element.val());
        },
        set: function(v) {
            element.val((!!v) ? v : "");
        }
    });

    Object.defineProperty(this, "element", {
        get: function() {
            return element;
        }
    });

    Object.defineProperty(this, "filled", {
        get: function() {
            return !!this.value;
        }
    });

    // PUBLIC METHODS

    /**
     * Verifies if a Cell is in the same Row and Column. i.e. if this this the same Cell.
     *
     * @param c Cell to be evaluated
     * @return true if c is in the same Row and Column
     */
    this.sameCell = function(c) {
        return (this.row === c.row) &&
            (this.col === c.col);
    }

    this.toString = function() {
        return "[" + this.row + ", " + this.col + ", " + this.sector + ", " + (this.filled ? this.value : "-") + "]";
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
