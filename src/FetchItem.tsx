import React, { useState } from 'react';
import GraphComponent from './components/GraphComponent';

interface GraphData {
  nodes: string[];
  edges: { from: string; to: string; timestamp: string; amount: number }[];
}

const FetchItem: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async () => {
    try {
      const response = await fetch('/api/transactions/graph');
      const data = await response.json();
      console.log(data); // Log the returned data to the console
      setData(data); // Set the fetched data
      setError(null); // Clear any previous error
    } catch (error) {
      console.error('Error fetching item:', error);
      setError('Error fetching item');
    }
  };

  return (
    <div>
      <button onClick={fetchItem}>Fetch Item</button>
      {data && <GraphComponent data={data} />}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FetchItem;