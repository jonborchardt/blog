var rawData;
var chart;
var maxWebActivity;
var maxWebActivityScale = 1.1;
var maxTimps;
var maxTimpsScale = 1.1;

getData();

function getData() {
    d3.json("data/webSpikeData.txt", function (error, jsondata) {
        var jdata = jsondata.map(function (series) {
            series.values = series.values.map(function (d) { return { x: d.Date, y: d.Value, ProgramName: d.ProgramName }; });
            return series;
        });
        rawData = jdata;

        maxWebActivity = d3.max(rawData[0].values, function (d) {
            return d.y;
        });

        maxTimps = d3.max(rawData[1].values, function (d) {
            return d.y;
        });

        chart = addChart(rawData);
        addBrush(maxTimps);
    });
};

// hack in new webspike chart
// todo, make general
function updateChart(c, d) {
    chart.lines.yDomain([0, maxWebActivity * maxWebActivityScale]);
    chart.bars.yDomain([0, maxTimps * maxTimpsScale]);
    chart.lines2.yDomain([0, maxWebActivity * maxWebActivityScale]);
    chart.bars2.yDomain([0, maxTimps * maxTimpsScale]);

    d3.select('#webSpikeChart svg')
                .datum(d)
                .call(c);

    nv.utils.windowResize(c.update);
}

function addChart(da) {
    var cchart = nv.models.linePlusBarWithFocusChart()
       .margin({ top: 30, right: 60, bottom: 50, left: 70 });


    cchart.xAxis
        .showMaxMin(false)
    .ticks(5)
        .tickFormat(function (d) {
            return d3.time.format('%_m/%_d/%y %_H:%M')(new Date(d));
        });

    cchart.x2Axis
        .showMaxMin(false)
     .ticks(5)
        .tickFormat(function (d) {
            return d3.time.format('%_m/%_d/%y %_H:%M')(new Date(d));
        });

    cchart.y1Axis
        .tickFormat(function (d) { return d3.format(',f')(d); })
        .showMaxMin(false);

    cchart.y2Axis
        .tickFormat(function (d) { return d3.format(',f')(d); })
        .showMaxMin(false);

    cchart.y3Axis
        .tickFormat(function (d) { return ""; })
        .showMaxMin(false);

    cchart.y4Axis
        .tickFormat(function (d) { return d3.format(',f')(d); })
        .showMaxMin(false);

    cchart.lines.forceY([0]);
    cchart.bars.forceY([0]);
    cchart.lines2.forceY([0]);
    cchart.bars2.forceY([0]);

    cchart.tooltipContent(function (key, y, e, graph) {
        var xd = d3.time.format('%_m/%_d/%y')(new Date(parseInt(graph.point.x)));
        var xt = d3.time.format('%_I:%M %p')(new Date(parseInt(graph.point.x)));
        var y = graph.point.y.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (key.indexOf('tImps') > -1) {
            tooltip_str =
                "<div class=\"popup\">" +
                "<b>" + String(graph.point.ProgramName) + "</b>" +
                "<hr/>" +
                "<ul>" +
                "<li>" + y + " tImps</li>" +
                "<li>" + xd + "</li>" +
                "<li>" + xt + "</li>" +
                "</ul>" +
                "</div>";
        }
        if (key.indexOf('New Visitors') > -1) {
            tooltip_str =
                "<div class=\"popup\">" +
                "<b>" + y + " new web visitors</b>" +
                "<hr/>" +
                "<ul>" +
                "<li>" + xd + "</li>" +
                "<li>" + xt + "</li>" +
                "</ul>" +
                "</div>";
        }
        return tooltip_str;
    });
    d3.select('#webSpikeChart svg')
       .datum(da)
       .call(cchart);

    return cchart;
};

// hack to test brush to be used as a scale chooser
// todo, make general
function addBrush(max) {
    var margin = { top: 30, right: 0, bottom: 0, left: 60 },
        width = 80 - margin.left - margin.right,
        height = 380 - margin.bottom - margin.top;

    var y = d3.scale.linear()
        .domain([max * 8, max / 100])
        .range([0, height])
        .clamp(true);

    var brush = d3.svg.brush()
        .y(y)
        .extent([0, 0])
        .on("brush", brushed);

    var svg = d3.select("#webSpikeChart svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width / 2 + ", 0)")
        .call(d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(function (d) { return ""; })
            .tickSize(0)
            .tickPadding(12))
        .select(".domain")
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

    var slider = svg.append("g")
        .attr("class", "slider")
        .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    slider.select(".background")
        .attr("height", height);

    var handle = slider.append("rect")
        .attr("class", "handle")
        .attr("stroke", "darkgray")
        .attr("fill", "white")
        .attr("transform", "translate(" + (width / 2 - 9) + ", 0)")
        .attr("width", 18)
        .attr("height", 9)
        .attr("rx", 3)
        .attr("ry", 3);

    slider
        .call(brush.event)
        .call(brush.extent([max, max]))
        .call(brush.event);

    function brushed() {
        var value = brush.extent()[0];

        if (d3.event.sourceEvent) { // not a programmatic event
            value = y.invert(d3.mouse(this)[1]);
            brush.extent([value, value]);
        }

        handle.attr("y", y(value));
        maxTimpsScale = value / maxTimps;

        updateChart(chart, rawData);
    }
}