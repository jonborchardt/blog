var chartWidth = 960;
var smallChartWidth = 270;
var smallChartHeight = 200;
var tallChartHeight = 460;
var extent;

// dimentions and groups
var byMonth,
    spendByMonth,
    byCommission,
    spendByCommission,
    byCreativeLength,
    spendByCreativeLength,
    byStation,
    spendByStation,
    spendOverTimeChart,
    spendByCommissionChart,
    spendByCreativeLengthChart,
    spendByStationChart,
    rawData;

testCrossfilterData();

function testCrossfilterData() {
    d3.json("data/rotData.txt", function (error, jsondata) {
        jsondata.values.forEach(function (d) { d.StartDate = parseDate(d.StartDate); });
        rawData = GetCrossfilterData(jsondata.values);
    });
};

function GetCrossfilterData(da) {
    var data = crossfilter(da);

    try {
        byMonth = data.dimension(function (d) { return d3.time.month(d.StartDate); });
        spendByMonth = byMonth.group().reduceSum(function (d) { return d.TotalBuy; });

        byCommission = data.dimension(function (d) { return d.Commission; });
        spendByCommission = byCommission.group().reduceSum(function (d) { return d.TotalBuy; });

        byCreativeLength = data.dimension(function (d) { return d.CreativeLength; });
        spendByCreativeLength = byCreativeLength.group().reduceSum(function (d) { return d.TotalBuy; });

        byStation = data.dimension(function (d) { return d.CallLetters; });
        spendByStation = byStation.group().reduceSum(function (d) { return d.TotalBuy; });

        // make charts
        spendOverTimeChart = makeSpendOverTimeChart();
        spendByCommissionChart = makeSpendByCommissionChart();
        spendByCreativeLengthChart = makeSpendByCreativeLengthChart();
        spendByStationChart = makeSpendByStationChart();
        makeMap();

        fillInExpensiveRotationsList();
    } catch (e) {
        nv.log(e.stack);
        console.log(e.stack);
    }

    return data;
}

function makeSpendOverTimeChart() {
    var chart = nv.models.PdLineWithFocusChart()
        .width(chartWidth)
        .showZeroLine(false)
        .showTags(false)
        .isArea(true)
        .title("PrecisionDemand Rotation Purchases 2010-present")
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    chart.xAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return d3.time.format("%x")(new Date(d)); });

    chart.x2Axis
        .showMaxMin(false)
       .tickFormat(function (d) { return d3.time.format("%b %Y")(new Date(d)); });

    chart.yAxis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.y2Axis
        .showMaxMin(false)
        .tickFormat(function (d) { return currencyShiftingFormatter(d); });

    chart.showLegend(false);

    // hook up events
    chart.dispatch.on('brush', onBrush);

    d3.select('#nvd3-spend-over-time svg')
      .datum(stdData(spendByMonth, "testTitle", Infinity))
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};

function makeSpendByCommissionChart() {
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
        .tickFormat(d3.format("%,.1f"))
        .axisLabel("Comission Rate");

    updateSpendByCommissionChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByCommissionChart(chart) {
    spendByCommission = byCommission.group().reduceSum(function (d) {
        return (d.StartDate >= new Date(extent[0]) && d.StartDate <= new Date(extent[1])) ? d.TotalBuy : 0;
    });

    d3.select('#nvd3-spend-by-commission')
           .datum(stdData(spendByCommission, "testTitle", Infinity))
           .call(chart);
}

function makeSpendByCreativeLengthChart() {
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
        .axisLabel("Creative Copy Length (secs)");

    updateSpendByCreativeLengthChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateSpendByCreativeLengthChart(chart) {
    spendByCreativeLength = byCreativeLength.group().reduceSum(function (d) {
        return (d.StartDate >= new Date(extent[0]) && d.StartDate <= new Date(extent[1])) ? d.TotalBuy : 0;
    });

    d3.select('#nvd3-spend-by-creativelength')
     .datum(stdData(spendByCreativeLength, "testTitle", Infinity))
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
        return (d.StartDate >= new Date(extent[0]) && d.StartDate <= new Date(extent[1])) ? d.TotalBuy : 0;
    });

    d3.select('#nvd3-spend-by-station')
     .datum(stdData(spendByStation, "Top Networks", 16, descendingValueSort))
     .call(chart);
}

function onBrush(e) {
    extent = e.extent;

    if (null != rawData) {
        updateSpendByCreativeLengthChart(spendByCreativeLengthChart);
        updateSpendByCommissionChart(spendByCommissionChart);
        updateSpendByStationChart(spendByStationChart);
        fillInExpensiveRotationsList();
        updateMap();
    }
}

function fillInExpensiveRotationsList() {
    var topData = byMonth
        .filter(function (d) { return d >= new Date(extent[0]) && d <= new Date(extent[1]); })
        .top(Infinity)
        .sort(function (a, b) { return d3.descending(a.TotalBuy, b.TotalBuy); });

    var r = d3.select('#rotList')
        .selectAll(".data")
        .data(topData.slice(0, 15), function (d) {
            return d.Nbr;
        });

    r.enter()
        .append("div")
        .attr("class", "data")
        .html(function (d) {
            return d.Nbr + ": " + d.DOW + ", " + d.DaypartStart + " - " + d.DaypartEnd + ", " + d.CallLetters + ", " + d.Account + ", " + d.Product + ", " + d.StartDate.getMonth() + "/" + d.StartDate.getDate() + "/" + d.StartDate.getFullYear() + " - " + d.EndDate + ", $" + d.TotalBuy + ".";
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

// map example
function makeMap() {
    var width = 450,
      height = 460;

    var mapFill = d3.scale.linear()
    .domain([10, 500])
    .range(["lightblue", "pink"]);
    
    var svg = d3.select("#d3-map")
        .attr("width", width)
        .attr("height", height);

    var path = d3.geo.path();

    d3.json("data/us.txt", function (error, us) {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) { return mapFill(Math.random() * 500); });
        
        svg.append("circle")
            .attr("r", 13)
            .attr("fill", "transparent")
            .attr("stroke", "#2200FF")
            .attr("cx", 130)
            .attr("cy", 130);
        
        svg.append("circle")
            .attr("r", 13)
            .attr("fill", "transparent")
            .attr("stroke", "#4422FF")
            .attr("cx", 150)
            .attr("cy", 20);
        
        svg.append("circle")
            .attr("r", 13)
            .attr("fill", "transparent")
            .attr("stroke", "#2244FF")
            .attr("cx", 130)
            .attr("cy", 200);
        
        svg.append("circle")
            .attr("r", 13)
            .attr("fill", "transparent")
            .attr("stroke", "#0077FF")
            .attr("cx", 170)
            .attr("cy", 250);
        
        svg.append("circle")
            .attr("r", 13)
            .attr("fill", "transparent")
            .attr("stroke", "#7711FF")
            .attr("cx", 300)
            .attr("cy", 130);
    });
}

function updateMap() {

    d3.select("#d3-map").selectAll("circle")
        .transition()
        .attr("cx", function (d) { return Math.random() * 263 + 122; })
        .attr("cy", function (d) { return Math.random() * 320 + 30; })
        .duration(500)
        .delay(50);
}

