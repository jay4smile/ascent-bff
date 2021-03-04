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
  compliant?: string;

  @property({
    type: 'string',
  })
  configuration?: string;

  @property({
    type: 'string',
  })
  evidence?: string;

  @property({
    type: 'string',
  })
  scc_goal?: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'string',
  })
  comment?: string;

  constructor(data: Partial<ControlMapping>) {
    super(data);
  }
}
