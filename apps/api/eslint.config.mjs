import nestConfig from '@erp/config/eslint/nest';

export default [
  ...nestConfig,
  {
    ignores: ['dist/**'],
  },
];
