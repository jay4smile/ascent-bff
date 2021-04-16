import {repository, Filter} from '@loopback/repository';
import {get, param} from '@loopback/rest';
import {ControlsRepository} from '../repositories';
import {Controls, Nist} from '../models';

export class ControlsNistController {
    constructor(
      @repository(ControlsRepository) protected controlsRepository: ControlsRepository,
    ) { }

  @get('/controls/{id}/nist')
  async findNistFromControlId(
    @param.path.string('id') id: typeof Controls.prototype.id,
    @param.query.object('filter') filter?: Filter<Nist>,
  ): Promise<Nist> {
    return this.controlsRepository.nist(id).get(filter);
  }
}
