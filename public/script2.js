const sendBtn = document.getElementById('sendBtn');
		const refreshBtn = document.getElementById('refreshBtn');
		const jsonInput = document.getElementById('jsonInput');
		const postResult = document.getElementById('postResult');
		const listResult = document.getElementById('listResult');

		sendBtn.addEventListener('click', async () => {
			try {
				const payload = JSON.parse(jsonInput.value);
				const r = await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
				postResult.textContent = JSON.stringify(await r.json(), null, 2);
				await loadList();
			} catch (e) {
				postResult.textContent = e.message;
			}
		});

		async function loadList() {
			const r = await fetch('/api/results');
			listResult.textContent = JSON.stringify(await r.json(), null, 2);
		}
		refreshBtn.addEventListener('click', loadList);
		loadList();