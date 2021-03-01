import {Entity, property} from '@loopback/repository';

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
  control?: string;

  @property({
    type: 'string',
  })
  resource?: string;

  @property({
    type: 'string',
  })
  desc?: string;

  @property({
    type: 'string',
  })
  configuration?: string;

  @property({
    type: 'string',
    attribute: "SCC Goal"
  })
  sccGoal?: string;

  @property({
    type: 'string'
  })
  comment?: string;

  constructor(data: Partial<ControlMapping>) {
    super(data);
  }
}
