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

  joinData(value) {
    this._rawData = value;


    return this;
  }

  render() {

    const r = 4;
    const colorGroup_s ={
      'good': '#94a7b7',
      'bad': '#c65b24',
      'no': '#71797e'
    }

    const colorGroup ={
      'good': '#B1BFCB',
      'bad': '#DF7E4D',
      'no': '#8E959A'
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
      .attr('stroke', colorGroup_s[maxKey])
      .attr('stroke-width', 1)
      .attr('opacity', 1)

    return this;
  }
}