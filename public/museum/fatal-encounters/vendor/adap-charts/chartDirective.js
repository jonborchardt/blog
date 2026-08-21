var Adap;
(function (Adap) {
    (function (Base) {
        (function (Charts) {
            "use strict";

            // The currently executing script file will always be the last one in the scripts array, so you can easily find its path
            var scripts = document.getElementsByTagName("script");
            var currentScriptPath = scripts[scripts.length - 1].src;

            angular.module('chartDirective', []).directive('genericChart', function () {
                return {
                    restrict: 'E',
                    scope: {
                        rows: '='
                    },
                    templateUrl: currentScriptPath.replace('chartDirective.js', 'chartTemplate.tpl')
                };
            });
        })(Base.Charts || (Base.Charts = {}));
        var Charts = Base.Charts;
    })(Adap.Base || (Adap.Base = {}));
    var Base = Adap.Base;
})(Adap || (Adap = {}));
