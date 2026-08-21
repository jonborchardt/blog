var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        // FilterRowChart
        // a dc based chart with rowBars aligned across the yaxis
        // https://tomneyland.github.io/angular-dc/example/stocks/nasdaq.html
        (function (Charts) {
            "use strict";

            

            

            // view model class (use init to add most chart specific dc options)
            var FilterRowChartViewModel = (function (_super) {
                __extends(FilterRowChartViewModel, _super);
                function FilterRowChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    this.chartType = "rowChart";

                    // the row chart uses a slightly different key value pair, and we want to convert it to what the generic charts expect
                    var firstMetric = this.metrics[this.chartBase.metricIds[0]];
                    var valueFuncWrapper = $.proxy(function (p) {
                        if (p.key === "Others") {
                            return p.value;
                        }
                        return firstMetric.valueFunc(p);
                    }, this);

                    // hold on to specific chart values
                    this.rowCap = chartBase.rowCap;
                    this.ordering = chartBase.ordering;
                    this.fixedBarHeight = chartBase.fixedBarHeight;
                    this.dynamicHeight = chartBase.dynamicHeight;
                    this.hideOthers = chartBase.hideOthers;

                    // update axis (the xAxis of a rowChart shows the METRIC)
                    this.xAxisTicks = chartBase.xAxisTicks ? chartBase.xAxisTicks : Math.floor(this.width / 55);
                    this.xAxisTickFormat = firstMetric.formatFunc; // using first one for DC

                    _super.prototype.init.call(this, function (c) {
                        // can add additional class specific extensions here
                        c.valueAccessor && c.valueAccessor(valueFuncWrapper); // trumps base

                        c.cap && _this.rowCap && c.cap(_this.rowCap);
                        c.ordering && _this.ordering && c.ordering(_this.ordering);
                        c.xAxis && c.xAxis().ticks && _this.xAxisTicks && c.xAxis().ticks(_this.xAxisTicks);
                        c.xAxis && c.xAxis().tickFormat && _this.xAxisTickFormat && c.xAxis().tickFormat(_this.xAxisTickFormat);
                        c.fixedBarHeight && _this.fixedBarHeight && c.fixedBarHeight(_this.fixedBarHeight);

                        // hide others if specified
                        if (_this.hideOthers) {
                            c.data($.proxy(function (group) {
                                var topRows = c._computeOrderedGroups(group.all());

                                // limit to cap if specified
                                if (c.cap && this.rowCap) {
                                    topRows = topRows.slice(0, this.rowCap);
                                }
                                return topRows;
                            }, _this));
                        } else if (c.cap && _this.rowCap && c.ordering && _this.ordering) {
                            c.data($.proxy(function (group) {
                                var topRows = c._computeOrderedGroups(group.all());
                                topRows = topRows.slice(0, this.rowCap);
                                return topRows;
                            }, _this));
                        }

                        // float height if specified (this.fixedBarHeight is required)
                        if (_this.dynamicHeight && _this.fixedBarHeight) {
                            c.height(c.data().length * _this.fixedBarHeight + 15 + _this.margin.bottom + _this.margin.top);
                        } else if (_this.dynamicHeight) {
                            console.log(Error("dynamicHeight=false requires fixedBarHeight to be defined"));
                        }
                    });

                    // trump title
                    this.dcOptions.title = $.proxy(function (p) {
                        return this.key.formatFunc(p.key) + ": " + firstMetric.formatFunc(valueFuncWrapper(p)) + " " + firstMetric.title;
                    }, this);
                    // make other chart specific alterations after init
                }
                return FilterRowChartViewModel;
            })(Charts.AbstractDcChartViewModelBase);
            Charts.FilterRowChartViewModel = FilterRowChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
