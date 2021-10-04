import assert from "assert"
import { JSDOM } from 'jsdom'
import { scaleLinear, select } from 'd3'
import { boxplot as _boxplot, boxplotSymbolDot, boxplotSymbolTick } from '../src/index.js'

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
const scale = scaleLinear()
  .domain([1, 5])
  .range([0, 100])

it('Boxes', () => {
  const plot = _boxplot()
    .scale(scale)
  const root = render(body(), stats, plot)
  const boxes = root.querySelectorAll('g.box > line')

  assert.deepStrictEqual(boxes.length, 2)
  assert.deepStrictEqual(+boxes[0].getAttribute('x1'), 25)
  assert.deepStrictEqual(+boxes[0].getAttribute('x2'), 49.5)
  assert.deepStrictEqual(+boxes[1].getAttribute('x1'), 50.5)
  assert.deepStrictEqual(+boxes[1].getAttribute('x2'), 75)
})

it('Boxes with inversed scale', () => {
  const plot = _boxplot()
    .scale(scaleLinear().domain([1, 5]).range([100, 0]))
  const root = render(body(), stats, plot)
  const boxes = root.querySelectorAll('g.box > line')

  assert.deepStrictEqual(boxes.length, 2)
  assert.deepStrictEqual(+boxes[0].getAttribute('x1'), 75)
  assert.deepStrictEqual(+boxes[0].getAttribute('x2'), 50.5)
  assert.deepStrictEqual(+boxes[1].getAttribute('x1'), 49.5)
  assert.deepStrictEqual(+boxes[1].getAttribute('x2'), 25)
})

it('Whiskers', () => {
  const plot = _boxplot()
    .scale(scale)
  const root = render(body(), stats, plot)
  const paths = root.querySelectorAll('g.whisker > path')

  assert.deepStrictEqual(paths.length, 2)
  assert.deepStrictEqual(paths[0].getAttribute('d'), 'M0,-10 l0,20 m0,-10 L25,0')
  assert.deepStrictEqual(paths[1].getAttribute('d'), 'M100,-10 l0,20 m0,-10 L75,0')
})

it('Points', () => {
  const plot = _boxplot()
    .scale(scale)
  const root = render(body(), stats, plot)
  const points = root.querySelectorAll('g.point > circle')

  assert.deepStrictEqual(points.length, 5)
  assert.deepStrictEqual(+points[0].getAttribute('cx'), 0)
  assert.deepStrictEqual(points[0].classList.contains('outlier'), true)
  assert.deepStrictEqual(points[0].classList.contains('farout'), true)

  assert.deepStrictEqual(+points[1].getAttribute('cx'), 25)
  assert.deepStrictEqual(points[1].classList.contains('outlier'), true)
  assert.deepStrictEqual(points[1].classList.contains('farout'), false)

  assert.deepStrictEqual(+points[2].getAttribute('cx'), 50)
  assert.deepStrictEqual(points[2].classList.contains('outlier'), false)
  assert.deepStrictEqual(points[2].classList.contains('farout'), false)

  assert.deepStrictEqual(+points[3].getAttribute('cx'), 75)
  assert.deepStrictEqual(points[3].classList.contains('outlier'), false)
  assert.deepStrictEqual(points[3].classList.contains('farout'), false)

  assert.deepStrictEqual(+points[4].getAttribute('cx'), 100)
  assert.deepStrictEqual(points[4].classList.contains('outlier'), false)
  assert.deepStrictEqual(points[4].classList.contains('farout'), false)
})

it('Symbol', () => {
  const configs = [
    {symbol: boxplotSymbolDot, nodeName: 'circle'},
    {symbol: boxplotSymbolTick, nodeName: 'line'},
  ]

  configs.forEach(config => {
    const plot = _boxplot()
      .symbol(config.symbol)
      .scale(scale)
    const root = render(body(), stats, plot)
    const points = root.querySelectorAll(`g.point > ${config.nodeName}`)
    assert.deepStrictEqual(points.length, 5)
  })

})

it('Symbol: tick', () => {
  const plot = _boxplot()
    .symbol(boxplotSymbolTick)
    .scale(scale)
  const root = render(body(), stats, plot)
  const points = root.querySelectorAll('g.point > line')
  assert.deepStrictEqual(points.length, 5)
})

function body() {
  const dom = new JSDOM()
  return dom.window.document.body
}


function render(element, stats, plot) {
  return select(element).append('svg').datum(stats).call(plot).node()
}
