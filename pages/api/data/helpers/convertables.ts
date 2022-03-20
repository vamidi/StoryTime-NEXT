import { Prisma, Revision } from '@prisma/client';
import { DBClient } from '@core-middlewares/prisma-client';
import { User } from '@core-data/users/user.model';
import { QueryParams } from '@core-data/helpers';
import { IProjectData, ITable, Project, ProjectModel } from '@core-data/projects/project.model';
import { IRelation, ITableData, Table, TableModel } from '@core-data/tables/table.model';

const prismaClient = DBClient.getInstance();

export function getTableName(tbl: string): string
{
	switch(tbl)
	{
		case 'users': return 'user';
		case 'projects': return 'project';
		case 'tables': return 'table';
		case 'revisions': return 'revision';
		default: return '';
	}
}

export function isRelation(tbl: string)
{
	switch(tbl) {
		case 'tables':
			return false;
		case 'revisions':
			return true;
		default: return false;
	}
}

export function getTableIncludes(tbl: string)
{
	switch(tbl)
	{
		case 'tables':
			return Table.includes;
		default:
			return null;
	}
}

/**
 * @brief - This file represent table columns that needs convert data
 * to the right column in the table.
 */
export async function convertTable(tbl: string, fields: any, incomingData: any, uid?: string): Promise<any>
{
	switch(tbl)
	{
		case 'projects':
			return Project.createOrUpdate(getTableName(tbl), fields, incomingData, uid ? 'update' : 'insert');
		case 'tables':
		{
			return Table.createOrUpdate(getTableName(tbl), fields, incomingData, uid ? 'update' : 'insert');
		}
		case 'users':
		{
			return User.createOrUpdate(getTableName(tbl), fields, incomingData, uid ? 'update' : 'insert');
		}
	}
}

/**
 *
 * TODO simplify this
 * @param tbl
 * @param fields
 * @param incomingData
 * @param query
 */
export async function queryTable(tbl: string, fields: any, incomingData: any, query?: QueryParams): Promise<any>
{
	const collection = {};
	if(query)
	{
		// TODO fix index path
		const q: Prisma.RevisionFindManyArgs = {
			orderBy: {},
			where: {}
		}
		if (query.hasOwnProperty('limitSet') && query.hasOwnProperty('limit')) {
			q['take'] = query.limit;
			q['skip'] = Math.max(0,await prismaClient.prisma[tbl].count() - query.limit);
		}
		q['orderBy'][query.index.indexPath.pieces[0]] = 'desc';
		q['where'][query.index.indexPath.pieces[0]] = { equals: 0 };

		const result = prismaClient.prisma[tbl].findMany(q);

		switch(tbl)
		{
			case 'revisions':
				const revisions: Revision[] = await result;
				if(revisions.length)
				{
					revisions.forEach((revision) =>
						collection[revision.uid] = {
							id: revision.uid,
							currentRevID: revision.currentRevID,
							revision: revision.revision,
							created_at: revision.created_at,
							updated_at: revision.updated_at,
							rowID: revision.rowID,
							oldValue: JSON.parse(revision.oldValue),
							newValue: JSON.parse(revision.newValue),
							uid: revision.userId,
							deleted: revision.deleted,
						});
				}
				break;
		}


	}
	return collection;
}

/**
 * @brief - this section will convert tables back to their JSON form
 */
export async function parseTable(tbl: string, uid: string,  fields: any[])
{
	switch(tbl)
	{
		case 'users':
		{
			return User.parse(getTableName(tbl), uid);
		}
		case 'projects':
		{
			const search = await prismaClient.prisma.project.findUnique({
				where: {
					uid: uid,
				},
				include: {
					metadata: true,
					tables: {
						select: {
							uid: true,
							data: {
								select: {
									tableId: true,
									deleted: true,
									data: true,
								}
							},
							relations: true,
							revisions: true,
							metadata: true,
						}
					},
					members: true,
				}
			});

			const tables: ITable = {};
			const project: ProjectModel | null = null;

			if(search && search.tables.length) {
				search.tables.forEach((table) => {
					tables[table.uid] = {
						enabled: true, // TODO see if we need this
						name: table.metadata.title,
						description: table.metadata.description,
					}
				});

				const searchData = search.metadata;
				// @ts-ignore
				let metadata: IProjectData = {};
				if (searchData) {
					metadata = {
						// Title of the project
						title: searchData.title,

						// Alias of the project
						alias: searchData.alias,

						// Project description
						description: searchData.description,

						// Owner of the project
						owner: search.ownerId,

						// When the project is created
						created_at: searchData.created_at,

						// When the project was updated
						updated_at: searchData.updated_at,

						// To see if the project is private
						private: searchData.private,

						// To see whether the project is deleted
						deleted: searchData.deleted,

						// To see which languages are in the project
						languages: JSON.parse(searchData.languages),

						relatedTables: JSON.parse(searchData.relatedTables),

						version: JSON.parse(searchData.version),
					};
				}

				if (search.tables.length) {
					search.tables.forEach((table) => {
						tables[table.uid] = {
							enabled: true, // TODO see if we need this
							name: table.metadata.title,
							description: table.metadata.title,
						}
					});
				}

				const members = {};
				if (search.members.length) {
					search.members.forEach((member) => members[member.uid] = true);
				}

				const project: ProjectModel = {
					uid,
					ownerId: search.ownerId,
					memberId: search.memberId,
					tables,
					metadata,
					members,
				};
				delete project['ownerId'];
				delete project['memberId'];
			}
			return project;
		}
		case 'tables':
		{
			const search: any = await prismaClient.prisma[tbl].findUnique({
				where: {
					uid: uid,
				},
				include: Table.includes,
			});

			const searchData = search.metadata;
			const metadata: ITableData = {
				// Title of the project
				title: searchData.title,

				// Project description
				description: searchData.description,

				// Owner of the project
				lastUID: searchData.lastUID,

				owner: searchData.owner,

				// When the project is created
				created_at: searchData.created_at,

				// When the project was updated
				updated_at: searchData.updated_at,

				// To see if the project is private
				private: searchData.private,

				// To see whether the project is deleted
				deleted: searchData.deleted,

				version: JSON.parse(searchData.version),
			};

			const data: any = {};
			if(search.data.length)
			{
				search.data.forEach((d, idx) =>
				{
					data[idx] = {
						deleted: d.deleted,
						uid: d.uid,
						...JSON.parse(d.data),
					}
				});
			}

			const revisions = {};
			if(search.revisions.length)
			{
				search.revisions.forEach((revision) =>
					revisions[revision.uid] = {
						id: revision.uid,
						currentRevID: revision.currentRevID,
						revision: revision.revision,
						created_at: revision.created_at,
						updated_at: revision.updated_at,
						rowID: revision.rowID,
						oldValue: JSON.parse(revision.oldValue),
						newValue: JSON.parse(revision.newValue),
						uid: revision.userId,
						deleted: revision.deleted,
					});
			}


			const relationData = search.relations;
			const relations: IRelation = {
				columns: {},
			};
			if(relationData.length)
			{
				relationData.forEach((d) =>
				{
					// TODO this is the same data for every column in for the table
					// TODO we need to refactor this to only have data from the row.
					const columns = JSON.parse(d.columns)

					relations.columns[d.relationName] = {
						uid: d.uid,
						key: d.relationName,
						...columns[d.relationName],
					}
				});
			}

			const table: TableModel = {
				uid: search.uid,
				projectId: search.projectId,
				projectID: search.projectId,
				data,
				revisions,
				relations,
				metadata,
			};
			delete table['projectId'];
			return table;
		}
	}
}
