import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipLink } from '../skip-link';

describe('SkipLink', () => {
  it('should render with default text', () => {
    render(<SkipLink />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('should render with custom text', () => {
    render(<SkipLink>Custom skip text</SkipLink>);
    expect(screen.getByText('Custom skip text')).toBeInTheDocument();
  });

  it('should have correct default href', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('should accept custom href', () => {
    render(<SkipLink href="#custom">Skip to custom</SkipLink>);
    const link = screen.getByText('Skip to custom');
    expect(link).toHaveAttribute('href', '#custom');
  });

  it('should be hidden by default', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveClass('sr-only');
  });
});
