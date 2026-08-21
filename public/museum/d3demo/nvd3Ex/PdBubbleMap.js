// containerDivId is the place to put the svg
// buckets is an array of, {d.bucketIndex, d.radius, d.color}
// bucketameDomain is a list of buckets in the array

function AddPdBubbleMap(containerDivId, buckets, bucketNameDomain, width, height) {
    var margin = { top: 20, right: 60, bottom: 30, left: 60 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    
    var x = d3.scale.ordinal().rangeBands([0, width]);

    // The size of the buckets in the CSV data file.
    // This could be inferred from the data if it weren't sparse.
    var xStep = width / (bucketNameDomain.length);

    var bucketWidth = width / bucketNameDomain.length - 20;
    var bucketCenters = [];
    bucketNameDomain.forEach(function (element, index, array) {
        bucketCenters.push({y:height/2, x: bucketWidth * (index+1), width: bucketWidth, height: height });
    });

    var svg = d3.select(containerDivId).select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Compute the scale domains.
    x.domain(bucketNameDomain);

    // Display the tiles for each non-zero bucket.
    // See http://bl.ocks.org/3074470 for an alternative implementation.
    var circles = svg.selectAll(".circleFloat")
        .data(buckets)
        .enter().append("circle")
        .attr("class", "circleFloat")
        .attr("cx", function (d) { return Math.random() * width; })
        .attr("cy", function (d) { return Math.random() * height; })
        .attr("r", 0)
        .style("fill","lightblue")
        .style("stroke", "blue");
    circles.transition().duration(2000).attr("r", function (d) { return d.radius; });
    
    var force = d3.layout.force()
    .gravity(-0.01)
    .charge(function (d) { return -Math.pow(d.radius, 2) / 8; })
    .friction(0.9)
    .nodes(buckets)
    .size([width, height]);
    force.start();

    force.on("tick", function (e) {
        circles.each(function (d) { moveTowardsBucket(d, e.alpha, bucketCenters); });
        circles
           .attr("cx", function (d) { return d.x; })
           .attr("cy", function (d) { return d.y; });
    });

    // Add an x-axis with label.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));
   
    return svg;
}

function moveTowardsBucket(d, alpha, centers) {
    var damper = 0.1;
       var target = centers[d.bucketIndex];
          d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
          d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
}