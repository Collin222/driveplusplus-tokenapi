import { Hono } from 'hono';

const app = new Hono();

app.post('/api/auth/token', async (c) => {
	const clientId = c.env.CLIENT_ID;
	const clientSecret = c.env.CLIENT_SECRET;
	const redirectUri = c.env.REDIRECT_URI;

	const body = await c.req.json();
	const now = Math.floor(Date.now() / 1000);

	try {
		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				code: body.code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
			}),
		});

		if (response.ok) {
			const { access_token: accessToken, expires_in: expiresIn, refresh_token: refreshToken } = await response.json();

			return c.json(
				{
					accessToken,
					expiresAt: now + expiresIn,
					refreshToken,
				},
				200
			);
		}

		const data = await response.json();
		console.error('request failed: ', data);
		return c.json(data, 400);
	} catch (error) {
		console.error('Error with authorization_code request: ', error);
		return c.json({ error }, 400);
	}
});

export default app;
