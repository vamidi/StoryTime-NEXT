import { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { Users } from '@prisma/client';

import { DBClient } from '../../../middlewares/prisma-client';
import { checkToken, createCookie, insertToken, updateToken } from '../../../middlewares/cookie';
import { makeClaims } from '../../../middlewares/claims';
import { authenticated, Claims } from '../../../middlewares/auth-check';

const prismaClient = DBClient.getInstance();

export default authenticated(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload: Claims,
) => {
	if(req.method !== 'POST') return res.status(200).json({ errorMessage: 'Not authorized!'});

	// we need the refresh token
	const { refresh_token } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

	if (!refresh_token) res.status(200).json({ message: 'No refresh token provided'});

	const user: Users = await prismaClient.prisma.users.findFirst({
		where: {
			uid: payload.uid,
		},
	});

	let { token, isMatch, isValid } = await checkToken(user, refresh_token);

	// if we have a match and the token is not valid anymore. generate a new one.
	if(token && isMatch)
	{
		const userMetadata = await prismaClient.prisma.userMetaData.findFirst({
			where: {
				userId: payload.uid,
			},
		});

		// make JWT token
		const claims = await makeClaims(userMetadata);
		const newToken = sign(claims, process.env.JWT_SECRET, { expiresIn: '1h' });

		// Create new cookie with new tokens
		const { newRefreshToken, newRefreshTokenExpiry, newRefreshTokenHash } = await createCookie();
		const exp: number = newRefreshTokenExpiry.getTime() + newRefreshTokenExpiry.getTimezoneOffset();

		const response = {
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
					refreshToken: null,
					accessToken: newToken,
					expirationTime: exp,
				},
			},
		}

		if(!isValid)
		{
			// insert the token in the database
			await insertToken(userMetadata.userId, newRefreshTokenHash, newRefreshTokenExpiry);
		}
		else
		{
			// update the token in the database
			await updateToken(token, newRefreshTokenExpiry);
		}


		// return the payload.
		response.user.stsTokenManager.refreshToken = !isValid ? newRefreshToken : refresh_token;

		return res.status(200).json({ ...response, err: false });
	}

	return res.status(200).json({ err: true, message: 'Token cant be found!'});
})
