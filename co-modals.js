(function (angular) {
    'use strict';


    // Mix in to our module
    var module;
    try {
        module = angular.module('coUtils');
    } catch (e) {
        module = angular.module('coUtils', []);
    }


    // Globals
    var modals = {},    // The various pop-ups
        container = document.createElement('div');

    // This is where our popup elements will reside
    container = angular.element(container);
    container.attr('id', 'modals');
    angular.element(document.body).append(container);


    module
        .controller('Modals', ['$scope', function($scope) {
            $scope.showModal = function (name) {
                modals[name].show();
            };

            $scope.closeModal = function (name) {
                modals[name].close();
            };
        }])

        .directive('modal', ['$timeout', '$animate', function($timeout, $animate) {
            return {
                scope: {
                    name: '@',
                    title: '@',
                    animation: '=?'
                },
                restrict: 'E',
                transclude: true,
                template:
                    '<div>' +
                        '<div>' +
                            '<div class="modal-header"><h1>{{title}}</h1>' +
                                '<span class="close" ng-click="close"></span>' +
                            '</div>' +
                            '<div class="modal-content" ng-transclude></div>' +
                        '</div>' +
                    '</div>',
                controller: function() {},
                link: function(scope, element, attrs, ctrl) {
                    var name = scope.name;

                    // Detach the element from the DOM
                    element.detach();

                    // Add the controller to the popup registry
                    modals[name] = ctrl;
                    scope.animation = scope.animation || 'co-modal';

                    // Provide the controller show and close functions
                    ctrl.show = function () {
                        container.append(element);
                        return $animate.addClass(element, scope.animation);
                    };

                    ctrl.close = function () {
                        return $animate.removeClass(element, scope.animation).then(function () {
                            element.detach();
                        });
                    };

                    // On destroy, unregister the popup
                    scope.$on('$destroy', function () {
                        ctrl.close()['finally'](function () {
                            element = null;
                        });
                        ctrl.close = angular.noop;
                        ctrl.show = angular.noop;
                        delete modals[name];
                    });
                }
            };
        }]);

}(this.angular));
