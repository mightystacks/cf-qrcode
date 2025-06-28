export default {
	async fetch(request, env, ctx): Promise<Response> {
		if (request.method === 'POST') {
			const formData = await request.formData();
			const text = formData.get('text') as string;

			const urlPattern = /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!$&'()*+,;=.]+$/i;
			const isValid = urlPattern.test(text);

			return new Response(generatePage({ text, isValid }), {
				headers: { 'content-type': 'text/html' },
			});
		}

		// Default form for GET requests
		return new Response(generatePage(), {
			headers: { 'content-type': 'text/html' },
		});
	},
} satisfies ExportedHandler<Env>;

// Helper function to build the page HTML
function generatePage({
	text = '',
	isValid = true,
}: { text?: string; isValid?: boolean } = {}) {
	const escapedText = text.replace(/"/g, '&quot;');
	const qrScript = isValid && text
		? `<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
		<script>
			const qrSize = Math.min(window.innerWidth * 0.8, 400);
			new QRCode(document.getElementById('qrcode'), {
				text: ${JSON.stringify(text)},
				width: qrSize,
				height: qrSize,
				colorDark: "#d7263d",
				colorLight: "#ffffff"
			});
		</script>`
		: '';

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>QR Code Generator</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		:root {
			--bg: #f9fafb;
			--card-bg: #ffffff;
			--accent: #d7263d;
			--text: #111827;
			--error: #dc2626;
		}
		body {
			margin: 0;
			font-family: system-ui, sans-serif;
			background: var(--bg);
			color: var(--text);
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 2rem;
		}
		h1 {
			font-size: 2rem;
			margin-bottom: 1rem;
			text-align: center;
		}
		.form-card {
			background: var(--card-bg);
			padding: 2rem;
			border-radius: 1rem;
			box-shadow: 0 4px 12px rgba(0,0,0,0.1);
			width: 100%;
			max-width: 500px;
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		input[type="url"] {
			width: 100%;
			padding: 1rem;
			border: 1px solid #d1d5db;
			border-radius: 0.5rem;
			font-size: 1rem;
			margin-bottom: 1rem;
			box-sizing: border-box;
		}
		button {
			background-color: var(--accent);
			color: white;
			padding: 0.75rem 1.5rem;
			border: none;
			border-radius: 0.5rem;
			font-size: 1rem;
			cursor: pointer;
			transition: background-color 0.2s ease;
		}
		button:hover {
			background-color: #a81d2b;
		}
		#error-msg {
			color: var(--error);
			margin-bottom: 1rem;
			font-size: 0.95rem;
		}
		#qrcode {
			margin-top: 2rem;
			display: flex;
			justify-content: center;
		}
		.back-link {
			margin-top: 2rem;
			text-decoration: none;
			color: var(--accent);
			font-size: 0.95rem;
		}
	</style>
</head>
<body>
	<h1>QR Code Generator</h1>
	<div class="form-card">
		${!isValid && text ? `<div id="error-msg">⚠️ Please enter a valid URL (starting with http:// or https://)</div>` : ''}
		<form method="POST">
			<input type="url" name="text" placeholder="Enter a valid URL" required autocomplete="off" value="${escapedText}">
			<button type="submit">${isValid && text ? 'Regenerate' : 'Generate QR Code'}</button>
		</form>
		${isValid && text ? `<div id="qrcode"></div>` : ''}
	</div>
	${isValid && text ? `<a href="/" class="back-link">← Generate another</a>` : ''}
	${qrScript}
</body>
</html>`;
}
