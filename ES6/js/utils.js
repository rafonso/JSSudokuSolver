// HELPER FUNCTIONS
"use strict";

const FINEST = 0;
const FINER = 1;
const FINE = 2;
const DEBUG = 3;

const LOG_LEVEL = DEBUG;

/*
 * Default parameters work for MS Edge just after version 14. 
 * For versions 12 and 13 it is necessary enable 
 * "Enable experimental Javascript features" setting under about:flags
 */
function log(f, level = FINEST) {
//    level = level || FINEST;
    if(level >= LOG_LEVEL) {
        console.debug(f());
    }
}
