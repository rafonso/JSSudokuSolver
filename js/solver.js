 function Solver(_puzzle) {

     this.puzzle = _puzzle;


 }


 Solver.prototype.validatePuzzle = function() {

     function validate(cells, pos, description) {
         // The found array has 10 position to not always subtract 1. the 0 position is simply not used.
         var found = [false, false, false, false, false, false, false, false, false, false];
         for (var i = 0; i < cells.length; i++) {
             var cell = cells[i];
             if (cell.isFilled()) {
                 var value = cell.getValue();
                 this.puzzle.setStatus(PuzzleStatus.ERROR);
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

     this.puzzle.setStatus(PuzzleStatus.VALIDATING);
     for (var i = 1; i <= 9; i++) {
         validate(this.puzzle.getCellsRow(i), i, "Row");
     }
     for (var i = 1; i <= 9; i++) {
         validate(this.puzzle.getCellsCol(i), i, "Column");
     }
     for (var i = 1; i <= 9; i++) {
         validate(this.puzzle.getCellsSector(i), i, "Sector");
     }
 }
