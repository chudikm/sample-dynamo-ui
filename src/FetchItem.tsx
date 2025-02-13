import React, { useState } from 'react';

const FetchItem: React.FC = () => {
  const [item, setItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async () => {
    try {
      const response = await fetch('/api/items/123');
      const data = await response.json();
      setItem(data.value);
      setError(null); // Clear any previous error
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Error fetching item');
    }
  };

  return (
    <div>
      <button onClick={fetchItem}>Fetch Item</button>
      {item && <p>{item}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FetchItem;