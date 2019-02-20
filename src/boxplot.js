import {quantile as d3quantile, min as d3min, max as d3max} from 'd3-array';
import {scaleLinear as d3scaleLinear} from 'd3-scale';

var epsilon = 1e-6;

export function boxplot() {
    var vertical = false;
    var scale = d3scaleLinear();
    var bandwidth = 20;
    var jitter = true;

    var _pointRadius = bandwidth * 0.1;
    var _faroutRadius = _pointRadius * 1.5;

    function boxplot(context) {
        var selection = context.selection ? context.selection() : context;

        var fenceGroup = selection.select('g.fence');
        if (fenceGroup.empty()) fenceGroup = selection.append('g').attr('class', 'fence');

        var pointGroup = selection.select('g.point');
        if (pointGroup.empty()) pointGroup = selection.append('g').attr('class', 'point');
        pointGroup.attr('transform', 'translate(' + (vertical ? bandwidth * 0.5 : 0) + ', ' + (vertical ? 0 : bandwidth * 0.5) + ')');

        var fence = fenceGroup.selectAll('path.fence').data(function (d) {
            return d.fences;
        });
        var fenceEnter = fence.enter()
            .append('path')
            .attr('class', function (d) {
                return 'fence ' + d.type;
            })
            .attr('fill', function (d) {
                return d.type === 'box' ? 'currentColor' : 'none';
            })
            .attr('stroke', function (d) {
                return d.type === 'box' ? 'none' : 'currentColor';
            });
        fence = fence.merge(fenceEnter);

        var point = pointGroup.selectAll('circle.point').data(function (d) {
            return d.points;
        });
        var pointEnter = point.enter().append('circle')
            .attr('class', 'point');
        var pointExit = point.exit();
        point = point.merge(pointEnter);

        if (context !== selection) {
            fence = fence.transition(context);
            fenceEnter
                .attr('opacity', epsilon);

            point = point.transition(context);
            pointEnter
                .attr('fill', 'currentColor')
                .attr('r', epsilon)
                .attr('opacity', epsilon);
            pointExit = pointExit.transition(context)
                .attr('opacity', epsilon)
                .attr('r', epsilon);
        }

        fence
            .attr('opacity', function (d) {
                return d.type === 'box' ? 0.6 : 1.0;
            })
            .attr('d', function (d, i) {
                return fencePath(d, i, scale, bandwidth, vertical)
            });

        point
            .attr('fill', 'currentColor')
            .attr('r', function (d) {
                return d.farout ? _faroutRadius : _pointRadius;
            })
            .attr('opacity', function (d) {
                return d.farout ? 0.9 : d.outlier ? 0.8 : 0.5;
            })
            .attr(vertical ? 'cx' : 'cy', function (d) {
                return jitter ? (Math.random() - 0.5) * (d.farout ? 0.0 : d.outlier ? 0.1 : 0.2) * bandwidth : 0;
            })
            .attr(vertical ? 'cy' : 'cx', function (d) {
                return scale(d.value);
            });
        pointExit
            .remove();

        return this;
    }

    boxplot.vertical = function (_) {
        return arguments.length ? (vertical = _, boxplot) : vertical;
    };
    boxplot.scale = function (_) {
        return arguments.length ? (scale = _, boxplot) : scale;
    };
    boxplot.bandwidth = function (_) {
        return arguments.length ? (bandwidth = _, boxplot) : bandwidth;
    };
    boxplot.jitter = function (_) {
        return arguments.length ? (jitter = _, boxplot) : jitter;
    };

    return boxplot;
}

export function boxplotStats(data) {
    var fiveNums = [0.00, 0.25, 0.50, 0.75, 1.00].map(function (d) {
        return d3quantile(data, d);
    });
    var iqr = fiveNums[3] - fiveNums[1];
    var step = iqr * 1.5;
    var fences = [
        {
            type: 'outer',
            start: fiveNums[1] - step - step,
            end: fiveNums[1] - step
        },
        {
            type: 'inner',
            start: fiveNums[1] - step,
            end: fiveNums[1]
        },
        {
            type: 'box',
            start: fiveNums[1],
            end: fiveNums[2]
        },
        {
            type: 'box',
            start: fiveNums[2],
            end: fiveNums[3]
        },
        {
            type: 'inner',
            start: fiveNums[3],
            end: fiveNums[3] + step
        },
        {
            type: 'outer',
            start: fiveNums[3] + step,
            end: fiveNums[3] + step + step
        }
    ];
    var whiskers = [
        {
            start: d3min(data.filter(function (d) {
                return fences[1].start <= d;
            })),
            end: fiveNums[1]
        },
        {
            start: d3max(data.filter(function (d) {
                return fences[4].end >= d;
            })),
            end: fiveNums[3]
        }
    ];
    var points = data.map(function (d) {
        return {
            value: d,
            outlier: d < fences[1].start || fences[4].end < d,
            farout: d < fences[0].start || fences[5].end < d
        };
    });

    return {
        fiveNums: fiveNums,
        iqr: iqr,
        step: step,
        fences: fences,
        whiskers: whiskers,
        points: points
    };
}

function fencePath(d, i, scale, w, vertical) {
    var s = scale(d.start), e = scale(d.end);

    if (d.type === 'outer') {
        return '';
    } else if (d.type === 'inner') {
        if (vertical) {
            return 'M' + [0, s] + ' L' + [w, s] + ' M' + [w * 0.5, s] + ' L' + [w * 0.5, e] + ' M' + [0, e] + ' L' + [w, e];
        } else {
            return 'M' + [s, 0] + ' L' + [s, w] + ' M' + [s, w * 0.5] + ' L' + [e, w * 0.5] + ' M' + [e, 0] + ' L' + [e, w];
        }
    } else /* if (d.type === 'box') */ {
        if (i === 2) {
            e--;
        } else {
            s++;
        }
        if (vertical) {
            return 'M' + [0, s] + ' L' + [0, e] + ' L' + [w, e] + ' L' + [w, s] + ' Z';
        } else {
            return 'M' + [s, 0] + ' L' + [e, 0] + ' L' + [e, w] + ' L' + [s, w] + ' Z';
        }
    }
}
