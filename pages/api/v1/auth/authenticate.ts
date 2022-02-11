import { NextApiRequest, NextApiResponse } from 'next';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { DBClient } from '../../../../middlewares/prisma-client';
import { createCookie, insertToken } from '../../../../middlewares/cookie';
import cors from '../../../../middlewares/cors';
import { makeClaims } from '../../../../middlewares/claims';

const prismaClient = DBClient.getInstance();

export default async (req: NextApiRequest, res: NextApiResponse) =>
{
	// Run cors
	await cors(req, res);

	if (req.method !== 'POST')
		return res.status(401).json({ errorMessage: 'Not authorized!' });

	// password: hash,
	const response: { email, password } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	if(response)
	{
		const userMetadata = await prismaClient.prisma.userMetaData.findFirst({
			where: {
				email: response.email,
			},
		});

		if(!response.password || !userMetadata.password)
			return res.status(200).json({ errorMessage: 'User could not be found'});

		const comparedResult = await compare(response.password, userMetadata.password);
		if (comparedResult)
		{
			// delete the password from the response
			// delete userMetadata.password;

			// make JWT token
			const claims = await makeClaims(userMetadata);
			// parseInt(process.env.JWT_EXPIRY)
			const token = sign(claims, process.env.JWT_SECRET, { expiresIn: '1h' });

			const { newRefreshToken, newRefreshTokenExpiry, newRefreshTokenHash } = await createCookie();
			const exp: number = newRefreshTokenExpiry.getTime() + newRefreshTokenExpiry.getTimezoneOffset();
			await insertToken(userMetadata.userId, newRefreshTokenHash, newRefreshTokenExpiry);

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

			payload.user.stsTokenManager.accessToken = token;
			payload.user.stsTokenManager.refreshToken = newRefreshToken;


			return res.status(200).json({ ...payload, err: false, message: 'Login successful' });
		}

		return res.status(200).json({ err: true, message: 'User could not be found' });
	}

	return res.status(401).json({ message: 'User could not be found'});
}
