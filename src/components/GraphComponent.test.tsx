import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphComponent from './GraphComponent';

const mockData = {
  nodes: ['Node1', 'Node2'],
  edges: [
    { from: 'Node1', to: 'Node2', timestamp: '2025-02-14T00:00:00Z', amount: 100 }
  ]
};

describe('GraphComponent', () => {
  test('renders graph nodes and edges', () => {
    render(<GraphComponent data={mockData} selectedNode={null} onNodeClick={jest.fn()} />);

    expect(screen.getByLabelText('Node Node1')).toBeInTheDocument();
    expect(screen.getByLabelText('Node Node2')).toBeInTheDocument();
  });

  test('calls onNodeClick when a node is clicked', () => {
    const handleNodeClick = jest.fn();
    render(<GraphComponent data={mockData} selectedNode={null} onNodeClick={handleNodeClick} />);

    const node = screen.getByLabelText('Node Node1');
    fireEvent.click(node);

    expect(handleNodeClick).toHaveBeenCalledWith('Node1');
  });

  test('highlights selected node', async () => {
    render(<GraphComponent data={mockData} selectedNode="Node1" onNodeClick={jest.fn()} />);

    const node = screen.getByLabelText('Node Node1');
    await waitFor(() => {
        expect(node).toHaveAttribute('fill', 'blue');
    });
    
  });
});