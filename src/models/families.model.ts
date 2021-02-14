import {Entity, model, property} from '@loopback/repository';

@model()
export class Families extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  family: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;


  constructor(data?: Partial<Families>) {
    super(data);
  }
}

export interface FamiliesRelations {
  // describe navigational properties here
}

export type FamiliesWithRelations = Families & FamiliesRelations;
