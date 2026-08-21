var Features;
(function (Features) {
    // TODO:
    // fix zip data for map (pass it in?)
    // fix order for all charts
    // fix colors for all maps
    (function (EncounterReport) {
        "use strict";
        var Charts = Adap.Base.Charts;
        var Models = Core.Models;

        var EncounterReportCharts = (function () {
            function EncounterReportCharts(rootScope, ads) {
                var _this = this;
                // defined per page
                this.charts = [];
                this.leftChartRows = [];
                this.mainChartRows = [];
                this.bottomChartRows = [];
                // calculated
                this.dimensions = [];
                this.rootScope = rootScope;

                this.encounterKeyMetrics = new Models.EncounterKeyMetrics();

                // set sizes
                var shortHeight = 100;
                var normalHeight = 200;
                var tallHeight = 300;
                var fullWidth = 800;
                var threeQuarterWidth = fullWidth * 3 / 4;
                var halfWidth = fullWidth * 1 / 2;
                var thirdWidth = fullWidth * 1 / 3;
                var quarterWidth = fullWidth * 1 / 4;
                var baseMargin = { top: 5, right: 35, bottom: 45, left: 40 };

                // main area
                this.charts["ageBarFilter"] = {
                    title: "Suspect Age",
                    chartType: 1 /* filterBarChart */,
                    keyId: "age",
                    metricIds: ["count"],
                    sizeData: { width: thirdWidth, height: normalHeight, margin: baseMargin },
                    groupCountOverride: 25,
                    minX: 1,
                    maxX: 97,
                    elasticY: true,
                    hideFilter: true
                };

                this.charts["genderPieFilter"] = {
                    title: "Gender",
                    chartType: 4 /* filterPieChart */,
                    keyId: "gender",
                    metricIds: ["count"],
                    sizeData: { width: thirdWidth, height: 170, margin: baseMargin },
                    hideLegend: true,
                    donut: true,
                    hideFilter: true
                };

                this.charts["raceRowFilter"] = {
                    title: "Race",
                    chartType: 2 /* filterRowChart */,
                    keyId: "race",
                    metricIds: ["logCount"],
                    sizeData: { width: thirdWidth, height: 220, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["logCount"];
                    },
                    hideFilter: true
                };

                this.charts["stateRowFilter"] = {
                    title: "State",
                    chartType: 2 /* filterRowChart */,
                    keyId: "state",
                    metricIds: ["logCount"],
                    sizeData: { width: thirdWidth, height: 950, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["logCount"];
                    },
                    hideFilter: true
                };

                this.charts["causeOfDeathRowFilter"] = {
                    title: "Cause of Death",
                    chartType: 2 /* filterRowChart */,
                    keyId: "causeOfDeath",
                    metricIds: ["logCount"],
                    sizeData: { width: thirdWidth, height: 800, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["logCount"];
                    },
                    hideFilter: true
                };

                this.charts["illnessRowFilter"] = {
                    title: "Drug Use",
                    chartType: 2 /* filterRowChart */,
                    keyId: "illness",
                    metricIds: ["logCount"],
                    sizeData: { width: thirdWidth, height: normalHeight, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["logCount"];
                    },
                    hideFilter: true
                };

                this.charts["stateMapFilter"] = {
                    title: "Map",
                    chartType: 5 /* filterGeoChoroplethChart */,
                    keyId: "zip",
                    metricIds: ["count"],
                    sizeData: { width: fullWidth, height: 400, margin: baseMargin },
                    hideFilter: true,
                    hideTitle: true
                };

                this.charts["monthBarFilter"] = {
                    title: "Filter by Month",
                    chartType: 1 /* filterBarChart */,
                    keyId: "month",
                    metricIds: ["count"],
                    sizeData: { width: fullWidth, height: normalHeight, margin: baseMargin },
                    elasticY: true,
                    xUnitsOverride: d3.time.months,
                    hideTitle: false
                };

                this.mainChartRows = [
                    {
                        charts: [
                            this.charts["monthBarFilter"]
                        ]
                    },
                    {
                        charts: [
                            this.charts["stateMapFilter"]
                        ]
                    },
                    {
                        charts: [
                            this.charts["ageBarFilter"],
                            this.charts["genderPieFilter"],
                            this.charts["raceRowFilter"]
                        ]
                    },
                    {
                        charts: [
                            this.charts["stateRowFilter"],
                            this.charts["causeOfDeathRowFilter"],
                            this.charts["illnessRowFilter"]
                        ]
                    }
                ];

                // TODO: do we want to cache the crossfilter dimensions if there has been no data change?
                this.xfilter = crossfilter(ads);

                // build eventManager
                var eventManager = new Charts.EventManager();

                // build id dimension
                console.log("building dimension: id");
                var idKey = this.encounterKeyMetrics.keys["id"];
                this.dimensions["id"] = this.xfilter.dimension(idKey.dimensionFunc);
                idKey.min = idKey.dimensionFunc(this.dimensions["id"].bottom(1)[0]);
                idKey.max = idKey.dimensionFunc(this.dimensions["id"].top(1)[0]);

                for (var chartIndex in this.charts) {
                    var chart = this.charts[chartIndex];
                    chart.chartVm = Charts.buildChart(chart, this.encounterKeyMetrics.keys, this.encounterKeyMetrics.metrics, this.dimensions, this.xfilter, eventManager);
                }
                ;

                // subscribe AFTER charts to ensure to trigger correct refresh
                eventManager.subscribe("filtered", $.proxy(function () {
                    var phase = _this.rootScope.$$phase;
                    if (phase !== "$apply" && phase !== "$digest") {
                        _this.rootScope.$apply();
                    }
                }, this));
            }
            return EncounterReportCharts;
        })();
        EncounterReport.EncounterReportCharts = EncounterReportCharts;
    })(Features.EncounterReport || (Features.EncounterReport = {}));
    var EncounterReport = Features.EncounterReport;
})(Features || (Features = {}));
