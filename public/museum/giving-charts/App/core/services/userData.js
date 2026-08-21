var Core;
(function (Core) {
    (function (Services) {
        "use strict";

        var UserDataService = (function () {
            function UserDataService($http, $q, $resource, $rootScope, $timeout) {
                this.http = $http;
                this.q = $q;
                this.resource = $resource;
            }
            UserDataService.$inject = ["$http", "$q", "$resource", "$rootScope", "$timeout"];
            return UserDataService;
        })();
        Services.UserDataService = UserDataService;

        // add to app
        Core.Modules.CoreServices.service("userDataService", [
            "$http", "$q", "$resource", "$rootScope", "$timeout",
            function ($http, $q, $resource, $rootScope, $timeout) {
                return new UserDataService($http, $q, $resource, $rootScope, $timeout);
            }
        ]);
    })(Core.Services || (Core.Services = {}));
    var Services = Core.Services;
})(Core || (Core = {}));
