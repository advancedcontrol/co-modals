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
                    title: '@'
                },
                restrict: 'E',
                transclude: true,
                template:
                    '<div ng-touch="close($event)">' +
                        '<div ng-touch="$event.stopPropagation()">' +
                            '<div class="modal-header"><h1>{{title}}</h1>' +
                                '<span ng-if="showClose" class="close" ng-touch="close($event)"></span>' +
                            '</div>' +
                            '<div class="modal-content" ng-transclude></div>' +
                        '</div>' +
                    '</div>',
                controller: function() {},
                link: function(scope, element, attrs, ctrl) {
                    var name = scope.name;
                        
                    scope.showClose = !attrs.hasOwnProperty('noClose');

                    // Add the controller to the popup registry
                    modals[name] = ctrl;
                    element.addClass(attrs.animation || 'bounceInRight');

                    // Provide the controller show and close functions
                    ctrl.show = function () {
                        container.append(element);
                        return $animate.addClass(element, 'coModal');
                    };

                    ctrl.close = function () {
                        return $animate.removeClass(element, 'coModal').then(function () {
                            element.detach();
                        });
                    };
                    
                    scope.close = function (e) {
                        if (scope.showClose) {
                            ctrl.close();
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    };

                    // Detach the element from the DOM
                    element.detach();

                    // On destroy, unregister the popup
                    scope.$on('$destroy', function () {
                        ctrl.close()['finally'](function () {
                            element.remove();
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
