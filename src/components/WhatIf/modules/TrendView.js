import * as d3 from 'd3';
import { SuperGroupView } from '@/utils/renderClass';
import { labelColor, eventBus } from '@/utils';
import store from '@/store';
import { SET_BRUSH_DATE } from '@/store/actionTypes';
import { Boundary } from './Boundary';

export default class TrendView extends SuperGroupView {
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

    this._xScale = undefined;
    this._selectStatus = false;   // 是否刷选的状态
  }

  /**
   * 添加原始数据，并转换为绘图数据
   */
  joinData(key, value) {
    this._rawData = value;

    const len = this._rawData.endTimeOutput.length;
    const dataFlat = new Array();
    for (let i = 0; i < len; i++) {
      dataFlat.push({
        endTimeOutput: this._rawData.endTimeOutput[i],
        no_flag: this._rawData.no_flag[i],
        good_flag: this._rawData.good_flag[i],
        bad_flag: this._rawData.bad_flag[i],
      })
    }
    this._stackData = d3.stack()
      .keys(this._key)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(dataFlat)

    return this;
  }

  render() {
    let maxValue = d3.max(
      this._rawData.good_flag,
      (d, i) => d + this._rawData.bad_flag[i] + this._rawData.no_flag[i]);

    this._container.selectChildren().remove();  // 先清空container
    this._container.append('rect')
      .attr('width', 1250)
      .attr('height', 90)
      .attr('fill', 'white')
      .attr('transform', `translate(${0, 0})`)

    const options = {
      width: this._viewWidth,
      height: this._viewHeight,
      yDomain: [0, maxValue],
      xDomain: this._rawData.endTimeOutput,
      colors: labelColor,
    }

    this.#areaChart(this._stackData, options);
    this.#renderStackBar(this._stackData, options);

    this.#buttonGroup();
    this.#updateThumbnail();
    return this;
  }

  updateXSelect(disDomain) {  // 提示gantt图显示的区域

    // console.log('这里运行了吗');
    if (!disDomain) return;

    // this._container.selectAll('.zoom-range')
    //   .data(paintData, d => d)
    //   .join(
    //     enter => enter.append('path')
    //       .attr('class', 'zoom-range')
    //       .attr('fill', '#666')
    //       .attr('d', Boundary.zoomDisArea({ width: 10, height: 10 })),
    //   )
    //   .attr('transform', (d, i) => `translate(${this._xScale(disDomain[i])}, ${tranY})`)

    // 更改样式
    const [good, bad, no] = this.#filterXSelectData(this._rawData, disDomain);
    const total = good + bad + no;
    const paintData = [Math.round(bad / total * 100), Math.round((good + no) / total * 100)];
    if (!this._selectStatus) {
      this.#renderXSelectBar(total, paintData, disDomain);
      this._selectStatus = true;
    } else {
      this.#updateXSelectBar(total, paintData, disDomain);
    }
  }


  //生成趋势柱状图，以及刷选交互
  #renderStackBar(data, {
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    marginTop = 0,
    marginRight = 0,
    marginBottom = 35,
    marginLeft = 0,
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yPadding = 0.1, // amount of y-range to reserve to separate bars
    colors = d3.schemeTableau10, // array of colors
  } = {}) {
    const that = this;
    const barGroup = this._container.append('g')    //柱状图在这个g里面
      .attr('class', 'trend-stack-bar-group')
      .attr('transform', `translate(${[marginLeft, marginTop]})`);

    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(yPadding);
    const yScale = d3.scaleLinear(yDomain, yRange);
    this._xScale = d3.scaleTime([new Date(xDomain[0]), new Date(xDomain[xDomain.length - 1])], xRange);

    const bar = barGroup
      .selectAll('.stack-bar')
      .data(data)
      .join('g')
      .attr('class', (_, i) => `stack-bar-${this._key[i]}`)
      .attr('class', (_, i) => 'stack-bar')
      .attr('fill', (_, i) => colors[i])
      .selectAll('.bar-rect')
      .data(d => d)
      .join('rect')
      .attr('class', 'bar-rect')
      .attr('x', (_, i) => xScale(xDomain[i]))
      .attr('y', ([y1, y2]) => Math.min(yScale(y1), yScale(y2)))
      .attr('height', ([y1, y2]) => Math.abs(yScale(y1) - yScale(y2)))
      .attr('width', xScale.bandwidth())
      .attr('opacity', 0.8)


    const brush = d3.brushX()
      .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
      .on('start brush', ({ selection }) => that.#brushing(selection, bar, xScale))
      .on('end', ({ selection }) => that.#brushEnd(selection, xDomain, xScale));

    barGroup.append('g')
      .attr('class', 'trend-brush')
      .call(brush)
    // .call(brush.move, [3, 5].map(x))
  }

  #brushing(selection, eles, xScale) {
    if (selection === null) {
      eles.attr('opacity', 0.2);
    } else {
      const computedOpacity = d => {
        let newX = xScale(d.data.endTimeOutput);
        return newX >= selection[0] && newX < selection[1];
      }
      eles.attr('opacity', d => computedOpacity(d) ? 1 : 0.2);
    }

    let brushGroup = this._container.select('.trend-brush');
    brushGroup.call(g => this.#brushHandle.call(this, g, selection));
  }

  #brushEnd(selection, xDomain, xScale) {
    if (selection === null) return;
    const brushRange = d3.filter(xDomain, d => {
      let x = xScale(d);
      return selection[0] <= x && x <= selection[1];
    })
    let newState = [brushRange[0], brushRange.slice(-1)[0]];
    store.dispatch(SET_BRUSH_DATE, newState);  // 派发修改state: 刷选的时间
  }

  #brushHandle(g, selection) {
    g.selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .join(
        enter => {
          enter.append("path")
            .attr("class", "handle--custom")
            .attr("fill", "#666")
            .attr("cursor", "ew-resize")
            .attr("d", (_, i) => Boundary.brush({
              width: 10,
              height: this._viewHeight - this._margin.top - this._margin.bottom - 15,
              direction: i === 0 ? 'left' : 'right'
            }))
        }
      )
      .attr("display", selection === null ? "none" : null)
      .attr("transform", selection === null ? null : (d, i) => `translate(${selection[i]},${this._margin.top - 10})`)
  }

  #filterXSelectData(_rawData, disDomain) {
    const [start, end] = disDomain.map(d => d.getTime());
    const len = _rawData.endTimeOutput.length;
    let good = 0, bad = 0, no = 0;
    for (let i = 0; i < len; i++) {
      const itemDate = new Date(_rawData.endTimeOutput[i]).getTime();
      if (itemDate >= start && itemDate <= end) {
        good += _rawData.good_flag[i];
        bad += _rawData.bad_flag[i];
        no += _rawData.no_flag[i];
      }
    }
    return [good, bad, no];
  }

  #renderXSelectBar(total, paintData, disDomain) {
    const width = 20;   // 小圆圈的尺寸
    const tranY = this._viewHeight - 8;

    // 中间的棍
    const rectHeight = width - 8;
    const rectWidth = this._xScale(disDomain[1]) - this._xScale(disDomain[0]);
    const linkGroup = this._container.append('g')
      .attr('class', 'link-group')
      .attr('transform', `translate(${this._xScale(disDomain[0]) - 40}, ${tranY - 16})`)
    linkGroup.append('rect')
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', '#ccc')
      .attr('stroke', d3.color('#ccc').darker(0.5))
      .attr('stroke-width', 1.5)
    const text = linkGroup.append('text')
      .attr('fill', 'white')
      .text(total)
    const { width: textW, height: textH } = text.node().getBBox();
    text.attr('transform', `translate(${[(rectWidth - textW) / 2, (rectHeight + textH) / 2 - 2]})`);

    // 两边的球
    const rangeGroup = this._container.selectAll('.zoom-range')
      .data(paintData)
      .join('g')
      .attr('class', 'zoom-range')
      .attr('transform', (_, i) => `translate(${this._xScale(disDomain[i]) - 40}, ${tranY - 20})`)
    rangeGroup.append('circle')
      .attr('r', width / 2)
      .attr('fill', (_, i) => labelColor[i])
      .attr('stroke', (_, i) => d3.color(labelColor[i]).darker(0.5))
      .attr('stroke-width', 1.5)
      .attr('transform', `translate(${[0, width / 2]})`)
    rangeGroup.append('text')
      .attr('class', 'range-text')
      .attr('fill', 'white')
      .text(d => d)
      .attr('transform', `translate(${[-7, (width + 12) / 2]})`)
  }

  #updateXSelectBar(total, paintData, disDomain) {
    const width = 22;   // 小圆圈的尺寸
    const tranY = this._viewHeight;
    const rectHeight = width;
    const rectWidth = this._xScale(disDomain[1]) - this._xScale(disDomain[0]);

    const linkGroup = this._container.select('.link-group');
    linkGroup.attr('transform', `translate(${this._xScale(disDomain[0])}, ${tranY + 8})`);
    linkGroup.select('rect').attr('width', rectWidth);
    const text = linkGroup.select('text')
    text.text(total);
    const { width: textW, height: textH } = text.node().getBBox();
    text.attr('transform', `translate(${[(rectWidth - textW) / 2, (rectHeight + textH) / 2 - 2 - 4]})`);

    const rangeGroup = this._container.selectAll('.zoom-range');
    rangeGroup.attr('transform', (_, i) => `translate(${this._xScale(disDomain[i])}, ${tranY + 4})`)
    this._container.selectAll('.range-text').text((_, i) => paintData[i]);
  }

  //缩略图
  thumbnail() {

    const distance = 18;

    const thumbnailBox = this._container.append('g')
      .attr('class', 'thumbnailBox')
      .attr('transform', `translate(${[this._viewWidth / 2, this._viewHeight - 30]})`)


    thumbnailBox
      .append('rect')
      .attr('transform', `translate(${[-distance / 2, 0]})`)
      .attr('class', 'background')
      .attr('fill', 'white')
      .attr('width', distance * 6)
      .attr('height', 15)

    thumbnailBox
      .append('rect')
      .attr('transform', `translate(${[-distance / 2, 0]})`)
      .attr('class', 'slider')
      .attr('fill', 'rgb(245, 245, 245)')
      .attr('stroke-width', 1)
      .attr('stroke', 'rgb(210, 210, 210)')
      .attr('width', distance * 3)
      .attr('height', 15)

    thumbnailBox.selectAll("circle")
      .data([0, 1, 2, 3, 4, 5])
      .join('circle')
      .attr('r', '2.5')
      .attr('opacity', (_, i) => {
        if (i < 3) {
          return 0.7
        }
        else {
          return 0.2
        }
      })
      .attr('transform', (_, i) => `translate(${[distance * i, 7.5]})`)

    thumbnailBox.on('mousewheel', thumbnailSlide)
    let position = 0; //记录g当前位置
    let curData = 0;

    function thumbnailSlide(event) {

      if (position == 0 && event.deltaY < 0) {
        thumbnailBox.select('.slider')
          .attr('transform', `translate(${[-distance / 2, 0]})`)
      }
      else if (position == 3 && event.deltaY > 0) {
        thumbnailBox.select('.slider')
          .attr('transform', `translate(${[-distance / 2 + distance * position, 0]})`)
      }
      else {
        thumbnailBox.select('.slider')
          .attr('bilibili', function (d, i) {
            if (event.deltaY > 0) {
              position = position + 1;
            }
            else {
              position = position - 1;
            }
          })
          .transition()
          .duration(200)
          .ease(d3.easeLinear)
          .attr('transform', `translate(${[-distance / 2 + distance * position, 0]})`)
      }

      if (curData != 0 && event.deltaY < 0) {
        curData = curData - 1;
      }
      else if (curData != 3 && event.deltaY > 0) {
        curData = curData + 1;
      }

      thumbnailBox.selectAll("circle")
        .transition()
        .duration(100)
        .ease(d3.easeLinear)
        .attr('opacity', (_, i) => {
          if (i >= curData && i <= curData + 2) {
            return 0.7
          }
          else {
            return 0.2
          }
        })

      console.log('curData', curData);
      eventBus.emit('发往Gantt', { data: curData });

      event.preventDefault();
    }

  }
  //缩略图更新
  #updateThumbnail() {
    const distance = 18;

    eventBus.on('发往Trend', (d) => {

      const thumbnailBox = d3.select('.thumbnailBox');
      let curArray = d.data;
      let length = curArray.length;

      thumbnailBox.select('.slider')
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .attr('width', distance * length)
        .attr('transform', `translate(${[-distance / 2 + distance * d.data[0], 0]})`)

      thumbnailBox.selectAll("circle")
        .transition()
        .duration(100)
        .ease(d3.easeLinear)
        .attr('opacity', (_, i) => {
          if (i >= curArray[0] && i <= curArray[length - 1]) {
            return 0.7
          }
          else {
            return 0.2
          }
        })
    })
  }

  #buttonGroup() {

    const that = this;

    const buttonsData = [
      { id: 'Bar', value: 1 },
      { id: 'Area', value: 2 }
    ];

    const buttonGroup = this._container.selectAll(".buttonsgroup")
      .data(buttonsData)
      .enter()
      .append("g")
      .attr('class', 'buttongroup')
      .attr('id', d => `${d.id}`)
      .attr("transform", (_, i) => `translate(${[1220, i * 25 + 15]})`)

    // 创建按钮
    const buttonsrect = buttonGroup.append("rect")
      .attr('id', d => `${d.id}`)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 15)
      .attr("fill", "white")
      .attr('stroke', '#94a7b7')
      .attr("rx", 5)
      .attr("ry", 5);

    const buttonstext = buttonGroup.append("text")
      .attr("x", 5)
      .attr("y", 10)
      .text(d => d.id)
      .attr("fill", "#94a7b7")
      .attr("font-size", 10)
      .attr("font-family", "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif")
      .attr("rx", 5)
      .attr("ry", 5);

    this._container.select('#Bar')
      .on('click', barChart)

    this._container.select('#Area')
      .on('click', areaChart)

    function barChart() {
      that._container.select('.trend-stack-area-group')
        .transition().duration(200).ease(d3.easeLinear)
        .attr('opacity', 0);
      that._container.select('.trend-stack-bar-group')
        .selectAll('.bar-rect')
        .transition().duration(200).ease(d3.easeLinear)
        .attr('opacity', 0.2)
    }

    function areaChart() {
      that._container.select('.trend-stack-bar-group')
        .selectAll('.bar-rect')
        .transition().duration(200).ease(d3.easeLinear)
        .attr('opacity', 0)
      that._container.select('.trend-stack-area-group')
        .transition().duration(200).ease(d3.easeLinear)
        .attr('opacity', 0.2)
    }

  }

  #areaChart(data, {
    width = 640, // outer width, in pixels
    height, // outer height, in pixels
    marginTop = 0,
    marginRight = 0,
    marginBottom = 35,
    marginLeft = 0,
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yPadding = 0.1, // amount of y-range to reserve to separate bars
    // colors = d3.schemeTableau10, // array of colors
  } = {}) {

    const xScale = d3.scaleTime([new Date(xDomain[0]), new Date(xDomain[xDomain.length - 1])], xRange);
    const yScale = d3.scaleLinear(yDomain, yRange);

    const series = this._stackData;

    const areaGroup = this._container.append('g')    //柱状图在这个g里面
      .attr('class', 'trend-stack-area-group')
      .attr('opacity', 0.0)
      .attr('transform', `translate(${[marginLeft, marginTop]})`);


    // 裁剪露出来的部分
    areaGroup.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 1200)
      .attr("height", 65);

    // 创建面积图
    const area = d3.area()
      .x(function (d) {
        return xScale(new Date(d.data.endTimeOutput));
      })
      .y0(function (d) { return yScale(d[0]); })
      .y1(function (d) { return yScale(d[1]); })
      .curve(d3.curveCardinal);

    const colors = d3.scaleOrdinal()
      .domain(['bad_flag', 'good_flag', 'no_flag'])
      .range(['#c65b24', '#94a7b7', '#71797e']);

    areaGroup.selectAll(".area")
      .data(series)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("d", area)
      // .attr('opacity', 1)
      .style("fill", function (d) { return colors(d.key); })
      .attr("clip-path", "url(#clip)");


  }

}