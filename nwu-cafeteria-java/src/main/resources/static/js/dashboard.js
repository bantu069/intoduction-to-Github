(function(){
	const cafeteriaEl = document.getElementById('filter-cafeteria');
	const startEl = document.getElementById('filter-start');
	const endEl = document.getElementById('filter-end');
	const applyBtn = document.getElementById('apply-filters');
	const exportBtn = document.getElementById('export-csv');

	const kpiTotal = document.getElementById('kpi-total');
	const kpiAvg = document.getElementById('kpi-avg');

	let lineChart, barChart;

	function buildQuery(){
		const p = new URLSearchParams();
		if(cafeteriaEl.value && cafeteriaEl.value !== 'All') p.set('cafeteria', cafeteriaEl.value);
		if(startEl.value) p.set('start_date', startEl.value);
		if(endEl.value) p.set('end_date', endEl.value);
		return p.toString();
	}

	async function loadStats(){
		const query = buildQuery();
		const res = await fetch(`/api/stats${query ? ('?' + query) : ''}`);
		const data = await res.json();
		updateKPIs(data);
		renderCharts(data);
		updateExportLink();
	}

	function updateKPIs(data){
		kpiTotal.textContent = data.overall.total;
		kpiAvg.textContent = data.overall.avg_rating ? data.overall.avg_rating.toFixed(2) : '—';
	}

	function renderCharts(data){
		const ctxLine = document.getElementById('chart-line');
		const ctxBar = document.getElementById('chart-bar');

		const labels = data.by_day.map(d => d.date);
		const values = data.by_day.map(d => d.avg_rating);

		if(lineChart) lineChart.destroy();
		lineChart = new Chart(ctxLine, {
			type: 'line',
			data: {
				labels,
				datasets: [{ label: 'Avg rating', data: values, borderColor: '#4b2e83', backgroundColor: 'rgba(75,46,131,0.1)', fill: true, tension: 0.2 }]
			}
		});

		const barLabels = ['1','2','3','4','5'];
		const barValues = barLabels.map(k => data.distribution[k] || 0);
		if(barChart) barChart.destroy();
		barChart = new Chart(ctxBar, {
			type: 'bar',
			data: { labels: barLabels, datasets: [{ label: 'Responses', data: barValues, backgroundColor: '#4b2e83' }] }
		});
	}

	function updateExportLink(){
		const query = buildQuery();
		exportBtn.href = `/api/export.csv${query ? ('?' + query) : ''}`;
	}

	applyBtn.addEventListener('click', () => loadStats());
	loadStats();
})();

