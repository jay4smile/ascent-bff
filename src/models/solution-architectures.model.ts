import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class SolutionArchitectures extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  solution_id: string;

  @property({
    type: 'string',
    required: true,
  })
  arch_id: string;

  constructor(data?: Partial<SolutionArchitectures>) {
    super(data);
  }
}

export interface SolutionArchitecturesRelations {
  // describe navigational properties here
}

export type SolutionArchitecturesWithRelations = SolutionArchitectures & SolutionArchitecturesRelations;
