import { Prisma, Tables } from '@prisma/client';
import { IVersion } from './pipeline.model';

export interface Revision {
	id?: string,
	currentRevID: number,						// - CurrentRevID - Current revision of the element
	revision: number, 							// - Revisions - Rev number of the element
	created_at: Date,						 	// - created_at - Data changed with the new value
	updated_at: Date,						 	// - updated_at - Data changed with the new value
	rowID: number,						        // - Id - Id of the element in that table
	oldValue: any,								// - oldValue - old value it got now
	newValue: any,	 							// - newValue - new value it had.
	uid: string,		 						// - uid - user id that changed it.
	deleted: boolean,
}

export interface IRelation {

	/**
	 * @brief - Add relation data to a collection
	 * @param key - column key of the current table
	 * @param value - key value pair of the other table and column
	 */
	columns?: { [key: string ]: { uid?:string, key: string, column: string, locked?: boolean } }
}

export interface TableTemplate
{
	[key: string]: any;
}

interface IMetaData {
	created_at: Object;
	updated_at: Object;
	deleted: boolean;
}

export interface ITableData extends IMetaData
{
	title: string;
	description: string;
	lastUID: number;
	created_at: Object;
	updated_at: Object;
	owner: string;
	private: boolean;
	deleted: boolean;

	// Pipeline settings
	version: IVersion;
}

export interface TableModel extends Tables {
	uid: string,
	projectID: string,
	data: TableTemplate,
	revisions: { [key: string]: Revision },
	relations: IRelation,
	metadata: ITableData,
}

export class Table implements TableModel
{
	data: TableTemplate;
	metadata: ITableData;
	projectID: string;
	relations: IRelation;
	revisions: { [p: string]: Revision };
	uid: string;
	projectId: string;

	public static get includes(): Prisma.TablesInclude
	{
		// TODO make it possible to exclude data
		return {
			project: {
				select: {
					uid: true,
				},
			},
			data: {
				select: {
					uid: true,
					deleted: true,
					data:true,
				},
			},
			relations: {
				select: {
					uid: true,
					relationName: true,
					columns: true,
				},
			},
			revisions: {
				select: {
					uid: true,
					currentRevID: true,
					revision: true,
					created_at: true,
					updated_at: true,
					rowID: true,
					oldValue: true,
					newValue: true,
					userId: true,
					deleted: true,
				},
			},
			metadata: {
				select: {
					title: true,
					created_at: true,
					description: true,
					deleted: true,
					lastUID: true,
					owner: true,
					updated_at:true,
					private:true,
					version: true,
				}
			},
		}
	}

	public static async createOrUpdate(tbl: string, fields: any, incomingData: any, type: 'insert' | 'update')
	{
		const inputData: Prisma.TablesCreateInput = {
			project: {},
			// relations?: RelationsCreateNestedManyWithoutTableInput
			// revisions?: RevisionsCreateNestedManyWithoutTableInput
		};

		const keys = Object.keys(incomingData);
		for(const key of keys)
		{
			const tblField: any = fields.find((field) => field.name.toLowerCase() === key.toLowerCase());
			if(tblField)
			{
				if(type === 'insert')
				{
					await Table.convertCreateInput(tblField, inputData as Prisma.TablesCreateInput, incomingData);
				}
				else
				{
					await Table.convertUpdateInput(tblField, inputData, incomingData);
				}
			}

		}

		return inputData;
	}

