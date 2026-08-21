// requires baseScript.js, dc.js, nvd3.js, d3.js, crossfilter.js

var fullWidth = 1000;
var filterWidth = 150;
var filterHeight = 150;
var tallChartHeight = 450;
var extent;

// dimentions and groups
var mediaTypeDimension,
    mediaTypeGrouping,
    daypartDimension,
    daypartGrouping,
    tRatioDimension,
    tRatioDimension2,
    tRatioGrouping,
    impsDimension,
    impsGrouping,
    networkDimention,
    networkGroupingByTratio,
    programDimention,
    programGroupingByTratio,
    rawData;

var filterMediaTypeChart,
    filterDaypartChart,
    filterTratioChart,
    filterImpsChart,
    topNetworksChart,
    topProgramsChart,
    daypartTable,
    daypartHeatMap,
    bubbleMap;

testCrossfilterData();

function testCrossfilterData() {
    d3.json("data/explorerData.txt", function (error, jsondata) {
        rawData = GetCrossfilterData(jsondata.values);
    });
};

function clearAllFilters() {

    dc.filterAll();

}

function GetCrossfilterData(da) {
    var data = crossfilter(da);

    try {
        mediaTypeDimension = data.dimension(function (d) { return d.MediaType; });
        mediaTypeGrouping = mediaTypeDimension.group();

        daypartDimension = data.dimension(function (d) { return bucketDaypart(d.Daypart); });// bucket to hack sort
        daypartGrouping = daypartDimension.group();

        tRatioDimension = data.dimension(function (d) { return Math.round(d.OverallTratio * 20); });
        tRatioGrouping = tRatioDimension.group();

        impsDimension = data.dimension(function (d) { return Math.round(d.Impressions / 15000); });
        impsGrouping = impsDimension.group();

        networkDimention = data.dimension(function (d) { return "- " + d.CallLetters; });
        networkGroupingByTratio = networkDimention.group().reduceSum(function (d) { return d.OverallTratio; });

        programDimention = data.dimension(function (d) { return "- " + d.ProgramName; });
        programGroupingByTratio = programDimention.group().reduceSum(function (d) { return d.OverallTratio; });

        filterMediaTypeChart = dc.pieChart("#filterMediaTypeChart")
            .width(filterWidth)
            .height(filterHeight)
            .transitionDuration(500)
            .radius(filterWidth / 2)
            .innerRadius(filterWidth / 7.5)
            .dimension(mediaTypeDimension)
            .group(mediaTypeGrouping)
            .on("postRedraw", function (chart) {// trigger refresh of non dc charts
                updateNonDcCharts();
            });

        filterDaypartChart = dc.rowChart("#filterDaypartChart")
            .width(filterWidth)
            .height(filterHeight)
            .dimension(daypartDimension)
            .group(daypartGrouping)
            .margins({ top: 0, left: 10, right: 5, bottom: 20 })
            .xAxis()
            .ticks(6)
        ;

        filterTratioChart = dc.barChart("#filterTratioChart")
           // .width(filterWidth)
            .height(filterHeight)
            .dimension(tRatioDimension)
            .group(tRatioGrouping)
            .brushOn(true)
            .x(d3.scale.linear())
            .elasticY(true)
            .elasticX(true);
        filterTratioChart.xAxis().tickFormat("");
        filterTratioChart.yAxis().tickFormat("");

        filterImpsChart = dc.barChart("#filterImpsChart")
          //     .width(filterWidth)
            .height(filterHeight)
            .dimension(impsDimension)
            .group(impsGrouping)
            .brushOn(true)
            .x(d3.scale.linear())
            .elasticY(true)
            .elasticX(true);
        filterImpsChart.xAxis().tickFormat("");
        filterImpsChart.yAxis().tickFormat("");

        // non dc
        topNetworksChart = makeTopNetworksChart();
        topProgramsChart = makeTopProgramsChart();

        updateDaypartTable();
        updateDaypartHeatMap();
        updateBubbleMap();

        dc.renderAll();

    } catch (e) {
        nv.log(e.stack);
        console.log(e.stack);
    }

    return data;
}

function updateNonDcCharts() {
    updateTopNetworksChart(topNetworksChart);
    updateTopProgramsChart(topProgramsChart);
    updateDaypartHeatMap();
    updateBubbleMap();

    updateDaypartTable();
}

function updateDaypartTable() {
    var programs = tRatioDimension.top(Infinity);

    // define columns
    var cols = ["ProgramName", "CallLetters", "MediaType", "OverallTratio", "Impressions"];

    d3.select("#topProgramsPerDaypartChart thead").remove();
    d3.select("#topProgramsPerDaypartChart tbody").remove();

    if (programs.length > 0) {
        var table = d3.select("#topProgramsPerDaypartChart");
        var thead = table.append("thead");
        var tbody = table.append("tbody");

        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(cols)
            .enter()
            .append("th")
            .text(function (column) { return column; });

        // create a row for each object in the data
        var rows = tbody.selectAll("tr")
            .data(programs)
            .enter()
            .append("tr");

        // create a cell in each row for each column
        var cells = rows.selectAll("td")
            .data(function (row) {
                return cols.map(function (column) {
                    return { column: column, value: row[column] };
                });
            })
            .enter()
            .append("td")
            .text(function (d) { return trunk(d.value, 20); });

        // reset tablesorter
        $("#topProgramsPerDaypartChart")
            .tablesorter({ widthFixed: false, widgets: ['zebra'] })
            .tablesorterPager({ container: $("#pager"), size: 17, positionFixed: false });
        //todom, there is a bug in the page jumpo... the new version might address this...
    }
}

