import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    repository,
    Where,
  } from '@loopback/repository';
  import {
    param,
    get,
    getModelSchemaRef,
    response,
  } from '@loopback/rest';
  import {Goal} from '../models';
  import {GoalRepository} from '../repositories';
  
  export class GoalController {
    constructor(
      @repository(GoalRepository)
      public goalRepository : GoalRepository,
    ) {}
  
    @get('/goals/count')
    @response(200, {
      description: 'Goal model count',
      content: {'application/json': {schema: CountSchema}},
    })
    async count(
      @param.where(Goal) where?: Where<Goal>,
    ): Promise<Count> {
      return this.goalRepository.count(where);
    }
  
    @get('/goals')
    @response(200, {
      description: 'Array of Goal model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Goal, {includeRelations: true}),
          },
        },
      },
    })
    async find(
      @param.filter(Goal) filter?: Filter<Goal>,
    ): Promise<Goal[]> {
      return this.goalRepository.find(filter);
    }
  
    @get('/goals/{id}')
    @response(200, {
      description: 'Goal model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Goal, {includeRelations: true}),
        },
      },
    })
    async findById(
      @param.path.string('id') id: string,
      @param.filter(Goal, {exclude: 'where'}) filter?: FilterExcludingWhere<Goal>
    ): Promise<Goal> {
      return this.goalRepository.findById(id, filter);
    }
  }
  