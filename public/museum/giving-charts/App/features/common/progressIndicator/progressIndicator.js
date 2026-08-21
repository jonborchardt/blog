var Features;
(function (Features) {
    (function (Common) {
        (function (ProgressIndicator) {
            "use strict";

            var ProgressIndicatorService = (function () {
                function ProgressIndicatorService($rootScope) {
                    var _this = this;
                    this.isLoading = false;
                    this.percentageLoaded = 0;
                    this.showPercentageBar = true;
                    // start the loading state. can show the radial progress bar or just show an animated spinner.
                    this.start = function (showBar) {
                        _this.percentageLoaded = 0;
                        _this.isLoading = true;
                        _this.showPercentageBar = showBar;
                        $rootScope.$broadcast("progressIndicator:update");
                    };

                    // ends the loading state.
                    this.complete = function () {
                        _this.percentageLoaded = 0;
                        _this.isLoading = false;
                        _this.showPercentageBar = false;
                        $rootScope.$broadcast("progressIndicator:update");
                    };

                    // used for updating the percentage of the radial progress bar.
                    this.updateProgress = function (percent) {
                        _this.percentageLoaded = percent;
                        $rootScope.$broadcast("progressIndicator:update");
                    };
                }
                ProgressIndicatorService.$inject = ["$rootScope"];
                return ProgressIndicatorService;
            })();
            ProgressIndicator.ProgressIndicatorService = ProgressIndicatorService;

            var UiProgressIndicator = (function () {
                function UiProgressIndicator($timeout, progressIndicatorService) {
                    this.scope = {};
                    this.templateUrl = "App/features/common/progressIndicator/progressIndicator.html";
                    this.replace = true;
                    this.restrict = "E";
                    this.link = function (scope, iElement) {
                        var update;
                        update = function () {
                            $timeout(function () {
                                scope.isLoading = progressIndicatorService.isLoading;
                                scope.percentageLoaded = progressIndicatorService.percentageLoaded;
                                scope.showPercentageBar = progressIndicatorService.showPercentageBar;
                                scope.$apply();
                            });
                        };

                        update();
                        scope.$on("progressIndicator:update", update);
                    };
                }
                UiProgressIndicator.$inject = ["$timeout", "progressIndicatorService"];
                return UiProgressIndicator;
            })();
            ProgressIndicator.UiProgressIndicator = UiProgressIndicator;

            Core.Modules.FeaturesProgressIndicator.service("progressIndicatorService", [
                "$rootScope",
                function ($rootScope) {
                    return new ProgressIndicatorService($rootScope);
                }
            ]);

            Core.Modules.FeaturesProgressIndicator.directive("uiProgressIndicator", [
                "$timeout", "progressIndicatorService",
                function ($timeout, progressIndicatorService) {
                    return new UiProgressIndicator($timeout, progressIndicatorService);
                }
            ]);
        })(Common.ProgressIndicator || (Common.ProgressIndicator = {}));
        var ProgressIndicator = Common.ProgressIndicator;
    })(Features.Common || (Features.Common = {}));
    var Common = Features.Common;
})(Features || (Features = {}));
