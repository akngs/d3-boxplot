function render(data, svg, w, h, transition) {
    var stats = data.map(function (d) {
        return d3.boxplotStats(d, function (d) {
            return d.x;
        });
    });

    var vertical = w < h;
    var axis1 = d3.scaleLinear()
        .domain([-5, 5])
        .range([10, vertical ? h - 10 : w - 10]);
    var axis2 = d3.scaleBand()
        .domain(d3.range(stats.length))
        .range([10, vertical ? w - 10 : h - 10])
        .padding(0.15);
    var colors = d3.schemeCategory10;
    var boxplot = d3.boxplot()
        .scale(axis1)
        .bandwidth(axis2.bandwidth())
        .vertical(vertical)
        .jitter(0.2);

    var root = d3.select(svg)
        .attr('width', w)
        .attr('height', h);
    var plots = root.selectAll('g.plot').data(stats);
    plots.exit().remove();
    plots = plots.enter()
        .append('g')
        .attr('class', 'plot')
        .attr('transform', function (d, i) {
            return vertical ?
                'translate(' + axis2(i) + ', 0)' :
                'translate(0, ' + axis2(i) + ')';
        })
        .merge(plots)
        .attr('color', function (d, i) {
            return colors[i];
        });
    if (transition) plots = plots.transition();
    plots.call(boxplot);
}

function update() {
    var rand = d3.randomNormal();
    var data = [];
    for (let i = 0; i < 6; i++) {
        data.push(d3.range(Math.random() * 10 + 20 | 0).map(function () {
            return {x: rand(), y: rand()};
        }).sort(function (a, b) {
            return d3.ascending(a.x, b.x);
        }));
    }

    render(data, document.querySelector('#svg1'), 300, 200, true);
    render(data, document.querySelector('#svg2'), 300, 200, false);
    render(data, document.querySelector('#svg3'), 200, 300, true);
    render(data, document.querySelector('#svg4'), 200, 300, false);
}

update();
