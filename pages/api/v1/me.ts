import { NextApiResponse } from 'next';
import { authenticatedMiddleware } from '@core-middlewares/auth-check';

export default authenticatedMiddleware(async (_, res: NextApiResponse) => {
	return res.status(200).json({ errorMessage: 'Still logged in!'});
});
