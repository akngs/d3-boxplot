let tape = require("tape"),
  boxplot = require("../")

tape("Single data point", test => {
  let stats = boxplot.boxplotStats([5])
  test.deepEqual(stats, {
    fiveNums: [5, 5, 5, 5, 5],
    iqr: 0,
    step: 0,
    fences: [
      {start: 5, end: 5},
      {start: 5, end: 5},
      {start: 5, end: 5},
      {start: 5, end: 5},
      {start: 5, end: 5},
    ],
    boxes: [
      {start: 5, end: 5},
      {start: 5, end: 5},
    ],
    whiskers: [
      {start: 5, end: 5},
      {start: 5, end: 5},
    ],
    points: [{value: 5, datum: 5, outlier: false, farout: false}],
  })
  test.end()
})

tape("Simple and obvious data", test => {
  let stats = boxplot.boxplotStats([1, 2, 3, 4, 5])
  test.deepEqual(stats, {
    fiveNums: [1, 2, 3, 4, 5],
    iqr: 2,
    step: 3,
    fences: [
      {start: -4, end: -1},
      {start: -1, end: 2},
      {start: 2, end: 4},
      {start: 4, end: 7},
      {start: 7, end: 10},
    ],
    boxes: [
      {start: 2, end: 3},
      {start: 3, end: 4},
    ],
    whiskers: [
      {start: 1, end: 2},
      {start: 5, end: 4},
    ],
    points: [
      {value: 1, datum: 1, outlier: false, farout: false},
      {value: 2, datum: 2, outlier: false, farout: false},
      {value: 3, datum: 3, outlier: false, farout: false},
      {value: 4, datum: 4, outlier: false, farout: false},
      {value: 5, datum: 5, outlier: false, farout: false},
    ],
  })
  test.end()
})

tape("Accessor", test => {
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
      {start: -4, end: -1},
      {start: -1, end: 2},
      {start: 2, end: 4},
      {start: 4, end: 7},
      {start: 7, end: 10},
    ],
    boxes: [
      {start: 2, end: 3},
      {start: 3, end: 4},
    ],
    whiskers: [
      {start: 1, end: 2},
      {start: 5, end: 4},
    ],
    points: [
      {value: 1, datum: {x: 1, y: 2}, outlier: false, farout: false},
      {value: 2, datum: {x: 2, y: 3}, outlier: false, farout: false},
      {value: 3, datum: {x: 3, y: 4}, outlier: false, farout: false},
      {value: 4, datum: {x: 4, y: 5}, outlier: false, farout: false},
      {value: 5, datum: {x: 5, y: 6}, outlier: false, farout: false},
    ],
  })
  test.end()
})

tape("Boxplot statistics from well-known numbers", test => {
  let data = [0, 3, 4.4, 4.5, 4.6, 5, 7]
  let stats = boxplot.boxplotStats(data)

  test.deepEqual(
    stats.fiveNums,
    [0, 3.7, 4.5, 4.8, 7]
  )
  test.deepEqual(
    stats.boxes,
    [{start: 3.7, end: 4.5}, {start: 4.5, end: 4.8}]
  )
  test.deepEqual(
    stats.whiskers,
    [{start: 3, end: 3.7}, {start: 5, end: 4.8}]
  )
  test.deepEqual(
    stats.points.map(p => p.outlier),
    [true, false, false, false, false, false, true]
  )
  test.deepEqual(
    stats.points.map(p => p.farout),
    [true, false, false, false, false, false, false]
  )

  test.end()
})
