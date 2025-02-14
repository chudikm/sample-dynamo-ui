import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FetchItem from './FetchItem';

/**
 * @jest-environment jsdom
 */

describe('FetchItem', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          nodes: ['Node1', 'Node2'],
          edges: [
            { from: 'Node1', to: 'Node2', timestamp: '2025-02-14T00:00:00Z', amount: 100 }
          ]
        })
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders FetchItem component', () => {
    render(<FetchItem />);
    expect(screen.getByText('Fetch Item')).toBeInTheDocument();
  });

  test('fetches and displays data', async () => {
    render(<FetchItem />);

    fireEvent.click(screen.getByText('Fetch Item'));

    await waitFor(() => {
        expect(screen.getByLabelText('Node Node1')).toBeInTheDocument();
        expect(screen.getByLabelText('Node Node2')).toBeInTheDocument();
    });
  });

  test('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject('API is down')
    );

    render(<FetchItem />);
    fireEvent.click(screen.getByText('Fetch Item'));

    await waitFor(() => {
      expect(screen.getByText('Error fetching item')).toBeInTheDocument();
    });
  });

  test('updates selected node on dropdown change', async () => {
    render(<FetchItem />);

    fireEvent.click(screen.getByText('Fetch Item'));

    await waitFor(() => {
      expect(screen.getAllByText('Node1'));
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Node1' } });

    expect(screen.getByRole('combobox')).toHaveValue('Node1');
  });
});