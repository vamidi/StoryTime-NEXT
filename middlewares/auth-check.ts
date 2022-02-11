import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import cors from './cors';
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
	TWITTER = 'twitter.com'
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

export type NextAuthenticatedApiHandler<T = any> = (req: NextApiRequest, res: NextApiResponse<T>, payload: Claims) => void | Promise<void>;

export const authenticated = (fn: NextAuthenticatedApiHandler) => async (
	req: NextApiRequest,
	res: NextApiResponse,
) => {

	// Run cors
	await cors(req, res);

	return verify(req.headers.authorization!, process.env.JWT_SECRET, { ignoreExpiration: true }, function (err, decoded)
	{
		// if we have a token and it is valid, but expired then we want to refresh it if the api route is 'token'
		// const error = err && err.name === 'TokenExpiredError';
		// if we have no error just continue.
		// console.log(error, req.url === '/api/v1/token', decoded);
		if (!err /* (!err || error && req.url === '/api/v1/token') */ && decoded) {
			return fn(req, res, decoded as Claims);
		}

		res.status(200).json({ err: true, message: 'Sorry you are not authenticated' });
	});
}
