import { NextApiRequest, NextApiResponse } from 'next';
import { authenticatedMiddleware, Claims } from '../../../../middlewares/auth-check';
import { database } from '../../../../config/serverApp';
import { isFirebase } from '../../../../config/utils';

export default authenticatedMiddleware(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload?: Claims,
) => {

	if(req.method !== 'GET') return res.status(401).json({ errorMessage: 'Not authorized!'});

	// we need the refresh token
	const { project } = req.query;

	if (!project) return res.status(401).json({ "error_msg": `No project ${project} parameters found` });

	if(isFirebase)
	{
		const projectValue =  await database.ref('projects').child(project as string).once('value');
		if(projectValue)
			return res.status(200).json(projectValue);
	}

	return res.status(404).json({ 'error_msg': 'No project found with the name $project found' })
});


