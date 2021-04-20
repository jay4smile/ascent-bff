import {Entity, property, model, hasOne} from '@loopback/repository';
import {Profile, Services} from '../models';

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
  control_subsections?: string;

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
  scc_profile?: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'string',
  })
  comment?: string;

  @hasOne(() => Services, {keyTo: 'service_id', keyFrom: 'service_id'})
  service: Services;

  @hasOne(() => Profile, {keyTo: 'id', keyFrom: 'scc_profile'})
  profile: Profile;

  constructor(data: Partial<ControlMapping>) {
    super(data);
  }
}
