const tape = require("tape")
const jsdom = require("jsdom")
const d3 = require("d3")
const boxplot = require("../")

const stats = {
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
    {value: 1, datum: 1, outlier: true, farout: true},
    {value: 2, datum: 2, outlier: true, farout: false},
    {value: 3, datum: 3, outlier: false, farout: false},
    {value: 4, datum: 4, outlier: false, farout: false},
    {value: 5, datum: 5, outlier: false, farout: false},
  ]
}
const scale = d3.scaleLinear()
  .domain([1, 5])
  .range([0, 100])

tape("Boxes", test => {
  const plot = boxplot.boxplot()
    .scale(scale)
  const root = render(body(), stats, plot)
  const boxes = root.querySelectorAll('g.box > line')

  test.equal(boxes.length, 2)
  test.equal(+boxes[0].getAttribute('x1'), 25)
  test.equal(+boxes[0].getAttribute('x2'), 49.5)
  test.equal(+boxes[1].getAttribute('x1'), 50.5)
  test.equal(+boxes[1].getAttribute('x2'), 75)
  test.end()
})

tape("Boxes with inversed scale", test => {
  const plot = boxplot.boxplot()
    .scale(d3.scaleLinear().domain([1, 5]).range([100, 0]))
  const root = render(body(), stats, plot)
  const boxes = root.querySelectorAll('g.box > line')

  test.equal(boxes.length, 2)
  test.equal(+boxes[0].getAttribute('x1'), 75)
  test.equal(+boxes[0].getAttribute('x2'), 50.5)
  test.equal(+boxes[1].getAttribute('x1'), 49.5)
  test.equal(+boxes[1].getAttribute('x2'), 25)
  test.end()
})

tape("Whiskers", test => {
  const plot = boxplot.boxplot()
    .scale(scale)
  const root = render(body(), stats, plot)
  const paths = root.querySelectorAll('g.whisker > path')

  test.equal(paths.length, 2)
  test.equal(paths[0].getAttribute('d'), 'M0,-10 l0,20 m0,-10 L25,0')
  test.equal(paths[1].getAttribute('d'), 'M100,-10 l0,20 m0,-10 L75,0')
  test.end()
})

tape("Points", test => {
  const plot = boxplot.boxplot()
    .scale(scale)
  const root = render(body(), stats, plot)
  const points = root.querySelectorAll('g.point > circle')

  test.equal(points.length, 5)
  test.equal(+points[0].getAttribute('cx'), 0)
  test.equal(points[0].classList.contains('outlier'), true)
  test.equal(points[0].classList.contains('farout'), true)

  test.equal(+points[1].getAttribute('cx'), 25)
  test.equal(points[1].classList.contains('outlier'), true)
  test.equal(points[1].classList.contains('farout'), false)

  test.equal(+points[2].getAttribute('cx'), 50)
  test.equal(points[2].classList.contains('outlier'), false)
  test.equal(points[2].classList.contains('farout'), false)

  test.equal(+points[3].getAttribute('cx'), 75)
  test.equal(points[3].classList.contains('outlier'), false)
  test.equal(points[3].classList.contains('farout'), false)

  test.equal(+points[4].getAttribute('cx'), 100)
  test.equal(points[4].classList.contains('outlier'), false)
  test.equal(points[4].classList.contains('farout'), false)
  test.end()
})

tape("Symbol", test => {
  const configs = [
    {symbol: boxplot.boxplotSymbolDot, nodeName: 'circle'},
    {symbol: boxplot.boxplotSymbolTick, nodeName: 'line'},
  ]

  configs.forEach(config => {
    const plot = boxplot.boxplot()
      .symbol(config.symbol)
      .scale(scale)
    const root = render(body(), stats, plot)
    const points = root.querySelectorAll(`g.point > ${config.nodeName}`)
    test.equal(points.length, 5)
  })

  test.end()
})

tape("Symbol: tick", test => {
  const plot = boxplot.boxplot()
    .symbol(boxplot.boxplotSymbolTick)
    .scale(scale)
  const root = render(body(), stats, plot)
  const points = root.querySelectorAll('g.point > line')
  test.equal(points.length, 5)
  test.end()
})

function body() {
  const dom = new jsdom.JSDOM()
  return dom.window.document.body
}


function render(element, stats, plot) {
  return d3.select(element).append('svg').datum(stats).call(plot).node()
}
