let tape = require("tape"),
  boxplot = require("../")

tape("Statistics for single data point", test => {
  let stats = boxplot.boxplotStats([5])
  test.deepEqual(stats, {
    fiveNums: [5, 5, 5, 5, 5],
    iqr: 0,
    step: 0,
    fences: [
      {type: 'outer', start: 5, end: 5},
      {type: 'inner', start: 5, end: 5},
      {type: 'iqr', start: 5, end: 5},
      {type: 'inner', start: 5, end: 5},
      {type: 'outer', start: 5, end: 5}
    ],
    boxes: [
      {type: 'box', start: 5, end: 5},
      {type: 'box', start: 5, end: 5},
    ],
    whiskers: [
      {type: 'whisker', start: 5, end: 5},
      {type: 'whisker', start: 5, end: 5}
    ],
    points: [{value: 5, datum: 5, outlier: false, farout: false}]
  })
  test.end()
})

tape("Statistics", test => {
  let stats = boxplot.boxplotStats([1, 2, 3, 4, 5])
  test.deepEqual(stats, {
    fiveNums: [1, 2, 3, 4, 5],
    iqr: 2,
    step: 3,
    fences: [
      {type: 'outer', start: -4, end: -1},
      {type: 'inner', start: -1, end: 2},
      {type: 'iqr', start: 2, end: 4},
      {type: 'inner', start: 4, end: 7},
      {type: 'outer', start: 7, end: 10}
    ],
    boxes: [
      {type: 'box', start: 2, end: 3},
      {type: 'box', start: 3, end: 4},
    ],
    whiskers: [
      {type: 'whisker', start: 1, end: 2},
      {type: 'whisker', start: 5, end: 4}
    ],
    points: [
      {value: 1, datum: 1, outlier: false, farout: false},
      {value: 2, datum: 2, outlier: false, farout: false},
      {value: 3, datum: 3, outlier: false, farout: false},
      {value: 4, datum: 4, outlier: false, farout: false},
      {value: 5, datum: 5, outlier: false, farout: false}
    ]
  })
  test.end()
})

tape("Statistics with accessor", test => {
  let data = [
    {x: 1, y: 2},
    {x: 2, y: 3},
    {x: 3, y: 4},
    {x: 4, y: 5},
    {x: 5, y: 6},
  ]
  let xStats = boxplot.boxplotStats(data, d => d.x)
  test.deepEqual(xStats, {
    fiveNums: [1, 2, 3, 4, 5],
    iqr: 2,
    step: 3,
    fences: [
      {type: 'outer', start: -4, end: -1},
      {type: 'inner', start: -1, end: 2},
      {type: 'iqr', start: 2, end: 4},
      {type: 'inner', start: 4, end: 7},
      {type: 'outer', start: 7, end: 10}
    ],
    boxes: [
      {type: 'box', start: 2, end: 3},
      {type: 'box', start: 3, end: 4},
    ],
    whiskers: [
      {type: 'whisker', start: 1, end: 2},
      {type: 'whisker', start: 5, end: 4}
    ],
    points: [
      {value: 1, datum: {x: 1, y: 2}, outlier: false, farout: false},
      {value: 2, datum: {x: 2, y: 3}, outlier: false, farout: false},
      {value: 3, datum: {x: 3, y: 4}, outlier: false, farout: false},
      {value: 4, datum: {x: 4, y: 5}, outlier: false, farout: false},
      {value: 5, datum: {x: 5, y: 6}, outlier: false, farout: false}
    ]
  })
  test.end()
})
