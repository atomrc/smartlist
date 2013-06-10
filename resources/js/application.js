/*global PEG, window, navigator*/
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
                    humanPattern: 'appeler <buddy> à <time>',
                    icon: "phone"
                },
                buy: {
                    id: 1,
                    humanPattern: 'acheter <article>',
                    icon: "money"
                }
            };
        }],

        actionManager: ['parser', 'Action', 'suggester', function (parser, Action, suggester) {
            return {
                update: function (action, str) {
                    var parseRes = parser.parse(str);
                    if (!parseRes) { action.type = null; action.datas = {}; return; }
                    action.type = parseRes.type;
                    switch (action.type.id) {
                    case 0:
                        return this.updateCall(action, parseRes);
                    case 1:
                        return this.updateBuy(action, parseRes);
                    }
                },

                updateCall: function (action, callDesc) {
                    if (action.updateDest(callDesc.dest)) {
                        return suggester.suggestContact(callDesc.dest[0], callDesc.dest[1]);
                    }
                    action.updateTime(callDesc.time);
                    action.updateCallParsedText();
                },

                updateBuy: function (action, buyDesc) {
                    action.updateItem(buyDesc.item);
                    action.updateBuyParsedText();
                }
            };
        }],

        suggester: [function () {
            return {
                suggestions: [],
                suggestContact: function (firstname, lastname) {
                    /*return {
                        name: ["Felix Bonjour"],
                        honorificPrefix: null,
                        givenName: ["Felix"],
                        additionalName: [""],
                        familyName: ["Bonjour"],
                        id: "8869d73644fa844db5821f9bc83c9f74"
                    };*/
                    var search = navigator.mozContacts.getAll({sortBy: "familyName", sortOrder: "descending"});
                    return search;
                }
            };
        }],

        Action: [function () {
            var Action = function () {};

            Action.prototype = {
                type: 0,
                datas: {}, //contains all the datas of the action
                parsedText: null,

                updateDest: function (dest) {
                    if (this.datas.contact) {
                        return false;
                    }
                    if (this.datas.dest === dest) {
                        return false;
                    }
                    if (dest.length === 0 || dest === ' ') {
                        return false;
                    }
                    this.datas.dest = dest;
                    return true;
                },

                updateTime: function (time) {
                    this.datas.time = time;
                },

                updateItem: function (item) {
                    this.datas.item = item;
                },

                updateBuyParsedText: function () {
                    this.parsedText = "acheter ";
                    if (this.datas.item) {
                        this.parsedText += this.datas.item;
                    }
                },

                updateCallParsedText: function () {
                    this.parsedText = "appeler ";
                    if (this.datas.contact) {
                        this.parsedText += this.datas.contact.name;
                        this.parsedText += " ";
                    }
                    if (this.datas.time) {
                        this.parsedText += this.datas.time.hour + "h" + this.datas.time.min;
                        this.parsedText += " ";
                    }
                }

            };

            return Action;
        }],

        parser: ['actionTypes', function (actionTypes) {
            var grammar = "START = CALL / BUY  " +
                "CALL = verb:CALLVERB dest:(CALLDEST)? ' '? time:(CALLTIME)? { return {'type': " + JSON.stringify(actionTypes.call) + ", 'dest': dest, 'time': time}; } " +
                "CALLVERB = ('appel'i[^ ]* / 'appe'i / 'app'i / 'ap'i) " +
                "CALLDEST = ' ' name:([^ ]+) { return name.join('') } " +
                "CALLTIME = hour:(INT INT?) 'h' min:(INT INT?) { return { hour: hour.join(''), min: min.join('') }; }  " +
                "BUY = BUYVERB item:BUYITEM { return { 'type': " + JSON.stringify(actionTypes.buy) + ", 'item': item }; } " +
                "BUYVERB = ('achet'i[^ ]* / 'ache'i / 'ach'i) " +
                "BUYITEM = item:.* { return item.join(''); } " +
                "INT = [0-9] ",
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
        }],

        actionRegisterer: [function () {
            return {
                //register the action and if it is a typed action, add the custom notif
                register: function (action) {
                    if (!action) { return false; }
                    switch (action.type.id) {
                    case 0:

                        
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

        grammarListener: ['Action', 'actionManager', function (Action, actionManager) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var destObj = scope.$eval(attrs.grammarListener).dest;
                    scope.$watch(attrs.ngModel, function (newValue, oldValue, scope) {
                        if (newValue) {
                            if (!destObj.action) { destObj.action = new Action(); }
                            var suggestions = actionManager.update(destObj.action, newValue);
                            if (suggestions) {
                                var sug = [],
                                    contact;
                                suggestions.onsuccess = function () {
                                    while (this.result) {
                                        contact = {
                                            name: this.result.name[0],
                                            id: this.result.id
                                        };
                                        sug.push(contact);
                                        this.continue();
                                    }
                                    if (this.done) {
                                        scope.$apply(function () {
                                            destObj.suggestions = sug;
                                        });
                                    }
                                };
                            }
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
    /************* FILTERS **************/
    /***************************************/
    application.filters = {
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
        appController: ['$scope', 'actionRegisterer', 'suggester', function (scope, actionRegisterer, suggester) {
            scope.todos = [];
            scope.newTodos = [];
            scope.suggester = suggester;
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
                    actionRegisterer.register(element.action);
                }
            };

            scope.affectContact = function (element, contact) {
                console.log(contact);
                if (contact) {
                    element.action.datas.contact = contact;
                }
                element.suggestions = null;
                element.action.updateCallParsedText();
            };

            scope.isCall = function (element) {
                if (!element.action.type) { return; }
                return element.action.type.id === 0;
            };

            scope.isBuy = function (element) {
                if (!element.action.type) { return; }
                return element.action.type.id === 1;
            };
        }]
    };

    return application;

}());
