// HELPER FUNCTIONS
"use strict";

function getFormattedHour () {

    function format (value, size, end) {
        var string = value.toString();
        while (string.length < size) {
            string = '0' + string;
        }

        return string + end;
    }

    var d = new Date();
    return "[" //
            + format(d.getHours(), 2, ":") //
            + format(d.getMinutes(), 2, ":") //
            + format(d.getSeconds(), 2, '.')
            + format(d.getMilliseconds(), 3, ']') //
            + " ";
}

function objectToString (obj) {
    var str = "";
    if (!!obj) {
        if (_.has(obj, "toString")) {
            str += obj.toString();
        } else {
            str += "{";
            Object.keys(obj).forEach(function (key, index, array) {
                var value = obj[key];
                if (!_.isFunction(value)) {
                    str += (key + "=");
                    if (_.isArray(value)) {
                        str += "[";
                        for (var i = 0; i < value.length; i++) {
                            str += objectToString(value[i]);
                            str += (i < value.length - 1) ? ", " : "";
                        }
                        str += "]";
                    } else if (_.isObject(value)) {
                        str += objectToString(value);
                    } else {
                        str += value;
                    }
                    if (index < array.length - 1) {
                        str += ", ";
                    }
                }
            });
            str += "}";
        }
    }

    return str;
}
