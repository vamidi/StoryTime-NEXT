import { NextApiResponse } from 'next';
import { authenticatedMiddleware } from '@core-middlewares/auth-check';

export default authenticatedMiddleware(async (_, res: NextApiResponse, token) =>
{
	try {
		const response = await fetch(
			`https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`,
			{
				method: 'POST',
				body: JSON.stringify({
					"grant_type": 'refresh_token',
					"refresh_token": token,
				}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json',
				},
			}
		);

		console.log(await response.json());

		if (response.status >= 400) {
			return res.status(400).json({
				error: 'There was an error'
			});
		}

		const jsonRes = response.json();
		console.log(jsonRes)
		return res.status(200).json(jsonRes);

	}
	catch (e) {
		console.log(e);
		return res.status(500).json({
			error: 'There was an error'
		});
	}
});
