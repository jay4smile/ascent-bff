import {Entity, model, property, hasMany} from '@loopback/repository';
import {Architectures, UserArchitectures, Solution, UserSolutions} from '../models/';

export interface UserConfig {
  complianceFeatures?: boolean,
  builderFeatures?: boolean,
  ibmContent?: boolean,
  azureContent?: boolean,
  awsContent?: boolean,
}

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  email: string;

  @property({
    type: 'object'
  })
  config?: UserConfig;

  @hasMany(() => Architectures, {
    through: {
      model: () => UserArchitectures,
      keyFrom: 'email',
      keyTo: 'arch_id'
    }
  })
  architectures: Architectures[];

  @hasMany(() => Solution, {
    through: {
      model: () => UserSolutions,
      keyFrom: 'email',
      keyTo: 'solution_id'
    }
  })
  solutions: Solution[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
