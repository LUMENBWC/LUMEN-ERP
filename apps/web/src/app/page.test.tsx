import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('renderiza o título do ERP', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /erp saas/i })).toBeInTheDocument();
  });
});
