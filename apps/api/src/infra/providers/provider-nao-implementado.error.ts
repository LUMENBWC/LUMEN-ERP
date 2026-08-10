export class ProviderNaoImplementadoError extends Error {
  constructor(provider: string, operacao: string) {
    super(`${provider}: ${operacao} não implementado neste MVP`);
    this.name = 'ProviderNaoImplementadoError';
  }
}
