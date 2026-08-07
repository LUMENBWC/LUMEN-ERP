export interface CaixaSessaoResumo {
  id: string;
  usuarioAberturaId: string;
  usuarioAberturaNome: string;
  valorAbertura: string;
  status: 'ABERTO' | 'FECHADO';
  abertoEm: string;
}
