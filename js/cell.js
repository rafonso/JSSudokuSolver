/**
 *
 */
function Cell(input) {

    var row = -1;
    var col = -1;
    var sector = -1;

    function init() {
        var pos = Cell.getCellPos(input);

        row = pos.row;
        col = pos.col;

        var rowSector;
        if (row <= 3) {
            rowSector = 0;
        } else if (row <= 6) {
            rowSector = 1;
        } else {
            rowSector = 2;
        }
        var colSector;
        if (col <= 3) {
            colSector = 1;
        } else if (col <= 6) {
            colSector = 2;
        } else {
            colSector = 3;
        }
        sector = 3 * rowSector + colSector;
    }

    this.getRow = function() {
        return row;
    }

    this.getCol = function() {
        return col;
    }

    this.getSector = function() {
        return sector;
    }

    this.getElement = function() {
        return $(input);
    }

    this.toString = function() {
        return "[" + this.getRow() + ", " + this.getCol() + ", " + this.getSector() + ", " + (this.isFilled() ? this.getValue() : "-") + "]";
    }

    init();
}

Cell.prototype.getValue = function() {
    return parseInt(this.getElement().val());
}

Cell.prototype.setValue = function(value) {
    this.getElement.val(value);
}

Cell.prototype.isFilled
 = function() {
    return !!this.getValue();
}

Cell.prototype.addClass = function(classe) {
    $(this.input).addClass(classe);
}
Cell.prototype.removeClass = function(classe) {
    $(this.input).removeClass(classe);
}

/**
 * Verifies if a Cell is in the same Row and Column. i.e. if this this the same Cell.
 *
 * @param c Cell to be evaluated
 * @return true if c is in the same Row and Column
 */
Cell.prototype.sameCell = function(c) {
    return (this.getRow() === c.getRow()) &&
        (this.getCol() === c.getCol());
}

Cell.getCellPos = function(element) {
    var pos = /^cell(\d)(\d)$/.exec(element.id);
    return {
        row: parseInt(pos[1]),
        col: parseInt(pos[2])
    };
}

Object.freeze(Cell);