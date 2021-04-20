import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class Goal extends Entity {

  @property({
    type: 'string',
    required: true,
    id: true,
    generated: false
  })
  goal_id: string;

  @property({
    type: 'string',
    required: true
  })
  description: string;

  @property({
    type: 'string'
  })
  parameters: string;

  @property({
    type: 'string'
  })
  parameters_default: string;

  @property({
    type: 'string'
  })
  comments: string;

  // Define well-known properties here

  constructor(data?: Partial<Goal>) {
    super(data);
  }
}
