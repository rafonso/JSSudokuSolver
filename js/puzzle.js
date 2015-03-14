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

    var _cells = puzzleElement.children().children("input").toArray().map(function(input) {
        return new Cell(input);
    });

    // PRIVATE METHODS

    function init() {

    }

    function get(func, pos, excludeCell) {
        var predicate = function(c) {
            return c[func]() === pos;
        };
        var excluder = (!!excludeCell) ?
            function(c) {
                return !excludeCell.sameCell(c);
            } : function() {
                return true;
            }

        return _cells.filter(predicate).filter(excluder);
    }

    this.cells = _cells;

    /**
     * Returns the Cells who are in determinated Row. It is possible exclude a Cell which (presumively) is in this Row.
     *
     * @param row solicited Row
     * @param excludeCell Cell to be excluded in result.
     * @return Cells which are in the solicitated Row. If excludeCell is defined, this will not be present in result.
     */
    this.getCellsRow = function(row, excludeCell) {
        return get("getRow", row, excludeCell);
    }

    /**
     * Returns the Cells who are in determinated Column. It is possible exclude a Cell which (presumively) is in this Column.
     *
     * @param col solicited Column
     * @param excludeCell Cell to be excluded in result.
     * @return Cells which are in the solicitated Column. If excludeCell is defined, this will not be present in result.
     */
    this.getCellsCol = function(col, excludeCell) {
        return get("getCol", col, excludeCell);
    }

    /**
     * Returns the Cells who are in determinated Sector. It is possible exclude a Cell which (presumively) is in this Sector.
     *
     * @param sector solicited Sector
     * @param excludeCell Cell to be excluded in result.
     * @return Cells which are in the solicitated Sector. If excludeCell is defined, this will not be present in result.
     */
    this.getCellsSector = function(sec, excludeCell) {
        return get("getSector", sec, excludeCell);
    }

    this.getStatus = function() {
        return status;
    }

    this.setStatus = function(newStatus) {
        if (!!newStatus) {
            var oldStatus = status;
            status = newStatus;

            console.debug("STATUS: " + oldStatus + " -> " + newStatus);

            puzzleElement.removeClass(oldStatus).addClass(newStatus);
            this.cells.forEach(function(c) {
                c.setStatus(newStatus);
            });
        }
    }

}

Object.freeze(Puzzle);
