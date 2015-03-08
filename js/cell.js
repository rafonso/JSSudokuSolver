/**
 *
 */
function Cell(input) {
    var pos = Cell.getCellPos(input);


    function getSector() {
        switch (pos.row) {
            case 1:
            case 2:
            case 3:
                switch (pos.col) {
                    case 1:
                    case 2:
                    case 3:
                        return 1;
                    case 4:
                    case 5:
                    case 6:
                        return 2;
                    case 7:
                    case 8:
                    case 9:
                        return 3;
                }
            case 4:
            case 5:
            case 6:
                switch (pos.col) {
                    case 1:
                    case 2:
                    case 3:
                        return 4;
                    case 4:
                    case 5:
                    case 6:
                        return 5;
                    case 7:
                    case 8:
                    case 9:
                        return 6;
                }
            case 7:
            case 8:
            case 9:
                switch (pos.col) {
                    case 1:
                    case 2:
                    case 3:
                        return 7;
                    case 4:
                    case 5:
                    case 6:
                        return 8;
                    case 7:
                    case 8:
                    case 9:
                        return 9;
                }
        }
        return NaN;

    }

    this.row = pos.row;
    this.col = pos.col;
    this.sector = getSector();


    this.getElement = function() {
        return $(input);
    }

}

Cell.prototype.getValue = function() {
    return parseInt(this.getElement().val());
}

Cell.prototype.isFilled = function() {
    return !!this.getValue();
}

Cell.prototype.addClass = function(classe) {
    $(this.input).addClass(classe);
}

Cell.prototype.removeClass = function(classe) {
    $(this.input).removeClass(classe);
}

Cell.prototype.toString = function() {
    return "[" + this.row + ", " + this.col + ", " + this.sector + ", " + (this.isFilled() ? this.getValue() : " ") + "]";
}

Cell.getCellPos = function(element) {
    var pos = /^cell(\d)(\d)$/.exec(element.id);
    return {
        row: parseInt(pos[1]),
        col: parseInt(pos[2])
    };
}
