import {Entity, model, property} from '@loopback/repository';

@model()
export class AutomationRelease extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @property({
    type: 'string',
    required: true,
  })
  tagName: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  createdAt: string;

  @property({
    type: 'string',
    required: true,
  })
  publishedAt: string;

  @property({
    type: 'string',
    required: true,
  })
  zipballUrl: string;

  @property({
    type: 'string',
    required: true,
  })
  body: string;

  constructor(data?: Partial<AutomationRelease>) {
    super(data);
  }
}

export interface AutomationReleaseRelations {
  // describe navigational properties here
}

export type AutomationReleaseWithRelations = AutomationRelease & AutomationReleaseRelations;
