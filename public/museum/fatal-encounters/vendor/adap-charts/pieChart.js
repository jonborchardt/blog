var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // PieChart
        // an NVd3 based chart that looks like a pie
        // http://krispo.github.io/angular-nvd3/#/pieChart
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific nvd3 options)
            var PieChartViewModel = (function (_super) {
                __extends(PieChartViewModel, _super);
                function PieChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "pieChart";

                    this.dataMapFunc = function () {
                        var ret = [];
                        if (_this.chartBase.metricIds.length > 1) {
                            console.log(Error("pieChart can only have one metric. using last one passed."), _this.chartBase.metricIds);
                        }
                        for (var metricIndex in _this.chartBase.metricIds) {
                            var metric = _this.metrics[_this.chartBase.metricIds[metricIndex]];

                            // for each metric, grab the values from the group
                            ret = _this.group.top(Infinity).map(function (d) {
                                return { key: _this.key.formatFunc(d.key), value: metric.valueFunc(d) };
                            });
                        }
                        ;
                        return ret;
                    };

                    _super.prototype.init.call(this);

                    // make other chart specific alterations after init
                    // set defaults // TODO: should we push any of these as options to caller?
                    var chart = this.nvd3Options.chart;
                    if (chartBase.donut) {
                        chart.donutRatio = 0.35;
                        chart.donut = true;
                        chart.donutLabelsOutside = true;
                    }
                    if (chartBase.hideLabels) {
                        chart.showLabels = !chartBase.hideLabels;
                    }
                    chart.labelThreshold = 0.05;
                    chart.valueFormat = this.metrics[this.chartBase.metricIds[0]].formatFunc;
                }
                return PieChartViewModel;
            })(Charts.AbstractNvd3ChartViewModelBase);
            Charts.PieChartViewModel = PieChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
