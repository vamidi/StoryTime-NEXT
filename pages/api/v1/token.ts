import { NextApiRequest, NextApiResponse } from 'next';
import { UserMetaData, User } from '@prisma/client';
import { sign } from 'jsonwebtoken';

import { DBClient } from '../middlewares/prisma-client';
import { checkToken, createCookie, insertToken, updateToken } from '../middlewares/cookie';
import { makeClaims } from '../middlewares/claims';
import cors from '@core-middlewares/cors';
import { isFirebase } from '@core-config/utils';
import auth from '@core-config/auth';

const prismaClient = DBClient.getInstance();

export default async (
	req: NextApiRequest,
	res: NextApiResponse,
) => {
	await cors(req, res);

	if(req.method !== 'POST') return res.status(401).json({ errorMessage: 'Not authorized!'});

	// we need the refresh token
	const hasBody = typeof req.body === 'string' && req.body !== '';
	const { uid, refresh_token } = hasBody ? JSON.parse(req.body) : req.body;

	if (!refresh_token) res.status(401).json({ message: 'No refresh token provided'});

	const user: User | null = await prismaClient.prisma.user.findFirst({
		where: {
			uid,
		},
	});

	if (user === null) return res.status(401).json({ message: 'User not found!'});

	let { token, isMatch, isValid } = await checkToken(user, refresh_token);

	console.log(isMatch, isValid);
	// if we have a match and the token is not valid anymore. generate a new one.
	if(isMatch)
	{
		const userMetadata: UserMetaData | null = await prismaClient.prisma.userMetaData.findFirst({
			where: {
				userId: uid,
			},
		});

		if (userMetadata === null || typeof auth.generateToken === 'undefined') return res.status(401).json({ message: 'User data found!'});

		const { claims, exp, idToken, refreshToken } = await auth.generateToken(userMetadata, token, !isValid);
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
		/*
		const response = {
			access_token: newToken,
			expires_in: process.env.JWT_EXPIRY,
			refresh_token: null,
		}
		 */

		// return the payload.
		// response.refresh_token = !isValid ? newRefreshToken : refresh_token;

		return res.status(200).json(payload);
	}

	return res.status(401).json({ errorMessage: 'Token cant be found!'});
};
