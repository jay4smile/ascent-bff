import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class Nist extends Entity {

  @property({
    type: 'string',
    required: true,
    id: true,
    generated: false
  })
  number: string;

  @property({
    type: 'string',
    required: true
  })
  family: string;

  @property({
    type: 'string',
    required: true
  })
  title: string;

  @property({
    type: 'string',
    required: true
  })
  priority: string;

  @property({
    type: 'object'
  })
  baseline_impact?: object;

  @property({
    type: 'object',
    required: true
  })
  statement: object;

  @property({
    type: 'object'
  })
  supplemental_guidance?: object;

  @property({
    type: 'object'
  })
  references?: object;

  @property({
    type: 'object'
  })
  withdrawn?: object;

  @property({
    type: 'string',
    required: true
  })
  base_control?: string;

  @property({
    type: 'string'
  })
  parent_control?: string;

  // Define well-known properties here

  constructor(data?: Partial<Nist>) {
    super(data);
  }
}

export interface NistRelations {
  // describe navigational properties here
}

export type NistWithRelations = Nist & NistRelations;
