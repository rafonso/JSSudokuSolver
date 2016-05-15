// HELPER FUNCTIONS
"use strict";

function getFormattedHour () {

    function format (value, size, end) {
        let string = value.toString();
        while (string.length < size) {
            string = '0' + string;
        }

        return string + end;
    }

    let d = new Date();
    return "[" //
            + format(d.getHours(), 2, ":") //
            + format(d.getMinutes(), 2, ":") //
            + format(d.getSeconds(), 2, '.')
            + format(d.getMilliseconds(), 3, ']') //
            + " ";
}
