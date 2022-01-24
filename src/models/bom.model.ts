import { hasOne, Entity, model, property } from '@loopback/repository';
import { Services } from '.';


/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class Bom extends Entity {
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
  arch_id: string;

  @property({
    type: 'string',
    required: true,
  })
  service_id: string;

  @property({
    type: 'string'
  })
  desc: string;

  @property({
    type: 'string'
  })
  yaml: string;

  @hasOne(() => Services, {keyTo: 'service_id', keyFrom: 'service_id'})
  service: Services;

  constructor(data?: Partial<Bom>) {
    super(data);
  }
}
