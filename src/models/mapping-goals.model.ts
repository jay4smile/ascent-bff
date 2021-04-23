import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class MappingGoals extends Entity {

  @property({
    type: 'string',
    id: true,
    generated: true
  })
  id?: string;
  
  @property({
    type: 'string',
    required: true,
  })
  goal_id: string;

  @property({
    type: 'string',
    required: true,
  })
  mapping_id: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<MappingGoals>) {
    super(data);
  }
}

export interface MappingGoalsRelations {
  // describe navigational properties here
}

export type MappingGoalsWithRelations = MappingGoals & MappingGoalsRelations;
