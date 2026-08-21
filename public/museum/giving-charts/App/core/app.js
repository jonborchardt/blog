// main module
var Core;
(function (Core) {
    "use strict";

    var Modules = (function () {
        function Modules() {
        }
        Modules.CoreFilters = angular.module("core.filters", []);
        Modules.CoreDirectives = angular.module("core.directives", []);
        Modules.CoreServices = angular.module("core.services", []);

        Modules.FeaturesProgressIndicator = angular.module("features.common.progressIndicator", []);

        Modules.FeaturesLayout = angular.module("features.layout", ["ngRoute"]);
        Modules.FeaturesRewardsReport = angular.module("features.rewardsReport", ["ngRoute"]);

        Modules.App = angular.module("app", [
            "angularDc",
            "nvd3",
            "core.directives",
            "core.filters",
            "core.services",
            "features.layout",
            "features.common.progressIndicator",
            "features.rewardsReport",
            "ngGrid",
            "ngResource",
            "ngRoute",
            "ngSanitize",
            "ui.grid.exporter",
            "ui.grid.resizeColumns",
            "ui.grid.selection",
            "ui.grid",
            "ui.router",
            "ui.select",
            "chartDirective"
        ]);
        return Modules;
    })();
    Core.Modules = Modules;
})(Core || (Core = {}));
