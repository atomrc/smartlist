/*global PEG, window*/
/*jslint plusplus: true*/

window.application = (function () {
    'use strict';
    var application = {};

    /***************************************/
    /*************** SERVICES ***************/
    /***************************************/
    application.services = {
        parser: [function () {
            var grammar = "START = VERB " +
                "VERB = CALL { return 1; } / BUY { return 2; } " +
                "CALL = 'appel'i[^ ]* / 'appe'i / 'app'i " +
                "BUY = 'achet'i[^ ]* / 'ache'i / 'ach'i ",
                parser = PEG.buildParser(grammar);
            return {
                parse: function (str) {
                    try {
                        return parser.parse(str);
                    } catch (e) {
                        return null;
                    }
                }
            };
        }]
    };


    /***************************************/
    /*************** DIRECTIVES ***************/
    /***************************************/
    application.directives = {
        grammarListener: ['parser', function (parser) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var destObj = scope.$eval(attrs.grammarListener).dest;
                    scope.$watch(attrs.ngModel, function (newValue, oldValue, scope) {
                        if (newValue) {
                            destObj.tip = parser.parse(newValue);
                        }
                    }, true);
                }
            };
        }]
    };

    /***************************************/
    /************* ANIMATIONS **************/
    /***************************************/
    application.animations = {
    };

    /***************************************/
    /*************** CONTROLLERS ***************/
    /***************************************/
    application.controllers = {
        appController: ['$scope', function (scope) {
            scope.todoList = [];
            scope.addElement = function () {
                this.todoList.push({});
            };

            scope.removeElement = function (element) {
                this.todoList.removeElement(element);
            };

            scope.validateTip = function (tip) {
            };
        }]
    };

    return application;

}());
