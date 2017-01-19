(function() {
    'use strict';

    var $bin = angular.module('flex.bin.tab', []);

    $bin.service('fx-tab', ['$window', function($window) {
        var self = this;
        var hash = location.hash.replace(/^(\#\/|\#)/i, '');
        var tabs = new Object;
        var show = new Object;

        self.add = function(space, name) {
            if (typeof tabs[space] === 'undefined')
                tabs[space] = new Array;

            tabs[space].push(name);
        };

        self.toggle = function(space, name) {
            var element;

            show[space] = name;

            for (var i = 0; i < tabs[space].length; i++) {
                element = document.querySelector(
                    '[fx-tab-fill="' + space + '.' + tabs[space][i] + '"]'
                );

                if (typeof element !== 'undefined') {
                    angular.element(element).hide();
                }
            }

            element = document.querySelector(
                '[fx-tab-fill="' + space + '.' + name + '"]'
            );

            if (typeof element !== 'undefined')
                angular.element(
                    element
                ).show();
            
            location.hash = name;
        };

        angular.element(window).ready(function() {
            // console.log(
            //     document.querySelectorAll('[fx-tab]')
            // );

            for (var space in tabs) {
                if (tabs[space].indexOf(hash) !== -1) {
                    var element = document.querySelector(
                        '[fx-tab="' + space + '.' + hash + '"]'
                    );

                    angular.element(element).click();


                } else {
                    var element = document.querySelector(
                        '[fx-tab="' + space + '.' + tabs[space][0] + '"]'
                    );

                    angular.element(element).click();
                }
            }
       });
    }]);

    $bin.directive('fxTab', ['fx-tab', function($tab) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attrs) {
                var space, name;

                if ($attrs.fxTab && /^(.*?)\.(.*?)$/i.test($attrs.fxTab) === true) {
                    [space, name] = $attrs.fxTab.split('.');

                    $tab.add(space, name);

                    $element.bind('click', function() {
                        $tab.toggle(space, name);
                    });
                }
            }
        };
    }]);
})();
