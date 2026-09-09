// Generic consumer for <iframe class="simplicity-embed" data-tut-src="..."> tags embedding
// a page built to the simplicity-tut-example embedding contract (`?embed=1`, `?theme=`,
// and the `simplicity-embed-resize` / `simplicity-embed-set-theme` postMessage protocol).
// One iframe tag per embed; no per-page script needed.

(() => {
	const currentTheme = () =>
		document.body.getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'light';

	const wireFrame = (iframe) => {
		if (iframe.dataset.simplicityEmbedWired) return;
		iframe.dataset.simplicityEmbedWired = '1';

		const url = new URL(iframe.dataset.tutSrc, location.href);
		url.searchParams.set('embed', '1');
		url.searchParams.set('theme', currentTheme());
		iframe.src = url.toString();

		iframe.style.border = '0';
		iframe.style.width = '100%';
		iframe.style.display = 'block';
	};

	const wireAll = () => {
		document.querySelectorAll('iframe.simplicity-embed[data-tut-src]').forEach(wireFrame);
	};

	window.addEventListener('message', (event) => {
		if (event.data?.type !== 'simplicity-embed-resize') return;
		document.querySelectorAll('iframe.simplicity-embed').forEach((iframe) => {
			if (iframe.contentWindow === event.source) {
				iframe.style.height = `${event.data.height}px`;
			}
		});
	});

	// Material's palette toggle flips `data-md-color-scheme` on <body> without a page
	// navigation; relay the new theme live so an already-loaded embed updates instantly
	// instead of only matching the host on the embed's next load.
	new MutationObserver(() => {
		const theme = currentTheme();
		document.querySelectorAll('iframe.simplicity-embed').forEach((iframe) => {
			iframe.contentWindow?.postMessage({ type: 'simplicity-embed-set-theme', theme }, '*');
		});
	}).observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });

	// `navigation.instant` (enabled on this site) swaps page content via client-side
	// routing, so a plain DOMContentLoaded listener would only ever see the first page of
	// a visit. `document$` fires on first load and again on every subsequent
	// instant-navigation swap.
	if (window.document$) {
		document$.subscribe(wireAll);
	} else {
		document.addEventListener('DOMContentLoaded', wireAll);
	}
})();
