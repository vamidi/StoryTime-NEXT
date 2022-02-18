import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import cors from './cors';
import { auth } from '../config/serverApp';
import { isFirebase } from '../config/utils';
/**
 * Enumeration of supported providers.
 *
 * @public
 */
export enum ProviderId {
	/** @internal */
	ANONYMOUS = 'anonymous',
	/** @internal */
	CUSTOM = 'custom',
	/** Facebook provider ID */
	FACEBOOK = 'facebook.com',
	/** @internal */
	FIREBASE = 'firebase',
	/** GitHub provider ID */
	GITHUB = 'github.com',
	/** Google provider ID */
	GOOGLE = 'google.com',
	/** Password provider */
	PASSWORD = 'password',
	/** Phone provider */
	PHONE = 'phone',
	/** Twitter provider ID */
	TWITTER = 'twitter.com',
}

export interface Claims {
	name: string,
	picture: string,
	iss: string,
	aud: string,
	auth_time: number,
	uid: string,
	user_id: string,
	sub: string,
	email: string,
	email_verified: boolean,
	prisma: {
		identities: {
			email: string[],
		},
		sign_in_provider: ProviderId,
	}
}

// export declare type authenticated<T = any> = (req: NextApiRequest, res: NextApiResponse<T>, payload: Claims) => void | Promise<void>;

export const authenticatedMiddleware = (fn: (req: NextApiRequest, res: NextApiResponse, payload?: Claims) => void) => async (
	req: NextApiRequest,
	res: NextApiResponse,
) => {
	// Run cors
	await cors(req, res);

	if(isFirebase)
	{
		const authHeader = req.headers.authorization as string;
		if (!authHeader) {
			return res.status(401).json({ errorMessage: 'Sorry you are not authenticated' });
		}

		const token = authHeader.split(' ')[1];
		let decodedToken;
		try {
			decodedToken = await auth.verifyIdToken(token);
			if (!decodedToken || !decodedToken.uid)
				return res.status(401).end('Not authenticated');

			req.body = JSON.stringify({ ...req.body, uid: decodedToken.uid });
		} catch (error: any) {
			console.log(error);
			const errorCode = error.errorInfo.code;
			error.status = 401;
			if (errorCode === 'auth/internal-error') {
				error.status = 500;
			}

			return res.status(error.status).json({ error: errorCode });
		}

		return fn(req, res);
	}
	else
	{
		verify(req.headers.authorization!, process.env.JWT_SECRET as string,async function (err, decoded)
		{
			if (!err && decoded) {
				await fn(req, res, decoded as Claims);
			}

			return res.status(401).json({ errorMessage: 'Sorry you are not authenticated' });
		});
	}

	return res.status(401).json({ errorMessage: 'Sorry you are not authenticated' });
}
