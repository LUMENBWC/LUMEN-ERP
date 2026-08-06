import { validarDocumento } from './validar-documento';

describe('validarDocumento', () => {
  describe('CPF', () => {
    it('aceita um CPF válido, com ou sem máscara', () => {
      expect(validarDocumento('FISICA', '111.444.777-35')).toBe(true);
      expect(validarDocumento('FISICA', '11144477735')).toBe(true);
    });

    it('rejeita um CPF com dígito verificador incorreto', () => {
      expect(validarDocumento('FISICA', '111.444.777-36')).toBe(false);
    });

    it('rejeita sequências com todos os dígitos iguais', () => {
      expect(validarDocumento('FISICA', '111.111.111-11')).toBe(false);
      expect(validarDocumento('FISICA', '000.000.000-00')).toBe(false);
    });

    it('rejeita tamanho incorreto', () => {
      expect(validarDocumento('FISICA', '123')).toBe(false);
    });
  });

  describe('CNPJ', () => {
    it('aceita um CNPJ válido, com ou sem máscara', () => {
      expect(validarDocumento('JURIDICA', '11.222.333/0001-81')).toBe(true);
      expect(validarDocumento('JURIDICA', '11222333000181')).toBe(true);
    });

    it('rejeita um CNPJ com dígito verificador incorreto', () => {
      expect(validarDocumento('JURIDICA', '11.222.333/0001-82')).toBe(false);
    });

    it('rejeita sequências com todos os dígitos iguais', () => {
      expect(validarDocumento('JURIDICA', '11.111.111/1111-11')).toBe(false);
    });

    it('rejeita tamanho incorreto', () => {
      expect(validarDocumento('JURIDICA', '123')).toBe(false);
    });
  });
});
