/**
 * This function is an health check, it simply responds
 * OK when requested
 * @param { Object } request the Hapi request object
 * @param { Function } reply the Hapi reply object
 * @return { Promise } a promise that resolves
 */
export const healthCheck = (request, reply) =>
  reply('ok');
