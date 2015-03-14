 function Solver(_puzzle) {

     function validate(cells, pos, description) {
         // The found array has 10 position to not always subtract 1. the 0 position is simply not used.
         var found = [false, false, false, false, false, false, false, false, false, false];
         cells.forEach(function(cell) {
             if (cell.filled) {
                 var value = cell.value;
                 if (found[value]) {
                     _puzzle.status = PuzzleStatus.INVALID;
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
         _.range(1, 10).forEach(function(i) {
             validate(_puzzle[func](i), i, description);
         })
     }

     return {
         get puzzle() {
             return _puzzle;
         },
         validatePuzzle: function() {
             this.puzzle.status = PuzzleStatus.VALIDATING;
             val("getCellsRow", "Row");
             val("getCellsCol", "Column");
             val("getCellsSector", "Sector");
             this.puzzle.status = PuzzleStatus.READY;
         },
         solve: function() {
             this.puzzle.status = PuzzleStatus.RUNNING;

             // All Cells become readonly
             // _.each(_puzzle.cells, function(c) {
             //    c.getElement().prop('readonly', true);
             // });

             // this.puzzle.setStatus(PuzzleStatus.SOLVED);

         },
         clean: function() {
             this.puzzle.cells.forEach(function(c) {
                 c.element.prop('readonly', false);
             });
         }

     };
 }
