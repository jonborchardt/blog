var chartWidth = 960;
var smallChartWidth = 270;
var smallChartHeight = 200;
var tallChartHeight = 460;
var extent;

// dimentions and groups
var byIndex,
    spendByIndex,
    byStation,
    byCpm,
    spendByCpm,
    byTcpm,
    spendByTcpm,
    byImps,
    spendByImps,
    byTimps,
    spendByTimps,
    byDow,
    spendByDow,
    byDaypart,
    spendByDaypart,
    byDuration,
    spendByDuration,
    spendByStation,
    spendByIndexChart,
    bubbleChart,
    spendByStationChart,
    spendByCpmChart,
    spendByTcpmChart,
    spendByImpsChart,
    spendByTimpsChart,
    spendByDowChart,
    spendByDaypartChart,
    spendByDurationChart,
    rawData;

testCrossfilterData();

function testCrossfilterData() {
    d3.json("data/programData.txt", function (error, jsondata) {
        rawData = GetCrossfilterData(jsondata.values);
    });
};

function GetCrossfilterData(da) {
    var data = crossfilter(da);

    try {
        byIndex = data.dimension(function (d) { return d.Index; });
        spendByIndex = byIndex.group().reduceSum(function (d) { return d.RunningCost; });

        byStation = data.dimension(function (d) { return d.CallLetters; });
        spendByStation = byStation.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byCpm = data.dimension(function (d) { return Math.round(scaleDown(d.Cpm, 1.2, 2)); });
        spendByCpm = byCpm.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byTcpm = data.dimension(function (d) { return Math.round(scaleDown(d.Tcpm, 8.5, 2)); });
        spendByTcpm = byTcpm.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byImps = data.dimension(function (d) { return Math.round(scaleDown(d.Imps / 10000, 12810 / 10000, 2)); });
        spendByImps = byImps.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byTimps = data.dimension(function (d) { return Math.round(scaleDown(d.Timps / 10000, 128 / 10000, 2)); });
        spendByTimps = byTimps.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byDow = data.dimension(function (d) { return bucketDow(d); });
        spendByDow = byDow.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byDaypart = data.dimension(function (d) { return bucketDaypart(d); });
        spendByDaypart = byDaypart.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        byDuration = data.dimension(function (d) { return d.Duration; });
        spendByDuration = byDuration.group().reduceSum(function (d) { return d.Cpa * d.MaxAirings; });

        // make charts
        spendByIndexChart = makeSpendByIndexChart();
        bubbleChart = makeBubbleChart();
        spendByStationChart = makeSpendByStationChart();
        spendByCpmChart = makeSpendByCpmChart();
        spendByTcpmChart = makeSpendByTcpmChart();
        spendByImpsChart = makeSpendByImpsChart();
        spendByTimpsChart = makeSpendByTimpsChart();
        spendByDowChart = makeSpendByDowChart();
        spendByDaypartChart = makeSpendByDaypartChart();
        spendByDurationChart = makeSpendByDurationChart();
        fillInTopProgamsList();
    } catch (e) {
        nv.log(e.stack);
        console.log(e.stack);
    }

    return data;
}

function makeSpendByIndexChart() {
    var chart = nv.models.PdLineWithFocusChart()
        .width(chartWidth)
        .showZeroLine(false)
        .showTags(false)
        .isArea(true)
        .tooltips(false)
        .title("Programs to Buy Ordered by tCPM")
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.xAxis
        .showMaxMin(false);

    chart.x2Axis
        .showMaxMin(false);

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.y2Axis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.showLegend(false);

    // hook up events
    chart.dispatch.on('brush', onBrush);

    d3.select('#nvd3-spend-over-tcpm svg')
      .datum(stdData(spendByIndex, "testTitle", Infinity))
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};

