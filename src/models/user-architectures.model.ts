import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class UserArchitectures extends Entity {
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
  arch_id: string;

  constructor(data?: Partial<UserArchitectures>) {
    super(data);
  }
}

export interface UserArchitecturesRelations {
  // describe navigational properties here
}

export type UserArchitecturesWithRelations = UserArchitectures & UserArchitecturesRelations;
