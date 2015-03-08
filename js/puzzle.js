function Puzzle(puzzleElement) {

    this.cells = $.map(puzzleElement.children().children("input"), function(input) {
        return new Cell(input);
    });

}
