var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // FilterLineChart
        // a dc based chart with lines running across the xaxis
        // https://tomneyland.github.io/angular-dc/example/stocks/nasdaq.html
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific dc options)
            var FilterLineChartViewModel = (function (_super) {
                __extends(FilterLineChartViewModel, _super);
                function FilterLineChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "lineChart";

                    // save value to the viewmodel
                    this.renderArea = chartBase.renderArea;

                    _super.prototype.init.call(this, function (c) {
                        // can add additional class specific extensions here
                        c.renderArea && c.renderArea(_this.renderArea);
                    });
                    // make other chart specific alterations after init
                }
                return FilterLineChartViewModel;
            })(Charts.AbstractFilterCoordinateGridChartViewModel);
            Charts.FilterLineChartViewModel = FilterLineChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
