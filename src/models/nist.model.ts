import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Nist extends Entity {

  @property({
    type: 'string',
    id: true,
    generated: true
  })
  _id?: string;

  @property({
    type: 'string',
    required: true
  })
  family: string;

  @property({
    type: 'string',
    required: true
  })
  number: string;

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
  "baseline-impact"?: object;

  @property({
    type: 'object',
    required: true
  })
  statement: object;

  @property({
    type: 'object'
  })
  "supplemental-guidance"?: object;

  @property({
    type: 'object'
  })
  references?: object;

  // Define well-known properties here

  constructor(data?: Partial<Nist>) {
    super(data);
  }
}

export interface NistRelations {
  // describe navigational properties here
}

export type NistWithRelations = Nist & NistRelations;
