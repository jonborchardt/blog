var Core;
(function (Core) {
    (function (Models) {
        "use strict";
        var Charts = Adap.Base.Charts;

        // defines how to use keys and metrics for Core.Models.IAd
        var EncounterKeyMetrics = (function () {
            function EncounterKeyMetrics() {
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
                this.keys["age"] = {
                    id: "age",
                    title: "Age",
                    valueType: 1 /* Number */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Age;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["gender"] = {
                    id: "gender",
                    title: "Gender",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Gender;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["race"] = {
                    id: "race",
                    title: "Race",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Race;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["city"] = {
                    id: "city",
                    title: "City",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.City;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["state"] = {
                    id: "state",
                    title: "State",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.State;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["zip"] = {
                    id: "zip",
                    title: "Zip",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Zip;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["agency"] = {
                    id: "agency",
                    title: "Agency",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Agency;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["causeOfDeath"] = {
                    id: "causeOfDeath",
                    title: "CauseOfDeath",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.CauseOfDeath;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["disposition"] = {
                    id: "disposition",
                    title: "Disposition",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Disposition;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };
                this.keys["illness"] = {
                    id: "illness",
                    title: "Illness",
                    valueType: 2 /* String */,
                    formatFunc: function (d) {
                        return d;
                    },
                    dimensionFunc: function (d) {
                        return d.Illness;
                    },
                    groupFunc: function (d) {
                        return d;
                    }
                };

                // define metrics (specific to the dataset, to be moved out of here and into data access when not in test data)
                // metrics represent how we sum up or average the data inside a group or dimension
                this.metrics["count"] = {
                    id: "count",
                    title: "Count",
                    valueType: 1 /* Number */,
                    formatFunc: function (d) {
                        return Charts.commaShiftingFormatter(d, Charts.commaFormatter[1]);
                    },
                    valueFunc: function (p) {
                        return p.value.value["count"];
                    },
                    reduceFunc: function (d) {
                        return 1;
                    },
                    reduceWeightFunc: function (d) {
                        return 1;
                    }
                };

                this.metrics["logCount"] = {
                    id: "logCount",
                    title: "Count",
                    valueType: 1 /* Number */,
                    formatFunc: function (d) {
                        return Charts.commaShiftingFormatter(Math.pow(10, d), Charts.commaFormatter[1]);
                    },
                    valueFunc: function (p) {
                        return Math.log(p.value.value["logCount"]) / Math.LN10;
                    },
                    reduceFunc: function (d) {
                        return 1;
                    },
                    reduceWeightFunc: function (d) {
                        return 1;
                    }
                };
            }
            return EncounterKeyMetrics;
        })();
        Models.EncounterKeyMetrics = EncounterKeyMetrics;
    })(Core.Models || (Core.Models = {}));
    var Models = Core.Models;
})(Core || (Core = {}));
