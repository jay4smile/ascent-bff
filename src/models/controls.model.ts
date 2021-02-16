import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Controls extends Entity {

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  control_family: string;

  @property({
    type: 'string',
    required: true,
  })
  cf_description: string;

  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  control_id: string;

  @property({
    type: 'boolean',
    required: true,
  })
  base_control: boolean;

  @property({
    type: 'string',
    required: true,
  })
  control_name: string;

  @property({
    type: 'string',
    required: true,
  })
  control_description: string;

  @property({
    type: 'string',
  })
  guidance?: string;

  @property({
    type: 'string',
  })
  parameters?: string;

  @property({
    type: 'string',
  })
  candidate?: string;

  @property({
    type: 'string',
  })
  comment?: string;

  @property({
    type: 'string',
  })
  inherited?: string;

  @property({
    type: 'string',
  })
  platform_responsibility?: string;

  @property({
    type: 'string',
  })
  app_responsibility?: string;

  // Define well-known properties here

  constructor(data?: Partial<Controls>) {
    super(data);
  }
}

export interface ControlsRelations {
  // describe navigational properties here
}

export type ControlsWithRelations = Controls & ControlsRelations;
