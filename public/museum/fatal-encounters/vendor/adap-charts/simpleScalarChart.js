var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // SimpleScalarChart
        // an chart showing a number and title
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific scalar options)
            var SimpleScalarChartViewModel = (function (_super) {
                __extends(SimpleScalarChartViewModel, _super);
                function SimpleScalarChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "simpleScalarChart";

                    _super.prototype.init.call(this);
                }
                return SimpleScalarChartViewModel;
            })(Charts.AbstractScalarChartViewModelBase);
            Charts.SimpleScalarChartViewModel = SimpleScalarChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
