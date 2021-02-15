import {Entity, model, property, hasOne, belongsTo} from '@loopback/repository';
import {Services} from './services.model';
import {Architectures} from './architectures.model';

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
  ibm_service: string;

  @property({
    type: 'string',
    required: true,
  })
  desc: string;

  @property({
    type: 'string',
    required: true,
  })
  deployment_method: string;

  @property({
    type: 'string',
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

  @property({
    type: 'string',
  })
  arch_id?: string;

  constructor(data?: Partial<Bom>) {
    super(data);
  }
}

export interface BomRelations {
  // describe navigational properties here
}

export type BomWithRelations = Bom & BomRelations;
