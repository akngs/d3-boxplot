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
    {value: 1, datum: 1, outlier: false, farout: false},
    {value: 2, datum: 2, outlier: false, farout: false},
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
  const boxes = root.querySelectorAll('g.box > rect')

  test.equal(boxes.length, 2)
  test.equal(+boxes[0].getAttribute('x'), 25)
  test.equal(+boxes[0].getAttribute('y'), -10)
  test.equal(+boxes[0].getAttribute('width'), 24.5)
  test.equal(+boxes[0].getAttribute('height'), 20)
  test.equal(+boxes[1].getAttribute('x'), 50.5)
  test.equal(+boxes[1].getAttribute('y'), -10)
  test.equal(+boxes[1].getAttribute('width'), 24.5)
  test.equal(+boxes[1].getAttribute('height'), 20)
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

function body() {
  const dom = new jsdom.JSDOM()
  return dom.window.document.body
}


function render(element, stats, plot) {
  return d3.select(element).append('svg').datum(stats).call(plot).node()
}
