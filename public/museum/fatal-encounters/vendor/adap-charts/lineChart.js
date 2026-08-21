var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // LineChart
        // an NVd3 based chart with lines aligned across the xaxis
        // http://krispo.github.io/angular-nvd3/#/lineChart
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific nvd3 options)
            var LineChartViewModel = (function (_super) {
                __extends(LineChartViewModel, _super);
                function LineChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "lineChart";

                    _super.prototype.init.call(this);

                    // make other chart specific alterations after init
                    var chart = this.nvd3Options.chart;
                    if (chartBase.isArea) {
                        chart.isArea = chartBase.isArea;
                    }
                }
                return LineChartViewModel;
            })(Charts.AbstractNvd3ChartViewModelBase);
            Charts.LineChartViewModel = LineChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
