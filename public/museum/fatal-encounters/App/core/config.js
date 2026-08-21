var Core;
(function (Core) {
    "use strict";

    // set up routing
    Core.Modules.App.run([
        "$rootScope", "$state", "$stateParams",
        function ($rootScope, $state, $stateParams) {
            // It's very handy to add references to $state and $stateParams to the $rootScope
            // so that you can access them from any scope within your applications.For example,
            // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
            // to active whenever 'contacts.list' or one of its decendents is active.
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]);

    // add to app
    Core.Modules.App.config([
        "$routeProvider", function ($routeProvider) {
            $routeProvider.when("/encounterReport", {
                templateUrl: "App/features/encounterReport/encounterReportView.html",
                controller: "encounterReportCtrl"
            }).otherwise({ redirectTo: "/encounterReport" });
        }
    ]);
})(Core || (Core = {}));
