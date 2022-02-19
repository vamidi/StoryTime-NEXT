import { NextApiRequest, NextApiResponse } from 'next';
import cors from '../../middlewares/cors';

export default async (req: NextApiRequest, res: NextApiResponse) =>
{
	// Run cors
	await cors(req, res);

	return res.status(200).json({ message : 'Ok'});
}
