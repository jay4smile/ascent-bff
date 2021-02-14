
import {Entity, model, property, hasMany} from '@loopback/repository';
import {Bom} from './bom.model';

@model()
export class Architectures extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  short_desc: string;

  @property({
    type: 'string',
  })
  long_desc?: string;

  @property({
    type: 'string',
    required: true,
  })
  diagram_link_drawio: string;

  @property({
    type: 'string',
    required: true,
  })
  diagram_link_png: string;

  @property({
    type: 'boolean',
    required: true,
  })
  fs_compliant: boolean;

  @property({
    type: 'string',
  })
  partner_name?: string;

  @property({
    type: 'boolean',
    required: true,
  })
  confidential: boolean;

  @property({
    type: 'boolean',
  })
  production_ready?: boolean;

  @hasMany(() => Bom, {keyTo: 'arch_id'})
  boms: Bom[];
  /*
  @hasMany(() => Bom, {keyTo: 'arch_id'})
  boms: Bom[];
  */

  constructor(data?: Partial<Architectures>) {
    super(data);
  }
}

export interface ArchitecturesRelations {
  // describe navigational properties here
}

export type ArchitecturesWithRelations = Architectures & ArchitecturesRelations;
