import { UserMetaData } from '@prisma/client';

export interface IClaims {
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
		sign_in_provider: string
	}
}

export const makeClaims = async (userMetadata: UserMetaData) =>
{
	return {
		name: "Demo",
		picture: "",
		iss: `https://securetoken.google.com/${ process.env.DATABASE_AUDIENCE_CLAIM }`,
		aud: process.env.DATABASE_AUDIENCE_CLAIM as string,
		auth_time: Math.floor(Date.now() / 1000),
		uid: userMetadata.userId,
		user_id: userMetadata.userId,
		sub: userMetadata.userId,
		email: userMetadata.email,
		email_verified: false,
		prisma: {
			identities: {
				email: [
					userMetadata.email
				]
			},
			sign_in_provider: "password"
		}
	};
}
