// holds abstract chart definitions for generic charts
/*
* 			Inheritance structure of chart defs:
*			IAbstractChartBase<T>
*				IAbstractDcChartBase<T>
*	 				IAbstractFilterCoordinateGridChart<T>
*						IFilterBarChart<T>
*						IFilterLineChart<T>
*					IFilterPieChart<T>
*					IFilterRowChart<T>
*				IAbstractNvd3ChartBase<T>
*					IMultiBarChart<T>
*                  IPieChart<T>
*                  ILineChart<T>
*					[add more nvd3 here]
*
*			Inheritance structure of view models:
*			IAbstractChartViewModelBase<T>
*				IAbstractDcChartViewModelBase<T>
*					IAbstractFilterCoordinateGridChartViewModel<T>
*						IFilterBarChartViewModel<T>
*						IFilterLineChartViewModel<T>
*					IFilterPieChartViewModel<T>
*					IFilterRowChartViewModel<T>
*				IAbstractNvd3ChartViewModelBase<T>
*					IMultiBarChartViewModel<T>
*                  IPieChartViewModel<T>
*                  ILineChartViewModel<T>
*					[add more nvd3 here]
*
*/
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Adap;
(function (Adap) {
    (function (Base) {
        (function (_Charts) {
            "use strict";
            var Charts = Adap.Base.Charts;

            /* simple example:
            
            // data example
            var data = <IData[]>[
            <IData>{ dateTime: moment([2014, 1, 1]), daypart: "1.Morning", cpm: 2.5, impressions: 123456000 },
            <IData>{ dateTime: moment([2014, 1, 2]), daypart: "1.Morning", cpm: 3, impressions: 23456000 },
            <IData>{ dateTime: moment([2014, 1, 3]), daypart: "2.Prime", cpm: 4.56, impressions: 3456000 },
            <IData>{ dateTime: moment([2014, 1, 4]), daypart: "3.Evening", cpm: 12.1, impressions: 456000 },
            <IData>{ dateTime: moment([2014, 1, 4]), daypart: "4.Overnight", cpm: 2.5, impressions: 5600000 }
            ];
            
            
            // crossfilter definition
            // http://square.github.io/crossfilter/
            this.xfilter = crossfilter(data); // a crossfilter object
            this.dimensions = []; // starts out empty (filled in as used)
            
            
            // key definition:
            // keys represent the domain / dimension of the data (how the data is grouped)
            this.keys = [];
            this.keys["day"] =
            <Charts.IKey<IData>>{
            id: "day", // used for lookup
            title: "Day", // used for labels
            valueType: Charts.ValueType.Date,
            formatFunc: (d: Date) => { return moment(d).format("MM/DD/YYYY"); }, // how should the key be formatted
            dimensionFunc: (d: IData) => { return d.dateTime; }, // what defines the domain
            groupFunc: (d: Moment) => { return d.startOf("day"); } // how should this be grouped
            };
            this.keys["daypart"] =
            <Charts.IKey<IData>>{
            id: "daypart",
            title: "Daypart",
            valueType: Charts.ValueType.String,
            formatFunc: (d: string) => { return d.substr(d.indexOf(".") + 1, 30); },
            dimensionFunc: (d: IData) => { return d.daypart; },
            groupFunc: (d: string) => { return d; }
            };
            
            
            // metric definition:
            // metrics represent how we sum up or average the data inside a group or dimension
            this.metrics = [];
            this.metrics["cpm"] =
            <Charts.IMetric<IData>>{
            id: "cpm", // used for lookup
            title: "CPM", // used for labels
            valueType: Charts.ValueType.Currency,
            formatFunc: (d: number) => { // how should the metric be formatted
            return Charts.currencyShiftingFormatter(d, Charts.commaFormatter[2]);
            },
            valueFunc: (p: Charts.IKeyValuePair) => { // how do we retrieve the value from the metric
            return (p.value.weightTotal["cpm"] ? p.value.value["cpm"] / p.value.weightTotal["cpm"] : 0);
            },
            reduceFunc: (d: IData) => { return d.cpm; }, // what defines the metric
            reduceWeightFunc: (d: IData) => { return d.impressions; } // what defines the denominator of the metric
            };
            this.metrics["impressions"] =
            <Charts.IMetric<IData>>{
            id: "impressions",
            title: "Impressions",
            valueType: Charts.ValueType.Number,
            formatFunc: (d: number) => { return Charts.commaShiftingFormatter(d, Charts.commaFormatter[1]); },
            valueFunc: (p: Charts.IKeyValuePair) => {
            return p.value.value["impressions"];
            },
            reduceFunc: (d: IData) => { return d.impressions; },
            reduceWeightFunc: (d: IData) => { return 1; }
            };
            
            
            // set sizes
            var shortHeight: number = 100;
            var normalHeight: number = 120;
            var tallHeight: number = 213;
            var fullWidth:number = 730;
            var threeQuarterWidth: number = fullWidth * 3 / 4;
            var halfWidth: number = fullWidth * 1 / 2;
            var quarterWidth: number = fullWidth * 1 / 4;
            var baseMargin: Charts.IMarginObj = { top: 5, right: 10, bottom: 20, left: 50 };
            
            
            // chart definition:
            // charts hold data required to determine how to build a chart
            this.charts = [];
            this.charts["impressionsPerDaypart"] = <Charts.IFilterPieChart<IData>>{
            title: "Dayparts (impressions)", // title of the chart
            chartType: Charts.ChartType.filterPieChart,
            keyId: "daypart", // key
            metricIds: ["impressions"], // list of metrics to use in the chart
            sizeData: <Charts.ISizeData>{ width:quarterWidth, height:normalHeight, margin:baseMargin } // size of the chart
            };
            this.charts["cpmByDay"] = <Charts.IFilterRowChart<IData>>{
            title: "CPM by Day",
            chartType: Charts.ChartType.filterRowChart,
            keyId: "day",
            metricIds: ["cpm"],
            sizeData: <Charts.ISizeData>{ width:quarterWidth, height:tallHeight, margin:baseMargin },
            rowCap: 8
            };
            
            
            // chart rows:
            // rown explain where charts should be placed on the page
            this.chartRows =
            [
            <Charts.IChartRow<IData>>{
            charts: <Charts.IAbstractChartBase<IData>[]>
            [
            this.charts["impressionsPerDaypart"],
            this.charts["cpmByDay"]
            ]
            }
            ];
            
            
            // build eventManager
            var eventManager = new Charts.EventManager();
            
            // with the values above, we generate a chartViewModel for each chart definition
            for (var chartIndex in this.charts) {
            var chart: Charts.IAbstractChartBase<IData> = this.charts[chartIndex];
            chart.chartVm = Charts.buildChart<IData>(chart, this.keys, this.metrics,
            this.dimensions, this.sizeBasedStyler, this.xfilter, eventManager);
            };
            
            
            // subscribe AFTER charts to ensure to trigger correct refresh
            eventManager.subscribe("filtered", $.proxy(() => {
            var phase: string = this.rootScope.$$phase;
            if (phase !== "$apply" && phase !== "$digest") {
            this.rootScope.$apply();
            }
            }, this));
            
            
            // the chart is then displayed via angular repeat in the view
            // <div ng-repeat="chartRows in vm.tvReportCharts.chartRows" class="row">
            //	<div ng-repeat="chart in chartRows.charts">
            //	  <div ng-if="null != chart.chartVm.dimension && null != chart.chartVm.dcPostSetupChart && null !=chart.chartVm.dcOptions"
            //		   dc-chart={{chart.chartVm.chartType}}
            //		   dc-options="chart.chartVm.dcOptions"
            //		   dc-post-setup-chart="chart.chartVm.dcPostSetupChart">
            //		<strong ng-if="!chart.hideTitle">{{chart.title}}</strong>
            //		<br />
            //		<a ng-if="!chart.hideReset" class="reset" href="javascript:;" style="display: none;"><span class="label label-danger">
            //			reset filter
            //		</span></a>
            //		<div ng-if="!chart.hideFilter" class="filter"></div>
            //		<div class="clearfix"></div>
            //	  </div>
            //	  <nvd3 ng-if="null != chart.chartVm.dimension && null != chart.chartVm.nvd3Data && null != chart.chartVm.nvd3Options"
            //			options="chart.chartVm.nvd3Options"
            //			data="chart.chartVm.nvd3Data">
            //	  </nvd3>
            //	</div>
            // </div
            */
            // defines all current valid chart types
            (function (ChartType) {
                ChartType[ChartType["simpleScalarChart"] = 0] = "simpleScalarChart";
                ChartType[ChartType["filterBarChart"] = 1] = "filterBarChart";
                ChartType[ChartType["filterRowChart"] = 2] = "filterRowChart";
                ChartType[ChartType["filterLineChart"] = 3] = "filterLineChart";
                ChartType[ChartType["filterPieChart"] = 4] = "filterPieChart";
                ChartType[ChartType["multiBarChart"] = 5] = "multiBarChart";
                ChartType[ChartType["pieChart"] = 6] = "pieChart";
                ChartType[ChartType["lineChart"] = 7] = "lineChart";
            })(_Charts.ChartType || (_Charts.ChartType = {}));
            var ChartType = _Charts.ChartType;
            ;

            // static chart builder
            function buildChart(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                switch (chartBase.chartType) {
                    case 0 /* simpleScalarChart */: {
                        return new _Charts.SimpleScalarChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 1 /* filterBarChart */: {
                        return new _Charts.FilterBarChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 2 /* filterRowChart */: {
                        return new _Charts.FilterRowChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 3 /* filterLineChart */: {
                        return new _Charts.FilterLineChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 4 /* filterPieChart */: {
                        return new _Charts.FilterPieChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 5 /* multiBarChart */: {
                        return new _Charts.MultiBarChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 6 /* pieChart */: {
                        return new _Charts.PieChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }
                    case 7 /* lineChart */: {
                        return new _Charts.LineChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    }

                    default: {
                        console.log(Error("Chart type unsupported: " + chartBase.chartType));
                        return null;
                    }
                }
            }
            _Charts.buildChart = buildChart;

            

            

            

            

            

            

            // base view model class for all charts
            // none of the properties should be altered (readonly is not supported by typescript yet)
            var AbstractChartViewModelBase = (function () {
                function AbstractChartViewModelBase(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    console.log("building chart: " + chartBase.title);

                    // hold on to chartBase
                    this.chartBase = chartBase;

                    // hold on to event manager
                    this.eventManager = eventManager;

                    // set style
                    this.margin = chartBase.sizeData.margin;
                    this.width = chartBase.sizeData.width;
                    this.height = chartBase.sizeData.height;

                    // set key
                    this.key = allKeys[chartBase.keyId];

                    // build dimension if not already built by a previous chart
                    if (!allDimensions[this.key.id]) {
                        console.log("building dimension: " + this.key.id);
                        allDimensions[this.key.id] = xfilter.dimension(this.key.dimensionFunc);

                        // set min/max per metric if not set by user
                        if (!this.key.min) {
                            this.key.min = this.key.dimensionFunc(allDimensions[this.key.id].bottom(1)[0]);
                        }
                        if (!this.key.max) {
                            this.key.max = this.key.dimensionFunc(allDimensions[this.key.id].top(1)[0]);
                        }
                    }
                    this.dimension = allDimensions[this.key.id];

                    // collect metrics
                    this.metrics = [];
                    for (var metricIndex in chartBase.metricIds) {
                        this.metrics[chartBase.metricIds[metricIndex]] = allMetrics[chartBase.metricIds[metricIndex]];
                    }

                    // if the chart is overriding the standard grouping function, devide the dimention by the desired chunks
                    var groupFunc = this.key.groupFunc;
                    if (this.chartBase.groupCountOverride) {
                        if (this.key.valueType === 0 /* Currency */ || this.key.valueType === 1 /* Number */) {
                            var minX = chartBase.minX ? chartBase.minX : this.key.min;
                            var maxX = chartBase.maxX ? chartBase.maxX : this.key.max;
                            var range = maxX - minX;
                            groupFunc = function (d) {
                                return minX + ((Math.floor((d - minX) / range * _this.chartBase.groupCountOverride) / _this.chartBase.groupCountOverride) * range);
                            };
                        } else {
                            console.log(Error("groupCountOverride is only usable on Number and Currency ValueTypes: " + this.key.valueType));
                        }
                    }

                    // make group
                    this.group = this.dimension.group(groupFunc).reduce($.proxy(function (p, v) {
                        if (!p.order) {
                            p.order = this.key.groupFunc(this.key.dimensionFunc(v));
                        }
                        for (var metricIndex in this.metrics) {
                            var metric = this.metrics[metricIndex];
                            var weight = metric.reduceWeightFunc(v);
                            p.value[metric.id] += (metric.reduceFunc(v) * weight);
                            p.weightTotal[metric.id] += weight;

                            // fix rounding error
                            p.value[metric.id] = d3.round(p.value[metric.id], 2);
                            p.weightTotal[metric.id] = d3.round(p.weightTotal[metric.id], 2);
                        }
                        return p;
                    }, this), $.proxy(function (p, v) {
                        for (var metricIndex in this.metrics) {
                            var metric = this.metrics[metricIndex];
                            var weight = metric.reduceWeightFunc(v);
                            p.value[metric.id] -= (metric.reduceFunc(v) * weight);
                            p.weightTotal[metric.id] -= weight;

                            // fix rounding error
                            p.value[metric.id] = d3.round(p.value[metric.id], 2);
                            p.weightTotal[metric.id] = d3.round(p.weightTotal[metric.id], 2);
                        }
                        return p;
                    }, this), // init
                    function () {
                        var p = { value: [], weightTotal: [], order: null };
                        for (var metricIndex in _this.metrics) {
                            var metric = _this.metrics[metricIndex];
                            p.value[metric.id] = 0;
                            p.weightTotal[metric.id] = 0;
                        }
                        return p;
                    });
                    this.group.order(function (p) {
                        return p.order;
                    });
                }
                return AbstractChartViewModelBase;
            })();
            _Charts.AbstractChartViewModelBase = AbstractChartViewModelBase;

            

            // base view model class for all scalar charts
            // none of the properties should be altered (readonly is not supported by typescript yet)
            var AbstractScalarChartViewModelBase = (function (_super) {
                __extends(AbstractScalarChartViewModelBase, _super);
                function AbstractScalarChartViewModelBase(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    this.dataMapFunc = null;

                    this.dataMapFunc = function (isAverage) {
                        var ret = [];
                        for (var metricIndex in _this.chartBase.metricIds) {
                            var metric = _this.metrics[_this.chartBase.metricIds[metricIndex]];

                            // for each metric, grab the values from the group
                            var value = 0;
                            if (isAverage && isAverage(metric.title)) {
                                var valNu = _this.dimension.groupAll().reduceSum(function (d) {
                                    return metric.reduceFunc(d) * metric.reduceWeightFunc((d));
                                }).value();
                                var valDe = _this.dimension.groupAll().reduceSum(function (d) {
                                    return metric.reduceWeightFunc((d));
                                }).value();
                                value = valNu / valDe;
                            } else {
                                value = _this.dimension.groupAll().reduceSum(function (d) {
                                    return metric.reduceFunc(d);
                                }).value();
                            }
                            ret.push({
                                key: metric.title,
                                value: metric.formatFunc(value),
                                detail: value
                            });
                        }
                        ;
                        return ret;
                    };
                }
                // init sets up the scalar data
                AbstractScalarChartViewModelBase.prototype.init = function () {
                    var _this = this;
                    console.log("init chart: " + this.chartBase.title);
                    var scalarChartBase = this.chartBase;

                    this.scalarChartData = this.dataMapFunc(scalarChartBase.isAverage);

                    // update data if crossfilter filtered event
                    this.eventManager.subscribe("filtered", $.proxy(function () {
                        _this.scalarChartData = _this.dataMapFunc(scalarChartBase.isAverage);
                    }, this));
                };
                return AbstractScalarChartViewModelBase;
            })(AbstractChartViewModelBase);
            _Charts.AbstractScalarChartViewModelBase = AbstractScalarChartViewModelBase;

            

            // base view model class for all DC charts
            // none of the properties should be altered (readonly is not supported by typescript yet)
            var AbstractDcChartViewModelBase = (function (_super) {
                __extends(AbstractDcChartViewModelBase, _super);
                function AbstractDcChartViewModelBase(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    if (this.chartBase.metricIds.length !== 1) {
                        console.log(Error("filter charts (dc) are required to have exactly 1 metric: found " + this.chartBase.metricIds.length + " in chart " + this.chartBase.title));
                    }
                }
                // init sets up the dc data
                AbstractDcChartViewModelBase.prototype.init = function (initExtension) {
                    var _this = this;
                    console.log("init chart: " + this.chartBase.title);

                    // grab first metric (currently only using the first dc metric in most cases, TODO: use stacks for the rest)
                    var firstMetric = this.metrics[this.chartBase.metricIds[0]];

                    // build options
                    this.dcOptions = {
                        // default title (label you see on a bar/pie slice/etc)
                        title: $.proxy(function (p) {
                            return this.key.formatFunc(p.key) + ": " + firstMetric.formatFunc(firstMetric.valueFunc(p)) + " " + firstMetric.title;
                        }, this),
                        // default label (what you see on hover/tooltio)
                        label: $.proxy(function (p) {
                            return this.key.formatFunc(p.key);
                        }, this),
                        // default filter printer (what you see when you do a filter)
                        filterPrinter: $.proxy(function (filters) {
                            var _this = this;
                            if (Object.prototype.toString.call(filters[0]) === "[object Array]") {
                                return this.key.formatFunc(filters[0][0]) + " -> " + this.key.formatFunc(filters[0][1]);
                            } else {
                                return filters.map(function (f) {
                                    return _this.key.formatFunc(f);
                                }).join(", ");
                            }
                        }, this),
                        // set default callback on filter event for this chart
                        onFiltered: $.proxy(function (d) {
                            // let others know about our filter event
                            _this.eventManager.publish("filtered");
                        }, this)
                    };

                    // build postSetupChart (then call initExtension)
                    this.dcPostSetupChart = $.proxy(function (c) {
                        c.valueAccessor && c.valueAccessor(firstMetric.valueFunc); // dc always only uses first metric
                        c.margins && c.margins(this.margin);
                        c.width && c.width(this.width);
                        c.height && c.height(this.height);
                        c.dimension && c.dimension(this.dimension);
                        c.group && c.group(this.group);

                        // default
                        c.centerBar && c.centerBar(true);
                        c.gap && c.gap(1);
                        c.alwaysUseRounding && c.alwaysUseRounding(true);
                        c.renderHorizontalGridLines && c.renderHorizontalGridLines(true);

                        // add chart specific extensions
                        initExtension(c);
                    }, this);
                };
                return AbstractDcChartViewModelBase;
            })(AbstractChartViewModelBase);
            _Charts.AbstractDcChartViewModelBase = AbstractDcChartViewModelBase;

            

            // base view model class for all NVD3 charts
            // none of the properties should be altered (readonly is not supported by typescript yet)
            var AbstractNvd3ChartViewModelBase = (function (_super) {
                __extends(AbstractNvd3ChartViewModelBase, _super);
                function AbstractNvd3ChartViewModelBase(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    var _this = this;
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);
                    this.dataMapFunc = null;

                    this.dataMapFunc = function () {
                        var ret = [];

                        for (var metricIndex in _this.chartBase.metricIds) {
                            var metric = _this.metrics[_this.chartBase.metricIds[metricIndex]];

                            // for each metric, grab the values from the group
                            ret.push({
                                key: metric.title,
                                values: _this.group.top(Infinity).map(function (d) {
                                    return { key: d.key, value: metric.valueFunc(d) };
                                })
                            });
                        }
                        ;
                        return ret;
                    };
                }
                // init sets up the nvd3 data
                AbstractNvd3ChartViewModelBase.prototype.init = function () {
                    var _this = this;
                    console.log("init chart: " + this.chartBase.title);

                    var nvd3ChartBase = this.chartBase;

                    // build options
                    this.nvd3Options = {
                        // set up chart
                        chart: {
                            type: this.chartType,
                            height: this.height,
                            width: this.width,
                            margin: this.margin,
                            // key and value are defined in the dataset via map
                            x: function (d) {
                                return d.key;
                            },
                            y: function (d) {
                                return d.value;
                            },
                            transitionDuration: 500,
                            xAxis: {
                                axisLabel: (!nvd3ChartBase.hideXAxisLabel ? this.key.title : ""),
                                tickFormat: this.key.formatFunc,
                                axisLabelDistance: 20
                            },
                            yAxis: {
                                axisLabel: (!nvd3ChartBase.hideYAxisLabel ? this.metrics[this.chartBase.metricIds[0]].title : ""),
                                tickFormat: this.metrics[this.chartBase.metricIds[0]].formatFunc,
                                axisLabelDistance: 20
                            },
                            showLegend: !nvd3ChartBase.hideLegend
                        },
                        title: { enable: !nvd3ChartBase.hideTitle, text: this.chartBase.title, class: "strong" }
                    };

                    // build data from group
                    this.nvd3Data = this.dataMapFunc();

                    // update data if crossfilter filtered event
                    this.eventManager.subscribe("filtered", $.proxy(function () {
                        _this.nvd3Data = _this.dataMapFunc();
                    }, this));
                };
                return AbstractNvd3ChartViewModelBase;
            })(AbstractChartViewModelBase);
            _Charts.AbstractNvd3ChartViewModelBase = AbstractNvd3ChartViewModelBase;

            

            // base view model class for DC charts that have an xaxis, yaxis, brush, etc...
            // none of the properties should be altered (readonly is not supported by typescript yet)
            var AbstractFilterCoordinateGridChartViewModel = (function (_super) {
                __extends(AbstractFilterCoordinateGridChartViewModel, _super);
                function AbstractFilterCoordinateGridChartViewModel(chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager) {
                    _super.call(this, chartBase, allKeys, allMetrics, allDimensions, xfilter, eventManager);

                    // setting up axis info in AbstractFilterCoordinateGridChartViewModel rather than base because not all charts need it
                    var minX = chartBase.minX ? chartBase.minX : this.key.min;
                    var maxX = chartBase.maxX ? chartBase.maxX : this.key.max;
                    var minY = chartBase.minY ? chartBase.minY : 0;
                    var maxY = chartBase.maxY ? chartBase.maxY : 100;
                    if (this.key.valueType === 3 /* Date */) {
                        this.x = d3.time.scale().domain([minX, maxX]);
                    } else if (this.key.valueType === 1 /* Number */ || this.key.valueType === 0 /* Currency */) {
                        this.x = d3.scale.linear().domain([minX, maxX]);
                    } else {
                        console.log(Error("AbstractFilterCoordinateGridChartViewModel is only usable by Date, Number and Currency ValueTypes: " + this.key.valueType));
                    }
                    if (null != chartBase.minY || null != chartBase.maxY) {
                        this.y = d3.scale.linear().domain([minY, maxY]);
                    }

                    // hold on to values
                    this.xUnitsOverride = chartBase.xUnitsOverride;
                    this.elasticY = chartBase.elasticY;
                    this.brushOff = chartBase.brushOff;

                    // set ticks based on size if user has not specified ticks count
                    this.xAxisTicks = (typeof chartBase.xAxisTicks !== 'undefined') ? chartBase.xAxisTicks : Math.floor(this.width / 75);
                    this.yAxisTicks = (typeof chartBase.yAxisTicks !== 'undefined') ? chartBase.yAxisTicks : Math.floor(this.height / 26);

                    // set tick formats
                    this.xAxisTickFormat = this.key.formatFunc;
                    this.yAxisTickFormat = this.metrics[this.chartBase.metricIds[0]].formatFunc; // using first one for DC

                    // generate axis ticks (needed because Axis().ticks does not appear to work)
                    this.generatedAxisTicksX = [];
                    for (var i = 0; i < this.xAxisTicks; i++) {
                        this.generatedAxisTicksX.push((maxX - minX) / (this.xAxisTicks - 1) * i + minX);
                    }

                    // add labels and space for axis labels if we are to show thme
                    if (chartBase.showLabelX) {
                        this.xAxisLabel = this.key.title;
                        this.margin.bottom += 12;
                    }
                    if (chartBase.showLabelY) {
                        this.yAxisLabel = this.metrics[this.chartBase.metricIds[0]].title; // using first one for DC
                        this.margin.left += 12;
                    }
                }
                // init sets up the AbstractFilterCoordinateGridChart data
                AbstractFilterCoordinateGridChartViewModel.prototype.init = function (initExtension) {
                    var _this = this;
                    _super.prototype.init.call(this, function (c) {
                        c.x && _this.x && c.x(_this.x);
                        c.y && _this.y && c.y(_this.y);

                        // use override if availiable
                        if (_this.xUnitsOverride) {
                            c.xUnits && c.xUnits(_this.xUnitsOverride);
                        } else {
                            c.xUnits && c.xUnits(function () {
                                return _this.chartBase.groupCountOverride ? _this.chartBase.groupCountOverride : _this.group.all().length;
                            });
                        }

                        // set values
                        c.elasticY && c.elasticY(_this.elasticY);
                        c.brushOn && c.brushOn(!_this.brushOff);
                        c.xAxis && c.xAxis().tickValues && c.xAxis().tickValues(_this.generatedAxisTicksX); // use tickValue for x because we can
                        c.yAxis && c.yAxis().ticks && c.yAxis().ticks(_this.yAxisTicks); // use tics for y because its all we have
                        c.xAxis && c.xAxis().tickFormat && _this.xAxisTickFormat && c.xAxis().tickFormat(_this.xAxisTickFormat);
                        c.yAxis && c.yAxis().tickFormat && _this.yAxisTickFormat && c.yAxis().tickFormat(_this.yAxisTickFormat);
                        c.xAxis && c.xAxisLabel && _this.xAxisLabel && c.xAxisLabel(_this.xAxisLabel);
                        c.yAxis && c.yAxisLabel && _this.yAxisLabel && c.yAxisLabel(_this.yAxisLabel);

                        // then call chart specific extensions
                        initExtension(c);
                    });
                };
                return AbstractFilterCoordinateGridChartViewModel;
            })(AbstractDcChartViewModelBase);
            _Charts.AbstractFilterCoordinateGridChartViewModel = AbstractFilterCoordinateGridChartViewModel;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
