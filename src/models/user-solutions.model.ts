import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class UserSolutions extends Entity {
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
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  solution_id: string;


  constructor(data?: Partial<UserSolutions>) {
    super(data);
  }
}

export interface UserSolutionsRelations {
  // describe navigational properties here
}

export type UserSolutionsWithRelations = UserSolutions & UserSolutionsRelations;
