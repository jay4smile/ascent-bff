import { hasMany, Entity, model, property } from '@loopback/repository';
import { Controls, ControlMapping } from '.';

/* eslint-disable @typescript-eslint/naming-convention */

@model({ settings: { strict: false } })
export class Services extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  service_id: string;

  @property({
    type: 'string'
  })
  fullname?: string;

  @property({
    type: 'string'
  })
  ibm_catalog_id?: string;

  @property({
    type: 'boolean'
  })
  fs_validated?: boolean;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  @hasMany(() => Controls, {
    through: {
      model: () => ControlMapping,
      keyFrom: 'service_id',
      keyTo: 'control_id',
    }
  })
  controls: Controls[];

  constructor(data?: Partial<Services>) {
    super(data);
  }
}