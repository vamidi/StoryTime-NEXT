import { NextApiRequest, NextApiResponse } from 'next';

import { DBClient } from '../../../middlewares/prisma-client';
import { authenticated } from '../../../middlewares/auth-check';

const prismaClient = DBClient.getInstance();

export default authenticated(async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	if(req.method !== 'GET')
		return 	res.status(401).json({ message: 'Not authorized!'});

	const projects = await prismaClient.prisma.project.findMany({
		where: {
			id: "1",
		}
	});

	res.status(200).json(projects);
});
