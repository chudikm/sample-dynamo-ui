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

    const errorMessage = await screen.findByText('Error fetching item');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveStyle('color: red');
  });
});