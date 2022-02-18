import { DBClient } from '../../../middlewares/prisma-client';
import { User } from '@prisma/client';
import { authenticatedMiddleware, Claims } from '../../../middlewares/auth-check';
import { NextApiRequest, NextApiResponse } from 'next';
import { checkToken } from '../../../middlewares/cookie';
import { database } from '../../../config/serverApp';
import { isFirebase } from '../../../config/utils';

const prismaClient = DBClient.getInstance();

export default authenticatedMiddleware(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload?: Claims,
) => {
	if(req.method !== 'GET') return res.status(401).json({ errorMessage: 'Not authorized!'});

	// we need the refresh token
	const { refresh_token, uid } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	const result: { projects?: any[] } = {};
	if(isFirebase)
	{
		await database.ref(`users/${uid}`).child('projects').once('value', (snapshot) => {
			if(snapshot.exists())
			{
				result.projects = snapshot.val();
			}
		});

		if(result.projects?.length === 0)
			return res.status(200).json({
				...result,
				error_msg: 'No projects found',
			});
	}
	else
	{
		if(!refresh_token || typeof payload === 'undefined') return res.status(401).json({ message: 'No refresh token provided'});

		const user: User | null = await prismaClient.prisma.user.findFirst({
			where: {
				id: payload.uid,
			},
		});

		if (user === null) return res.status(401).json({ message: 'User not found!'});

		let { isMatch, isValid } = await checkToken(user, refresh_token);

		console.log(isMatch, isValid);

		result.projects = await prismaClient.prisma.project.findMany({
			where: {
				id: '1',
			},
		});
	}

	return res.status(200).json(result);
});