var Adap;
(function (Adap) {
    (function (Base) {
        // interfaces, static functions anmd variables to help make generic chart creation faster and more consistent
        (function (Charts) {
            "use strict";

            // comma formatters return numbers to x precision with commas between the 000
            Charts.commaFormatter0 = d3.format(",.0f");
            Charts.commaFormatter1 = d3.format(",.1f");
            Charts.commaFormatter2 = d3.format(",.2f");
            Charts.commaFormatter3 = d3.format(",.3f");

            // ads ability to query for formatter based on precision
            Charts.commaFormatter = [Charts.commaFormatter0, Charts.commaFormatter1, Charts.commaFormatter2, Charts.commaFormatter3];

            // condense 50.0MM into 50MM but keep 50.1MM as 50.1MM
            function removeExtraZeros(ret) {
                var i = ret.lastIndexOf("0.0");
                if (i > -1 && "0" === ret[ret.length - 1]) {
                    ret = ret.substr(0, i + 1);
                }
                return ret;
            }
            Charts.removeExtraZeros = removeExtraZeros;

            // thousands formater
            function commaKformatter(d, formatter, symbol) {
                var ret = removeExtraZeros(symbol + formatter(d / 1000));
                return ret + "k";
            }
            Charts.commaKformatter = commaKformatter;
            ;

            // millions formatter
            function commaMformatter(d, formatter, symbol) {
                var ret = removeExtraZeros(symbol + formatter(d / Math.pow(1000, 2)));
                return ret + "MM";
            }
            Charts.commaMformatter = commaMformatter;
            ;

            // billions formatter
            function commaBformatter(d, formatter, symbol) {
                var ret = removeExtraZeros(symbol + formatter(d / Math.pow(1000, 3)));
                return ret + "B";
            }
            Charts.commaBformatter = commaBformatter;
            ;

            // trillions formatter
            function commaTformatter(d, formatter, symbol) {
                var ret = removeExtraZeros(symbol + formatter(d / Math.pow(1000, 4)));
                return ret + "T";
            }
            Charts.commaTformatter = commaTformatter;
            ;

            // returns the correct formatter, k, MM, B, T
            function commaShiftingFormatter(d, formatter, symbol) {
                formatter = typeof formatter !== "undefined" ? formatter : Charts.commaFormatter1; // default param
                symbol = typeof symbol !== "undefined" ? symbol : ""; // default param
                if (d >= Math.pow(1000, 4)) {
                    return commaTformatter(d, formatter, symbol);
                }
                if (d >= Math.pow(1000, 3)) {
                    return commaBformatter(d, formatter, symbol);
                }
                if (d >= Math.pow(1000, 2)) {
                    return commaMformatter(d, formatter, symbol);
                }
                if (d >= 1000) {
                    return commaKformatter(d, formatter, symbol);
                }
                return symbol + formatter(d);
            }
            Charts.commaShiftingFormatter = commaShiftingFormatter;
            ;

            // adds $
            function currencyShiftingFormatter(d, formatter) {
                return commaShiftingFormatter(d, formatter, "$");
            }
            Charts.currencyShiftingFormatter = currencyShiftingFormatter;
            ;

            // value types, currently not used much, but could be used to define valueType specific formatting and precision in the future
            (function (ValueType) {
                ValueType[ValueType["Currency"] = 0] = "Currency";
                ValueType[ValueType["Number"] = 1] = "Number";
                ValueType[ValueType["String"] = 2] = "String";
                ValueType[ValueType["Date"] = 3] = "Date";
            })(Charts.ValueType || (Charts.ValueType = {}));
            var ValueType = Charts.ValueType;
            ;

            

            

            

            

            

            

            

            

            

            // observer
            var EventSubscription = (function () {
                function EventSubscription(id, callback) {
                    this.id = id;
                    this.callback = callback;
                }
                return EventSubscription;
            })();

            var Message = (function () {
                function Message(message) {
                    this.message = message;
                    this.subscriptions = [];
                    this.nextId = 0;
                }
                Message.prototype.subscribe = function (callback) {
                    var subscription = new EventSubscription(this.nextId++, callback);
                    this.subscriptions[subscription.id] = subscription;
                    return subscription.id;
                };

                Message.prototype.unsubscribe = function (id) {
                    this.subscriptions[id] = undefined;
                };

                Message.prototype.notify = function (payload) {
                    var index;
                    for (index = 0; index < this.subscriptions.length; index++) {
                        if (this.subscriptions[index]) {
                            this.subscriptions[index].callback(payload);
                        }
                    }
                };
                return Message;
            })();

            var EventManager = (function () {
                function EventManager() {
                    this.messages = {};
                }
                EventManager.prototype.subscribe = function (message, callback) {
                    var msg;
                    msg = this.messages[message] || (this.messages[message] = new Message(message));

                    return msg.subscribe(callback);
                };

                EventManager.prototype.unsubscribe = function (message, token) {
                    if (this.messages[message]) {
                        this.messages[message].unsubscribe(token);
                    }
                };

                EventManager.prototype.publish = function (message, payload) {
                    if (this.messages[message]) {
                        this.messages[message].notify(payload);
                    }
                };
                return EventManager;
            })();
            Charts.EventManager = EventManager;
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
