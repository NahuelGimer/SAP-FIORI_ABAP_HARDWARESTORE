sap.ui.define([], function () {
    "use strict";
    return {
        formatInitZeros: function (initZeros) {
            if (initZeros === undefined || initZeros === null) {
                return null;
            }
            if (initZeros.length > 0) {
                var initZerosOff = initZeros.replace(/^(0+)/g, '').padStart(1,"0");
                return initZerosOff;
            }
           if (initZeros === 0) {
                return "<span class='myZeroValue'>" + initZeros + "</span>";
            }
            return null;
        },
    };
});