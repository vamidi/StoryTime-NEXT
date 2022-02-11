import { NextApiRequest, NextApiResponse } from 'next';
import { authenticated, Claims } from '../../../../middlewares/auth-check';
import { DBClient } from '../../../../middlewares/prisma-client';
import { UserMetaData } from '@prisma/client';

const prismaClient = DBClient.getInstance();

export default authenticated(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload: Claims,
) => {
	console.log(req.headers);

	if(req.method !== 'POST') return res.status(401).json({ message: 'Not authorized!'});

	const userMetaData: UserMetaData[] = await prismaClient.prisma.userMetaData.findMany({
		where: {
			userId: payload.uid,
		}
	});

	const users = userMetaData.map((metadata) => {
		return {
			localId: metadata.userId,
			displayName: metadata.displayName,
			photoUrl: metadata.photoURL || 'random',
			email: metadata.email,
			emailVerified: false,
			phoneNumber: '123',
			lastLoginAt: 0,
			createdAt: metadata.created_at,
			tenantId: '123',
			passwordHash: '123', // atob('REDACTED')
			providerUserInfo: [
				{
					providerId: payload.prisma.sign_in_provider,
					rawId: metadata.email,
					email: metadata.email,
					displayName: metadata.displayName,
					photoUrl: metadata.photoURL,
					phoneNumber: '123',
				},
			],
			mfaInfo: [
				{
					mfaEnrollmentId: '1234',
					enrolledAt: 0,
					displayName: metadata.displayName,
					phoneInfo: '123',
				}
			],
		}
	})

	res.status(200).json({ users });
});
