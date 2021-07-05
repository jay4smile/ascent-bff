import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class OnBoardingStage extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  label: string;

  @property({
    type: 'string',
    required: true,
  })
  secondary_label: string;

  @property({
    type: 'string',
  })
  description: string;

  @property({
    type: 'number',
    required: true,
  })
  position: number;

  @property({
    type: 'string',
    required: true,
  })
  content: string;


  constructor(data?: Partial<OnBoardingStage>) {
    super(data);
  }
}

export interface OnBoardingStageRelations {
  // describe navigational properties here
}

export type OnBoardingStageWithRelations = OnBoardingStage & OnBoardingStageRelations;
