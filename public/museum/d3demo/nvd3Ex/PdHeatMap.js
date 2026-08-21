// containerDivId is the place to put the svg
// buckets is an array of, {d.clusterName, d.daypartTime, d.tRatio}
// clusterNameDomain is a list of clustersNames in the array

function AddPdHeatMap(containerDivId, buckets, clusterNameDomain, width, height) {
    var margin = { top: 20, right: 60, bottom: 30, left: 60 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeBands([0, width]),
        y = d3.time.scale().range([0, height]),
        z = d3.scale.linear().range(["#D2FFFF", "#4682B4"]);

    // The size of the buckets in the CSV data file.
    // This could be inferred from the data if it weren't sparse.
    var yStep = height / 24;
    var xStep = width / (clusterNameDomain.length);

    var svg = d3.select(containerDivId).select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Compute the scale domains.
    x.domain(clusterNameDomain);
    y.domain([new Date(1, 1, 1, 0, 0, 0, 0), new Date(1, 1, 1, 23, 59, 59, 999)]);// 1 day
    z.domain([0, d3.max(buckets, function (d) { return d.tRatio; })]);

    // Display the tiles for each non-zero bucket.
    // See http://bl.ocks.org/3074470 for an alternative implementation.
    svg.selectAll(".tile")
        .data(buckets)
        .enter().append("rect")
        .attr("class", "tile")
        .attr("x", function (d) { return x(d.clusterName); })
        .attr("y", function (d) { return y(d.daypartTime); })
        .attr("width", xStep)
        .attr("height", yStep)
        .style("fill", function (d) { return z(d.tRatio); });

    // Add a legend for the color values.
    var legend = svg.selectAll(".legend")
        .data(z.ticks(6).slice(1).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", z);

    legend.append("text")
        .attr("x", 26)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text(String);

    svg.append("text")
        .attr("class", "label")
        .attr("x", width + 20)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text("tRatio");

    // Add an x-axis with label.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));
    //.append("text")
    //.attr("class", "label")
    //.attr("x", width)
    //.attr("y", -6)
    //.attr("text-anchor", "end")
    //.text("Cluster");

    // Add a y-axis with label.
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).ticks(d3.time.hours, 3).tickFormat(d3.time.format('%I%p')).orient("left"));
    //.append("text")
    //.attr("class", "label")
    //.attr("y", 6)
    //.attr("dy", ".71em")
    //.attr("text-anchor", "end")
    //.attr("transform", "rotate(-90)")
    //.text("Daypart");

    return svg;
}