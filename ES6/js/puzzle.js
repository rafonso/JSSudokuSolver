"use strict";

function _get (p, func, pos, excludeCell)  {
    let predicate = function (c) {
        return c[func] === pos;
    };
    let excluder = (!!excludeCell) ? function (c) {
        return !excludeCell.sameCell(c);
    } : function () {
        return true;
    };

    return p.cells.filter(predicate).filter(excluder);
}



// cls = this.cells;
/**
 * Represents a Puzzle, with all cells.
 */
class Puzzle {

    // PUBLIC PROPERTIES
    
    constructor() {
        this.status = PuzzleStatus.WAITING;
        
        this.cells = [];
        for (let row = 1; row <= 9; row++) {
            for (let col = 1; col <= 9; col++) {
                this.cells.push(new Cell(row, col));
            }
        }
    }
    
    changeStatus (newStatus) {

        function changeCellStatus (cellStatus) {
            return (c) => {
                c.cellStatus = cellStatus;
            };
        }

        let oldStatus = status;
        status = newStatus;

        console.debug(getFormattedHour() + "STATUS: " + oldStatus + " -> "
                + newStatus);

        puzzleElement.changePuzzleStatus(oldStatus, newStatus);
        cells.forEach((c) => {
            c.puzzleStatus = newStatus;
        });
        switch (newStatus) {
        case PuzzleStatus.RUNNING:
            cells.filter(c => c.filled
            ).forEach(changeCellStatus(CellStatus.ORIGINAL));
            break;
        case PuzzleStatus.WAITING:
            cells.forEach( (c) => {
                c.value = null;
            });
            cells.forEach(changeCellStatus(CellStatus.IDLE));
            break;
        default :
            cells.forEach(changeCellStatus(CellStatus.IDLE));
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
    getCellsRow(row, excludeCell) {
        return _get(this, "row", row, excludeCell);
    }

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
    getCellsCol(col, excludeCell) {
        return _get(this, "col", col, excludeCell);
    }

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
    getCellsSector(sec, excludeCell) {
        return _get(this, "sector", sec, excludeCell);
    }

    getCell(row, col) {
        return _.find(this.cells, (c) => ((c.row === row) && (c.col === col)));
    }

    toString() {
        return "Puzzle[status: " + this.status + ", cells: " + this.cells + "]";
    }

}

