(function () {
    'use strict';
    /***************************************/
    /*************** EXTENSIONS ***************/
    /***************************************/
    Array.prototype.removeElement = function (element) {
        this.splice(this.indexOf(element), 1);
    };

    Array.prototype.empty = function () {
        this.splice(0, this.length);
    };
}());
