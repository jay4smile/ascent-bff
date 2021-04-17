import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class Profile extends Entity {

  @property({
    type: 'string',
    required: true,
    id: true,
    generated: false
  })
  id: string;

  @property({
    type: 'string'
  })
  mnemonic: string;

  @property({
    type: 'string'
  })
  description: string;

  // Define well-known properties here

  constructor(data?: Partial<Profile>) {
    super(data);
  }
}
