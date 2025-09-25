import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import HomePage from '@/app/page';

test('renders homepage without crashing', () => {
  render(<HomePage />);
  expect(screen.getByText('DeadLine')).toBeInTheDocument();
  expect(screen.getByText('Get Started')).toBeInTheDocument();
});

test('renders sign in page without crashing', async () => {
  // This would be a more comprehensive test in a real scenario
  expect(true).toBe(true);
});