function makeBubbleChart() {
    var chart = nv.models.scatterChart()
        .width(chartWidth)
        .showLegend(false);

    chart.xAxis
    .tickFormat(d3.format(','))
        .showMaxMin(false);

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    updateBubbleChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateBubbleChart(chart) {
    d3.select('#nvd3-tcpm svg')
       .datum(stdDataBubble(byIndex.top(Infinity), "tCPM", extent[0], extent[1]))
       .call(chart);
}

function makeSpendByStationChart() {
    var chart = nv.models.multiBarHorizontalChart()
        .width(smallChartWidth)
        .height(tallChartHeight)
        .showValues(true)
        .tooltips(true)
        .showControls(false)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    updateSpendByStationChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByStationChart(chart) {
    spendByStation = byStation.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-station')
     .datum(stdData(spendByStation, "Top Networks", 16, descendingValueSort))
     .call(chart);
}

function makeSpendByCpmChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("CPM");

    updateSpendByCpmChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByCpmChart(chart) {
    spendByCpm = byCpm.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-cpm')
     .datum(stdData(spendByCpm, "testTitle", Infinity))
     .call(chart);
}

function makeSpendByTcpmChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("tCPM");

    updateSpendByTcpmChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByTcpmChart(chart) {
    spendByTcpm = byTcpm.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-tcpm')
     .datum(stdData(spendByTcpm, "testTitle", Infinity))
     .call(chart);
}

function makeSpendByImpsChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("Imps (10k)");

    updateSpendByImpsChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByImpsChart(chart) {
    spendByImps = byImps.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-imps')
     .datum(stdData(spendByImps, "testTitle", Infinity))
     .call(chart);
}

function makeSpendByTimpsChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("tImps (10k)");

    updateSpendByTimpsChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByTimpsChart(chart) {
    spendByTimps = byTimps.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-timps')
     .datum(stdData(spendByTimps, "testTitle", Infinity))
     .call(chart);
}

function makeSpendByDowChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("Day of Week Distribution");

    updateSpendByDowChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByDowChart(chart) {
    spendByDow = byDow.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-dow')
     .datum(stdData(spendByDow, "testTitle", Infinity))
     .call(chart);
}

function makeSpendByDaypartChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("Daypart Distribution");

    updateSpendByDaypartChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByDaypartChart(chart) {
    spendByDaypart = byDaypart.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-daypart')
     .datum(stdData(spendByDaypart, "testTitle", Infinity))
     .call(chart);
}

function makeSpendByDurationChart() {
    var chart = nv.models.discreteBarChart()
        .staggerLabels(true)
        .width(smallChartWidth)
        .height(smallChartHeight)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.xAxis
        .axisLabel("Duration (secs)");

    updateSpendByDurationChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByDurationChart(chart) {
    spendByDuration = byDuration.group().reduceSum(function (d) {
        return (d.Index >= extent[0] && d.Index <= extent[1]) ? d.Cpa * d.MaxAirings : 0;
    });

    d3.select('#nvd3-spend-by-duration')
     .datum(stdData(spendByDuration, "testTitle", Infinity))
     .call(chart);
}

function onBrush(e) {
    extent = e.extent;

    if (null != rawData) {
        updateBubbleChart(bubbleChart);
        updateSpendByStationChart(spendByStationChart);
        updateSpendByCpmChart(spendByCpmChart);
        updateSpendByTcpmChart(spendByTcpmChart);
        updateSpendByImpsChart(spendByImpsChart);
        updateSpendByTimpsChart(spendByTimpsChart);
        updateSpendByDowChart(spendByDowChart);
        updateSpendByDaypartChart(spendByDaypartChart);
        updateSpendByDurationChart(spendByDurationChart);
        fillInTopProgamsList();
    }
}

function fillInTopProgamsList() {
    var topData = byIndex
        .filter(function (d) { return d >= new Date(extent[0]) && d <= new Date(extent[1]); })
        .top(Infinity)
        .sort(function (a, b) { return d3.ascending(a.Index, b.Index); });

    var r = d3.select('#programList')
        .selectAll(".data")
        .data(topData.slice(0, 25), function (d) {
            return d.Name;
        });

    r.enter()
        .append("div")
        .attr("class", "data")
        .html(function (d) {
            return d.Name + " (" + d.CallLetters + "), Buy " + d.MaxAirings + " @ $" + d.Cpa + "0";
        });

    r.exit().remove();
    r.order();
}

function stdData(d, title, top, sort) {
    sort = typeof sort !== 'undefined' ? sort : ascendingKeySort; //default param
    var dataArr = [];
    var sorted = d.top(top).sort(sort);
    sorted.forEach(function (p, i) {
        dataArr.push({ "key": p.key, "value": p.value });
    });
    return [{ "key": title, "values": dataArr }];
}

function stdDataBubble(d, title, minId, maxId) {
    var dataArr = [];
    d.forEach(function (p, i) {
        if (p.Index >= minId && p.Index <= maxId) {
            dataArr.push({ "x": p.Imps, "y": p.Cpa, "size": p.Tcpm * p.Tcpm });
        }
    });
    return [{ "key": title, "values": dataArr }];
}

function ascendingKeySort(a, b) { return d3.ascending(a.key, b.key); }
function descendingValueSort(a, b) { return d3.descending(a.value, b.value); }

var parseDate = d3.time.format("%m/%d/%Y").parse;
var commasFormatter = d3.format(",.1f");
function currencyFormatter(d) { return "$" + commasFormatter(d); };
function currencyKformatter(d) { return "$" + commasFormatter(d / 1000) + "k"; };
function currencyMformatter(d) { return "$" + commasFormatter(d / Math.pow(1000, 2)) + "MM"; };
function currencyBformatter(d) { return "$" + commasFormatter(d / Math.pow(1000, 3)) + "B"; };
function currencyTformatter(d) { return "$" + commasFormatter(d / Math.pow(1000, 4)) + "T"; };
function currencyShiftingFormatter(d) {
    if (d >= Math.pow(1000, 4))
        return currencyTformatter(d);
    if (d >= Math.pow(1000, 3))
        return currencyBformatter(d);
    if (d >= Math.pow(1000, 2))
        return currencyMformatter(d);
    if (d >= 1000)
        return currencyKformatter(d);
    return currencyFormatter(d);
};

function scaleDown(d, start, factor) {
    var val = start;
    while (true) {
        if (d <= val)
            return val;
        val *= factor;
    }
};

function bucketDow(d) {
    var max = Math.max(d.Mon, d.Tue, d.Wed, d.Thur, d.Fri, d.Sat, d.Sun);
    if (d.Mon >= max) return "   Mon";
    if (d.Tue >= max) return "   Tue";
    if (d.Wed >= max) return "   Wed";
    if (d.Thur >= max) return "  Thur";
    if (d.Fri >= max) return " Fri";
    if (d.Sat >= max) return "Sat";
    return "Sun";
}

function bucketDaypart(d) {
    var max = Math.max(d.Morning, d.Daytime, d.EarlyFringe, d.Prime, d.Overnight);
    if (d.Morning >= max) return "  Morning";
    if (d.Daytime >= max) return " Daytime";
    if (d.EarlyFringe >= max) return " EarlyFringe";
    if (d.Prime >= max) return " Prime";
    return "Overnight";
}