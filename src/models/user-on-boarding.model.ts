import {Entity, model, property} from '@loopback/repository';

/* eslint-disable @typescript-eslint/naming-convention */

@model()
export class UserOnBoarding extends Entity {
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
  control_id: string;

  @property({
    type: 'string',
    required: true,
  })
  user_id: string;

  @property({
    type: 'string',
    required: true,
  })
  status: string;


  constructor(data?: Partial<UserOnBoarding>) {
    super(data);
  }
}

export interface UserOnBoardingRelations {
  // describe navigational properties here
}

export type UserOnBoardingWithRelations = UserOnBoarding & UserOnBoardingRelations;
