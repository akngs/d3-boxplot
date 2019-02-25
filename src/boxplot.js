import {quantile as d3quantile, min as d3min, max as d3max} from 'd3-array';
import {scaleLinear as d3scaleLinear} from 'd3-scale';

var epsilon = 1e-6;

export function boxplot() {
    var vertical = false;
    var scale = d3scaleLinear();
    var bandwidth = 20;
    var boxwidth = 20;
    var showInnerDots = true;
    var opacity = 0.8;
    var jitter = 0.2;

    var _pointRadius = bandwidth * 0.1;
    var _faroutRadius = _pointRadius * 1.5;

    function boxplot(context) {
        var selection = context.selection ? context.selection() : context;
        var rootTranslate = vertical ? [bandwidth * .5, 0] : [0, bandwidth * .5];

        var gWhisker = selection.select('g.whisker');
        if (gWhisker.empty()) gWhisker = selection.append('g').attr('class', 'whisker');
        gWhisker.attr('transform', 'translate(' + rootTranslate + ')');

        var gBox = selection.select('g.box');
        if (gBox.empty()) gBox = selection.append('g').attr('class', 'box');
        gBox.attr('transform', 'translate(' + rootTranslate + ')');

        var gPoint = selection.select('g.point');
        if (gPoint.empty()) gPoint = selection.append('g').attr('class', 'point');
        gPoint.attr('transform', 'translate(' + rootTranslate + ')');

        var whisker = gWhisker.selectAll('path').data(function (d) {
            return d.whiskers;
        });
        var whiskerEnter = whisker.enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', function (d) {
                return d.type === 'box' ? 'none' : 'currentColor';
            })
            .attr('d', whiskerPath);
        whisker = whisker.merge(whiskerEnter);

        var box = gBox.selectAll('rect').data(function (d) {
            return d.boxes;
        });
        var boxEnter = box.enter()
            .append('rect')
            .attr('fill', 'currentColor')
            .attr('stroke', 'none')
            .attr(vertical ? 'y' : 'x', function (d, i) {
                return scale(d.start) + (i === 0 ? 0 : .5);
            })
            .attr(vertical ? 'x' : 'y', -.5 * boxwidth)
            .attr(vertical ? 'height' : 'width', function (d, i) {
                return scale(d.end) - scale(d.start) - (i === 0 ? .5 : 0);
            })
            .attr(vertical ? 'width' : 'height', boxwidth);
        box = box.merge(boxEnter);

        var point = gPoint.selectAll('circle.point').data(function (d) {
            return showInnerDots ? d.points : d.points.filter(function (d) {
                return d.outlier;
            });
        });
        var pointEnter = point.enter().append('circle')
            .attr('class', 'point');
        var pointExit = point.exit();
        point = point.merge(pointEnter)
            .classed('outlier', function (d) {
                return d.outlier;
            })
            .classed('farout', function (d) {
                return d.farout;
            })
            .attr(vertical ? 'cx' : 'cy', function (d) {
                return jitter === 0 ?
                    0 :
                    (Math.random() - .5) * (d.farout ? 0 : d.outlier ? .5 : 1) * jitter * bandwidth;
            })
            .attr(vertical ? 'cy' : 'cx', function (d) {
                return scale(d.value);
            });

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
            .attr('d', whiskerPath)
            .attr('opacity', opacity);

        box
            .attr(vertical ? 'y' : 'x', function (d, i) {
                return scale(d.start) + (i === 0 ? 0 : .5);
            })
            .attr(vertical ? 'x' : 'y', -.5 * boxwidth)
            .attr(vertical ? 'height' : 'width', function (d, i) {
                return scale(d.end) - scale(d.start) - (i === 0 ? .5 : 0);
            })
            .attr(vertical ? 'width' : 'height', boxwidth)
            .attr('opacity', opacity);

        point
            .attr('fill', 'currentColor')
            .attr('r', function (d) {
                return d.farout ? _faroutRadius : _pointRadius;
            })
            .attr('opacity', opacity);
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
    boxplot.showInnerDots = function (_) {
        return arguments.length ? (showInnerDots = _, boxplot) : showInnerDots;
    };
    boxplot.bandwidth = function (_) {
        return arguments.length ? (bandwidth = _, boxplot) : bandwidth;
    };
    boxplot.boxwidth = function (_) {
        return arguments.length ? (boxwidth = _, boxplot) : boxwidth;
    };
    boxplot.opacity = function (_) {
        return arguments.length ? (opacity = _, boxplot) : opacity;
    };
    boxplot.jitter = function (_) {
        return arguments.length ? (jitter = _, boxplot) : jitter;
    };

    function whiskerPath(d) {
        var s = scale(d.start), e = scale(d.end), w = boxwidth;
        var frags = vertical ?
            ['M', [-.5 * w, s], 'L', [.5 * w, s], 'M', [0, s], 'L', [0, e]] :
            ['M', [s, -.5 * w], 'L', [s, .5 * w], 'M', [s, 0], 'L', [e, 0]];
        return frags.join('');
    }

    return boxplot;
}

export function boxplotStats(data, valueof) {
    var values = valueof ? data.map(valueof) : data;

    var fiveNums = [0.00, 0.25, 0.50, 0.75, 1.00].map(function (d) {
        return d3quantile(values, d);
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
            type: 'iqr',
            start: fiveNums[1],
            end: fiveNums[3],
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
            start: d3min(values.filter(function (d) {
                return fences[1].start <= d;
            })),
            end: fiveNums[1]
        },
        {
            type: 'whisker',
            start: d3max(values.filter(function (d) {
                return fences[3].end >= d;
            })),
            end: fiveNums[3]
        }
    ];
    var points = values.map(function (d, i) {
        return {
            value: d,
            datum: data[i],
            outlier: d < fences[1].start || fences[3].end < d,
            farout: d < fences[0].start || fences[4].end < d
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
