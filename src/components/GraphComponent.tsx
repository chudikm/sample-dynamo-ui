import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GraphData {
  nodes: string[];
  edges: { from: string; to: string; timestamp: string; amount: number }[];
}

interface GraphComponentProps {
  data: GraphData;
  selectedNode: string | null;
  onNodeClick: (nodeId: string) => void;
}

const GraphComponent: React.FC<GraphComponentProps> = ({ data, selectedNode, onNodeClick }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const highlightedNodeRef = useRef<any>(null);

  useEffect(() => {
    if (!data) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height);

    const nodes = data.nodes.map(node => ({ id: node, x: 0, y: 0 }));
    const links = data.edges.map(edge => ({ source: edge.from, target: edge.to, amount: edge.amount }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', d => Math.sqrt(d.amount / 50)) // Set stroke-width based on amount
      .attr('stroke', '#999');

    const linkText = svg.append('g')
      .attr('class', 'link-text')
      .selectAll('text')
      .data(links)
      .enter().append('text')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .text(d => d.amount)
      .attr('data-source', d => d.source)
      .attr('data-target', d => d.target);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .attr('data-id', d => d.id)
      .call(d3.drag<any, { id: string }>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any)
      .on('click', clicked);

    const nodeText = svg.append('g')
      .attr('class', 'node-text')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('fill', '#ff1')
      .attr('font-size', '10px')
      .text(d => d.id);

    node.append('title')
      .text(d => d.id);

    simulation
      .nodes(nodes)
      .on('tick', ticked);

    simulation.force<d3.ForceLink<any, any>>('link')!.links(links);

    function ticked() {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      linkText
        .attr('x', d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr('y', d => ((d.source as any).y + (d.target as any).y) / 2);

      node
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y);

      nodeText
        .attr('x', d => (d as any).x)
        .attr('y', d => (d as any).y - 15); // Position the text above the node
    }

    function dragstarted(this: any, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      highlightConnectedNodesAndLinks.call(this, d, 'red', 'orange');
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(this: any, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;

      resetNodeAndLinkColors.call(this, d);
    }

    function clicked(this: any, event: any, d: any) {
      if (highlightedNodeRef.current) {
        resetNodeAndLinkColors.call(this, highlightedNodeRef.current);
      }
      highlightedNodeRef.current = d;
      highlightConnectedNodesAndLinks.call(this, d, 'blue', 'green');
      onNodeClick(d.id);
    }

    return () => {
      svg.selectAll('*').remove();
    };
  }, [data]);

  useEffect(() => {
    if (selectedNode) {
      const nodeData = data.nodes.find(n => n === selectedNode);
      if (nodeData) {
        if (highlightedNodeRef.current) {
          resetNodeAndLinkColors(highlightedNodeRef.current);
        }
        highlightedNodeRef.current = { id: selectedNode };
        highlightConnectedNodesAndLinks(highlightedNodeRef.current, 'blue', 'green');
      }
    }
  }, [selectedNode]);

  function highlightConnectedNodesAndLinks(d: any, nodeColor: string, connectedNodeColor: string) {
    // Change color of the clicked or dragged node
    d3.select(`[data-id="${d.id}"]`).attr('fill', nodeColor);

    // Change color of the links connected to the clicked or dragged node
    d3.selectAll('.links line')
      .filter((l: any) => l.source.id === d.id || l.target.id === d.id)
      .attr('stroke', nodeColor);

    // Change color of the nodes connected to the clicked or dragged node
    d3.selectAll('.nodes circle')
      .filter((n: any) => data.edges.some(
        (l: any) => 
            (l.from === d.id && l.to === n.id) || (l.to === d.id && l.from === n.id)
    ))
      .attr('fill', connectedNodeColor);

    // Change color of the text of the clicked or dragged node
    d3.selectAll('.node-text text')
      .filter((n: any) => n.id === d.id)
      .attr('fill', nodeColor);

    // Change color of the text of the nodes connected to the clicked or dragged node
    d3.selectAll('.node-text text')
      .filter((n: any) => data.edges.some((l: any) => (l.from === d.id && l.to === n.id) || (l.to === d.id && l.from === n.id)))
      .attr('fill', connectedNodeColor);
  }

  function resetNodeAndLinkColors(d: any) {
    // Revert color of the dragged node
    d3.select(`[data-id="${d.id}"]`).attr('fill', '#69b3a2');

    // Revert color of the links connected to the dragged node
    d3.selectAll('.links line')
      .filter((l: any) => l.source.id === d.id || l.target.id === d.id)
      .attr('stroke', '#999');

    // Revert color of the nodes connected to the dragged node
    d3.selectAll('.nodes circle')
      .filter((n: any) => data.edges.some((l: any) => (l.from === d.id && l.to === n.id) || (l.to === d.id && l.from === n.id)))
      .attr('fill', '#69b3a2');

    // Revert color of the text of the dragged node
    d3.selectAll('.node-text text')
      .filter((n: any) => n.id === d.id)
      .attr('fill', '#ff1');

    // Revert color of the text of the nodes connected to the dragged node
    d3.selectAll('.node-text text')
      .filter((n: any) => data.edges.some((l: any) => (l.from === d.id && l.to === n.id) || (l.to === d.id && l.from === n.id)))
      .attr('fill', '#ff1');
  }

  return <svg ref={ref}></svg>;
};

export default GraphComponent;