import {hasOne, hasMany, Entity, model, property} from '@loopback/repository';
import {Nist, Services, ControlMapping} from '.';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class Controls extends Entity {

  @property({
    type: 'string',
    required: true,
    id: true,
    generated: false
  })
  control_id: string;

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

  @hasOne(() => Nist, {keyTo: 'number'})
  nist: Nist;

  @hasMany(() => Services, {
    through: {
      model: () => ControlMapping,
      keyFrom: 'control',
      keyTo: 'resource',
    }
  })
  services: Services[];

  constructor(data?: Partial<Controls>) {
    super(data);
  }
}
