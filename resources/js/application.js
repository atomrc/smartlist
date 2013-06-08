/*global PEG, window*/
/*jslint plusplus: true*/

window.application = (function () {
    'use strict';
    var application = {};

    /***************************************/
    /*************** SERVICES ***************/
    /***************************************/
    application.services = {
        actionTypes: [function () {
            return {
                call: {
                    id: 0,
                    humanPattern: 'call <buddy> at <time>'
                },
                buy: {
                    id: 1,
                    humanPattern: 'buy <article>'
                }
            };
        }],

        parser: ['actionTypes', function (actionTypes) {
            var grammar = "START = CALL / BUY  " +
                "CALL = verb:CALLVERB ' '? dest:(CALLDEST)? ' '? time:(CALLTIME)? { return {'type': " + JSON.stringify(actionTypes.call) + ", 'dest': dest, 'time': time}; } " +
                "CALLVERB = ('call'i[^ ]* / 'cal'i / 'ca'i) " +
                "CALLDEST = first:([^ ]+) ' '? last:([^ ]*) { return [first.join(''), last.join('')] } " +
                "CALLTIME = 'time' " +
                "BUY = 'buyi'i[^ ]* / 'buy'i / 'bu'i ",
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
        dynamicList: [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.$watch(attrs.dynamicList, function (newList, oldList, scope) {
                        if (!newList) { return; }
                        if (newList.length === 0) { newList.push({}); }
                        var lastElement = newList[newList.length - 1];
                        if (lastElement.fullText && lastElement.fullText.length > 0) {
                            newList.push({});
                        }

                    }, true);
                }
            };
        }],

        grammarListener: ['parser', function (parser) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var destObj = scope.$eval(attrs.grammarListener).dest;
                    scope.$watch(attrs.ngModel, function (newValue, oldValue, scope) {
                        if (newValue) {
                            destObj.tip = parser.parse(newValue);
                            console.log(destObj.tip);
                        }
                    }, true);
                }
            };
        }],

        focusout: [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element[0].addEventListener('focusout', function () {
                        scope.$apply(function () {
                            scope.$eval(attrs.focusout);
                        });
                    });
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
            scope.todos = [];
            scope.newTodos = [];
            scope.addElement = function () {
                this.newTodos.push({});
            };

            scope.deleteAction = function (element) {
                this.todos.removeElement(element);
            };

            scope.registerAction = function (element) {
                if ((element.fullText || {}).length > 0) {
                    this.newTodos.removeElement(element);
                    this.todos.push(element);
                }
            };
        }]
    };

    return application;

}());
