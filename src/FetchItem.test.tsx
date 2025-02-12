import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FetchItem from './FetchItem';

/**
 * @jest-environment jsdom
 */

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ value: 'Fetched Item' }),
  })
) as jest.Mock;

describe('FetchItem', () => {

  test('renders FetchItem component', () => {
    render(<FetchItem />);
    expect(screen.getByText('Fetch Item')).toBeInTheDocument();
  });

  test('fetches and displays item on button click', async () => {
    render(<FetchItem />);
    fireEvent.click(screen.getByText('Fetch Item'));
    const fetchedItem = await screen.findByText('Fetched Item');
    expect(fetchedItem).toBeInTheDocument();
  });

  test('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject('API is down')
    );

    render(<FetchItem />);
    fireEvent.click(screen.getByText('Fetch Item'));

    // You can add more assertions here to check for error handling
    // For example, you might want to check if an error message is displayed
  });
});