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
    UserOnBoardingRepository,
    UserRepository,
  } from '../repositories';
  
  // List of protected resources
  const protectedTargets = [
    'UserOnBoardingController.prototype.updateById',
    'UserOnBoardingController.prototype.deleteById',
  ]
  
  /**
   * Interceptor checking that user has ownership over resources he's trying to
   * access.
   */
  @injectable(asGlobalInterceptor('architecture-ownership'))
  export class UserOnBoardingInterceptor implements Provider<Interceptor> {
    constructor(
      @repository(UserRepository)
      public userRepository: UserRepository,
      @repository(UserOnBoardingRepository)
      public userOnBoardingRepository: UserOnBoardingRepository,
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
  
        if (!['dev', 'test'].includes(process.env.NODE_ENV || '')) {    
            let wantedEmail = "";
            if (protectedTargets.includes(ctx.targetName)) {
                wantedEmail = (await this.userOnBoardingRepository.findById(ctx.args[0])).user_id;
            } else if (ctx.targetName === 'UserOnBoardingController.prototype.find') {
                wantedEmail = ctx.args[0];
            } else if (ctx.targetName === 'UserOnBoardingController.prototype.create') {
                wantedEmail = request?.body?.user_id;
            }
            if (wantedEmail && wantedEmail !== email) return response.status(401).send({error: {
                message: `User ${email} cannot perform this request.`
            }});
        }

        const result = await next();
        return result;
      };
    }
  }
  