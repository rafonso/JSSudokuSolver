var PuzzleStatus = {
    WAITING: "waiting",
    VALIDATING: "validating",
    READY: "ready",
    INVALID: "invalid",
    RUNNING: "running",
    STOPPED: "stopped",
    SOLVED: "solved",
}

function Puzzle(puzzleElement) {

    // PRIVATE ATTRIBUTES

    var status = PuzzleStatus.WAITING;

    var cells = puzzleElement.children().children("input").toArray().map(function(input) {
        return Cell(input);
    });

    puzzleElement.changePuzzleStatus = changePuzzleStatus;

    // PRIVATE METHODS

    function get(func, pos, excludeCell) {
        var predicate = function(c) {
            return c[func] === pos;
        };
        var excluder = (!!excludeCell) ?
            function(c) {
                return !excludeCell.sameCell(c);
            } : function() {
                return true;
            }

        return cells.filter(predicate).filter(excluder);
    }

    function changeStatus(newStatus) {

        function changeCellStatus(cellStatus) {
            return function(c) {
                c.cellStatus = cellStatus;
            }
        }

        var oldStatus = status;
        status = newStatus;

        console.debug(getFormattedHour() + "STATUS: " + oldStatus + " -> " + newStatus);

        puzzleElement.changePuzzleStatus(oldStatus, newStatus);
        cells.forEach(function(c) {
            c.puzzleStatus = newStatus;
        });
        switch (newStatus) {
            case PuzzleStatus.RUNNING:
                cells.filter(function(c) {
                    return c.filled;
                }).forEach(changeCellStatus(CellStatus.ORIGINAL));
                break;
            case PuzzleStatus.WAITING:
                cells.forEach(function(c) {
                    c.value = null;
                });
                cells.forEach(changeCellStatus(CellStatus.IDLE));
                break;
            default:
                cells.forEach(changeCellStatus(CellStatus.IDLE));
        }
    }

    return {
        get cells() {
            return cells;
        },
        get status() {
            return status;
        },
        set status(newStatus) {
            if (!!newStatus) {
                changeStatus(newStatus);
            }
        },
        /**
         * Returns the Cells who are in determinated Row. It is possible exclude a Cell which (presumively) is in this Row.
         *
         * @param row solicited Row
         * @param excludeCell Cell to be excluded in result.
         * @return Cells which are in the solicitated Row. If excludeCell is defined, this will not be present in result.
         */
        getCellsRow: function(row, excludeCell) {
            return get("row", row, excludeCell);
        },
        /**
         * Returns the Cells who are in determinated Column. It is possible exclude a Cell which (presumively) is in this Column.
         *
         * @param col solicited Column
         * @param excludeCell Cell to be excluded in result.
         * @return Cells which are in the solicitated Column. If excludeCell is defined, this will not be present in result.
         */
        getCellsCol: function(col, excludeCell) {
            return get("col", col, excludeCell);
        },
        /**
         * Returns the Cells who are in determinated Sector. It is possible exclude a Cell which (presumively) is in this Sector.
         *
         * @param sector solicited Sector
         * @param excludeCell Cell to be excluded in result.
         * @return Cells which are in the solicitated Sector. If excludeCell is defined, this will not be present in result.
         */
        getCellsSector: function(sec, excludeCell) {
            return get("sector", sec, excludeCell);
        },
        toString: function() {
            return "Puzzle[status: " + this.status + ", cells: " + this.cells + "]";
        }
    }

}
