"use strict";

/**
 * Represents a puzzle cell with the values.
 */
function Cell(row, col, value, status) {

    // PUBLIC PROPERTIES

    this.row = row;

    this.col = col;

    this.sector =
        ((row > 6) ? 6 : ((row > 3) ? 3 : 0)) +
    ((col > 6) ? 3 : ((col > 3) ? 2 : 1));

    this.value = (!!value) ? value : null;

    this.status = (!!status) ? status : CellStatus.IDLE;

    Object.defineProperty(this, "filled", {
        get : function () {
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
    this.sameCell = function (c) {
        return (this.row === c.row) &&
        (this.col === c.col);
    };

    this.clone = function () {
        return new Cell(this.row, this.col, this.value, this.status);
    }

    this.toString = function () {
        return "[" + this.row +
        ", " + this.col +
//        ", " + this.sector +
        ", " + (this.filled ? this.value : "-") +
        ", " + ((!!this.status) ? this.status.charAt(0) : "-") +
        "]";
    };

}

Object.freeze(Cell);
