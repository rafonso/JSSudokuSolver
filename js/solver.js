 function Solver(_puzzle) {

     this.puzzle = _puzzle;

     this.validatePuzzle = function() {

         function validate(cells, pos, description) {
             // The found array has 10 position to not always subtract 1. the 0 position is simply not used.
             var found = [false, false, false, false, false, false, false, false, false, false];
             for (var i = 0; i < cells.length; i++) {
                 var cell = cells[i];
                 if (cell.isFilled()) {
                     var value = cell.getValue();
                     if (found[value]) {
                         _puzzle.setStatus(PuzzleStatus.INVALID);
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

         function val(func, description) {
             for (var i = 1; i <= 9; i++) {
                 validate(_puzzle[func](i), i, description);
             }
         }

         this.puzzle.setStatus(PuzzleStatus.VALIDATING);
         val("getCellsRow", "Row");
         val("getCellsCol", "Column");
         val("getCellsSector", "Sector");
         this.puzzle.setStatus(PuzzleStatus.READY);
     }


 }
