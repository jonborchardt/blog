var Core;
(function (Core) {
    (function (Models) {
        "use strict";
        var Charts = Adap.Base.Charts;

        // defines how to use keys and metrics for Core.Models.IAd
        var RewardsKeyMetrics = (function () {
            function RewardsKeyMetrics() {
                this.keys = [];
                this.metrics = [];
                // define keys
                // keys represent the domain / dimension of the data (how the data is grouped)
                this.keys["id"] = {
                    id: "id",
                    title: "Id",
                    valueType: 1 /* Number */,
                    formatFunc: function (d) {
                        return "" + d;
                    },
                    dimensionFunc: function (d) {
                        return d.Id;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["day"] = {
                    id: "day",
                    title: "Day",
                    valueType: 3 /* Date */,
                    formatFunc: function (d) {
                        return moment(d).format("MM/DD/YYYY");
                    },
                    dimensionFunc: function (d) {
                        return d.Moment;
                    },
                    groupFunc: function (d) {
                        return d.startOf("day");
                    }
                };
                this.keys["week"] = {
                    id: "week",
                    title: "Week",
                    valueType: 3 /* Date */,
                    formatFunc: function (d) {
                        return moment(d).format("MM/DD/YYYY");
                    },
                    dimensionFunc: function (d) {
                        return d.Moment;
                    },
                    groupFunc: function (d) {
                        return d.startOf("week");
                    }
                };
                this.keys["month"] = {
                    id: "month",
                    title: "Month",
                    valueType: 3 /* Date */,
                    formatFunc: function (d) {
                        return moment(d).format("MM/DD/YYYY");
                    },
                    dimensionFunc: function (d) {
                        return d.Moment;
                    },
                    groupFunc: function (d) {
                        return d.startOf("month");
                    }
                };
                this.keys["amount"] = {
                    id: "amount",
                    title: "Amount",
                    valueType: 1 /* Number */,
                    formatFunc: function (d) {
                        return "$" + d;
                    },
                    dimensionFunc: function (d) {
                        return d.Amount;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["to"] = {
                    id: "to",
                    title: "To",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.To;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["to2"] = {
                    id: "to2",
                    title: "To",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.To;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["from"] = {
                    id: "from",
                    title: "From",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.From;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["from2"] = {
                    id: "from2",
                    title: "From",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.From;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["memo"] = {
                    id: "memo",
                    title: "Memo",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Memo;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };

                this.keys["ltv"] = {
                    id: "ltv",
                    title: "LTV Internal",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return (d.ToIndex < 19 && d.FromIndex < 19) ? "Yes" : "No";
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };

                // define metrics (specific to the dataset, to be moved out of here and into data access when not in test data)
                // metrics represent how we sum up or average the data inside a group or dimension
                this.metrics["amount"] = {
                    id: "amount",
                    title: "Amount",
                    valueType: 1 /* Number */,
                    formatFunc: function (d) {
                        return Charts.currencyShiftingFormatter(d, Charts.commaFormatter[0]);
                    },
                    valueFunc: function (p) {
                        return p.value.value["amount"];
                    },
                    reduceFunc: function (d) {
                        return d.Amount;
                    },
                    reduceWeightFunc: function (d) {
                        return 1;
                    }
                };
            }
            return RewardsKeyMetrics;
        })();
        Models.RewardsKeyMetrics = RewardsKeyMetrics;
    })(Core.Models || (Core.Models = {}));
    var Models = Core.Models;
})(Core || (Core = {}));
