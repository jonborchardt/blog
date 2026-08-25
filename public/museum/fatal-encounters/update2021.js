// 2026 addendum to the preserved 2014 demo. Not part of the original app;
// the 2014 files are untouched (this script wraps them from outside). It
// adds a toggle button that appends the June-2014-through-2021
// fatalencounters.org rows into the live crossfilter (widening the month
// timeline and growing the Race chart), and removes them again on a second
// click. It also swaps the Race and Drug Use chart positions at boot so Race
// sits in the tall bottom row where it has room to grow.
(function () {
    "use strict";

    var DATA_SRC = "App/core/models/encountersUpdate2021.js";
    var ADDED_ID_MIN = 100001;

    // ---- boot patch: swap Race and Drug Use positions ----
    var OrigCharts = Features.EncounterReport.EncounterReportCharts;
    Features.EncounterReport.EncounterReportCharts = function (rootScope, ads) {
        var inst = new OrigCharts(rootScope, ads);
        var race = inst.charts["raceRowFilter"];
        var illness = inst.charts["illnessRowFilter"];
        inst.mainChartRows.forEach(function (row) {
            row.charts = row.charts.map(function (c) {
                return c === race ? illness : c === illness ? race : c;
            });
        });
        return inst;
    };

    // ---- toggle ----
    var saved = null; // pre-update state, present while the update is applied

    function monthChartOf(erc) {
        return erc.charts["monthBarFilter"].chartVm;
    }

    function doAdd(scope, rows, note) {
        var vm = scope.vm;
        var erc = vm.encounterReportCharts;
        var monthVm = monthChartOf(erc);
        var raceVm = erc.charts["raceRowFilter"].chartVm;

        saved = {
            monthDomain: monthVm.innerChart.x().domain().slice(),
            monthTicks: monthVm.innerChart.xAxis().tickValues().slice(),
            raceHeight: raceVm.innerChart.height(),
            encounterCount: vm.encounters.length
        };

        // the app reads d.Moment, stamped at load time by EncounterLoader
        rows.forEach(function (d) { d.Moment = window.moment(d.Date); });
        vm.encounters = vm.encounters.concat(rows);
        erc.xfilter.add(rows);

        // the month timeline's x domain and axis tick values were fixed at
        // build from the 2000-2014 extent; widen both to the combined extent
        var dim = monthVm.dimension;
        var min = dim.bottom(1)[0].Moment;
        var max = dim.top(1)[0].Moment;
        monthVm.innerChart.x().domain([min, max]);
        var tickCount = monthVm.xAxisTicks || 10;
        var ticks = [];
        for (var i = 0; i < tickCount; i++) {
            ticks.push(((max - min) / (tickCount - 1)) * i + (+min));
        }
        monthVm.innerChart.xAxis().tickValues(ticks);

        // the newer rows bring many more race categories; give the chart room
        var raceCategories = raceVm.group.all().length;
        raceVm.innerChart.height(Math.max(saved.raceHeight, raceCategories * 22 + 60));

        window.dc.renderAll();
        scope.$apply();

        note.textContent = "Updated: " + rows.length.toLocaleString() +
            " encounters added (June 2014 back-fill through December 2021), " +
            vm.encounters.length.toLocaleString() + " total. Click again to return to the 2014 snapshot.";
    }

    function doRemove(scope, note) {
        var vm = scope.vm;
        var erc = vm.encounterReportCharts;
        var monthVm = monthChartOf(erc);
        var raceVm = erc.charts["raceRowFilter"].chartVm;

        // clear every chart filter so remove() targets exactly the added rows
        window.dc.filterAll();
        var idDim = erc.dimensions["id"];
        idDim.filterFunction(function (d) { return d >= ADDED_ID_MIN; });
        erc.xfilter.remove();
        idDim.filterAll();
        vm.encounters = vm.encounters.filter(function (d) { return d.Id < ADDED_ID_MIN; });

        monthVm.innerChart.x().domain(saved.monthDomain);
        monthVm.innerChart.xAxis().tickValues(saved.monthTicks);
        raceVm.innerChart.height(saved.raceHeight);
        saved = null;

        window.dc.renderAll();
        scope.$apply();

        note.textContent = "Back to the original 2014 snapshot, " +
            vm.encounters.length.toLocaleString() + " encounters. Click to reapply the update.";
    }

    function onClick(btn, note) {
        var gridEl = document.querySelector(".gridStyle");
        var scope = gridEl && window.angular ? window.angular.element(gridEl).scope() : null;
        if (!scope || !scope.vm || !scope.vm.encounterReportCharts) {
            note.textContent = "The dashboard has not finished loading yet; try again in a moment.";
            return;
        }
        if (saved) {
            doRemove(scope, note);
            btn.textContent = "Load the 2015-2021 update";
            return;
        }
        var run = function () {
            try {
                doAdd(scope, window.encountersUpdate2021 || [], note);
                btn.textContent = "Remove the 2015-2021 update";
            } catch (e) {
                note.textContent = "Update failed: " + e.message;
            }
            btn.disabled = false;
        };
        if (window.encountersUpdate2021) { run(); return; }
        btn.disabled = true;
        note.textContent = "Loading about 12 MB of newer data...";
        var script = document.createElement("script");
        script.src = DATA_SRC;
        script.onload = run;
        script.onerror = function () {
            btn.disabled = false;
            note.textContent = "Could not fetch the update data.";
        };
        document.body.appendChild(script);
    }

    function insertButton() {
        var header = document.querySelector(".page-header");
        if (!header) { return false; }
        var box = document.createElement("div");
        box.className = "well well-sm";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-primary";
        btn.textContent = "Load the 2015-2021 update";
        var note = document.createElement("p");
        note.className = "small";
        note.style.marginTop = "6px";
        note.style.marginBottom = "0";
        note.textContent = "A 2026 addition: appends the fatalencounters.org rows collected since " +
            "this page was built, including a back-fill of its thin mid-2014 tail. " +
            "The original code is unchanged; click again to undo.";
        btn.onclick = function () { onClick(btn, note); };
        box.appendChild(btn);
        box.appendChild(note);
        header.appendChild(box);
        return true;
    }

    // the header renders after angular bootstraps; poll briefly until it exists
    var tries = 0;
    var timer = setInterval(function () {
        if (insertButton() || ++tries > 100) { clearInterval(timer); }
    }, 200);
})();
