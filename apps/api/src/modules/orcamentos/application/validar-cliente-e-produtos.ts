import { ClienteInvalidoError, ProdutoInvalidoError } from '../domain/orcamento.errors';
import type { OrcamentosRepositoryPort } from './ports/orcamentos.repository.port';

/**
 * Checagem compartilhada entre criar/atualizar orçamento - ambos validam o
 * mesmo par (cliente existe, todo produtoId referenciado pelos itens
 * existe) antes de gravar.
 */
export async function validarClienteEProdutos(
  repo: OrcamentosRepositoryPort,
  clienteId: string,
  produtoIds: string[],
): Promise<void> {
  const [clienteValido, produtosExistentes] = await Promise.all([
    repo.clienteExiste(clienteId),
    repo.produtosExistentes(produtoIds),
  ]);

  if (!clienteValido) {
    throw new ClienteInvalidoError();
  }

  const produtoIdFaltante = produtoIds.find((id) => !produtosExistentes.has(id));
  if (produtoIdFaltante) {
    throw new ProdutoInvalidoError(produtoIdFaltante);
  }
}
