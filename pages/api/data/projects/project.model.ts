import { Prisma, Project as Projects } from '@prisma/client';
import { KeyLanguage } from '@core-data/helpers/languages.model';
import { IVersion } from '@core-data/helpers/pipeline.model';

export interface ITable
{
	[key: string]: {
		enabled: boolean,
		name: string,
		description?: string,
	},
}

export interface IProjectData
{
	// Title of the project
	title: string;

	// Alias of the project
	alias: string;

	// Project description
	description: string;

	// Owner of the project
	owner: string;

	// When the project is created
	created_at: Object;

	// When the project was updated
	updated_at: Object;

	// To see if the project is private
	private: boolean;

	// To see whether the project is deleted
	deleted: boolean;

	// To see which languages are in the project
	languages: { [key in KeyLanguage]?: boolean },

	version: IVersion;
}

export interface IGameStats
{
	formulaPlayers: string;
	formulaEnemies: string;
	maxLevel: number;
	stats: {
		[key: string]: {},
	};
	modifiers: {
		[key: string]: {},
	};
}

export interface ProjectModel extends Projects
{
	uid: string;
	tables: ITable;
	metadata: IProjectData;
	members: { [key: string]: boolean };

	gameStats?: IGameStats;
}

export class Project implements ProjectModel
{
	members: { [p: string]: boolean };
	metadata: IProjectData;
	tables: ITable;
	uid: string;
	memberId = '';
	ownerId = '';

	static async createOrUpdate(tbl: string, fields: any, incomingData: any, type: 'insert' | 'update')
	{
		const inputData: Prisma.ProjectCreateInput | Prisma.ProjectUpdateInput = {
			owner: {},
		};

		const keys = Object.keys(incomingData);
		for(const key of keys)
		{
			const tblField: any = fields.find((field) => field.name === key);
			if(tblField)
			{
				// check if this is a relation field
				if(tblField.hasOwnProperty('relationName'))
				{
					if(type === 'insert')
					{
						await Project.convertCreateInput(tblField, inputData as Prisma.ProjectsCreateInput, incomingData);
					}
					else
					{
						await Project.convertUpdateInput(tblField, inputData, incomingData);
					}
				}
			}

		}

		return inputData;
	}

	private static async convertCreateInput(tblField: any, inputData: Prisma.ProjectsCreateInput, incomingFieldData: any)
	{
		switch(tblField.name)
		{
			// grab the relations
			case 'members': {
				if (incomingFieldData.hasOwnProperty('members')) {
					// TODO add more
					const members = Object.entries(incomingFieldData.members);
					const uids: { uid: string }[] = [];
					for (const [key, value] of members) {
						if (value) {
							uids.push({ uid: key });
						}
					}
					inputData.members = {
						connect: uids,
					};
				}
			}
				break;
			case 'metadata': {
				// grab the owner from the metadata
				if(incomingFieldData.hasOwnProperty('metadata'))
				{
					// TODO we can probably get this from the authenticated user.
					const metadata = incomingFieldData.metadata;

					inputData.owner = {
						connect: {
							uid: metadata.owner,
						},
					};

					delete metadata['owner'];
					inputData.metadata = {
						create: {
							...metadata,
							languages: JSON.stringify(metadata.languages),
							version: JSON.stringify(metadata.version),
						},
					}
				}
			}
				break;
		}
	}

	private static async convertUpdateInput(tblField: any, updateData: Prisma.ProjectsUpdateInput, incomingFieldData: any)
	{

	}
}
