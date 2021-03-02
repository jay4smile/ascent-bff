import {Entity, property, model} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model({settings: {strict: false}})
export class ControlMapping extends Entity {
  // id property and others

  @property({
    type: 'string',
    id: true,
    generated: true
  })
  id?: string;

  @property({
    type: 'string',
  })
  control_id?: string;

  @property({
    type: 'string',
  })
  service_id?: string;

  @property({
    type: 'string',
  })
  arch_id?: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'string',
  })
  comment?: string;

  @property({
    type: 'string',
  })
  evidence_id?: string;

  constructor(data: Partial<ControlMapping>) {
    super(data);
  }
}
