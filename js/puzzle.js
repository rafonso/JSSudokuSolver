function Puzzle(puzzleElement) {

    function excluderCell(excludeCell) {
        return (!!excludeCell) ?
            function(c) {
                return excludeCell.sameCell(c);
            } : _.constant(false);
    }

    this.cells = $.map(puzzleElement.children().children("input"), function(input) {
        return new Cell(input);
    });

    /**
     * Returns the Cells who are in determinated Row. It is possible exclude a Cell which (presumively) is in this Row.
     *
     * @param row solicited Row
     * @param excludeCell Cell to be excluded in result.
     * @return Cells which are in the solicitated Row. If excludeCell is defined, this will not be present in result.
     */
    this.getCellsRow = function(row, excludeCell) {
        return _.chain(this.cells)
            .filter(function(c) {
                return c.getRow() === row;
            })
            .reject(excluderCell(excludeCell)).value();
    }

    /**
     * Returns the Cells who are in determinated Column. It is possible exclude a Cell which (presumively) is in this Column.
     *
     * @param col solicited Column
     * @param excludeCell Cell to be excluded in result.
     * @return Cells which are in the solicitated Column. If excludeCell is defined, this will not be present in result.
     */
    this.getCellsCol = function(col, excludeCell) {
        return _.chain(this.cells)
            .filter(function(c) {
                return c.getCol() === col;
            })
            .reject(excluderCell(excludeCell)).value();
    }

    /**
     * Returns the Cells who are in determinated Sector. It is possible exclude a Cell which (presumively) is in this Sector.
     *
     * @param sector solicited Sector
     * @param excludeCell Cell to be excluded in result.
     * @return Cells which are in the solicitated Sector. If excludeCell is defined, this will not be present in result.
     */
    this.getCellsSector = function(sec, excludeCell) {
        return _.chain(this.cells)
            .filter(function(c) {
                return c.getSector() === sec;
            })
            .reject(excluderCell(excludeCell)).value();
    }

}

Puzzle.prototype.validatePuzzle = function() {

    function validate(cells, pos, description) {
        var found = [false, false, false, false, false, false, false, false, false, false];
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if (cell.isFilled()) {
                var value = cell.getValue();
                if (found[value]) {
                    throw {
                        msg: description + " " + pos + ". Repeated value: " + value,
                        invalidCells: cells
                    }
                } else {
                    found[value] = true;
                }
            }
        }
    }

    for(var i = 1; i <= 9; i ++) {
    	validate(this.getCellsRow(i), i, "Row");
    }
    for(var i = 1; i <= 9; i ++) {
    	validate(this.getCellsCol(i), i, "Column");
    }
    for(var i = 1; i <= 9; i ++) {
    	validate(this.getCellsSector(i), i, "Sector");
    }
}

Object.freeze(Puzzle);
