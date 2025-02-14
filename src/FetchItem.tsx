import React, { useState } from 'react';
import GraphComponent from './components/GraphComponent';

interface GraphData {
  nodes: string[];
  edges: { from: string; to: string; timestamp: string; amount: number }[];
}

const FetchItem: React.FC = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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

  const handleNodeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNode(event.target.value);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  return (
    <div>
      <button onClick={fetchItem}>Fetch Item</button>
      {data && (
        <>
          <select onChange={handleNodeSelect} value={selectedNode || ''}>
            <option value="" disabled>Select a node</option>
            {data.nodes.map(node => (
              <option key={node} value={node}>{node}</option>
            ))}
          </select>
          <GraphComponent data={data} selectedNode={selectedNode} onNodeClick={handleNodeClick} />
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FetchItem;