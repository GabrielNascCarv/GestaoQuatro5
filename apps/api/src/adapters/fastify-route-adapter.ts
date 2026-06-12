import { FastifyRequest, FastifyReply } from 'fastify';

export interface HttpRequest {
  body?: any;
  params?: any;
  query?: any;
  user?: any;
}

export interface HttpResponse {
  statusCode: number;
  body: any;
}

export interface Controller {
  handle(httpRequest: HttpRequest): Promise<HttpResponse>;
}

export const adaptRoute = (controller: Controller) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const httpRequest: HttpRequest = {
      body: request.body,
      params: request.params,
      query: request.query,
      user: (request as any).user,
    };

    const httpResponse = await controller.handle(httpRequest);

    if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
      reply.status(httpResponse.statusCode).send(httpResponse.body);
    } else {
      reply.status(httpResponse.statusCode).send({
        error: httpResponse.body.message,
        ...httpResponse.body,
      });
    }
  };
};
