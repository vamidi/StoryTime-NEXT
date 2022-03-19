import { User as Users, UserMetaData, Prisma, Project as Projects } from '@prisma/client';
import { DBClient } from '@core-middlewares/prisma-client';

const prismaClient = DBClient.getInstance();

export interface Roles {
	superAdmin?: boolean, // – A super is the owner of the project. This user is able to do everything inside a project
	admin?: boolean, // – somebody that has the same abilities as the super, except they can't rename/delete project
	editor?: boolean, // – somebody who can publish and manage tables including the tables of other users.
	author?: boolean, // – somebody who can publish and manage their own tables.
	subscriber?: boolean, // – somebody who can only manage their profile.
	// TODO see if we need this
	contributor?: boolean, // – somebody who can write and manage their own tables but cannot publish them.
	reader?: boolean, // somebody that can only read public tables and projects.
}

export interface UserModel extends Users
{
	/**
	 * @brief - User Metadata
	 */
	metadata: UserMetaData;

	/**
	 * @brief - Project data
	 * This explains which projects the player
	 * belongs to.
	 */
	projects: { [key: string]: { roles: Roles } };
}

export class User implements UserModel
{
	uid: string = '';
	roles: string = '';

	metadata = {
		uid: Number.MAX_SAFE_INTEGER,
		userId: '',
		created_at: new Date(Date.now()),
		updated_at: new Date(Date.now()),
		displayName: '',
		email: '',
		password: '',
		firstName: '',
		lastName: '',
		photoURL: '',
	};

	projects: { [p: string]: { roles: Roles } } = {};

	/**
	 * @brief search for the user and parse it to the right form for the frontend.
	 * @param tbl
	 * @param uid
	 */
	public static async parse(tbl: string, uid: string)
	{
		const search: { uid: string, metadata?: UserMetaData, projects?: Projects[], roles?: string } = await prismaClient.prisma[tbl].findUnique({
			where: {
				uid,
			},
			include: {
				tokens: false,
				metadata: true,
				projects: true,
			}
		});
		const projects = {};
		const roles: { [key: string]: Roles } = JSON.parse(search.roles);
		search.projects.forEach((project) => projects[project.uid] = roles[project.uid]);
		const user: UserModel = {
			uid: uid,
			metadata: search.metadata,
			projects,
			roles: '',
		};
		// TODO remove after migration -> this is a hack for shutting up the IDE.
		delete user['roles'];
		return user;
	}

	public static async createOrUpdate(tbl: string, fields: any, incomingData: any, type: 'insert' | 'update')
	{
		const inputData: Prisma.UsersCreateInput | Prisma.UsersUpdateInput = { }

		const keys = Object.keys(incomingData);
		for(const key of keys)
		{
			const tblField: any = fields.find((field) => field.name.toLowerCase() === key.toLowerCase());
			if(tblField)
			{
				if(type === 'insert')
				{
					await User.convertCreateInput(tblField, inputData as Prisma.UsersCreateInput, incomingData);
				}
				else
				{
					await User.convertUpdateInput(tblField, inputData, incomingData);
				}

				// check if this is a relation field
				// if(tblField.hasOwnProperty('relationName'))
				// {
				// }
			}
		}

		return inputData;
	}

	private static async convertCreateInput(tblField: any, inputData: Prisma.UsersCreateInput, incomingFieldData: any)
	{
		switch(tblField.name)
		{
			case 'roles':
			{
				if (incomingFieldData.hasOwnProperty('roles')) {
					inputData.roles = JSON.stringify(incomingFieldData.roles);
				}
			}
				break;
			// grab the relations
			case 'projects': {
				if (incomingFieldData.hasOwnProperty('projects')) {
					// TODO add more
					const projects = Object.entries(incomingFieldData.projects);
					const uids: { uid: string }[] = [];
					for (const [key, value] of projects) {
						if (value) {
							uids.push({ uid: key });
						}
					}

					inputData.projects = {
						connect: uids,
					};
				}
			}
				break;
			case 'metadata':
			{
				const metadata: UserMetaData = {
					...incomingFieldData.metadata,
					updated_at: new Date(Date.now()),
				};
				inputData.metadata = {
					connect: metadata,
				}
			}
				break;
		}
	}

	private static async convertUpdateInput(tblField: any, updateData: Prisma.UsersUpdateInput, incomingFieldData: any)
	{
		switch(tblField.name)
		{
			// grab the relations
			case 'projects':
			{
				if (incomingFieldData.hasOwnProperty('projects'))
				{
					// we need to find the projects
					const queryProjects: { projects: {uid, memberId, ownerId }[] } = await prismaClient.prisma.users.findUnique({
						where: {
							uid: incomingFieldData.uid,
						},
						select: {
							uid: false,
							tokens: false,
							metadata: false,
							projects: true,
							ownedProjects: false,
							roles: false,
						}
					});

					const excludedProjects: {uid: string}[] = [];

					// TODO add more
					const uids: { uid: string }[] = [];

					//  we need to take the highest object.
					const keys = Object.keys(incomingFieldData.projects);
					const arr: string[] = keys.length > queryProjects.projects.length ? keys :
						queryProjects.projects.map((value) => value.uid);

					arr.forEach((projectId) =>
					{
						// if we haven't found a project disconnect it.
						const value = incomingFieldData.projects[projectId];
						const obj = { uid: projectId };

						if(value === null || typeof value === 'undefined')
						{
							excludedProjects.push(obj);
						}
						else
							uids.push(obj);

					});

					const query = {
						connect: uids,
						disconnect: excludedProjects,
					};

					updateData.projects =  query;
					updateData.ownedProjects = query;

					// console.log(JSON.stringify(incomingFieldData.projects));
					updateData.roles = JSON.stringify(incomingFieldData.projects);
				}
			}
				break;
			case 'metadata':
			{
				const metadata: Prisma.UserMetaDataUncheckedUpdateWithoutUserInput = {
					...incomingFieldData.metadata,
					updated_at: new Date(Date.now()),
				};

				// TODO wait for update where fields are ignored if they don't exist in schema
				if(metadata.hasOwnProperty('userId'))
				{
					delete metadata['userId'];
				}

				updateData.metadata = {
					update: metadata,
				}
			}
		}
	}
}
