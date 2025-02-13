import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphComponent from './GraphComponent';

const mockData = {
  nodes: ['Person_1', 'Person_2'],
  edges: [
    { from: 'Person_1', to: 'Person_2', timestamp: '2025-02-11T14:20:53', amount: 100 },
  ],
};

describe('GraphComponent', () => {
  test('renders GraphComponent with nodes and edges', () => {
    const { container } = render(<GraphComponent data={mockData} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelectorAll('circle').length).toBe(2);
    expect(container.querySelectorAll('line').length).toBe(1);
  });
});