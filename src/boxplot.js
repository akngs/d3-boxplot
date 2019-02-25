import {quantile, min, max} from 'd3-array'
import {scaleLinear} from 'd3-scale'

export function boxplot() {
  const epsilon = 1e-6

  let vertical = false
  let scale = scaleLinear()
  let bandwidth = 20
  let boxwidth = 20
  let showInnerDots = true
  let opacity = .8
  let jitter = .2
  let key = undefined

  function boxplot(context) {
    const selection = context.selection ? context.selection() : context
    const rootTranslate = vertical ? [bandwidth * .5, 0] : [0, bandwidth * .5]

    let gWhisker = selection.select('g.whisker')
    if (gWhisker.empty()) gWhisker = selection.append('g').attr('class', 'whisker')
    gWhisker.attr('transform', `translate(${rootTranslate})`)

    let gBox = selection.select('g.box')
    if (gBox.empty()) gBox = selection.append('g').attr('class', 'box')
    gBox.attr('transform', `translate(${rootTranslate})`)

    let gPoint = selection.select('g.point')
    if (gPoint.empty()) gPoint = selection.append('g').attr('class', 'point')
    gPoint.attr('transform', `translate(${rootTranslate})`)

    let whisker = gWhisker.selectAll('path').data(d => d.whiskers)
    whisker = whisker.enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', 'currentColor')
      .attr('opacity', epsilon)
      .attr('d', whiskerPath)
      .merge(whisker)

    let box = gBox.selectAll('rect').data(d => d.boxes)
    box = box.enter().append('rect')
      .attr('fill', 'currentColor')
      .attr('stroke', 'none')
      .attr('opacity', epsilon)
      .attr(vertical ? 'y' : 'x', (d, i) => scale(d.start) + (i === 0 ? 0 : .5))
      .attr(vertical ? 'x' : 'y', -.5 * boxwidth)
      .attr(vertical ? 'height' : 'width', (d, i) => scale(d.end) - scale(d.start) - (i === 0 ? .5 : 0))
      .attr(vertical ? 'width' : 'height', boxwidth)
      .merge(box)

    let point = gPoint.selectAll('circle').data(d => showInnerDots ? d.points : d.points.filter(d2 => d2.outlier), d => key(d.datum))
    let pointExit = point.exit()
    point = point.enter().append('circle')
      .attr('fill', 'currentColor')
      .attr('stroke', 'none')
      .attr('opacity', epsilon)
      .attr('r', epsilon)
      .attr(vertical ? 'cx' : 'cy', d => jitter ? (Math.random() - .5) * (d.farout ? 0 : d.outlier ? .5 : 1) * jitter * bandwidth : 0)
      .attr(vertical ? 'cy' : 'cx', d => scale(d.value))
      .merge(point)
      .classed('outlier', d => d.outlier)
      .classed('farout', d => d.farout)

    if (context !== selection) {
      whisker = whisker.transition(context)
      box = box.transition(context)
      point = point.transition(context)
      pointExit = pointExit.transition(context)
    }

    whisker
      .attr('opacity', opacity)
      .attr('d', whiskerPath)
    box
      .attr('opacity', opacity)
      .attr(vertical ? 'y' : 'x', (d, i) => scale(d.start) + (i === 0 ? 0 : .5))
      .attr(vertical ? 'x' : 'y', -.5 * boxwidth)
      .attr(vertical ? 'height' : 'width', (d, i) => scale(d.end) - scale(d.start) - (i === 0 ? .5 : 0))
      .attr(vertical ? 'width' : 'height', boxwidth)
    point
      .attr('opacity', opacity)
      .attr('r', d => d.farout ? bandwidth * .15 : bandwidth * .1)
      .attr(vertical ? 'cx' : 'cy', d => jitter ? (Math.random() - .5) * (d.farout ? 0 : d.outlier ? .5 : 1) * jitter * bandwidth : 0)
      .attr(vertical ? 'cy' : 'cx', d => scale(d.value))
    pointExit
      .attr('opacity', epsilon)
      .attr('r', epsilon)
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

  function whiskerPath(d) {
    const s = scale(d.start), e = scale(d.end), w = boxwidth
    return vertical ?
      `M${[-.5 * w, s]} L${[.5 * w, s]} M${[0, s]} L${[0, e]}` :
      `M${[s, -.5 * w]} L${[s, .5 * w]} M${[s, 0]} L${[e, 0]}`
  }

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
  return {
    fiveNums,
    iqr,
    step,
    fences,
    boxes,
    whiskers,
    points,
  }
}
