var Features;
(function (Features) {
    // TODO:
    // fix zip data for map (pass it in?)
    // fix order for all charts
    // fix colors for all maps
    (function (RewardsReport) {
        "use strict";
        var Charts = Adap.Base.Charts;
        var Models = Core.Models;

        var RewardsReportCharts = (function () {
            function RewardsReportCharts(rootScope, rewards, people) {
                var _this = this;
                // defined per page
                this.charts = [];
                this.leftChartRows = [];
                this.mainChartRows = [];
                this.bottomChartRows = [];
                // calculated
                this.dimensions = [];
                this.rootScope = rootScope;

                this.rewardsKeyMetrics = new Models.RewardsKeyMetrics();

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
                var barHeight = 20;

                // main area
                this.charts["weekBarFilter"] = {
                    title: "When",
                    chartType: 1 /* filterBarChart */,
                    keyId: "month",
                    metricIds: ["amount"],
                    sizeData: { width: halfWidth + 20, height: shortHeight, margin: baseMargin },
                    elasticY: true,
                    xUnitsOverride: d3.time.months,
                    hideTitle: false
                };

                this.charts["amountBarFilter"] = {
                    title: "How Much",
                    chartType: 1 /* filterBarChart */,
                    keyId: "amount",
                    metricIds: ["amount"],
                    sizeData: { width: quarterWidth, height: shortHeight, margin: baseMargin },
                    groupCountOverride: 20,
                    elasticY: true,
                    hideFilter: true,
                    minX: 0,
                    maxX: 101
                };

                this.charts["ltvPieFilter"] = {
                    title: "LTV Internal",
                    chartType: 4 /* filterPieChart */,
                    keyId: "ltv",
                    metricIds: ["amount"],
                    sizeData: { width: quarterWidth - 30, height: shortHeight - 30, margin: baseMargin },
                    hideFilter: true
                };

                this.charts["topFromRowFilter"] = {
                    title: "Top Givers",
                    chartType: 2 /* filterRowChart */,
                    keyId: "from",
                    metricIds: ["amount"],
                    sizeData: { width: quarterWidth, height: 400, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["amount"];
                    },
                    hideFilter: true,
                    rowCap: 20,
                    fixedBarHeight: barHeight,
                    dynamicHeight: true
                };

                this.charts["topToRowFilter"] = {
                    title: "Top Rewarded",
                    chartType: 2 /* filterRowChart */,
                    keyId: "to",
                    metricIds: ["amount"],
                    sizeData: { width: quarterWidth, height: 400, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["amount"];
                    },
                    hideFilter: true,
                    rowCap: 20,
                    fixedBarHeight: barHeight,
                    dynamicHeight: true
                };

                this.charts["memoRowFilter"] = {
                    title: "Why",
                    chartType: 2 /* filterRowChart */,
                    keyId: "memo",
                    metricIds: ["amount"],
                    sizeData: { width: halfWidth - 20, height: 400, margin: baseMargin },
                    ordering: function (d) {
                        return -d.value["value"]["amount"];
                    },
                    hideFilter: true,
                    rowCap: 20,
                    fixedBarHeight: barHeight,
                    dynamicHeight: true
                };

                this.charts["fromRowFilter"] = {
                    title: "_ All Givers",
                    chartType: 2 /* filterRowChart */,
                    keyId: "from2",
                    metricIds: ["amount"],
                    sizeData: { width: quarterWidth, height: 400, margin: baseMargin },
                    hideFilter: true,
                    fixedBarHeight: barHeight,
                    dynamicHeight: true
                };
                this.charts["toRowFilter"] = {
                    title: "_ All Rewarded",
                    chartType: 2 /* filterRowChart */,
                    keyId: "to2",
                    metricIds: ["amount"],
                    sizeData: { width: quarterWidth, height: 400, margin: baseMargin },
                    hideFilter: true,
                    fixedBarHeight: barHeight,
                    dynamicHeight: true
                };

                this.leftChartRows = [
                    {
                        charts: [
                            this.charts["fromRowFilter"],
                            this.charts["toRowFilter"]
                        ]
                    }
                ];

                this.mainChartRows = [
                    {
                        charts: [
                            this.charts["weekBarFilter"],
                            this.charts["amountBarFilter"],
                            this.charts["ltvPieFilter"]
                        ]
                    },
                    {
                        charts: [
                            this.charts["topFromRowFilter"],
                            this.charts["topToRowFilter"],
                            this.charts["memoRowFilter"]
                        ]
                    }
                ];

                // TODO: do we want to cache the crossfilter dimensions if there has been no data change?
                this.xfilter = crossfilter(rewards);

                // build eventManager
                var eventManager = new Charts.EventManager();

                // build id dimension
                console.log("building dimension: id");
                var idKey = this.rewardsKeyMetrics.keys["id"];
                this.dimensions["id"] = this.xfilter.dimension(idKey.dimensionFunc);
                idKey.min = idKey.dimensionFunc(this.dimensions["id"].bottom(1)[0]);
                idKey.max = idKey.dimensionFunc(this.dimensions["id"].top(1)[0]);

                for (var chartIndex in this.charts) {
                    var chart = this.charts[chartIndex];
                    chart.chartVm = Charts.buildChart(chart, this.rewardsKeyMetrics.keys, this.rewardsKeyMetrics.metrics, this.dimensions, this.xfilter, eventManager);
                }
                ;

                // subscribe AFTER charts to ensure to trigger correct refresh
                eventManager.subscribe("filtered", $.proxy(function () {
                    var phase = _this.rootScope.$$phase;
                    if (phase !== "$apply" && phase !== "$digest") {
                        _this.rootScope.$apply();
                    }
                }, this));

                //temp
                eventManager.subscribe("filtered", $.proxy(function () {
                    // first get a new list opf people who are in the filtred set
                    var filteredRewards = _this.dimensions['id'].top(999999);
                    var filteredPeople = [];
                    filteredRewards.forEach(function (d) {
                        var tempIndex = people[d.ToIndex]["tempIndex"];
                        if (typeof (tempIndex) == 'undefined') {
                            people[d.ToIndex]["tempIndex"] = filteredPeople.length;
                            filteredPeople.push(people[d.ToIndex]);
                        }
                        var tempIndex = people[d.FromIndex]["tempIndex"];
                        if (typeof (tempIndex) == 'undefined') {
                            people[d.FromIndex]["tempIndex"] = filteredPeople.length;
                            filteredPeople.push(people[d.FromIndex]);
                        }
                    });

                    // limit how many we show
                    var count = 500;
                    filteredPeople = filteredPeople.slice(0, count);

                    // build matrix
                    var matrix = [];
                    filteredPeople.forEach(function (d, i) {
                        var innerArray = [];
                        filteredPeople.forEach(function (dd, ii) {
                            innerArray.push(0);
                        });
                        matrix.push(innerArray);
                    });

                    // fill matrix
                    filteredRewards.forEach(function (d) {
                        var fromIndex = people[d.FromIndex]["tempIndex"];
                        var toIndex = people[d.ToIndex]["tempIndex"];
                        if (fromIndex < count && toIndex < count) {
                            matrix[fromIndex][toIndex] += d.Amount;
                        }
                    });

                    // begin d3 code
                    var width = 700, height = 700, outerRadius = Math.min(width, height) / 2 - 10, innerRadius = outerRadius - 24;

                    var formatPercent = function (d) {
                        return Charts.currencyShiftingFormatter(d, Charts.commaFormatter[0]);
                    };

                    var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

                    var layout = d3.layout.chord().padding(.04).sortSubgroups(d3.descending).sortChords(d3.ascending);

                    var path = d3.svg.chord().radius(innerRadius);

                    d3.select("#chord svg").remove();
                    var svg = d3.select("#chord").append("svg").attr("width", width).attr("height", height).append("g").attr("id", "circle").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    svg.append("circle").attr("r", outerRadius);

                    // Compute the chord layout.
                    layout.matrix(matrix);

                    // Add a group per neighborhood.
                    var group = svg.selectAll(".group").data(layout.groups).enter().append("g").attr("class", "group").on("mouseover", mouseover);

                    // Add a mouseover title.
                    group.append("title").text(function (d, i) {
                        return filteredPeople[i].name + ": " + formatPercent(d.value);
                    });

                    // Add the group arc.
                    var groupPath = group.append("path").attr("id", function (d, i) {
                        return "group" + i;
                    }).attr("d", arc).style("fill", function (d, i) {
                        return filteredPeople[i].color;
                    });

                    // Add a text label.
                    var groupText = group.append("text").attr("x", 6).attr("dy", 15);

                    groupText.append("textPath").attr("xlink:href", function (d, i) {
                        return "#group" + i;
                    }).text(function (d, i) {
                        return filteredPeople[i].name.slice(0, 20);
                    });

                    // Remove the labels that don't fit. :(
                    groupText.filter(function (d, i) {
                        return (groupPath[0][i].getTotalLength() / 2 - 2) < this.getComputedTextLength();
                    }).remove();

                    // Add the chords.
                    var chord = svg.selectAll(".chord").data(layout.chords).enter().append("path").attr("class", "chord").style("fill", function (d) {
                        return filteredPeople[d.source.index].color;
                    }).attr("d", path);

                    // Add an elaborate mouseover title for each chord.
                    chord.append("title").text(function (d) {
                        return filteredPeople[d.source.index].name + " → " + filteredPeople[d.target.index].name + ": " + formatPercent(d.source.value) + "\n" + filteredPeople[d.target.index].name + " → " + filteredPeople[d.source.index].name + ": " + formatPercent(d.target.value);
                    });

                    function mouseover(d, i) {
                        chord.classed("fade", function (p) {
                            return p.source.index != i && p.target.index != i;
                        });
                    }

                    // remove tempIndex
                    people.forEach(function (d) {
                        delete d["tempIndex"];
                    });
                }, this));
            }
            return RewardsReportCharts;
        })();
        RewardsReport.RewardsReportCharts = RewardsReportCharts;
    })(Features.RewardsReport || (Features.RewardsReport = {}));
    var RewardsReport = Features.RewardsReport;
})(Features || (Features = {}));
