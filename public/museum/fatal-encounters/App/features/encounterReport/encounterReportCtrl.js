var Features;
(function (Features) {
    (function (EncounterReport) {
        "use strict";

        var EncounterReportCtrl = (function () {
            function EncounterReportCtrl($interval, $q, $rootScope, $scope, $timeout, dataAccessService, progressIndicatorService, userDataService) {
                var _this = this;
                this.showDownloadCsv = false;
                this.gridColumnDefs = [];
                this.loading = false;
                this.encounters = [];
                this.filterTheGrid = true;
                $scope.vm = this;
                this.scope = $scope;
                this.userDataService = userDataService;

                dataAccessService.getEncounterData().then(function (data) {
                    $scope.vm.encounters = data;
                    $scope.vm.encounterReportCharts = new EncounterReport.EncounterReportCharts($rootScope, $scope.vm.encounters);
                });

                this.gridColumnDefs = [
                    { field: "Date", width: "**" },
                    { field: "Name", width: "***" },
                    { field: "Age", width: "*" },
                    { field: "Gender", width: "*" },
                    { field: "RaceEx", displayName: "Race", width: "**" },
                    { field: "Address", visible: false, width: "***" },
                    { field: "City", width: "**" },
                    { field: "State", width: "*" },
                    { field: "Zip", visible: false, width: "*" },
                    { field: "County", visible: false, width: "**" },
                    { field: "Agency", width: "***" },
                    { field: "CauseOfDeathEx", displayName: "CauseOfDeath", width: "**" },
                    { field: "Illness", displayName: "Drug Use", visible: false, width: "*" },
                    { field: "DispositionEx", displayName: "Disposition", visible: false, width: "***" },
                    { field: "Description", visible: false, width: "*****" },
                    { field: "MoreInfo", cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><a href="{{row.entity[\'MoreInfo\']}}">Link</a></div>', width: "*" }
                ];

                this.gridOptions = {
                    data: this.filterTheGrid ? "vm.encounterReportCharts.dimensions['id'].top(999999)" : "vm.encounters",
                    columnDefs: this.gridColumnDefs,
                    enableSorting: true,
                    enableColumnResizing: true,
                    enableColumnReordering: true,
                    enableFiltering: true,
                    enableRowSelection: false,
                    enableGridMenu: true,
                    multiSelect: false,
                    exporterMenuPdf: false,
                    exporterMenuCsv: false,
                    enablePaging: false,
                    gridMenuCustomItems: [
                        {
                            title: "Download as CSV",
                            action: function () {
                                var myElement = angular.element(document.querySelectorAll(".custom-csv-link-location"));
                                _this.gridApi.exporter.csvExport("all", "all", myElement);
                                _this.showDownloadCsv = true;
                            }
                        }
                    ],
                    onRegisterApi: function (gridApi) {
                        _this.gridApi = gridApi;
                    }
                };
            }
            EncounterReportCtrl.$inject = [
                "$interval", "$q", "$rootScope", "$scope", "$timeout",
                "dataAccessService", "progressIndicatorService", "userDataService"
            ];
            return EncounterReportCtrl;
        })();
        EncounterReport.EncounterReportCtrl = EncounterReportCtrl;

        // add to app
        Core.Modules.FeaturesEncounterReport.controller("encounterReportCtrl", [
            "$interval", "$q", "$rootScope", "$scope", "$timeout", "dataAccessService", "progressIndicatorService", "userDataService",
            function ($interval, $q, $rootScope, $scope, $timeout, dataAccessService, progressIndicatorService, userDataService) {
                return new EncounterReportCtrl($interval, $q, $rootScope, $scope, $timeout, dataAccessService, progressIndicatorService, userDataService);
            }
        ]);
    })(Features.EncounterReport || (Features.EncounterReport = {}));
    var EncounterReport = Features.EncounterReport;
})(Features || (Features = {}));
