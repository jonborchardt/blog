var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // FilterPieChart
        // a dc based chart pie slices
        // https://tomneyland.github.io/angular-dc/example/stocks/nasdaq.html
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific dc options)
            var FilterPieChartViewModel = (function (_super) {
                __extends(FilterPieChartViewModel, _super);
                function FilterPieChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "pieChart";

                    // the pie chart uses a slightly different key value pair, and we want to convert it to what the generic charts expect
                    var firstMetric = this.metrics[this.chartBase.metricIds[0]];
                    var valueFuncWrapper = $.proxy(function (p) {
                        if (p.data) {
                            p = p.data;
                        }
                        if (p.key === "Others") {
                            return p.value;
                        }
                        if (!p.value || !p.value.value) {
                            return 0.001;
                        }
                        var ret = Math.max(0.001, firstMetric.valueFunc(p));
                        return ret;
                    }, this);

                    // set inner radius to defaulot size if not specified
                    this.innerRadius = chartBase.innerRadius ? chartBase.innerRadius : Math.min(this.width, this.height) / 4;
                    this.slicesCap = chartBase.slicesCap;

                    _super.prototype.init.call(this, function (c) {
                        // can add additional class specific extensions here
                        c.valueAccessor && c.valueAccessor(valueFuncWrapper); // trumps base

                        c.slicesCap && _this.slicesCap && c.slicesCap(_this.slicesCap);
                        c.innerRadius && _this.innerRadius && c.innerRadius(_this.innerRadius);
                    });

                    // make other chart specific alterations after init
                    // trump title
                    this.dcOptions.title = $.proxy(function (p) {
                        return this.key.formatFunc(p.data ? p.data.key : p.key) + ": " + firstMetric.formatFunc(valueFuncWrapper(p)) + " " + firstMetric.title;
                    }, this);
                }
                return FilterPieChartViewModel;
            })(Charts.AbstractDcChartViewModelBase);
            Charts.FilterPieChartViewModel = FilterPieChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
