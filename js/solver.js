 function Solver(_puzzle) {

     this.puzzle = _puzzle;

     this.validatePuzzle = function() {

         function validate(cells, pos, description) {
             // The found array has 10 position to not always subtract 1. the 0 position is simply not used.
             var found = [false, false, false, false, false, false, false, false, false, false];
             cells.forEach(function(cell) {
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
             });
         }

         function val(func, description) {
             [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(i) {
                 validate(_puzzle[func](i), i, description);
             })
         }

         this.puzzle.setStatus(PuzzleStatus.VALIDATING);
         val("getCellsRow", "Row");
         val("getCellsCol", "Column");
         val("getCellsSector", "Sector");
         this.puzzle.setStatus(PuzzleStatus.READY);
     }


     this.solve = function() {
         this.puzzle.setStatus(PuzzleStatus.RUNNING);

         // All Cells become readonly
         // _.each(_puzzle.cells, function(c) {
         //    c.getElement().prop('readonly', true);
         // });

         // this.puzzle.setStatus(PuzzleStatus.SOLVED);

     }


     this.clean = function() {
         _puzzle.cells.forEach(function(c) {
             c.getElement().prop('readonly', false);
         });
     }


 }
