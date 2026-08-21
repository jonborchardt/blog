var Core;
(function (Core) {
    (function (Services) {
        "use strict";

        var DataAccessService = (function () {
            function DataAccessService($http, $q, $resource) {
                this.http = $http;
                this.q = $q;
                this.resource = $resource;
            }
            DataAccessService.prototype.getSomeData = function () {
                var deferred = this.q.defer();

                var dataObjectUri = "api/data/Like/BrandRecords?";

                // log call
                console.log("calling " + dataObjectUri);
                this.http({ method: "GET", url: dataObjectUri }).success(function (data, status, headers, config) {
                    // console.log(data);
                    // TODO, convert return value to expected type //var ret: Core.Models.IBrand[] = data.map((d: any) => { return converter.convert(d); });
                    deferred.resolve(data);
                }).error(function (data, status, headers, config) {
                    deferred.reject(Error("Error fetching data."));
                });
                return deferred.promise;
            };

            DataAccessService.prototype.getEncounterData = function () {
                var deferred = this.q.defer();

                setTimeout(function () {
                    var encounters = new Core.Models.EncounterLoader().encounters;
                    deferred.resolve(encounters);
                }, 1);

                return deferred.promise;
            };
            DataAccessService.$inject = ["$http", "$q", "$resource"];
            return DataAccessService;
        })();
        Services.DataAccessService = DataAccessService;

        // add to app
        Core.Modules.CoreServices.service("dataAccessService", [
            "$http", "$q", "$resource",
            function ($http, $q, $resource) {
                return new DataAccessService($http, $q, $resource);
            }
        ]);
    })(Core.Services || (Core.Services = {}));
    var Services = Core.Services;
})(Core || (Core = {}));
