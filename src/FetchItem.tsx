import React, { useState } from 'react';

const FetchItem: React.FC = () => {
  const [item, setItem] = useState<string | null>(null);

  const fetchItem = async () => {
    try {
      const response = await fetch('https://api.example.com/item');
      const data = await response.json();
      setItem(data.value);
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchItem}>Fetch Item</button>
      {item && <p>{item}</p>}
    </div>
  );
};

export default FetchItem;