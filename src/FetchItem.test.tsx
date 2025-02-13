import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FetchItem from './FetchItem';

/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      nodes: ['Person_1', 'Person_2'],
      edges: [
        { from: 'Person_1', to: 'Person_2', timestamp: '2025-02-11T14:20:53', amount: 100 },
      ],
    }),
  })
) as jest.Mock;

describe('FetchItem', () => {

  test('renders FetchItem component', () => {
    render(<FetchItem />);
    expect(screen.getByText('Fetch Item')).toBeInTheDocument();
  });

  test('fetches and displays graph data on button click', async () => {
    render(<FetchItem />);
    fireEvent.click(screen.getByText('Fetch Item'));

    await waitFor(() => {
      expect(screen.getAllByText('Person_1'));
      expect(screen.getAllByText('Person_2'));
      expect(screen.getByText('100')).toBeInTheDocument();
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
});