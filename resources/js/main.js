/*global angular, application, require, window*/

(function (application) {
    'use strict';
    var element,
        ngApplication = angular.module('smartlist', []);

    for (element in application.services) {
        if (application.services.hasOwnProperty(element)) {
            ngApplication.factory(element, application.services[element]);
        }
    }
    //init directives
    for (element in application.directives) {
        if (application.directives.hasOwnProperty(element)) {
            ngApplication.directive(element, application.directives[element]);
        }
    }

    //init animations
    for (element in application.animations) {
        if (application.animations.hasOwnProperty(element)) {
            ngApplication.directive(element, application.animations[element]);
        }
    }
    //init filters
    for (element in application.filters) {
        if (application.filters.hasOwnProperty(element)) {
            ngApplication.filter(element, application.filters[element]);
        }
    }

    for (element in application.controllers) {
        if (application.controllers.hasOwnProperty(element)) {
            ngApplication.controller(element, application.controllers[element]);
        }
    }

}(window.application));

