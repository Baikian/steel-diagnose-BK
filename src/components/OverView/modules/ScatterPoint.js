import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColor,
} from '@/utils';

export default class ScatterPoint extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);

    this._rootName = rootName;
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };

    this._rawData = null;     // 原始数据
    this._rScale = null;      // 半径标尺
  }

  joinData(value, rScale) {
    this._rawData = value;
    this._rScale = rScale;

    return this;
  }

  render() {
    // const data = this._rawData;
    // const r = this._viewWidth / 3;
    // const pie = d3.pie()([data.bad, data.good, data.no]);
    // const path = d3.arc().outerRadius(r).innerRadius(r - r * 0.382 * 0.7).padAngle(0.05);

    // // 背景
    // this._container.append('circle')
    //   .attr('r', r)
    //   .attr('fill', 'white')
    //   .attr('opacity', 0.8)

    // //圆环
    // const arcGroup = this._container.selectAll('.arc')
    //   .data(pie)
    //   .join('path')
    //   .attr('d', path)
    //   .attr('fill', (_, i) => labelColor[i])

    // //内圈圆
    // this._rScale.range([3, r * 0.618 * 0.7]);   // 重置 rScale
    // this._container.append('circle')
    //   .attr('r', this._rScale(data.details.production_rhythm))
    //   .attr('fill', '#aaa')

    const r = 1.5;
    const colorGroup ={
      'good': '#94a7b7',
      'bad': '#c65b24',
      'no': '#71797e'
    }

    const flagGroup = {
      'good': this._rawData.good,
      'bad': this._rawData.bad,
      'no': this._rawData.no
    }

    let maxKey = '';
    let maxValue = -Infinity;

    for (let key in flagGroup) {
      if (flagGroup[key] > maxValue) {
        maxValue = flagGroup[key];
        maxKey = key;
      }
    }


    this._container.append('circle')
      .attr('r', r)
      .attr('fill', colorGroup[maxKey])
      .attr('stroke', colorGroup[maxKey])
      .attr('stroke-width', 0.25)
      .attr('opacity', 0.3)

    return this;
  }
}