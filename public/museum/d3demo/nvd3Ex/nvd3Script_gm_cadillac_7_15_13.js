//usage: AddChart("data/data_gm_vs_non_gm.txt", "#chart_nvd3 svg", true, 960);
function AddChart(dataUrl, chartHtmlLoc, showTags, chartWidth) {
    showTags = typeof showTags !== 'undefined' ? showTags : true;
    chartWidth = typeof chartWidth !== 'undefined' ? chartWidth : 960; //default params

    return nv.addGraph(function () {
        var chart = nv.models.PdLineWithFocusChart();
        chart.width(chartWidth);
        chart.x(function (d) { return d.date; });
        chart.y(function (d) { return d.value; });
        chart.y2(function (d) { return d.volumeValue; });

        d3.json(dataUrl, function (error, jsondata) {
            chart.title(jsondata.title);

            chart.xAxis
                .showMaxMin(false)
                .tickFormat(function (d) { return d3.time.format("%x")(new Date(d)); });

            chart.x2Axis
                .showMaxMin(false)
                .tickFormat(function (d) { return d3.time.format("%b %Y")(new Date(d)); });

            chart.yAxis
                .showMaxMin(false)
                .tickFormat(function (d) { return commaShiftingFormatter(d); });

            chart.y2Axis
                .showMaxMin(false)
                .tickFormat(function (d) { return null; });//todo, config

            chart.yDomain([jsondata.min, jsondata.max]);

            // set our values for Ex features
            chart.labelSize(14);
            chart.circleRadius(6);
            chart.labelBoxPadding(2);
            chart.legendWidth(200);
            chart.legendHeight(1900);
            chart.showZeroLine(true);
            chart.showTags(showTags);
            chart.isArea(true);

            d3.select(chartHtmlLoc)
                .datum(jsondata.datasets)
                .call(chart);

            nv.utils.windowResize(chart.update);
        });

        return chart;
    });
}

//todo, move to utility
var commaFormatter1 = d3.format(",.1f");
var commaFormatter2 = d3.format(",.2f");
function commaKformatter(d) { return commaFormatter1(d / 1000) + "k"; };
function commaMformatter(d) { return commaFormatter1(d / Math.pow(1000, 2)) + "MM"; };
function commaBformatter(d) { return commaFormatter1(d / Math.pow(1000, 3)) + "B"; };
function commaTformatter(d) { return commaFormatter1(d / Math.pow(1000, 4)) + "T"; };
function commaShiftingFormatter(d) {
    if (d >= Math.pow(1000, 4))
        return commaTformatter(d);
    if (d >= Math.pow(1000, 3))
        return commaBformatter(d);
    if (d >= Math.pow(1000, 2))
        return commaMformatter(d);
    if (d >= 1000)
        return commaKformatter(d);
    return commaFormatter2(d);
};