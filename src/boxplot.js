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

        var whiskerGroup = selection.select('g.whisker');
        if (whiskerGroup.empty()) whiskerGroup = selection.append('g').attr('class', 'whisker');

        var boxGroup = selection.select('g.box');
        if (boxGroup.empty()) boxGroup = selection.append('g').attr('class', 'box');

        var pointGroup = selection.select('g.point');
        if (pointGroup.empty()) pointGroup = selection.append('g').attr('class', 'point');
        pointGroup.attr('transform', 'translate(' + (vertical ? bandwidth * 0.5 : 0) + ', ' + (vertical ? 0 : bandwidth * 0.5) + ')');

        var whisker = whiskerGroup.selectAll('path').data(function (d) {
            return d.whiskers;
        });
        var whiskerEnter = whisker.enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', function (d) {
                return d.type === 'box' ? 'none' : 'currentColor';
            })
            .attr('d', function (d) {
                var s = scale(d.start), e = scale(d.end), w = bandwidth;
                return vertical ?
                    'M' + [0, s] + ' L' + [w, s] + ' M' + [w * 0.5, s] + ' L' + [w * 0.5, e] + ' M' + [0, e] + ' L' + [w, e] :
                    'M' + [s, 0] + ' L' + [s, w] + ' M' + [s, w * 0.5] + ' L' + [e, w * 0.5] + ' M' + [e, 0] + ' L' + [e, w];
            });
        whisker = whisker.merge(whiskerEnter);

        var box = boxGroup.selectAll('rect').data(function (d) {
            return d.boxes;
        });
        var boxEnter = box.enter()
            .append('rect')
            .attr('fill', 'currentColor')
            .attr('stroke', 'none')
            .attr(vertical ? 'y' : 'x', function (d, i) {
                return scale(d.start) + (i === 0 ? 0 : 0.5);
            })
            .attr(vertical ? 'x' : 'y', 0)
            .attr(vertical ? 'height' : 'width', function (d, i) {
                return scale(d.end) - scale(d.start) - (i === 0 ? 0.5 : 0);
            })
            .attr(vertical ? 'width' : 'height', bandwidth);
        box = box.merge(boxEnter);

        var point = pointGroup.selectAll('circle.point').data(function (d) {
            return d.points;
        });
        var pointEnter = point.enter().append('circle')
            .attr('class', 'point')
            .attr(vertical ? 'cx' : 'cy', function (d) {
                return jitter ? (Math.random() - 0.5) * (d.farout ? 0.0 : d.outlier ? 0.1 : 0.2) * bandwidth : 0;
            })
            .attr(vertical ? 'cy' : 'cx', function (d) {
                return scale(d.value);
            });
        var pointExit = point.exit();
        point = point.merge(pointEnter);

        if (context !== selection) {
            whisker = whisker.transition(context);
            whiskerEnter
                .attr('opacity', epsilon);

            box = box.transition(context);
            boxEnter
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

        whisker
            .attr('opacity', function (d) {
                return d.type === 'box' ? 0.6 : 1.0;
            })
            .attr('d', function (d) {
                var s = scale(d.start), e = scale(d.end), w = bandwidth;
                return vertical ?
                    'M' + [0, s] + ' L' + [w, s] + ' M' + [w * 0.5, s] + ' L' + [w * 0.5, e] + ' M' + [0, e] + ' L' + [w, e] :
                    'M' + [s, 0] + ' L' + [s, w] + ' M' + [s, w * 0.5] + ' L' + [e, w * 0.5] + ' M' + [e, 0] + ' L' + [e, w];
            });

        box
            .attr('opacity', function (d) {
                return d.type === 'box' ? 0.6 : 1.0;
            })
            .attr(vertical ? 'y' : 'x', function (d, i) {
                return scale(d.start) + (i === 0 ? 0 : 0.5);
            })
            .attr(vertical ? 'x' : 'y', 0)
            .attr(vertical ? 'height' : 'width', function (d, i) {
                return scale(d.end) - scale(d.start) - (i === 0 ? 0.5 : 0);
            })
            .attr(vertical ? 'width' : 'height', bandwidth);

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
    var boxes = [
        {
            type: 'box',
            start: fiveNums[1],
            end: fiveNums[2]
        },
        {
            type: 'box',
            start: fiveNums[2],
            end: fiveNums[3]
        }
    ];
    var whiskers = [
        {
            type: 'whisker',
            start: d3min(data.filter(function (d) {
                return fences[1].start <= d;
            })),
            end: fiveNums[1]
        },
        {
            type: 'whisker',
            start: d3max(data.filter(function (d) {
                return fences[2].end >= d;
            })),
            end: fiveNums[3]
        }
    ];
    var points = data.map(function (d) {
        return {
            value: d,
            outlier: d < fences[1].start || fences[2].end < d,
            farout: d < fences[0].start || fences[3].end < d
        };
    });

    return {
        fiveNums: fiveNums,
        iqr: iqr,
        step: step,
        fences: fences,
        boxes: boxes,
        whiskers: whiskers,
        points: points
    };
}
