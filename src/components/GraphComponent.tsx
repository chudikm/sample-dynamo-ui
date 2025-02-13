import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GraphData {
  nodes: string[];
  edges: { from: string; to: string; timestamp: string; amount: number }[];
}

const GraphComponent: React.FC<{ data: GraphData }> = ({ data }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data) return;

    const width = 800;
    const height = 600;

    const svg = d3.select(ref.current)
      .attr('width', width)
      .attr('height', height);

    const nodes = data.nodes.map(node => ({ id: node,x:0,y:0}));
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
      .text(d => d.amount);

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(d3.drag<any, { id: string }>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

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

      // Change color of the dragged node
      d3.select(this).attr('fill', 'red');

      // Change color of the links connected to the dragged node
      link.filter(l => (l.source as any).id === d.id || (l.target as any).id === d.id)
        .attr('stroke', 'red');

      // Change color of the nodes connected to the dragged node
      node.filter(n => links.some(l => (l.source as any).id === d.id && (l.target as any).id === n.id) || links.some(l => (l.target as any).id === d.id && (l.source as any).id === n.id))
        .attr('fill', 'orange');

      // Change color of the text of the dragged node
      nodeText.filter(n => n.id === d.id)
        .attr('fill', 'red');

      // Change color of the text of the nodes connected to the dragged node
      nodeText.filter(n => links.some(l => (l.source as any).id === d.id && (l.target as any).id === n.id) || links.some(l => (l.target as any).id === d.id && (l.source as any).id === n.id))
        .attr('fill', 'orange');
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(this: any, event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;

      // Revert color of the dragged node
      d3.select(this).attr('fill', '#69b3a2');

      // Revert color of the links connected to the dragged node
      link.filter(l => (l.source as any).id === d.id || (l.target as any).id === d.id)
        .attr('stroke', '#999');

      // Revert color of the nodes connected to the dragged node
      node.filter(n => links.some(l => (l.source as any).id === d.id && (l.target as any).id === n.id) || links.some(l => (l.target as any).id === d.id && (l.source as any).id === n.id))
        .attr('fill', '#69b3a2');

      // Revert color of the text of the dragged node
      nodeText.filter(n => n.id === d.id)
        .attr('fill', '#ff1');

      // Revert color of the text of the nodes connected to the dragged node
      nodeText.filter(n => links.some(l => (l.source as any).id === d.id && (l.target as any).id === n.id) || links.some(l => (l.target as any).id === d.id && (l.source as any).id === n.id))
        .attr('fill', '#ff1');
    }

    return () => {
      svg.selectAll('*').remove();
    };
  }, [data]);

  return <svg ref={ref}></svg>;
};

export default GraphComponent;