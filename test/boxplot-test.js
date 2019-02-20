var tape = require("tape"),
    boxplot = require("../");

tape("Statistics for single data point", function (test) {
    var stats = boxplot.boxplotStats([5]);
    test.deepEqual(stats, {
        fiveNums: [5, 5, 5, 5, 5],
        iqr: 0,
        step: 0,
        fences: [
            {type: 'outer', start: 5, end: 5},
            {type: 'inner', start: 5, end: 5},
            {type: 'box', start: 5, end: 5},
            {type: 'box', start: 5, end: 5},
            {type: 'inner', start: 5, end: 5},
            {type: 'outer', start: 5, end: 5}
        ],
        whiskers: [
            {start: 5, end: 5},
            {start: 5, end: 5}
        ],
        points: [{value: 5, outlier: false, farout: false}]
    });
    test.end();
});

tape("Statistics", function (test) {
    var stats = boxplot.boxplotStats([1, 2, 3, 4, 5]);
    test.deepEqual(stats, {
        fiveNums: [1, 2, 3, 4, 5],
        iqr: 2,
        step: 3,
        fences: [
            {type: 'outer', start: -4, end: -1},
            {type: 'inner', start: -1, end: 2},
            {type: 'box', start: 2, end: 3},
            {type: 'box', start: 3, end: 4},
            {type: 'inner', start: 4, end: 7},
            {type: 'outer', start: 7, end: 10}
        ],
        whiskers: [
            {start: 1, end: 2},
            {start: 5, end: 4}
        ],
        points: [
            {value: 1, outlier: false, farout: false},
            {value: 2, outlier: false, farout: false},
            {value: 3, outlier: false, farout: false},
            {value: 4, outlier: false, farout: false},
            {value: 5, outlier: false, farout: false}
        ]
    });
    test.end();
});
