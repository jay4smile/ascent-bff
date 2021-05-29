import {
  /* inject, */
  globalInterceptor,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import { RestBindings } from '@loopback/rest';

const protectedControlTargets = [
  'ControlsController.prototype.find',
  'ControlsController.prototype.findById',
]

 /* eslint-disable no-useless-catch */

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('control-details', {tags: {name: 'ControlDetails'}})
export class ControlDetailsInterceptor implements Provider<Interceptor> {
  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const request:any = await invocationCtx.get(RestBindings.Http.REQUEST);
      const response = await invocationCtx.get(RestBindings.Http.RESPONSE);
      const email:string = request?.user?.email;
      
      if (email && protectedControlTargets.includes(invocationCtx.targetName)) {
        if (request?.query?.filter
           && !request?.appIdAuthorizationContext?.accessTokenPayload?.scope?.split(" ")?.includes("view_controls")
           && JSON.parse(request.query.filter)?.include?.includes("controlDetails")) {
            return response.status(401).send({error: {
              message: `User ${email} cannot perform this request.`
            }});
        }
      }

      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
