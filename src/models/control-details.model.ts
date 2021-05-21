import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class ControlDetails extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
    generated: false
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
  })
  fs_guidance?: string;

  @property({
    type: 'string',
  })
  parameters?: string;

  @property({
    type: 'string',
  })
  implementation?: string;


  constructor(data?: Partial<ControlDetails>) {
    super(data);
  }
}

export interface ControlDetailsRelations {
  // describe navigational properties here
}

export type ControlDetailsWithRelations = ControlDetails & ControlDetailsRelations;
