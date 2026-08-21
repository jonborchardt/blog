nv.models.PdLineWithFocusChart = function () {

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var lines = nv.models.line()
      , lines2 = nv.models.line()
      , xAxis = nv.models.axis()
      , yAxis = nv.models.axis()
      , x2Axis = nv.models.axis()
      , y2Axis = nv.models.axis()
      , legend = nv.models.legend()
      , brush = d3.svg.brush()
    ;

    var margin = { top: 30, right: 30, bottom: 30, left: 60 }
      , margin2 = { top: 0, right: 30, bottom: 20, left: 60 }
      , color = nv.utils.defaultColor()
      , width = null
      , height = null
      , height2 = 100
      , x
      , y
      , x2
      , y2
      , showLegend = true
      , brushExtent = null
      , tooltips = true
      , tooltip = function (key, x, y, e, graph) {
          return '<h3>' + key + '</h3>' +
                 '<p>' + y + ' at ' + x + '</p>'
      }
      , noData = "No Data Available."
      , dispatch = d3.dispatch('tooltipShow', 'tooltipHide', 'brush')
      , title = ""
      , zeroLine
      , outerLegend
      , focus
      , labelSize = 14
      , circleRadius = 6
      , labelBoxPadding = 2
      , legendWidth = 200
      , legendHeight = 1900
      , showZeroLine = true
      , showTags = true
      , isArea = false
      , labelBoxSize = labelBoxPadding * 2 + labelSize * 0.87
    ;

    lines
      .clipEdge(true)
    ;
        lines2
      .interactive(false)
    ;
    xAxis
      .orient('bottom')
      .tickPadding(5)
    ;
    yAxis
      .orient('left')
    ;
    x2Axis
      .orient('bottom')
      .tickPadding(5)
    ;
    y2Axis
      .orient('left')
    ;
    //============================================================


    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var showTooltip = function (e, offsetElement) {
        var left = e.pos[0] + (offsetElement.offsetLeft || 0),
            top = e.pos[1] + (offsetElement.offsetTop || 0),
            x = xAxis.tickFormat()(lines.x()(e.point, e.pointIndex)),
            y = yAxis.tickFormat()(lines.y()(e.point, e.pointIndex)),
            content = tooltip(e.series.key, x, y, e, chart);

        nv.tooltip.show([left, top], content, null, null, offsetElement);
    };

    //============================================================


    function chart(selection) {
        selection.each(function (data) {
            var container = d3.select(this),
                that = this;

            var availableWidth = (width || parseInt(container.style('width')) || 960)
                                   - margin.left - margin.right,
                availableHeight1 = (height || parseInt(container.style('height')) || 400)
                                   - margin.top - margin.bottom - height2,
                availableHeight2 = height2 - margin2.top - margin2.bottom;

            chart.update = function () { container.transition().call(chart) };
            chart.container = this;


            //------------------------------------------------------------
            // Display No Data message if there's nothing to show.

            if (!data || !data.length || !data.filter(function (d) { return d.values.length }).length) {
                var noDataText = container.selectAll('.nv-noData').data([noData]);

                noDataText.enter().append('text')
                  .attr('class', 'nvd3 nv-noData')
                  .attr('dy', '-.7em')
                  .style('text-anchor', 'middle');

                noDataText
                  .attr('x', margin.left + availableWidth / 2)
                  .attr('y', margin.top + availableHeight1 / 2)
                  .text(function (d) { return d });

                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Setup Scales

            x = lines.xScale();
            y = lines.yScale();
            x2 = lines2.xScale();
            y2 = lines2.yScale();

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Setup containers and skeleton of chart

            var wrap = container.selectAll('g.nv-wrap.nv-lineWithFocusChart').data([data]);
            var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-lineWithFocusChart').append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-legendWrap');

            var focusEnter = gEnter.append('g').attr('class', 'nv-focus');
            focusEnter.append('g').attr('class', 'nv-x nv-axis');
            focusEnter.append('g').attr('class', 'nv-y nv-axis');
            focusEnter.append('g').attr('class', 'nv-linesWrap');

            var contextEnter = gEnter.append('g').attr('class', 'nv-context');
            contextEnter.append('g').attr('class', 'nv-x nv-axis');
            contextEnter.append('g').attr('class', 'nv-y nv-axis');
            contextEnter.append('g').attr('class', 'nv-linesWrap');
            contextEnter.append('g').attr('class', 'nv-brushBackground');
            contextEnter.append('g').attr('class', 'nv-x nv-brush');

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Legend

            if (showLegend) {
                legend.width(availableWidth);

                g.select('.nv-legendWrap')
                    .datum(data)
                    .call(legend);

                if (margin.top != legend.height()) {
                    margin.top = legend.height();
                    availableHeight1 = (height || parseInt(container.style('height')) || 400)
                                       - margin.top - margin.bottom - height2;
                }

                g.select('.nv-legendWrap')
                    .attr('transform', 'translate(0,' + (-margin.top) + ')')
            }

            //------------------------------------------------------------


            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


            //------------------------------------------------------------
            // Main Chart Component(s)

            lines
              .width(availableWidth)
              .height(availableHeight1)
              .color(
                data
                  .map(function (d, i) {
                      return d.color || color(d, i);
                  })
                  .filter(function (d, i) {
                      return !data[i].disabled;
                  })
              );

            lines2
              .defined(lines.defined())
              .width(availableWidth)
              .height(availableHeight2)
              .color(
                data
                  .map(function (d, i) {
                      return d.color || color(d, i);
                  })
                  .filter(function (d, i) {
                      return !data[i].disabled;
                  })
              );

            g.select('.nv-context')
                .attr('transform', 'translate(0,' + (availableHeight1 + margin.bottom + margin2.top) + ')')
            
            var contextLinesWrap = g.select('.nv-context .nv-linesWrap')
                .datum(data.filter(function (d) { return !d.disabled }))
           
            d3.transition(contextLinesWrap).call(lines2);

            // add Ex features
            addAddonFeatures();

            //------------------------------------------------------------


            /*
      var focusLinesWrap = g.select('.nv-focus .nv-linesWrap')
      .datum(data.filter(function(d) { return !d.disabled }))
      
      d3.transition(focusLinesWrap).call(lines);
      */



            //------------------------------------------------------------
            // Setup Main (Focus) Axes

            xAxis
              .scale(x)
              .ticks(availableWidth / 100)
              .tickSize(-availableHeight1, 0);

            yAxis
              .scale(y)
              .ticks(availableHeight1 / 36)
              .tickSize(-availableWidth, 0);

            g.select('.nv-focus .nv-x.nv-axis')
                .attr('transform', 'translate(0,' + availableHeight1 + ')');

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Setup Brush

            brush
              .x(x2)
              .on('brush', onBrush);

            if (brushExtent) brush.extent(brushExtent);

            var brushBG = g.select('.nv-brushBackground').selectAll('g')
                .data([brushExtent || brush.extent()])

            var brushBGenter = brushBG.enter()
                .append('g');

            brushBGenter.append('rect')
                .attr('class', 'left')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', availableHeight2);

            brushBGenter.append('rect')
                .attr('class', 'right')
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', availableHeight2);

            gBrush = g.select('.nv-x.nv-brush')
                .call(brush);
            gBrush.selectAll('rect')
                //.attr('y', -5)
                .attr('height', availableHeight2);
            gBrush.selectAll('.resize').append('path').attr('d', resizePath);

            onBrush();

            //------------------------------------------------------------


            //------------------------------------------------------------
            // Setup Secondary (Context) Axes

            x2Axis
              .scale(x2)
              .ticks(availableWidth / 100)
              .tickSize(-availableHeight2, 0);

            g.select('.nv-context .nv-x.nv-axis')
                .attr('transform', 'translate(0,' + y2.range()[0] + ')');
            d3.transition(g.select('.nv-context .nv-x.nv-axis'))
                .call(x2Axis);


            y2Axis
              .scale(y2)
              .ticks(availableHeight2 / 36)
              .tickSize(-availableWidth, 0);

            d3.transition(g.select('.nv-context .nv-y.nv-axis'))
                .call(y2Axis);

            g.select('.nv-context .nv-x.nv-axis')
                .attr('transform', 'translate(0,' + y2.range()[0] + ')');

            //------------------------------------------------------------


            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------

            legend.dispatch.on('legendClick', function (d, i) {
                d.disabled = !d.disabled;

                if (!data.filter(function (d) { return !d.disabled }).length) {
                    data.map(function (d) {
                        d.disabled = false;
                        wrap.selectAll('.nv-series').classed('disabled', false);
                        return d;
                    });
                }

                // remove all new items
                removeAddonFeatures();

                container.transition().call(chart);
            });

            dispatch.on('tooltipShow', function (e) {
                if (tooltips) showTooltip(e, that.parentNode);
            });

            //============================================================


            //============================================================
            // Addon Functions
            //------------------------------------------------------------
            // add Ex features
            function addAddonFeatures() {
                focus = g.select('.nv-focus');
                var chartWidth = chart.width() - chart.margin().right - chart.margin().left;

                // draw area under lines
                lines.isArea(isArea);

                container.append("defs").append("clipPath")
                    .attr("id", "clip").append("rect")
                    .attr("width", chartWidth)
                    .attr("height", 1000);

                // add title
                container.append("text")
                  .attr("x", 70)
                  .attr("y", 20)
                  .attr("class", "replace title")
                  .text(title);

                // add zero line
                if (showZeroLine) {
                    zeroLine = focus.append("line")
                        .attr("x1", 0)
                        .attr("x2", chartWidth)
                        .attr("class", "zeroline");
                }

                // add tags
                if (showTags) {
                    // add tags and legend
                    outerLegend = container.append("g").append("foreignObject")
                          .attr("class", "tagLegend")
                          .attr("height", legendHeight)
                          .attr("width", legendWidth)
                          .attr("transform", "translate(" + chart.width() + ", 10)");

                    var innerLegend = outerLegend.append("xhtml:div")
                          .attr("class", "tagLegendContent");

                    data.forEach(function (d2, i) {
                        if (!d2.disabled) {
                            var labelData = d2.values.filter(function (d3) { return null != d3.label; });
                            var ds = " dataset_" + i;

                            focus.selectAll("circle.tagCircle" + ds)
                                .data(labelData)
                                .enter()
                                .append("circle")
                                .attr("clip-path", "url(#clip)")
                                .attr("class", "replace tagCircle" + ds)
                                .attr("r", circleRadius);

                            focus.selectAll("rect.tagRect" + ds)
                                .data(labelData)
                                .enter()
                                .append("rect")
                                .attr("clip-path", "url(#clip)")
                                .attr("class", "replace tagRect" + ds)
                                .attr("width", labelBoxSize)
                                .attr("height", labelBoxSize)
                                .attr("rx", 2)
                                .attr("ry", 2);

                            focus.selectAll("text.tagLabel" + ds)
                                .data(labelData)
                                .enter()
                                .append("text")
                                .attr("clip-path", "url(#clip)")
                                .attr("font-size", labelSize)
                                .text(function (d) { return d.label; })
                                .attr("class", "replace tagLabel" + ds);

                            // inner legend
                            innerLegend.selectAll("div.legendItem" + ds)
                                .data(labelData)
                                .enter()
                                .append("div")
                                .attr("class", "legendItem" + ds)
                                .append("div")
                                .attr("class", "legendLabel")
                                .text(function (d) {
                                    return d.label;
                                })
                                .append("div")
                                .attr("class", "legendDesc")
                                .text(function (d) {
                                    return d.description;
                                })
                                .append("div")
                                .attr("class", "legendNote")
                                .text(function (d) {
                                    return d.notes;
                                });
                        }
                    });
                }
            }

            function removeAddonFeatures() {
                // remove Ex features on click, this should not be needed in the future... but it is now...
                if (showTags) {
                    focus.selectAll(".replace").remove();
                    outerLegend.remove();
                }

                if (showZeroLine) {
                    zeroLine.remove();
                }
            }

            function updateAddonFeatures() {
                // update dataset circles
                var labelOffsetX = circleRadius * -1.17;
                var labelOffsetY = circleRadius * -2.33;
                var xAxisChartRange = d3.scale.linear().range([x.range()[0], x.range()[1]]).domain([x.domain()[0], x.domain()[1]]);
                var yAxisChartRange = d3.scale.linear().range([y.range()[0], y.range()[1]]).domain([y.domain()[0], y.domain()[1]]);

                if (showTags) {
                    focus.selectAll("circle.tagCircle")
                        .attr("cx", function (d) { return xAxisChartRange(d.date); })
                        .attr("cy", function (d) { return yAxisChartRange(d.value); });

                    focus.selectAll("rect.tagRect")
                        .attr("x", function (d) { return xAxisChartRange(d.date) + labelOffsetX; })
                        .attr("y", function (d) { return yAxisChartRange(d.value) + labelOffsetY - labelBoxSize; });

                    focus.selectAll("text.tagLabel")
                        .attr("x", function (d) { return xAxisChartRange(d.date) + labelOffsetX + labelBoxPadding; })
                        .attr("y", function (d) { return yAxisChartRange(d.value) + labelOffsetY - labelBoxPadding; });
                }

                if (showZeroLine) {
                    zeroLine
                        .attr("y1", yAxisChartRange(0))
                        .attr("y2", yAxisChartRange(0));
                }
            }


            //============================================================
            // Functions
            //------------------------------------------------------------

            // Taken from crossfilter (http://square.github.com/crossfilter/)
            function resizePath(d) {
                var e = +(d == 'e'),
                    x = e ? 1 : -1,
                    y = availableHeight2 / 3;
                return 'M' + (.5 * x) + ',' + y
                    + 'A6,6 0 0 ' + e + ' ' + (6.5 * x) + ',' + (y + 6)
                    + 'V' + (2 * y - 6)
                    + 'A6,6 0 0 ' + e + ' ' + (.5 * x) + ',' + (2 * y)
                    + 'Z'
                    + 'M' + (2.5 * x) + ',' + (y + 8)
                    + 'V' + (2 * y - 8)
                    + 'M' + (4.5 * x) + ',' + (y + 8)
                    + 'V' + (2 * y - 8);
            }


            function updateBrushBG() {
                if (!brush.empty()) brush.extent(brushExtent);
                brushBG
                    .data([brush.empty() ? x2.domain() : brushExtent])
                    .each(function (d, i) {
                        var leftWidth = x2(d[0]) - x.range()[0],
                            rightWidth = x.range()[1] - x2(d[1]);
                        d3.select(this).select('.left')
                          .attr('width', leftWidth < 0 ? 0 : leftWidth);

                        d3.select(this).select('.right')
                          .attr('x', x2(d[1]))
                          .attr('width', rightWidth < 0 ? 0 : rightWidth);
                    });
            }


            function onBrush() {
                brushExtent = brush.empty() ? null : brush.extent();
                extent = brush.empty() ? x2.domain() : brush.extent();


                dispatch.brush({ extent: extent, brush: brush });


                updateBrushBG();

                // Update Main (Focus)
                var focusLinesWrap = g.select('.nv-focus .nv-linesWrap')
                    .datum(
                      data
                        .filter(function (d) { return !d.disabled })
                        .map(function (d, i) {
                            return {
                                key: d.key,
                                values: d.values.filter(function (d, i) {
                                    return lines.x()(d, i) >= extent[0] && lines.x()(d, i) <= extent[1];
                                })
                            }
                        })
                    );
                d3.transition(focusLinesWrap).call(lines);


                // Update Main (Focus) Axes
                d3.transition(g.select('.nv-focus .nv-x.nv-axis'))
                    .call(xAxis);
                d3.transition(g.select('.nv-focus .nv-y.nv-axis'))
                    .call(yAxis);

                // update Ex features
                updateAddonFeatures();
            }

            //============================================================ 


        });

        return chart;
    }


    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    lines.dispatch.on('elementMouseover.tooltip', function (e) {
        e.pos = [e.pos[0] + margin.left, e.pos[1] + margin.top];
        dispatch.tooltipShow(e);
    });

    lines.dispatch.on('elementMouseout.tooltip', function (e) {
        dispatch.tooltipHide(e);
    });

    dispatch.on('tooltipHide', function () {
        if (tooltips) nv.tooltip.cleanup();
    });

    //============================================================


    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.dispatch = dispatch;
    chart.legend = legend;
    chart.lines = lines;
    chart.lines2 = lines2;
    chart.xAxis = xAxis;
    chart.yAxis = yAxis;
    chart.x2Axis = x2Axis;
    chart.y2Axis = y2Axis;
    chart.title = title;
    chart.labelSize = labelSize;
    chart.circleRadius = circleRadius;
    chart.labelBoxPadding = labelBoxPadding;
    chart.legendWidth = legendWidth;
    chart.legendHeight = legendHeight;
    chart.showZeroLine = showZeroLine;
    chart.showTags = showTags;
    chart.isArea = isArea;

    d3.rebind(chart, lines, 'defined', 'isArea', 'size', 'xDomain', 'yDomain', 'forceX', 'forceY', 'interactive', 'clipEdge', 'clipVoronoi', 'id');

    chart.x = function (_) {
        if (!arguments.length) return lines.x;
        lines.x(_);
        lines2.x(_);
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return lines.y;
        lines.y(_);
        lines2.y(_);
        return chart;
    };

    chart.y2 = function (_) {
        if (!arguments.length) return lines2.y;
        lines2.y(_);
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
        return chart;
    };

    chart.margin2 = function (_) {
        if (!arguments.length) return margin2;
        margin2 = _;
        return chart;
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.height2 = function (_) {
        if (!arguments.length) return height2;
        height2 = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
        color = nv.utils.getColor(_);
        legend.color(color);
        return chart;
    };

    chart.showLegend = function (_) {
        if (!arguments.length) return showLegend;
        showLegend = _;
        return chart;
    };

    chart.tooltips = function (_) {
        if (!arguments.length) return tooltips;
        tooltips = _;
        return chart;
    };

    chart.tooltipContent = function (_) {
        if (!arguments.length) return tooltip;
        tooltip = _;
        return chart;
    };

    chart.interpolate = function (_) {
        if (!arguments.length) return lines.interpolate();
        lines.interpolate(_);
        lines2.interpolate(_);
        return chart;
    };

    chart.noData = function (_) {
        if (!arguments.length) return noData;
        noData = _;
        return chart;
    };

    // Chart has multiple similar Axes, to prevent code duplication, probably need to link all axis functions manually like below
    chart.xTickFormat = function (_) {
        if (!arguments.length) return xAxis.tickFormat();
        xAxis.tickFormat(_);
        x2Axis.tickFormat(_);
        return chart;
    };

    chart.yTickFormat = function (_) {
        if (!arguments.length) return yAxis.tickFormat();
        yAxis.tickFormat(_);
        y2Axis.tickFormat(_);
        return chart;
    };

    chart.title = function (_) {
        if (!arguments.length) return title;
        title = _;
        return chart;
    };

    chart.labelSize = function (_) {
        if (!arguments.length) return labelSize;
        labelSize = _;
        labelBoxSize = labelBoxPadding * 2 + labelSize * 0.87;
        return chart;
    };

    chart.circleRadius = function (_) {
        if (!arguments.length) return circleRadius;
        circleRadius = _;
        return chart;
    };

    chart.labelBoxPadding = function (_) {
        if (!arguments.length) return labelBoxPadding;
        labelBoxPadding = _;
        labelBoxSize = labelBoxPadding * 2 + labelSize * 0.87;
        return chart;
    };

    chart.legendWidth = function (_) {
        if (!arguments.length) return legendWidth;
        legendWidth = _;
        return chart;
    };

    chart.legendHeight = function (_) {
        if (!arguments.length) return legendHeight;
        legendHeight = _;
        return chart;
    };

    chart.showZeroLine = function (_) {
        if (!arguments.length) return showZeroLine;
        showZeroLine = _;
        return chart;
    };

    chart.showTags = function (_) {
        if (!arguments.length) return showTags;
        showTags = _;
        return chart;
    };

    chart.isArea = function (_) {
        if (!arguments.length) return isArea;
        isArea = _;
        return chart;
    };

    //============================================================


    return chart;
}