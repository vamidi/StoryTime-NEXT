import { NextApiRequest, NextApiResponse } from 'next';
import { authenticatedMiddleware, Claims } from '../../../middlewares/auth-check';
import { database } from '../../../config/serverApp';

export default authenticatedMiddleware(async (
	req: NextApiRequest,
	res: NextApiResponse,
	payload?: Claims,
) => {

	if(req.method !== 'GET') return res.status(401).json({ errorMessage: 'Not authorized!'});

	// we need the refresh token
	const { id } = req.query;

	if (!id) return res.status(401).json({ "error_msg": `No project ${id} parameters found` });

	await database.ref(`projects/${id}`).child('projects').once('value', (snapshot) => {

	});

	// TODO finish this to get specific project.
		// $arr = $this->database->getReference('projects')
	// ->getChild($project)
	// ->getSnapshot()
	// ->getValue();

		// if (!empty($arr))
		// {
		// 	return response()->json([$arr]);
		// }


		// return res.status(401).json({"error_msg": array("No project found with the name $project found")]);
		// return response()->json(["error_msg" => array("No project found with the name $project found")]);
});


