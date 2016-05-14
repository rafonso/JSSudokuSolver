// HELPER FUNCTIONS
"use strict";

const FINEST = 0;
const FINER = 1;
const FINE = 2;
const DEBUG = 3;

const LOG_LEVEL = FINEST;

/*
 * Default parameters work for MS Edge just after version 14. 
 * For versions 12 and 13 it is necessary enable 
 * "Enable experimental Javascript features" setting under about:flags
 */
function log(f, level = FINEST) {
    
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
    
//    level = level || FINEST;
    if(level >= LOG_LEVEL) {
        console.debug(getFormattedHour() + f());
    }
}
