function ascendingKeySort(a, b) { return d3.ascending(a.key, b.key); }

function descendingValueSort(a, b) { return d3.descending(a.value, b.value); }

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

var parseDate = d3.time.format("%m/%d/%Y").parse;

function scaleDown(d, start, factor) {
    var val = start;
    while (true) {
        if (d <= val)
            return val;
        val *= factor;
    }
};

var commaFormatter0 = d3.format(",.0f");
var commaFormatter1 = d3.format(",.1f");
var commaFormatter2 = d3.format(",.2f");

function commaKformatter(d, formatter, symbol) { return symbol + formatter(d / 1000) + "k"; };
function commaMformatter(d, formatter, symbol) { return symbol + formatter(d / Math.pow(1000, 2)) + "MM"; };
function commaBformatter(d, formatter, symbol) { return symbol + formatter(d / Math.pow(1000, 3)) + "B"; };
function commaTformatter(d, formatter, symbol) { return symbol + formatter(d / Math.pow(1000, 4)) + "T"; };

function commaShiftingFormatter(d, formatter, symbol) {
    formatter = typeof formatter !== 'undefined' ? formatter : commaFormatter1; //default param
    symbol = typeof symbol !== 'undefined' ? symbol : ""; //default param
    if (d >= Math.pow(1000, 4))
        return commaTformatter(d, formatter, symbol);
    if (d >= Math.pow(1000, 3))
        return commaBformatter(d, formatter, symbol);
    if (d >= Math.pow(1000, 2))
        return commaMformatter(d, formatter, symbol);
    if (d >= 1000)
        return commaKformatter(d, formatter, symbol);
    return symbol+formatter(d);
};

function currencyShiftingFormatter(d, formatter) {
    return commaShiftingFormatter(d, formatter, "$");
}

function trunk(str, maxLen) {
    if (typeof str == 'string') {
        return str.substr(0, maxLen - 1) + (str.length > maxLen ? '...' : '');
    }
    return str;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}