function makeTopNetworksChart() {
    var chart = nv.models.multiBarHorizontalChart()
        .width(fullWidth / 5)
        .height(tallChartHeight + 45)
        .showValues(false)
        .tooltips(false)
        .showControls(false)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    updateTopNetworksChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateTopNetworksChart(chart) {
    d3.select('#topNetworksChart svg')
     .datum(stdData(networkGroupingByTratio, "Top Networks", 16, descendingValueSort))
     .transition()
     .duration(500)
     .call(chart);
}

function makeTopProgramsChart() {
    var chart = nv.models.multiBarHorizontalChart()
        .width(fullWidth / 5)
        .height(tallChartHeight + 45)
        .showValues(false)
        .tooltips(false)
        .showControls(false)
        .x(function (d) { return d.key; })
        .y(function (d) { return d.value; });

    updateTopProgramsChart(chart);

    nv.utils.windowResize(chart.update);

    return chart;
};
function updateTopProgramsChart(chart) {
    d3.select('#topProgramsChart svg')
     .datum(stdData(programGroupingByTratio, "Top Programs", 16, descendingValueSort))
     .transition()
     .duration(500)
     .call(chart);
}

var bucketNames = ["-0.2", "0.0", "0.2", "0.4", "0.6", "0.8"];
var bubbleData = [];
function updateBubbleMap() {
    if (null != bubbleMap) {
        bubbleMap.remove();
    }
    bubbleData = generateBubbleData();
    bubbleMap = AddPdBubbleMap("#programBubbleChart", bubbleData, bucketNames, fullWidth, tallChartHeight);
}
// can be optimized

function generateBubbleData() {
    var ret = [];
    var programs = tRatioDimension.top(300);
    programs.forEach(function(d) {

        // for (var i = 0; i < 300; i++) {
        ret.push({ bucketIndex: Math.floor(d.OverallTratio / 0.15), radius: 7, color: "blue" });
    });
    return ret;
    return [, { bucketIndex: 1, radius: 20, color: "blue" },
    { bucketIndex: 2, radius: 20, color: "blue" }, { bucketIndex: 3, radius: 20, color: "blue" },
    { bucketIndex: 4, radius: 20, color: "blue" }, { bucketIndex: 5, radius: 20, color: "blue" }];
}

var clustersNames = ["Overall Broad", "Cluster1 Broad", "Cluster2 Broad", "Cluster3 Broad", "Overall Cable", "Cluster1 Cable", "Cluster2 Cable", "Cluster3 Cable"];
var heatmapData = [];
function updateDaypartHeatMap() {
    if (null != daypartHeatMap) {
        daypartHeatMap.remove();
    }
    heatmapData = generateDayPartHeatMapData();
    daypartHeatMap = AddPdHeatMap("#daypartClusterHeatChart", heatmapData, clustersNames, fullWidth, tallChartHeight);
}

// can be optimized
function generateDayPartHeatMapData() {
    var hd = [];
    for (var t = 0; t < 24; t++) {
        clustersNames.forEach(function (d) {
            hd.push({ clusterName: d, daypartTime: new Date(1, 1, 1, t, 0, 0, 0), tRatio: 0, count: 0 });
        });
    }

    var programs = tRatioDimension.top(Infinity);
    programs.forEach(function (d) {
        var t = d.Start;
        var index = t * clustersNames.length;

        if (d.MediaType == "Cable") {
            index += 4;// cable colums are 4 later
        }

        hd[index].tRatio += d.OverallTratio;
        hd[index].count += 1;

        hd[index + 1].tRatio += d.Cluster1Tratio;
        hd[index + 1].count += 1;

        hd[index + 2].tRatio += d.Cluster2Tratio;
        hd[index + 2].count += 1;

        hd[index + 3].tRatio += d.Cluster3Tratio;
        hd[index + 3].count += 1;
    });

    hd.forEach(function (d) {
        if (d.count > 0) {
            d.OverallTratio /= d.count;
            d.Cluster1Tratio /= d.count;
            d.Cluster2Tratio /= d.count;
            d.Cluster3Tratio /= d.count;
        }
    });

    return hd;
}

function bucketDaypart(d) {
    if (d == "Morning") return "  Morning";
    if (d == "Daytime") return " Daytime";
    if (d == "EarlyFringe") return " EarlyFringe";
    if (d == "LateFringe") return " LateFringe";
    if (d == "Prime") return " Prime";
    if (d == "Overnight") return "Overnight";
    return "Unknown";
}