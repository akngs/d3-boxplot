function render(data, svg, w, h, transition) {
  let stats = data.map(d => d3.boxplotStats(d, d2 => d2.x))
  let vertical = w < h
  let axis1 = d3.scaleLinear()
    .domain([-5, 5])
    .range([10, vertical ? h - 10 : w - 10])
  let axis2 = d3.scaleBand()
    .domain(d3.range(stats.length))
    .range([10, vertical ? w - 10 : h - 10])
    .padding(0.15)
  let colors = d3.schemeCategory10
  let boxplot = d3.boxplot()
    .scale(axis1)
    .bandwidth(axis2.bandwidth())
    .vertical(vertical)
    .jitter(0.2)
    .key(d => d.key)

  let root = d3.select(svg)
    .attr('width', w)
    .attr('height', h)
  let plots = root.selectAll('g.plot').data(stats)
  plots.exit().remove()
  plots = plots.enter()
    .append('g')
    .attr('class', 'plot')
    .attr('transform', (d, i) => vertical ? 'translate(' + axis2(i) + ', 0)' : 'translate(0, ' + axis2(i) + ')')
    .merge(plots)
    .attr('color', (d, i) => colors[i])
  if (transition) plots = plots.transition().duration(1000)
  plots.call(boxplot)
}

function update() {
  let rand = d3.randomNormal()
  let keys = d3.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''))
  let data =[]

  for (let i = 0; i < 6; i++) {
    data.push(d3.range(20)
      .map(i => ({key: keys[i], x: rand(), y: rand()}))
      .sort((a, b) => d3.ascending(a.x, b.x))
    )
  }
  render(data, document.querySelector('#svg1'), 300, 200, true)
  render(data, document.querySelector('#svg2'), 300, 200, false)
  render(data, document.querySelector('#svg3'), 200, 300, true)
  render(data, document.querySelector('#svg4'), 200, 300, false)
}

update()
