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
    SolutionRepository,
    UserRepository
  } from '../repositories';
  
  // List of protected resources
  const protectedPathTargets = [
    'SolutionController.prototype.uploadFiles',
    'SolutionController.prototype.findById',
    'SolutionController.prototype.downloadAutomationZip',
    'SolutionController.prototype.updateById',
    'SolutionController.prototype.deleteById',
  ]
  const protectedBodyTargets = [
    'SolutionController.prototype.create',
  ]
  
  /**
   * Interceptor checking that user has ownership over resources he's trying to
   * access.
   */
  @injectable(asGlobalInterceptor('architecture-ownership'))
  export class SolutionOwnershipInterceptor implements Provider<Interceptor> {
    constructor(
      @repository(SolutionRepository)
      public solutionRepository: SolutionRepository,
      @repository(UserRepository)
      public userRepository: UserRepository,
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
          try {
            await this.userRepository.findById(email);
          } catch (error) {
            await this.userRepository.create({ email: email });
          }
          
          let id = "";
          if (protectedPathTargets.includes(ctx.targetName)) {
            id = ctx.args[0];
          } else if (protectedBodyTargets.includes(ctx.targetName)) {
            id = request.body.id;
          }
          if (id) {
            try {
              const solution = await this.solutionRepository.findById(id, {include: ['owners']});
              if (!(request?.scopes?.includes("super_edit") || ((request.method === "GET" || ctx.targetName === "SolutionsController.prototype.duplicate") && solution.public) || solution?.owners?.find(owner => owner.email === email))) {
                return response.status(401).send({error: {
                  message: `User ${email} must be owner of solution ${id} to perform this request.`
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
  