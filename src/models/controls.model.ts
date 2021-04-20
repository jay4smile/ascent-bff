import {hasOne, hasMany, Entity, model, property} from '@loopback/repository';
import {Nist, Services, ControlMapping, Architectures} from '.';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class Controls extends Entity {

  @property({
    type: 'string',
    required: true,
    id: true,
    generated: false
  })
  id: string;

  @property({
    type: 'string',
    required: true
  })
  name: string;

  @property({
    type: 'string',
    required: true
  })
  description: string;

  @property({
    type: 'string',
    required: true
  })
  implementation: string;

  @property({
    type: 'string'
  })
  parameters: string;

  @property({
    type: 'boolean'
  })
  base_control: boolean;

  @property({
    type: 'string'
  })
  parent_control: string;

  @hasOne(() => Nist, {keyTo: 'number'})
  nist: Nist;

  @hasMany(() => Services, {
    through: {
      model: () => ControlMapping,
      keyFrom: 'control_id',
      keyTo: 'service_id',
    }
  })
  services: Services[];

  @hasMany(() => Architectures, {
    through: {
      model: () => ControlMapping,
      keyFrom: 'control_id',
      keyTo: 'arch_id',
    }
  })
  architectures: Architectures[];

  constructor(data?: Partial<Controls>) {
    super(data);
  }
}
