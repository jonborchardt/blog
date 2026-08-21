<!-- build dynamic generic charts -->
<div ng-repeat="chartRows in rows" class="row">
	<div ng-repeat="chart in chartRows.charts">
		<div ng-if="null != chart.chartVm.dimension && null != chart.chartVm.dcPostSetupChart && null !=chart.chartVm.dcOptions"
		     dc-chart={{chart.chartVm.chartType}}
		     dc-options="chart.chartVm.dcOptions"
		     dc-post-setup-chart="chart.chartVm.dcPostSetupChart">
			<strong ng-if="!chart.hideTitle">{{chart.title}}</strong>
			<a ng-if="!chart.hideReset" class="reset" href="javascript:;" style="display: none;"><span class="label label-danger">reset filter</span></a>
			<span ng-if="!chart.hideFilter" class="filter"></span>
			<div class="clearfix"></div>
		</div>
		<nvd3 ng-if="null != chart.chartVm.dimension && null != chart.chartVm.nvd3Data && null != chart.chartVm.nvd3Options"
		      options="chart.chartVm.nvd3Options"
		      data="chart.chartVm.nvd3Data">
		</nvd3>
		<div ng-if="null != chart.chartVm.dimension && null != chart.chartVm.scalarChartData">
			<div ng-repeat="dataPoint in chart.chartVm.scalarChartData" class="scalarChart" title={{dataPoint.detail}}>
				<div class="value">{{dataPoint.value}}</div>
				<div class="key">{{dataPoint.key}}</div>
			</div>
		</div>
	</div>
</div>