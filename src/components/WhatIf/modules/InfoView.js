import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColorMap,
  GillSans,   // 字体
  SegoeUI,
} from '@/utils';

import {
  infoTarget,
  infoTargetMap,
} from './utils';

export default class InfoView extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, tooltipIns, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);

    this._rootName = rootName;
    this._key = ['bad_flag', 'good_flag', 'no_flag'];
    this._tooltip = tooltipIns;
    this._margin = { top: 0, bottom: 0, left: 0, right: 0 };
    this._width = width;
    this._height = height;
    this._xScale = undefined; // 大横轴的比例尺
    this._offset = undefined; // 规格信息group相对于gantt的偏移量
    this._rawData = undefined;  // 原始数据
    this._extent = undefined;   // 规格范围
  }

  joinData(value, extent) {
    this._rawData = value;
    this._extent = extent;
    return this;
  }

  render() {
    this.#renderBackground();
    this.#renderInfoContent({
      xDomain: [0, 1],
      yDomain: infoTarget,
      // colors: ['#cbdcea', '#999', d3.color('#cbdcea').darker(1)], // 填充, 边框, 文字
      colors: ['#cbdcea', '#999', d3.color('#cbdcea').darker(1)], // 填充, 边框, 文字
    });
    this.#productionLine();
    return this;
  }

  #renderBackground() {
    //框
    this._container.append('rect')
      .attr('width', this._viewWidth)
      .attr('height', this._viewHeight)
      // .attr('stroke', this._rawData.color)
      .attr('stroke', "#7C8C99")
      .attr('stroke-width', 2)
      .attr("stroke-opacity", 0.4)
      .attr('fill', 'white')

    //钢种text
    this._container.append('text')
      // .attr('x', 0)
      // .attr('y', 18)
      // .text(this._rawData.id)
      .text(d => {
        const newId = [];
        const length = this._rawData.id.length;
        for (let i = 2; i < length; i++) {
          if (i > 6)
            break;
          else
            newId.push(this._rawData.id[i]);
        }
        // console.log('newId', newId);
        return newId.join("");
        // return 333;
      })
      .attr('transform', `translate(${[15, 18]})`)
      .attr("fill", "#94a7b7")
      .style("font-family", "GillSans")
      .style("font-size", "12")
      .style("font-weight", 'normal')
    // .style('text-anchor', 'middle')

    //中间的横线
    this._container.append('line')
      .attr('transform', `translate(${[0, 25]})`)
      .attr('x1', 15)
      .attr('x2', 75)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5)

  }

  #renderInfoContent({
    width = 90,
    height = 90,
    marginTop = 35,
    marginRight = 10,
    marginBottom = 10,
    marginLeft = 25,
    yDomain,
    yRange = [0, height - marginTop - marginBottom + 5],
    // yRange = [0, 50],
    xDomain,
    xRange = [0, width - marginLeft - marginRight - 15],
    yPadding = 0.35,
    colors = ['blue', 'black', 'red'], // 填充, 边框, 文字
  } = {}) {
    const fontSize = 11;
    const strokeWidth = 0.8;
    const xScale = d3.scaleLinear(xDomain, xRange);
    const yScale = d3.scaleBand(yDomain, yRange).paddingInner(yPadding).paddingOuter(0.15);
    const yAxis = d3.axisLeft(yScale)
      .tickSizeOuter(0)
      .tickFormat(d => infoTargetMap[d].name);
    const data = infoTarget.map(d => {
      return {
        target: d,
        value: this._rawData.infoData[d],
      }
    });

    //长宽高详细信息
    const barGroup = this._container.append('g')
      .attr('class', 'target-content')
      .attr('transform', `translate(${[marginLeft, marginTop]})`)
      .style('font-size', fontSize)
      .style('font-family', GillSans)
      .style('font-weight', 'normal')
      .style('font-style', 'normal')
      .style('text-anchor', 'middle');

    //右边的三个横条
    barGroup
      .selectAll('.barChart')
      .data(data)
      .join('g')
      .call(g => g.append('rect')
        .attr('x', strokeWidth / 2 + 8)
        .attr('y', d => yScale(d.target) - 3)
        .attr('width', d => xScale(1))
        .attr('height', yScale.bandwidth())
        .attr('fill', 'white')
        .attr('stroke', colors[1])
        .attr('stroke-width', strokeWidth))
      .call(g => g.append('rect')
        .attr('x', strokeWidth / 2 + 8)
        .attr('y', d => yScale(d.target) + strokeWidth / 2 - 3)
        .attr('width', d => xScale(d.value))
        .attr('height', yScale.bandwidth() - strokeWidth)
        .attr('fill', colors[0]))
      .call(g => g.append('text')
        .text(d => `${(d.value * this._extent[d.target][1]).toFixed(2)} ${infoTargetMap[d.target].unit}`)
        .attr('x', xScale(1) / 2 + 8)
        .attr('y', d => yScale(d.target) + (yScale.bandwidth() + fontSize) / 2 - 5)
        .attr('font-size', 9)
        .style("font-family", GillSans)
        .style('font-weight', 'normal')
        .style('font-style', 'normal')
        .attr('text-anchor', 'middle')
        .attr('fill', d3.color('#cbdcea').darker(1)))

    //左边的轴
    barGroup.append('g')
      .attr('transform', `translate(${[-strokeWidth + 8, -3]})`)
      .style("font-family", GillSans)
      .style("font-size", 8)
      .style("font-weight", 'normal')
      .style("color", '#999')
      .call(yAxis)
  }

  #productionLine() {

    //计算画产量线的各个参数
    const initH = -70;
    const numScale = d3.scaleLinear().domain([0, 500]).range([0, 10]);
    const prevH = this._rawData.prevH;
    const curH = this._rawData.curH;
    const curX = this._width / 2 - this._width / 2 * (-initH - prevH - curH) / (-initH - prevH - curH / 2);
    const Y1 = 2 * curX * (-initH - prevH - curH / 2) / this._width / 2;

    let prevData = [
      { x: -10, y0: initH + prevH, y1: initH },
      { x: 100, y0: initH + prevH, y1: initH }
    ];

    let curData = [
      { x: this._width / 2 - curX - 0, y0: 0, y1: 0 },
      { x: this._width / 2 + curX + 0, y0: 0, y1: -Y1 * 3.5 },
      { x: this._width + 10, y0: initH + prevH + curH, y1: initH + prevH }
    ];

    const area = d3.area()
      .x(d => d.x)
      .y0(d => d.y0)
      .y1(d => d.y1);

    //横线
    this._container.append("path")
      .datum(prevData)
      .attr("class", "prev")
      .attr("d", area);

    //斜线
    this._container.append("path")
      .datum(curData)
      .attr("class", "prev")
      .attr("d", area);


    //后续建议改成一个g包裹住
    this._container.append('rect')
      .style("fill", "rgb(111,111,111)")
      .attr('x', 103)
      .attr('y', -45)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('height', 30)
      .attr('width', 60)


    const vertices = [[100, -30], [103, -34], [103, -26]],
      fontSize = `9px`,
      fontFamily = GillSans;

    // 创建一个SVG路径元素，使用三角形的顶点坐标来定义路径
    this._container.append("path")
      .attr("d", "M" + vertices.join("L") + "Z")
      .style("fill", "rgb(111,111,111)");

    this._container.append("text")
      .text(d => {
        return `Bad. ${this._rawData.bad_flag}`;
      })
      .attr('x', 107)
      .attr('y', -35)
      .attr('fill', 'white')
      .style('font-family', fontFamily)
      .style('font-size', fontSize)
      .style('font-style', 'normal')


    //

    const data = [
      { x: 140, y: -31},
      { x: 150, y: -40}
    ];

    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    this._container.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('d', line);


    this._container.append('rect')
      .style("fill", "white")
      .attr('x', 107)
      .attr('y', -32)
      .attr('height', 1)
      .attr('width', 33)

    this._container.append("text")
      .text(d => {
        return `Good.${this._rawData.good_flag}`;
      })
      .attr('x', 107)
      .attr('y', -20)
      .attr('fill', 'white')
      .style('font-family', fontFamily)
      .style('font-size', fontSize)
      .style('font-style', 'normal')

    //圆环   
    const random = Math.random();
    const pie = d3.pie()([this._rawData.good_flag, this._rawData.bad_flag, this._rawData.no_flag]);
    const outerPath = d3.arc().outerRadius(8).innerRadius(4).padAngle(0.09);
    const labelColor = ['#94a7b7', '#c65b24', '#71797e'];
    // const labelColor = ['#c65b24', '#94a7b7', '#71797e']; // [bad, good, noflag]
    this._container.selectAll('orterArc')
      .data(pie)
      .join('path')
      .attr('transform', `translate(${[153, -30]})`)
      .attr("fill", function (d, i) {
        return labelColor[i];
      })
      .attr("d", outerPath)
      .attr('opacity', 0.8);

  }
}