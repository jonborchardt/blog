var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // MultiBarChart
        // an NVd3 based chart with multiple bars aligned across the xaxis
        // http://krispo.github.io/angular-nvd3/#/multiBarChart
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific nvd3 options)
            var MultiBarChartViewModel = (function (_super) {
                __extends(MultiBarChartViewModel, _super);
                function MultiBarChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "multiBarChart";

                    _super.prototype.init.call(this);

                    // make other chart specific alterations after init
                    var chart = this.nvd3Options.chart;
                    if (chartBase.hideControls) {
                        chart.showControls = !chartBase.hideControls;
                    }
                    if (chartBase.stacked) {
                        chart.stacked = chartBase.stacked;
                    }
                    if (chartBase.staggerLabels) {
                        chart.staggerLabels = chartBase.staggerLabels;
                    }
                    if (chartBase.rotateLabels) {
                        chart.rotateLabels = chartBase.rotateLabels;
                    }
                }
                return MultiBarChartViewModel;
            })(Charts.AbstractNvd3ChartViewModelBase);
            Charts.MultiBarChartViewModel = MultiBarChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
