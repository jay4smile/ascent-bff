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
  arch_id?: string;

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
  ibm_service: string;

  @property({
    type: 'string'
  })
  deployment_method: string;

  @property({
    type: 'string'
  })
  compatibility?: string;

  @property({
    type: 'string',
  })
  catalog_link?: string;

  @property({
    type: 'string',
  })
  documentation?: string;

  @property({
    type: 'string',
  })
  hippa_compliance?: string;

  @property({
    type: 'string',
  })
  availability?: string;

  @property({
    type: 'string',
  })
  remarks?: string;

  @property({
    type: 'string',
  })
  provision?: string;

  @property({
    type: 'string',
  })
  automation?: string;

  @property({
    type: 'string',
  })
  hybrid_option?: string;

  @hasOne(() => Services, {keyTo: 'service_id', keyFrom: 'service_id'})
  service: Services;

  constructor(data?: Partial<Bom>) {
    super(data);
  }
}
