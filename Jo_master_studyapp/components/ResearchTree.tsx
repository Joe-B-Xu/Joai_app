import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ResearchNode } from '../types';

interface Props {
  data: ResearchNode;
}

const ResearchTree: React.FC<Props> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 600;
    const height = 300;
    
    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<ResearchNode>().size([height, width - 150]); // Rotate: height maps to x, width to y
    treeLayout(root);

    const g = svg.append("g").attr("transform", "translate(40,0)");

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.depth === 0 ? "#2563eb" : d.depth === 1 ? "#f59e0b" : "#475569");

    node.append("text")
      .attr("dy", 3)
      .attr("x", d => d.children ? -10 : 10)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("font-size", "12px")
      .style("fill", "#1e293b")
      .style("font-family", "sans-serif");

  }, [data]);

  return <svg ref={svgRef} className="w-full h-auto border border-gray-100 rounded bg-white shadow-sm" />;
};

export default ResearchTree;
