var Features;
(function (Features) {
    (function (RewardsReport) {
        "use strict";

        var RewardsReportCtrl = (function () {
            function RewardsReportCtrl($interval, $q, $rootScope, $scope, $timeout, dataAccessService, progressIndicatorService, userDataService) {
                var _this = this;
                this.showDownloadCsv = false;
                this.gridColumnDefs = [];
                this.loading = false;
                this.rewards = [];
                this.filterTheGrid = true;
                $scope.vm = this;
                this.scope = $scope;
                this.userDataService = userDataService;

                dataAccessService.getRewardsData().then(function (data) {
                    $scope.vm.rewards = data.rewards;
                    $scope.vm.rewardsReportCharts = new RewardsReport.RewardsReportCharts($rootScope, $scope.vm.rewards, data.people);
                });

                this.gridColumnDefs = [
                    { field: "Moment.format(\"MMM Do YYYY\")", displayName: "Date", width: "*" },
                    { field: "From", width: "*" },
                    { field: "Amount", width: "*" },
                    { field: "To", width: "*" },
                    { field: "Memo", width: "**" }
                ];

                this.gridOptions = {
                    data: this.filterTheGrid ? "vm.rewardsReportCharts.dimensions['id'].top(999999)" : "vm.rewards",
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
            RewardsReportCtrl.$inject = [
                "$interval", "$q", "$rootScope", "$scope", "$timeout",
                "dataAccessService", "progressIndicatorService", "userDataService"
            ];
            return RewardsReportCtrl;
        })();
        RewardsReport.RewardsReportCtrl = RewardsReportCtrl;

        // add to app
        Core.Modules.FeaturesRewardsReport.controller("rewardsReportCtrl", [
            "$interval", "$q", "$rootScope", "$scope", "$timeout", "dataAccessService", "progressIndicatorService", "userDataService",
            function ($interval, $q, $rootScope, $scope, $timeout, dataAccessService, progressIndicatorService, userDataService) {
                return new RewardsReportCtrl($interval, $q, $rootScope, $scope, $timeout, dataAccessService, progressIndicatorService, userDataService);
            }
        ]);
    })(Features.RewardsReport || (Features.RewardsReport = {}));
    var RewardsReport = Features.RewardsReport;
})(Features || (Features = {}));
