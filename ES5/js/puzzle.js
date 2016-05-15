"use strict";

/**
 * Represents a Puzzle, with all cells.
 */
function Puzzle () {

    // PUBLIC PROPERTIES

    this.status = PuzzleStatus.WAITING;

    this.cells = [];
    for (var row = 1; row <= 9; row++) {
        for (var col = 1; col <= 9; col++) {
            this.cells.push(new Cell(row, col));
        }
    }

    // PRIVATE METHODS

    var cls = this.cells;
    function get (func, pos, excludeCell) {
        var predicate = function (c) {
            return c[func] === pos;
        };
        var excluder = (!!excludeCell) ? function (c) {
            return !excludeCell.sameCell(c);
        } : function () {
            return true;
        };

        return cls.filter(predicate).filter(excluder);
    }

    function changeStatus (newStatus) {

        function changeCellStatus (cellStatus) {
            return function (c) {
                c.cellStatus = cellStatus;
            };
        }

        var oldStatus = status;
        this.status = newStatus;

        console.debug(getFormattedHour() + "STATUS: " + oldStatus + " -> " + 
                newStatus);

        puzzleElement.changePuzzleStatus(oldStatus, newStatus);
        this.cells.forEach(function (c) {
            c.puzzleStatus = newStatus;
        });
        switch (newStatus) {
        case PuzzleStatus.RUNNING:
            this.cells.filter(function (c) {
                return c.filled;
            }).forEach(changeCellStatus(CellStatus.ORIGINAL));
            break;
        case PuzzleStatus.WAITING:
            this.cells.forEach(function (c) {
                c.value = null;
            });
            this.cells.forEach(changeCellStatus(CellStatus.IDLE));
            break;
        default :
            this.cells.forEach(changeCellStatus(CellStatus.IDLE));
        }
    }

    // PUBLIC METHODS

    /**
     * Returns the Cells who are in determinated Row. It is possible exclude a
     * Cell which (presumively) is in this Row.
     * 
     * @param row
     *            solicited Row
     * @param excludeCell
     *            Cell to be excluded in result.
     * @return Cells which are in the solicitated Row. If excludeCell is
     *         defined, this will not be present in result.
     */
    this.getCellsRow = function (row, excludeCell) {
        return get("row", row, excludeCell);
    };

    /**
     * Returns the Cells who are in determinated Column. It is possible exclude
     * a Cell which (presumively) is in this Column.
     * 
     * @param col
     *            solicited Column
     * @param excludeCell
     *            Cell to be excluded in result.
     * @return Cells which are in the solicitated Column. If excludeCell is
     *         defined, this will not be present in result.
     */
    this.getCellsCol = function (col, excludeCell) {
        return get("col", col, excludeCell);
    };

    /**
     * Returns the Cells who are in determinated Sector. It is possible exclude
     * a Cell which (presumively) is in this Sector.
     * 
     * @param sector
     *            solicited Sector
     * @param excludeCell
     *            Cell to be excluded in result.
     * @return Cells which are in the solicitated Sector. If excludeCell is
     *         defined, this will not be present in result.
     */
    this.getCellsSector = function (sec, excludeCell) {
        return get("sector", sec, excludeCell);
    };

    this.getCell = function (row, col) {
        return _.find(this.cells, function (c) {
            return (c.row === row) && (c.col === col);
        });
    };

    this.toString = function () {
        return "Puzzle[status: " + this.status + ", cells: " + this.cells + "]";
    };

}
