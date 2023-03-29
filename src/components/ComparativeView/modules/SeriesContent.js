import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColor,
} from '@/utils';

export default class SeriesContent extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);

    this._rootName = rootName;
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };

    this._innerR = 6;
    this._hoopinnerR = 14;
    this._hoopouterR = 20;

    this._good = null;     // 原始数据
    this._bad = null;
    this._noflag = null;
    this.circlecolor = ["#94a7b7", "#c65b24", "#71797e", "#BFBFBF"];
  }

  joinData(value) {
    this._good = value.good;
    this._bad = value.bad;
    this._noflag = value.noflag;
    this._match = value.match;

    return this;
  }

  render() {
    // 背景
    this._container.append('circle')
      .attr('class', 'beijing')
      .attr('r',  this._hoopouterR + 2)
      .attr('fill', 'white')
    
    //产量,内圈圆
    const ifmatch = this._match;
    this._container.append('circle')
      .attr('class', 'chanliang')
      .attr("fill", "#BFBFBF")
      .attr('r', this._innerR)
      .attr('opacity', (d) => {
        if (ifmatch == 0)
          return 0.7
        else
          return 1
      });

    const pie = d3.pie()([this._noflag, this._bad, this._good]);
    const outerPath = d3.arc().outerRadius(this._hoopouterR).innerRadius(this._hoopinnerR).padAngle(0.07);

    //质量，外圈环
    this._container.selectAll('orterArc')
      .data(pie)
      .join('path')
      .attr('class', 'outerArc')
      .attr("fill", function (d, i) {
        return labelColor[i];
      })
      .attr("d", outerPath)
      .attr('opacity', () => {
        if (ifmatch == 0)
          return 0.7;
        else
          return 1;
      });

    return this;
  }

}