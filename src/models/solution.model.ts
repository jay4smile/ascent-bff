import {Entity, model, property, hasMany} from '@loopback/repository';
import {Architectures, SolutionArchitectures} from '../models/';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class Solution extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  short_desc?: string;

  @property({
    type: 'string',
  })
  long_desc?: string;

  @property({
    type: 'string',
  })
  readme?: string;

  @hasMany(() => Architectures, {
    through: {
      model: () => SolutionArchitectures,
      keyFrom: 'solution_id',
      keyTo: 'arch_id'
    }
  })
  architectures: Architectures[];

  constructor(data?: Partial<Solution>) {
    super(data);
  }
}

export interface SolutionRelations {
  // describe navigational properties here
}

export type SolutionWithRelations = Solution & SolutionRelations;
