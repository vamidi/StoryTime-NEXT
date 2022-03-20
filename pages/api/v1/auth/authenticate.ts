import { Request, Response } from 'express';
import { DBClient } from '../../middlewares/prisma-client';
import cors from '../../middlewares/cors';
import auth from '../../config/auth';

const prismaClient = DBClient.getInstance();

export default async (req: Request, res: Response) =>
{
	// Run cors
	// @ts-ignore
	await cors(req, res);

	if (req.method !== 'POST' || typeof req.body === 'undefined')
		return res.status(200).json({ errorMessage: 'Not authorized!' });

	// password: hash,
	const hasBody = typeof req.body === 'string' && req.body !== '';
	const response: { email: string, password: string } = hasBody ? JSON.parse(req.body) : req.body;
	if(response)
	{
		if(!response.password)
			return res.status(200).json({ errorMessage: 'Users could not be found'});

		const result = await auth.login(response.email, response.password);
		if(typeof result === 'boolean' && typeof auth.generateToken !== 'undefined') {
			const userMetadata = await prismaClient.prisma.userMetaData.findFirst({
				where: {
					email: response.email,
				},
			});

			const { claims, exp, idToken, refreshToken } = await auth.generateToken(userMetadata);
			const payload = {
				additionalUserInfo: {
					isNewUser: false,
					profile: {},
					providerId: 'password',
					username: null,
				},
				credential: null,
				operationType: 'signIn',
				user: {
					...claims,
					apiKey: 'AIzaSyC05Pn4eiFjs0fvahifUsciggpwyw0Xj9M',
					appName: '[DEFAULT]',
					authDomain: 'buas-prototype-dev.firebaseapp.com',
					stsTokenManager: {
						apiKey: 'AIzaSyC05Pn4eiFjs0fvahifUsciggpwyw0Xj9M',
						refreshToken: '',
						accessToken: '',
						expirationTime: exp,
					},
				},
			}

			payload.user.stsTokenManager.accessToken = idToken;
			payload.user.stsTokenManager.refreshToken = refreshToken;

			return res.status(200).json(payload);
		}

		return res.status(200).json(result);
	}

	return res.status(401).json({ errorMessage: 'User could not be found'});
}
