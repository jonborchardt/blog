var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // FilterBarChart
        // a dc based chart with bars aligned across the xaxis
        // https://tomneyland.github.io/angular-dc/example/stocks/nasdaq.html
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific dc options)
            var FilterBarChartViewModel = (function (_super) {
                __extends(FilterBarChartViewModel, _super);
                function FilterBarChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "barChart";

                    _super.prototype.init.call(this, function (c) {
                        // can add additional class specific extensions here
                    });
                    // make other chart specific alterations after init
                }
                return FilterBarChartViewModel;
            })(Charts.AbstractFilterCoordinateGridChartViewModel);
            Charts.FilterBarChartViewModel = FilterBarChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
