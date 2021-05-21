import {
  asGlobalInterceptor,
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import { RestBindings } from '@loopback/rest';

import { repository } from '@loopback/repository';
import {
  ArchitecturesRepository,
  UserRepository,
  BomRepository
} from '../repositories';

// List of protected resources
const unauthorizedTargets = [
  'BomController.prototype.updateAll',
  'ArchitecturesController.prototype.updateAll',
]
const protectedArchPathTargets = [
  'ArchitecturesController.prototype.findDiagramById',
  'ArchitecturesController.prototype.postDiagram',
  'ArchitecturesController.prototype.findById',
  'ArchitecturesController.prototype.updateById',
  'ArchitecturesController.prototype.deleteById',
  'ArchitecturesBomController.prototype.find',
  'ArchitecturesBomController.prototype.downloadComplianceReport',
  'ArchitecturesBomController.prototype.create',
  'ArchitecturesBomController.prototype.uploadBomYaml',
  'ArchitecturesBomController.prototype.patch',
  'ArchitecturesBomController.prototype.delete',
  'BomController.prototype.compositeCatalogByArchId',
]
const protectedArchBodyTargets = [
  'BomController.prototype.create',
  'BomController.prototype.updateAll',
]
const protectedBomPathTargets = [
  'BomController.prototype.findById',
  'BomController.prototype.findCompositeById',
  'BomController.prototype.updateById',
  'BomController.prototype.deleteById',
  'BomController.prototype.compositeCatalogById'
]

/**
 * Interceptor checking that user has ownership over resources he's trying to
 * access.
 */
@injectable(asGlobalInterceptor('architecture-ownership'))
export class ArchitectureOwnershipInterceptor implements Provider<Interceptor> {
  constructor(
    @repository(ArchitecturesRepository)
    public architecturesRepository: ArchitecturesRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(BomRepository)
    public bomRepository: BomRepository,
  ) { }

  value() {
    return async (
      ctx: InvocationContext,
      next: () => ValueOrPromise<InvocationResult>,
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request:any = await ctx.get(RestBindings.Http.REQUEST);
      const response = await ctx.get(RestBindings.Http.RESPONSE);

      const email:string = request?.user?.email;

      if (email) {
        if (unauthorizedTargets.includes(ctx.targetName)) {
          return response.status(401).send({error: {
            message: `User ${email} cannot perform this request.`
          }});
        }
        try {
          await this.userRepository.findById(email);
        } catch (error) {
          await this.userRepository.create({ email: email });
        }
        
        let archid = "";
        if (protectedArchPathTargets.includes(ctx.targetName)) {
          archid = ctx.args[0];
        } else if (protectedArchBodyTargets.includes(ctx.targetName)) {
          archid = request.body.arch_id;
        } else if (protectedBomPathTargets.includes(ctx.targetName)) {
          const bom = await this.bomRepository.findById(ctx.args[0]);
          archid = bom.arch_id;
        }
        if (archid) {
          try {
            const arch = await this.architecturesRepository.findById(archid, {include: ['owners']});
            if (!((request.method === "GET" && arch.public) || arch?.owners?.find(owner => owner.email === email))) {
              return response.status(401).send({error: {
                message: `User ${email} must be owner of architecture ${archid} to perform this request.`
              }});
            }
          } catch (error) {
            console.log(error);
          }
        }
      }

      const result = await next();
      return result;
    };
  }
}
