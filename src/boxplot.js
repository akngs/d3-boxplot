import {quantile, min, max} from 'd3-array'
import {scaleLinear} from 'd3-scale'

export function boxplot() {
  let vertical = false
  let scale = scaleLinear()
  let bandwidth = 20
  let boxwidth = 20
  let showInnerDots = true
  let opacity = .8
  let jitter = .2
  let key = undefined

  function boxplot(context) {
    const x = vertical ? 'y' : 'x'
    const y = vertical ? 'x' : 'y'
    const w = vertical ? 'height' : 'width'
    const h = vertical ? 'width' : 'height'
    const coor = vertical ? (x, y) => [y, x] : (x, y) => [x, y]

    const selection = context.selection ? context.selection() : context
    const whiskerPath = d => `M${coor(scale(d.start), -.5 * boxwidth)} l${coor(0, boxwidth)} m${coor(0, -.5 * boxwidth)} L${coor(scale(d.end), 0)}`
    const jitterer = jitter === 0 ? 0 : (d, i) => Math.sin(1e5 * (i + d.value)) * .5 * (d.farout ? 0 : d.outlier ? .5 : 1) * jitter * bandwidth
    const r = Math.max(1.5, Math.sqrt(bandwidth) * .5)

    let gWhisker = selection.select('g.whisker')
    if (gWhisker.empty()) gWhisker = selection.append('g')
      .attr('class', 'whisker')
      .attr('transform', `translate(${coor(0, bandwidth * .5)})`)

    let gBox = selection.select('g.box')
    if (gBox.empty()) gBox = selection.append('g')
      .attr('class', 'box')
      .attr('transform', `translate(${coor(0, bandwidth * .5)})`)

    let gPoint = selection.select('g.point')
    if (gPoint.empty()) gPoint = selection.append('g')
      .attr('class', 'point')
      .attr('transform', `translate(${coor(0, bandwidth * .5)})`)

    let whisker = gWhisker.selectAll('path').data(d => d.whiskers)
    whisker = whisker.enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('opacity', 0)
      .attr('d', whiskerPath)
      .merge(whisker)

    let box = gBox.selectAll('rect').data(d => d.boxes)
    box = box.enter().append('rect')
      .attr('fill', 'currentColor')
      .attr('stroke', 'none')
      .attr('opacity', 0)
      .attr(x, (d, i) => scale(d.start) + (i === 0 ? 0 : .5))
      .attr(y, -.5 * boxwidth)
      .attr(w, d => scale(d.end) - scale(d.start) - .5)
      .attr(h, boxwidth)
      .merge(box)

    let point = gPoint.selectAll('circle').data(
      d => showInnerDots ? d.points : d.points.filter(d2 => d2.outlier),
      key ? (d => key(d.datum)) : undefined
    )
    let pointExit = point.exit()
    point = point.enter().append('circle')
      .attr('fill', 'currentColor')
      .attr('stroke', 'none')
      .attr('opacity', 0)
      .attr('r', 0)
      .attr(`c${x}`, d => scale(d.value))
      .attr(`c${y}`, jitterer)
      .merge(point)
      .classed('outlier', d => d.outlier)
      .classed('farout', d => d.farout)

    if (context !== selection) {
      gWhisker = gWhisker.transition(context)
      gBox = gBox.transition(context)
      gPoint = gPoint.transition(context)
      whisker = whisker.transition(context)
      box = box.transition(context)
      point = point.transition(context)
      pointExit = pointExit.transition(context)
    }

    gWhisker
      .attr('transform', `translate(${coor(0, bandwidth * .5)})`)
    gBox
      .attr('transform', `translate(${coor(0, bandwidth * .5)})`)
    gPoint
      .attr('transform', `translate(${coor(0, bandwidth * .5)})`)
    whisker
      .attr('opacity', opacity)
      .attr('d', whiskerPath)
    box
      .attr('opacity', opacity)
      .attr(x, (d, i) => scale(d.start) + (i === 0 ? 0 : .5))
      .attr(y, -.5 * boxwidth)
      .attr(w, d => scale(d.end) - scale(d.start) - .5)
      .attr(h, boxwidth)
    point
      .attr('opacity', opacity)
      .attr('r', d => d.farout ? r * 1.5 : r)
      .attr(`c${x}`, d => scale(d.value))
      .attr(`c${y}`, jitterer)
    pointExit
      .attr('opacity', 0)
      .attr('r', 0)
      .remove()

    return this
  }

  boxplot.vertical = (..._) => _.length ? (vertical = _[0], boxplot) : vertical
  boxplot.scale = (..._) => _.length ? (scale = _[0], boxplot) : scale
  boxplot.showInnerDots = (..._) => _.length ? (showInnerDots = _[0], boxplot) : showInnerDots
  boxplot.bandwidth = (..._) => _.length ? (bandwidth = _[0], boxplot) : bandwidth
  boxplot.boxwidth = (..._) => _.length ? (boxwidth = _[0], boxplot) : boxwidth
  boxplot.opacity = (..._) => _.length ? (opacity = _[0], boxplot) : opacity
  boxplot.jitter = (..._) => _.length ? (jitter = _[0], boxplot) : jitter
  boxplot.key = (..._) => _.length ? (key = _[0], boxplot) : key

  return boxplot
}

export function boxplotStats(data, valueof) {
  const values = valueof ? data.map(valueof) : data
  const fiveNums = [0.00, 0.25, 0.50, 0.75, 1.00].map(d => quantile(values, d))
  const iqr = fiveNums[3] - fiveNums[1]
  const step = iqr * 1.5
  const fences = [
    {start: fiveNums[1] - step - step, end: fiveNums[1] - step},
    {start: fiveNums[1] - step, end: fiveNums[1]},
    {start: fiveNums[1], end: fiveNums[3]},
    {start: fiveNums[3], end: fiveNums[3] + step},
    {start: fiveNums[3] + step, end: fiveNums[3] + step + step},
  ]
  const boxes = [
    {start: fiveNums[1], end: fiveNums[2]},
    {start: fiveNums[2], end: fiveNums[3]},
  ]
  const whiskers = [
    {start: min(values.filter(d => fences[1].start <= d)), end: fiveNums[1]},
    {start: max(values.filter(d => fences[3].end >= d)), end: fiveNums[3]},
  ]
  const points = values.map((d, i) => ({
    value: d,
    datum: data[i],
    outlier: d < fences[1].start || fences[3].end < d,
    farout: d < fences[0].start || fences[4].end < d,
  }))
  return {fiveNums, iqr, step, fences, boxes, whiskers, points}
}