	private static async convertCreateInput(tblField: any, inputData: Prisma.TablesCreateInput, incomingFieldData: any)
	{
		switch(tblField.name)
		{
			case 'projectId':
			{
				if (incomingFieldData.hasOwnProperty('projectID'))
				{
					inputData.project = {
						connect: { uid: incomingFieldData.projectID },
					};
				}
			}
			break;
			case 'data':
			{
				if (incomingFieldData.hasOwnProperty('data'))
				{
					const tblData = Object.values<any>(incomingFieldData.data);
					const prismaData: {deleted: boolean, data: string }[] = [];
					for(const value of tblData)
					{
						const isDeleted = value.deleted;
						delete value.deleted;
						const d: {deleted: boolean, data: string } = {
							deleted: isDeleted,
							data: JSON.stringify(value),
						}
						prismaData.push(d);
					}
					inputData.data = {
						create: prismaData,
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

					inputData.metadata = {
						create: {
							...metadata,
							version: JSON.stringify(metadata.version),
						},
					};
				}
			}
			break;
			case 'relations':
			{
				// TODO this should we rewritten to match the CUID pattern. so CUID -> column name -> column key/column value
				const relData = incomingFieldData.relations.columns;
				const relations: Prisma.Enumerable<Prisma.RelationsCreateOrConnectWithoutTableInput> = []
				if(relData)
				{
					const rels = Object.entries<{uid: string, key, column}>(relData);
					for(const [key, value] of rels)
					{
						const relation = {
							where: { uid: '' },
							create: {
								relationName: key,
								columns: JSON.stringify(relData),
							}
						};

						if(value.hasOwnProperty('uid'))
							relation.where = { uid: value.uid };

						relations.push(relation);
					}
				}

				inputData.relations = {
					connectOrCreate: relations,
				}
			}
			break;
			case 'revisions':
			{
				const revisionData = incomingFieldData.revisions;
				const revisions: Prisma.Enumerable<Prisma.RevisionsCreateOrConnectWithoutTableInput> = []
				if(revisionData)
				{
					const rev = Object.entries<Revision>(revisionData);
					for(const [key, value] of rev)
					{
						const rev: Prisma.RevisionsCreateOrConnectWithoutTableInput = {
							where: { uid: '' },
							create: {
								currentRevID: value.currentRevID,
								revision: value.revision,
								created_at: value.created_at,
								updated_at: value.updated_at,
								rowID: value.rowID,
								oldValue: JSON.stringify(value.oldValue),
								newValue: JSON.stringify(value.newValue),
								userId: JSON.stringify(value.uid),
								deleted: value.deleted,
							}
						};

						if(value.hasOwnProperty('id'))
							rev.where = { uid: value.id };

						revisions.push(rev);
					}
				}

				inputData.revisions = {
					connectOrCreate: revisions,
				}
			}
		}
	}

	private static async convertUpdateInput(tblField: any, updateData: Prisma.TablesUpdateInput, incomingFieldData: any)
	{
		switch(tblField.name)
		{
			case 'projectId':
			{
				if (incomingFieldData.hasOwnProperty('projectID'))
				{
					updateData.project = {
						connect: { uid: incomingFieldData.projectID },
					};
				}
			}
				break;
			case 'data':
			{
				if (incomingFieldData.hasOwnProperty('data'))
				{
					const tblData = Object.values<any>(incomingFieldData.data);
					const tableData: Prisma.Enumerable<Prisma.TableDataUpdateWithWhereUniqueWithoutTableInput> = [];

					for(const value of tblData)
					{
						const isDeleted = value.deleted;
						delete value.deleted;
						const d: Prisma.TableDataUpdateWithWhereUniqueWithoutTableInput = {
							where: { uid: undefined },
							data: {
								deleted: isDeleted,
								data: JSON.stringify(value),
							},
						}

						if(value.hasOwnProperty('uid'))
							d.where.uid = value.uid;

						// console.log(d);

						tableData.push(d);
					}

					updateData.data = {
						update: tableData,
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
					updateData.metadata = {
						update: {
							...metadata,
							version: JSON.stringify(metadata.version),
						},
					};
				}
			}
			break;
			case 'relations':
			{
				// TODO this should we rewritten to match the CUID pattern. so CUID -> column name -> column key/column value
				const relData = incomingFieldData.relations.columns;
				const relations: Prisma.Enumerable<Prisma.RelationsCreateOrConnectWithoutTableInput> = []
				if(relData)
				{
					const rels = Object.entries<{uid: string, key, column}>(relData);
					for(const [key, value] of rels)
					{
						const relation = {
							where: {
								uid: '',
							},
							create: {
								relationName: key,
								columns: JSON.stringify(relData),
							}
						};

						if(value.hasOwnProperty('uid'))
							relation.where.uid = value.uid;

						relations.push(relation);
					}
				}

				updateData.relations = {
					connectOrCreate: relations,
				};
			}
			break;
			case 'revisions':
			{
				// TODO We should check this to see if the revision comes in a different form. --> arr or obj
				const revData = incomingFieldData.revisions;
				const revisions: Prisma.Enumerable<Prisma.RevisionsCreateOrConnectWithoutTableInput> = [];
				if((revData !== null || typeof revData !== 'undefined') && Array.isArray(revData))
				{
					revData.forEach((value) =>
					{
						const revision: Prisma.RevisionsCreateOrConnectWithoutTableInput = {
							where: {
								uid: '',
							},
							create: {
								// uid?: string
								currentRevID: value.currentRevID,
								revision: value.revision,
								created_at: value.created_at,
								updated_at: value.updated_at,
								rowID: value.rowID,
								oldValue: JSON.stringify(value.oldValue),
								newValue: JSON.stringify(value.newValue),
								userId: value.uid,
								deleted: value.deleted,
							}
						};

						if(value.hasOwnProperty('id'))
							revision.where.uid = value.id;

						revisions.push(revision);
					});
				}
				else
				{
					for(const value of Object.values<any>(revData))
					{
						const revision: Prisma.RevisionsCreateOrConnectWithoutTableInput = {
							where: {
								uid: '',
							},
							create: {
								// uid?: string
								currentRevID: value.currentRevID,
								revision: value.revision,
								created_at: value.created_at,
								updated_at: value.updated_at,
								rowID: value.rowID,
								oldValue: JSON.stringify(value.oldValue),
								newValue: JSON.stringify(value.newValue),
								userId: value.uid,
								deleted: value.deleted,
							}
						};

						if(value.hasOwnProperty('id'))
							revision.where.uid = value.id;

						revisions.push(revision);
					}
				}

				updateData.revisions = {
					connectOrCreate: revisions,
				};
			}
		}
	}
}