
import {Entity, model, property, hasMany} from '@loopback/repository';
import {Bom, User, UserArchitectures} from '.';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class Architectures extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  arch_id?: string;

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
    required: true,
  })
  long_desc?: string;

  @property({
    type: 'string',
    required: true,
  })
  diagram_folder: string;

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

  @property({
    type: 'string',
  })
  automation_variables: string;

  @hasMany(() => Bom, {keyTo: 'arch_id'})
  boms: Bom[];

  @hasMany(() => User, {
    through: {
      model: () => UserArchitectures,
      keyFrom: 'arch_id',
      keyTo: 'email'
    }
  })
  owners: User[];

  constructor(data?: Partial<Architectures>) {
    super(data);
  }
}

export interface ArchitecturesRelations {
  // describe navigational properties here
}

export type ArchitecturesWithRelations = Architectures & ArchitecturesRelations;
