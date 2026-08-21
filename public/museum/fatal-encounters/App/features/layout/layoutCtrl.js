var Features;
(function (Features) {
    (function (Layout) {
        "use strict";

        var LayoutCtrl = (function () {
            function LayoutCtrl($scope) {
                $scope.vm = this;
                this.scope = $scope;

                this.routes = [
                    {
                        name: "EncounterReport",
                        path: "/encounterReport",
                        routeTitle: "EncounterReport",
                        iconClass: "",
                        active: true
                    }
                ];

                // ========== ui handlers ========== //
                function activateNavItem(path) {
                    $scope.vm.routes.forEach(function (route) {
                        var active;
                        if (route.paths) {
                            route.paths.forEach(function (routePath) {
                                if (routePath.path === path) {
                                    active = true;
                                    $scope.vm.currentRoute = routePath;
                                }
                            });
                        } else {
                            if (path === route.path) {
                                active = true;
                                $scope.vm.currentRoute = route;
                            }
                        }
                        route.active = active;
                    });
                }

                $scope.$on("$routeChangeSuccess", function (event, data) {
                    if (data.$$route) {
                        activateNavItem(data.$$route.originalPath);
                    }
                });
            }
            LayoutCtrl.$inject = ["$scope"];
            return LayoutCtrl;
        })();
        Layout.LayoutCtrl = LayoutCtrl;
        ;

        // add to app
        Core.Modules.FeaturesLayout.controller("layoutCtrl", ["$scope", function ($scope) {
                return new LayoutCtrl($scope);
            }]);
    })(Features.Layout || (Features.Layout = {}));
    var Layout = Features.Layout;
})(Features || (Features = {}));
