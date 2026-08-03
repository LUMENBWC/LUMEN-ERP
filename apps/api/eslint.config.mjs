import nestConfig from '@erp/config/eslint/nest';

export default [
  ...nestConfig,
  {
    ignores: ['dist/**', 'generated/**'],
  },
  {
    files: ['prisma/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
