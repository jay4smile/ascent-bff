import {Entity, model, property, hasMany} from '@loopback/repository';
import {Architectures, UserArchitectures} from '../models/';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  email: string;

  @hasMany(() => Architectures, {
    through: {
      model: () => UserArchitectures,
      keyFrom: 'email',
      keyTo: 'arch_id'
    }
  })
  architectures: Architectures[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
