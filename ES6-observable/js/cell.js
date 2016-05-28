"use strict";

/**
 * Represents a puzzle cell with the values.
 */
class Cell {
    
    constructor(r, c, v, s) {
        this._row = r;

        this._col = c;

        this._sector = ((r > 6) ? 6 : ((r > 3) ? 3 : 0)) +
                 ((c > 6) ? 3 : ((c > 3) ? 2 : 1));

        this._value = (!!v) ? v : null;

        this._status = (!!s) ? s : CellStatus.IDLE;
    }
    
    // GETTERS AND SETTERS
    
    get col() {
        return this._col;
    }
    
    get row() {
        return this._row;
    }
    
    get sector() {
        return this._sector;
    }
    
    get value() {
        return this._value;
    }
    
    set value(v) {
        this._value = v;
    }

    get status() {
        return this._status;
    }
    
    set status(s) {
        this._status = s;
    }

    get filled() {
        return !!this.value;
    }

    // PUBLIC METHODS

    /**
     * Verifies if a Cell is in the same Row and Column. i.e. if this this the
     * same Cell.
     * 
     * @param c
     *            Cell to be evaluated
     * @return true if c is in the same Row and Column
     */
    sameCell(c) {
        return (this.row === c.row) && (this.col === c.col);
    }

    clone() {
        return new Cell(this.row, this.col, this.value, this.status);
    }

    toString() {
        return `[${this.row}${this.col}${(this.filled ? this.value : "-")}${((!!this.status) ? this.status.charAt(0) : "-")}]`; 
    }
    
    static isEmptyCell(c) {
        return !c.filled;
    } 

}

// Object.freeze(Cell);
