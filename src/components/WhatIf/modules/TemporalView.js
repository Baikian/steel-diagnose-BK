import * as d3 from "d3";
import * as echarts from 'echarts';
import Chart from "./chart.js";
import boxlinedata from './data.json';
// import sampleData from "../../../data/temporalChart.json"
import {
  SuperGroupView,
  labelColor,
  sortedIndex,
  bindElement,
  updateElement,
  translate,
  createElement,
  queryIcon,
  pinIcon,
  eventBus,
  getParentData,
  mergeColor,
  updateChildrenNodes,
  zoomIcon,
  createIcon
} from "@/utils";

import { checkProccess, checkProccess_2 } from './utils'

import { barView, labelName, riverView } from "./barView";
import mockdata from './mockData.json'


export default class TemporalView extends SuperGroupView {
  constructor({
    width,
    height,
    moveX = 0,
    moveY = 0,
  } = {}, parentNode, tooltipIns, rootName) {
    super({ width, height, moveX, moveY }, parentNode, rootName);
    this._rootName = rootName;
  }

  /**
   * 添加原始数据，并转换为绘图数据
   */
  joinData(key, data) {
    if (this._rawData === undefined) { //初始化
      //括号里的d代表数组里的每一个元素
      this._batchName = data.map(d => d.id);
      this._rawData = data.map(d => d.data);
      //issue 1：根据data自动计算label数量，并取得排序功能。
      this._labelName = labelName;
      console.log("initData", data)
    }
    else {  //更新数据
      // let newData = {};
      // for (let item in data) {
      //   newData[data[item].id] = data[item].data;
      // }
      // this.updateData(data.map(d => d.id), newData);
      // return this;
    }

    this._mergeStatus = false;
    this._batchDetails = {};
    this._upidDetails = {};
    this._mergeArray = [];
    this._mingap = 15;//bar最小宽度

    for (let item in this._batchName) {
      let key = this._batchName[item],
        datum = this._rawData[item];
      this._batchDetails[key] = {
        raw: datum,
        timeDomain: d3.extent(datum, d => new Date(d.toc)),
        //存upid的数组
        discreteDomain: datum.map(d => d.upid),
        oldXRange: [0, 0],
        xRange: [0, 0],
        xScale: null,
        //存upid的数组
        upid: datum.map(d => d.upid),
        width: datum.length * this._mingap
      };
      // console.log(datum)
      for (let index in datum) {
        // console.log(datum[index].upid)
        let obj = datum[index],
          // contq大小有什么含义？
          tqOrder = sortedIndex(obj.CONTQ, true),
          t2Order = sortedIndex(obj.CONTJ, true);
        this._upidDetails[obj.upid] = obj;
        obj.dimens = {};
        obj.one_dimens.forEach((d, i) => {
          obj.dimens[d.name] = d;
          d.tqOrder = tqOrder[i];
          d.CONTQ = obj.CONTQ[i];
          d.CONTJ = obj.CONTJ[i];
          d.t2Order = t2Order[i];
          d.upid = obj.upid;
          d.toc = obj.toc;
        })
      }
      this._mergeArray.push(this._batchDetails[key].width);
    }

    // console.log(this._batchDetails);
    // console.log(this._upidDetails);
    // console.log(this._mergeArray);

    this._labelDetails = {};

    for (let item in this._labelName) {
      this._labelDetails[this._labelName[item]] = {
        name: this._labelName[item],
        status: this._mergeStatus,
        value: Math.random(),
        order: item,
        y: this._viewHeight,
        yScale: null,
        pattern: "temporal"
      }
    }

    this._barInstances = {};
    this._riverInstances = {};

    this.#initSetting();
    this.reflow();
    this.render();

    return this;
  }


  //设置card的各种初始长宽高
  #initSetting() {
    this._barWidth = 300;
    this._temporalMargin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._temporalHeight = 90;
    this._temporalWidth = d3.sum(this._mergeArray);

    this._temporal_Height = this._temporalHeight + this._temporalMargin.top + this._temporalMargin.bottom;

    this._mergeMargin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._mergeHeight = 170;
    this._mergeWidth = d3.sum(this._mergeArray);

    this._merge_Height = this._mergeHeight + this._mergeMargin.top + this._mergeMargin.bottom;

    this._cardMargin = { top: 5, bottom: 5, left: 5, right: 5 };
    // this._cardWidth = this._barWidth + this._mergeWidth + this._cardMargin.left + this._cardMargin.right;
    this._cardWidth = 1140;

    this._chartMargin = 15;

    this._borderStyle = { color: "#b9bbbd", rx: 3, ry: 3 };

    this._cursorIndex = 0; //当前指标

    this._isDiscrete = true;
  }

  //计算布局
  reflow() { //
    //重新计算布局
    this._cardHeight = d => this._cardMargin.top + this._cardMargin.bottom
      + this._temporal_Height + (this._labelDetails[d].status ? this._merge_Height : 0);

    this.#getBatchParams();

    for (let key in this._labelDetails) {
      this._labelDetails[key].height = this._cardHeight(key)
    }


    // this._getInvisibleKeys();
    //根据value大小计算keys数组，再继续计算当前展示的this._currentKeys
    //也即value改变，指标的顺序也发生改变
    const LD = this._labelDetails;
    let keys = sortedIndex(this._labelName.map(d => LD[d].value), false),
      arr = [],
      end = this._viewHeight - this._margin.bottom;

    keys.forEach((d, i) => {
      const obj = LD[this._labelName[d]],
        prev = i > 0 ? LD[this._labelName[keys[i - 1]]] : 0;
      obj.oldy = obj.y;
      obj.order = i;
      obj.y = (i > 0 ? prev.y + prev.height : 0) + (i > 0 ? 1 : 0) * this._chartMargin;
    });
    let currIndex = this._labelName[keys[this._cursorIndex]];


    let amendment = LD[currIndex].y;  //y修正值
    keys.forEach((d, i) => {
      const obj = LD[this._labelName[d]];
      obj.y = obj.y - amendment;
      if (i >= this._cursorIndex && obj.y + obj.height < end) {
        arr.push(this._labelName[d])
      }
    })
    this._currentKeys = arr;

    this._currentKeys.forEach(d => {
      let arr = Object.values(this._upidDetails).map(e => e.dimens[d]).filter(d => d !== undefined);
      if (arr.length !== 0) {
        LD[d].yScale = d3.scaleLinear().range([0, this._mergeHeight])
          .domain(
            [d3.min([arr.map(d => d.value), arr.map(d => d.extremum_l)].flat()) * 0.95,
            d3.max([arr.map(d => d.value), arr.map(d => d.extremum_u)].flat()) * 1.05])
        // d3.extent([arr.map(d => d.value), arr.map(d => d.extremum_l), arr.map(d => d.extremum_u)].flat()))
      } else {
        LD[d].yScale = null;
      }

      if (this._riverInstances[d] === undefined) {
        this._riverInstances[d] = {}
      }
    });

    Object.keys(this._riverInstances).forEach(d => {
      if (this._currentKeys.indexOf(d) === -1) {
        delete this._riverInstances[d];
      }
    })

    console.log('batchDetails', this._batchDetails)
    // console.log('labelDetails', this._labelDetails)
    // console.log('labelName', this._labelName)
    // //下面这两个是对应的，现在的视图要显示的 
    // console.log('riverInstances', this._riverInstances)
    // console.log('currentKeys', this._currentKeys)
  }

  //计算布局时调用
  #getBatchParams() {
    //计算this._batchDetails内数据的
    let keys = Object.keys(this._batchDetails);
    let range = Array.from(d3.cumsum(keys.map((_, i) => this._mergeArray[i])));
    range.unshift(0);
    console.log('range', range);
    let rangeArray = d3.pairs(range);
    rangeArray.forEach((d, i) => {
      let singleData = this._batchDetails[keys[i]];
      singleData.oldXRange = singleData.xRange;
      singleData.xRange = d;
      singleData.width = d[1] - d[0];
      singleData.xScale = this._isDiscrete
        ? d3.scaleBand().range(d.map(e => e - d[0])).domain(singleData.discreteDomain)
          .paddingInner(0).paddingOuter(0).align(0.5)
        : d3.scaleLinear().range(d.map(e => e - d[0])).domain(singleData.timeDomain);
      singleData.xAccessor = this._isDiscrete ? e => e.upid : e => new Date(e.toc);
      singleData.step = this._isDiscrete ? singleData.xScale.step() : 0;
    })
  }

  render() {
    this._container.selectAll("*").remove();  // 先清空container

    this.#renderGroup();             //生成大框和背景，添加鼠标滑动事件
    this.#renderDefsG();             //添加阴影
    this.#renderSingleRow();         //生成单个指标内容


    eventBus.on('发往Gantt', (d) => {
      let position = -d.data;
      this._container
        .transition()
        .duration(400)
        .ease(d3.easeLinear)
        .attr('transform', `translate(${[position * 950, 15]})`)
    })

    return this;
  }

  // 生成cardgroup以及背景，监听鼠标滚轮事件并调用reRender更新
  #renderGroup() {
    this._cardGroup = this._container
      // .selectAll('g')
      // .data([0, 1, 2, 3, 4, 5])
      // .enter()
      .append("g")
      .attr("class", "cardGroup")
      .attr("transform", (_, i) => {
        return translate([30, 0])
      })
      // rect是诊断的背景
      .call(g => g.append("rect")
        .attr("stroke", "none")
        .attr("fill", "white")
        .attr("height", this._viewHeight - this._margin.top - this._margin.bottom)
        .attr("width", this._cardWidth))
      //鼠标滚轮事件，里面有reRender
      .on("wheel", e => {
        let n = this._cursorIndex;

        e.stopPropagation();
        e.preventDefault();

        if (n < this._labelName.length - 1 && n > 0) {
          this._cursorIndex += (e.deltaY > 0 ? 1 : -1);
        } else if (n == 0) {
          this._cursorIndex += (e.deltaY > 0 ? 1 : 0);
        } else if (n == this._labelName.length - 1) {
          this._cursorIndex += (e.deltaY > 0 ? 0 : -1);
        } else {
          return;
        }
        this.reRender();
      })

    // this.#renderButtonGroup()
  }

  //重新计算布局，在renderGroup滚轮事件中调用
  reRender() {
    this.reflow();
    this.#renderSingleRow();
  }

  // 阴影边框箭头复用？render里面调用了
  #renderDefsG() {
    const defsG = this._container.append("g")
      .attr("class", "defsG");
    defsG.append("defs")
      // 外面的框和阴影
      .call(g => g.append("filter")
        .attr("id", "card-shadow")
        .call(g => g.append("feDropShadow")
          .attr("dx", 0)
          .attr("dy", 0)
          .attr("stdDeviation", 2.5)
          .attr("flood-color", "#bfbdbd")))//#ededed
    // 里面的左边框和阴影
    // .call(g => g.append("filter")
    //   .attr("id", "batch-shadow")
    //   .call(g => g.append("feDropShadow")
    //     .attr("dx", 0)
    //     .attr("dy", 0)
    //     .attr("stdDeviation", 1)
    //     .attr("flood-color", "#bfbdbd")));//#ededed
    const markerBoxWidth = 5;
    const markerBoxHeight = 5;
    const refX = markerBoxWidth / 2;
    const refY = markerBoxHeight / 2;
    const markerWidth = markerBoxWidth / 2;
    const markerHeight = markerBoxHeight / 2;
    const arrowPoints = [[0, 0], [0, 5], [5, 2.5]];
    // 箭头
    defsG
      .call(g => g.append("defs")
        .append("marker")
        .attr("id", "shape-arrow")
        .attr("viewBox", [0, 0, markerBoxWidth, markerBoxHeight])
        .attr("refX", refX)
        .attr("refY", refY)
        .attr("markerWidth", markerBoxWidth)
        .attr("markerHeight", markerBoxHeight)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", d3.line()(arrowPoints))
        .attr("fill", labelColor[0])
        .attr("stroke", mergeColor[0]))
  }

  //生成指标card以及各种内容 更新 及退出动画，render和rerender里各调用一次
  #renderSingleRow({
    groupAttrs = {
      transform: d => translate([0, this._labelDetails[d].y]),
      class: "labelGroup",
      opacity: 1
    },
    updateGroupFunc = g => updateElement(g, groupAttrs),
    cardAttrs = {
      height: d => this._labelDetails[d].height,
      class: "outerBox",
      width: this._cardWidth,
      stroke: this._borderStyle.color,
      "stroke-width": 0.25,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#card-shadow)"
    },
    columnGroupAttrs = {
      transform: translate([this._cardMargin.left + 150, this._cardMargin.top]),
      height: d => this._labelDetails[d].height - this._cardMargin.top - this._cardMargin.bottom,
      class: "barBorder",
      width: this._barWidth - 110,
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    },
    circleGroupAttrs = {
      transform: translate([this._cardMargin.left, this._cardMargin.top]),
      height: d => this._labelDetails[d].height - this._cardMargin.top - this._cardMargin.bottom,
      class: "barBorder",
      width: this._barWidth - 160,
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    }
  } = {}) {
    // const t = d3.transition().duration(750);
    this._cardGroup.selectAll(".labelGroup").data(this._currentKeys, d => d)
      .join(
        enter => enter.append("g")
          .attr("transform", d => translate([0, this._labelDetails[d].oldy]))
          .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
          .call(tar => createElement(tar, "rect", cardAttrs))
          // .call(tar => createElement(tar, "rect", columnGroupAttrs))
          // .call(tar => createElement(tar, "rect", circleGroupAttrs))
          .call(tar => this.#lineChart(tar))
          // .call(tar => this.#columnChart(tar))
          .call(tar => this.#labelName(tar))
          .call(tar => this.#joinBatchElement(tar))
          // .call(tar => this.#joinBarElement(tar))
          .call(tar => this.#joinPinIcon(tar))
          .call(tar => this.#joinQueryIcon(tar)),
        update => update
          .transition().duration(500).ease(d3.easeLinear)
          .call(updateGroupFunc)
        // .call(tar => updateElement(tar.selectAll(".outerBox"), cardAttrs))
        // .call(tar => updateElement(tar.selectAll(".barBorder"), barGroupAttrs))
        ,
        exit => exit.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc).remove())
      // mouseenter事件，其他指标变透明，右上角icon显示出来
      .on("mouseenter", (e, d) => {
        let group = d3.select(e.target),
          zoom = group.selectAll(".zoomIcon"),
          pin = group.selectAll(".pinIcon"),
          func = g => g.attr("visibility", "visible")
            .transition().duration(250).ease(d3.easeLinear)
            .attr("transform", function () { return d3.select(this).attr("newY") });
        [zoom, pin].map(func);
        this._initMouseEvent({
          "label": d
        })
      })
      .on("mouseleave", (e, d) => {
        let group = d3.select(e.target),
          zoom = group.selectAll(".zoomIcon"),
          pin = group.selectAll(".pinIcon"),
          func = g => g
            .transition().duration(250).ease(d3.easeLinear)
            .attr("transform", function () { return d3.select(this).attr("oldY") })
            .transition().attr("visibility", "hidden");
        [zoom, pin].map(func);
        this._removeMouseEvent({
          label: d
        })
      })
  }

  //生成箭头
  #joinBatchElement(group,
    {
      context = this,
      groupAttrs = {
        transform: d => {
          return translate([this._batchDetails[d].xRange[0] + this._cardMargin.left + this._barWidth - 150, this._cardMargin.top])
        },
        class: function (d) { return `label_${getParentData(this, 1)} batch_${d} batchElement` }
      },
      updateGroupFunc = g => updateElement(g, groupAttrs),
      cardAttrs = {
        height: function () {
          return context._labelDetails[getParentData(this, 2)].height
            - context._cardMargin.top - context._cardMargin.bottom - 40
        },
        class: "renderBox",
        label: function () { return context._labelDetails[getParentData(this, 2)].height },
        width: d => this._batchDetails[d].width,
        stroke: this._borderStyle.color,
        "stroke-width": 0.01,
        fill: "white",
        rx: this._borderStyle.rx,
        ry: this._borderStyle.ry,
        filter: "url(#batch-shadow)"
      }
    } = {}) {
    // const key = group.data();
    console.log('batchName', this._batchName);
    group.selectAll(`.batchElement`).data(this._batchName, d => d)
      .join(
        enter => enter.append("g")
          .attr("transform", d => {
            // console.log('this._batchDetails[d]',this._batchDetails[d]);
            return translate([this._batchDetails[d].oldXRange[0], this._cardMargin.top]);
          })
          .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
          // .call(tar => createElement(tar, "rect", cardAttrs))
          .each(function (d) {
            let { width, height } = this.getBBox();

            let label = getParentData(this, 1), //getParentData(this, 1), getParentData(this, 0)
              indexDatum = context._labelDetails[label],
              batch = d,
              batchDatum = context._batchDetails[batch],
              lineDatum = batchDatum.upid.map(e => context._upidDetails[e].dimens[label]);

            context._riverInstances[label][batch] = new riverView({
              width,
              height,
              container: d3.select(this),
              xIndex: batch,
              yIndex: label,
              yScale: indexDatum.yScale,
              xScale: batchDatum.xScale,
              xAccessor: batchDatum.xAccessor,
              yAccessor: e => e.value,
              step: batchDatum.step,
              lineDatum: lineDatum,
              filterFunc: d => d.l > d.value || d.u < d.value, //d.extremum_l > d.value || d.extremum_u < d.value
              filterArr: [d => d.l > d.value && d.fqc_label !== 0, d => d.u < d.value && d.fqc_label !== 0],
              pattern: indexDatum.pattern
            }).render();
            // console.log(Object.keys(context._riverInstances), label)
          }),
        update => update.transition().duration(500).ease(d3.easeLinear)
          .call(updateGroupFunc)
          .call(tar => updateElement(tar.selectAll(".renderBox"), cardAttrs))
          .each(function (d) {
            let label = getParentData(this, 1),
              indexDatum = context._labelDetails[label],
              batch = d,
              batchDatum = context._batchDetails[batch],
              lineDatum = batchDatum.upid.map(e => context._upidDetails[e].dimens[label]);
            if (lineDatum.filter(d => d !== undefined).length === 0) return;
            context._riverInstances[label] && context._riverInstances[label][batch] && context._riverInstances[label][batch].updateRiver({
              xScale: context._batchDetails[batch].xScale,
              yScale: indexDatum.yScale,
              xAccessor: context._batchDetails[batch].xAccessor,
              step: context._batchDetails[batch].step,
              lineDatum: lineDatum,
              pattern: context._labelDetails[label].pattern
            })
          })
        ,
        exit => exit
          // .transition().duration(500).ease(d3.easeLinear)
          //   .call(updateGroupFunc)
          .remove()
      )
      .on("mouseenter", (e, d) => {
        this._initMouseEvent({
          "batch": d
        })
      })
      .on("mouseleave", (e, d) => {
        let target = e.target,
          i = getParentData(target, 1),
          j = d;
        this._removeMouseEvent({
          "batch": d,
        });
      })
  }

  //生成card左边的河流图
  #joinBarElement(group, {
    groupAttrs = {
      transform: translate([this._cardMargin.left + 350, this._cardMargin.top]),
      class: "barElement"
    },
    options = {
      width: this._barWidth - 10,
    },
    barGroupAttrs = {
      // transform: translate([this._cardMargin.left + 350, this._cardMargin.top]),
      height: d => this._labelDetails[d].height - this._cardMargin.top - this._cardMargin.bottom,
      class: "barBorder",
      width: this._barWidth - 10,
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    }
  } = {}) {
    let context = this;
    this._barInstances = {};
    group
      .append("g")
      .call(g => updateElement(g, groupAttrs))
      .call(tar => createElement(tar, "rect", barGroupAttrs))
      .each(function (d) {
        let datum = Object.values(context._upidDetails).filter(e => e.dimens[d] !== undefined);
        if (datum.length === 0) return;
        let arr = datum.map(e => e.dimens[d].value),
          data = d3.bin().thresholds(20)(arr),
          container = d3.select(this),
          xDomain = [data[0].x0, data[data.length - 1].x1],
          height = context._labelDetails[d].height - context._cardMargin.top - context._cardMargin.bottom,
          bad = d3.bin().thresholds(10)(datum.filter(e => e.fqc_label === 0).map(e => e.dimens[d].value)),
          good = d3.bin().thresholds(10)(datum.filter(e => e.fqc_label === 1).map(e => e.dimens[d].value));
        d3.select(this).call(g => updateElement(g, groupAttrs));
        context._barInstances[d] = new barView(Object.assign({
          container: container,
          data: [bad, good],
          status: d3.max(good, d => d.length) > d3.max(bad, d => d.length),//data number Boolen
          xDomain,
          height,
          color: mergeColor,
          opacity: [0.5, 0.8]
        }, options)).render()
      })
    // console.log(this._barInstances)
  }

  //生成箱线图
  #boxLineChart(group,
    {
      context = this,
      groupAttrs = {
        transform: d => {
          // console.log(d, this._batchDetails[d], this._batchName)
          return translate([this._cardMargin.left + 350, this._cardMargin.top + 120])
        },
        class: 'boxLine'
      },
      updateGroupFunc = g => updateElement(g, groupAttrs),
      cardAttrs = {
        height: function () {
          return 143;
        },
        label: function () { return context._labelDetails[getParentData(this, 2)].height },
        width: d => this._batchDetails[d].width + 300,
        stroke: this._borderStyle.color,
        "stroke-width": 0.01,
        fill: "white",
        rx: this._borderStyle.rx,
        ry: this._borderStyle.ry,
        filter: "url(#batch-shadow)"
      }
    } = {}) {

    group.selectAll(`.batchElement`).data(this._batchName, d => d)
      .join(
        enter => enter.append("g")
          .attr("transform", d => translate([this._batchDetails[d].oldXRange[0], this._cardMargin.top]))
          .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
          .call(tar => createElement(tar, "rect", cardAttrs))
          .call(tar => this.#joinBoxline(tar)),
        exit => exit
          // .transition().duration(500).ease(d3.easeLinear)
          //   .call(updateGroupFunc)
          .remove()
      )
      .on("mouseenter", (e, d) => {
        this._initMouseEvent({
          "batch": d
        })
      })
      .on("mouseleave", (e, d) => {
        let target = e.target,
          i = getParentData(target, 1),
          j = d;
        this._removeMouseEvent({
          "batch": d,
        });
      })
  }

  #joinBoxline(group) {

    const config = {
      barPadding: 0.4,
      barStroke: 'grey',
      margins: { top: 80, left: 80, bottom: 50, right: 80 },
      textColor: 'black',
      gridColor: 'gray',
      tickShowGrid: [200, 400, 600, 800, 1000],
      title: '基础盒须图'
    }
    let data = boxlinedata.data;

    data.forEach((item) => {
      item.values.sort((a, b) => a - b);
      item.Q1 = d3.quantile(item.values, 0.25);
      item.Q2 = d3.quantile(item.values, 0.5);
      item.Q3 = d3.quantile(item.values, 0.75);
      item.min = item.values[0];
      item.max = item.values[item.values.length - 1];
    });
    console.log('datadata', data);
    const scaleX = d3.scaleBand()
      .domain(data.map((d) => d.name))
      .range([100, 800])
      .padding(config.barPadding);

    const scaleY = d3.scaleLinear()
      .domain([(Math.floor(d3.min(data.map((d) => d.min)) / 100) - 1) * 100, (Math.floor(d3.max(data.map((d) => d.max)) / 100) + 1) * 100])
      .range([120, 20])

    let groups = group.selectAll('.g')
      .data(data);

    console.log('group是什么', groups);

    let groupsEnter = groups.enter()
      .append('g')
      .attr('class', 'g');

    groupsEnter.append('rect')
      .attr('fill-opacity', '0')
      .attr('stroke', config.barStroke);

    groupsEnter.each(function () {
      for (let i = 0; i < 2; i++) {
        d3.select(this).append('line')
          .attr('stroke', config.barStroke);
      }
    });

    let groupsUpdate = groupsEnter.merge(groups);

    groupsUpdate.selectAll('rect')      //绘制盒子矩形
      .attr('x', (d) => scaleX(d.name))
      .attr('y', (d) => scaleY(d.Q3))
      .attr('width', scaleX.bandwidth())
      .attr('height', (d) => scaleY(d.Q1) - scaleY(d.Q3));

    groupsUpdate.each(function (d) {       //绘制五条连接线
      let x1 = scaleX(d.name);
      let x2 = x1 + scaleX.bandwidth();
      let middle = (x1 + x2) / 2;

      let minLine = {
        x1: x1,
        y1: scaleY(d.min),
        x2: x2,
        y2: scaleY(d.min)
      };

      let linkLine1 = {
        x1: middle,
        y1: scaleY(d.Q3),
        x2: middle,
        y2: scaleY(d.min)
      };

      let lines = [minLine, linkLine1];

      d3.select(this)
        .selectAll('line')
        .each(function (d, i) {
          d3.select(this)
            .attr('x1', lines[i].x1)
            .attr('x2', lines[i].x2)
            .attr('y1', lines[i].y1)
            .attr('y2', lines[i].y2);
        });
    });

    let curveLine = d3.line()
      .x(function (d) {
        return scaleX(d.name);
      })
      .y(function (d) {
        return scaleY(d.max + 100);
      })
      .curve(d3.curveLinear);

    group.append("line")
      .attr("x1", 100)
      .attr("y1", 135)
      .attr("x2", 800)
      .attr("y2", 135)
      .attr("stroke", "black")
      .attr("stroke-width", '0.5');


    group.append("path")
      .datum(d => data)
      .attr("fill", "none")
      .attr("stroke", "rgb(227, 173, 146)")
      .attr("stroke-width", 1.5)
      .attr("d", curveLine)
      .attr('transform', translate([33, 25]));
    // groups.exit()
    //   .remove();

    group.insert('g', '.body')
      .attr('transform', translate([0, 120]))
      .attr('class', 'xAxis')
      .call(d3.axisBottom(scaleX))
      .selectAll("text")
      .attr("font-size", "0px");


    group.insert('g', '.body')
      .attr('transform', translate([100, 0]))
      .attr('class', 'yAxis')
      .call(d3.axisLeft(scaleY).ticks(5))
      .selectAll("text")
      .attr("font-size", "0px");

    group.append('rect')
      .attr('width', '300')
      .attr('height', '10')
      .attr('fill', 'rgb(227, 173, 146)')
      .attr('transform', translate([150, 130]))

    group.append('rect')
      .attr('width', '200')
      .attr('height', '10')
      .attr('fill', 'rgb(227, 173, 146)')
      .attr('transform', translate([500, 130]))

  }

  //生成折线图
  #lineChart(group,
    {
      context = this,
      mingap = this._mingap,
      groupAttrs = {
        transform: d => {
          return translate([this._batchDetails[d].xRange[0] + this._cardMargin.left + this._barWidth, 0])
        },
        class: function (d) { return `label_${getParentData(this, 1)} batch_${d} batchElement` }
      },
      updateGroupFunc = g => updateElement(g, groupAttrs),
    } = {}) {
    let width = 310,
      height = 90,
      padding = {
        top: 10,
        right: 40,
        bottom: 20,
        left: 40
      };

    const that = this;

    group.selectAll('.linebox').data(this._batchName, d => d)
      .join(
        enter => enter.append('g')
          .attr('class', 'lineBox')
          .attr("transform", d => {
            // console.log('this._batchDetails[d]', this._batchDetails[d]);
            return translate([this._batchDetails[d].oldXRange[0], 0]);
          })
          .call(enter => enter.transition().duration(500).ease(d3.easeLinear).call(updateGroupFunc))
          .each(function (d) {

            let xScale = that._batchDetails[d].xScale;

            let label = getParentData(this, 1), //getParentData(this, 1), getParentData(this, 0)
              indexDatum = context._labelDetails[label],
              batch = d,
              batchDatum = context._batchDetails[batch],
              lineDatum = batchDatum.upid.map(e => context._upidDetails[e].dimens[label]);
            if (lineDatum.filter(d => d !== undefined).length === 0) return;

            let lineBox = d3.select(this);
            // let xAxis = d3.axisBottom()
            //   .scale(xScale)
            //   .tickSize(5);

            // lineBox.append('g')
            //   .call(xAxis)
            //   .attr("transform", "translate(0," + (height - padding.bottom - 10) + ")")
            //   .selectAll("text")
            //   .attr("transform", translate([-50, 0]))
            //   .attr("font-size", "0px")
            //   .attr("dx", "50px");

            let extent = d3.extent(lineDatum, d => d.value);
            let limit = [lineDatum[0].l, lineDatum[0].u]
            const yDomain = [
              Math.min(...extent, ...limit),
              Math.max(...extent, ...limit)
            ];

            let yScale = d3.scaleLinear()
              .domain(yDomain)
              .range([height - padding.bottom, padding.top]);

            // let yAxis = d3.axisLeft()
            //   .scale(yScale)
            //   .ticks(4);

            // lineBox.append('g')
            //   .call(yAxis)
            //   .attr("transform", translate([0, 5]));

            //生成折线
            let curveline = d3.line()
              .x((e, f) => {
                return xScale(e.upid) + (f === lineDatum.length - 1 ? mingap : 0)
              })
              .y(e => yScale(e.value))
              // .curve(d3.curveCardinal.tension(0.3))(lineDatum)
              .curve(d3.curveCatmullRom.alpha(0.9))(lineDatum)

            lineBox.append("path")
              .datum(lineDatum)
              .attr('transform', translate([25, 0]))
              .attr("fill", "none")
              .attr("stroke", "rgb(179,89,104)")
              .attr("stroke-width", 2)
              .attr("d", curveline);

            //生成范围
            let limitarea = d3.area()
              .y0(e => yScale(e.l))
              .y1(e => yScale(e.u))
              .x((e, f) => xScale(e.upid) + (f === lineDatum.length - 1 ? mingap : 0))
              (lineDatum);

            lineBox.append("path")
              .datum(lineDatum)
              .attr('transform', translate([25, 0]))
              .attr('class', 'mergeArea')
              .attr('opacity', '0.2')
              .attr("fill", "steelblue")
              .attr("stroke", "none")
              .attr("d", limitarea);

            //生成圆圈
            lineBox.selectAll(".mergeCircle")
              .data(lineDatum.filter(d => d.l > d.value || d.u < d.value))
              .join("circle")
              // .attr('transform', translate([20, 0]))
              .attr('r', '3.5')
              .attr('class', 'mergeCircle')
              .attr('opacity', '1')
              .attr("fill", "rgb(221,181,188)")
              .attr("stroke-width", "1.5")
              .attr("stroke", 'rgb(137,63,75)')
              .attr('transform', d => translate([xScale(d.upid) + 25, yScale(d.value)]))
          })
      )
  }

  //南丁格尔图
  #nandinggeer(group) {

    // const data = [
    //   { name: "外包", value: 2500 },
    //   { name: "金融", value: 5054 },
    //   { name: "制造", value: 5120 },
    //   { name: "金融", value: 4754 },
    //   { name: "制造", value: 1120 },
    //   { name: "咨询", value: 6032 }
    // ];

    // let roseBox = group.append('g')
    //   .attr('transform', translate([this._cardMargin.left + 60, this._cardMargin.top + 35]))

    // const pieData = d3.pie()
    //   .value((d) => d.value)
    //   .sort((a, b) => a.value - b.value)(data);

    // const color = d3.scaleOrdinal(d3.schemeCategory10);

    // const allCount = data.reduce((pre, cur) => pre + cur.value, 0);

    // const roseArc = d3.arc()
    //   .innerRadius(0)
    //   .outerRadius((d) => {
    //     return (d.value / allCount) * 80 + 20;
    //   })
    //   .cornerRadius(2); // 圆角

    // const arcGroup = roseBox.append("g")
    //   .attr("transform", "translate(10, 10)")
    //   .selectAll("path")
    //   .data(pieData);

    // arcGroup.join("path")
    //   .attr("fill", 'rgb(227, 173, 146)')
    //   .attr('opacity', '0.6')
    //   .attr("d", roseArc);
  }

  #labelName(group) {

    const labelContainer = group.append('g')
      .attr('transform', `translate(${[15, 0]})`)
      .attr('class', 'labelContainer')


    //生成背景rect
    labelContainer.each(function () {
      const currLable = d3.select(this);
      currLable
        .append('rect');
    });

    //生成指标名字
    const textColor = { 'roll': '#8FA38B', 'heat': '#B09776', 'cool': '#7C8C99' } //轧制，加热，冷却
    labelContainer
      .append('text')
      .text(d => d)
      .attr('transform', `translate(${[30, 5]})`)
      .attr('fill', d => {
        const proccess = checkProccess_2(d)
        return textColor[proccess];
      })
      .attr('stroke', d => {
        const proccess = checkProccess_2(d)
        return textColor[proccess];
      })
      .attr('stroke-width', '0.25')
      .style('font-family', 'GillSans')
      .style('font-size', '14px')
      .style('font-style', 'italic')
      .style('text-anchor', 'start')
      .raise();

    //获得指标名字宽度，设置背景rect属性
    labelContainer.each(function () {
      const currLable = d3.select(this);
      const width = currLable.select('text').node().getComputedTextLength() + 10;
      currLable
        .select('rect')
        .attr('width', width)
        .attr('height', 20)
        .attr('fill', 'white')
        .attr('transform', `translate(${[25, -10]})`);
    });

    //图标图片及背景
    labelContainer
      .call(g =>
        g.append('rect')
          .attr('class', 'icon_background')
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('width', 24)
          .attr('height', 24)
          .attr('fill', 'white')
          .attr('stroke', '#D3B58D')
          .attr('stroke-width', 0.25)
          .attr('transform', `translate(${[0, -12]})`)
      )
      .call(g =>
        g.append('image')
          .attr('class', 'lable_icon')
          .attr('width', 18)
          .attr('height', 18)
          .attr('href', d => checkProccess(d))
          .attr('transform', `translate(${[3, -10]})`)
      )

  }

  //生成柱状图
  #columnChart(group) {
    let w = 130;
    let h = 100;
    let col_h = 10;
    let barPadding = 1;

    let dataset = [15, 20, 40, 80, 50];

    let columnBox = group.append('g')
      .attr('transform', translate([this._cardMargin.left, this._cardMargin.top]))

    columnBox.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr('fill', 'rgb(227, 173, 146)')
      .attr('opacity', '1')
      .attr("x", function (d, i) {
        return w - d;
      })
      .attr("y", function (d, i) {
        return i * (col_h + 3);
      })
      .attr("width", d => d)
      .attr("height", col_h);
  }

  //mouseenter则其他card变透明
  _initMouseEvent(options = {
  }) {
    if (options["label"] !== undefined) {
      this._container.selectAll(".labelGroup")
        .attr("opacity", f => options["label"] !== f ? 0.6 : 1);
    }
    if (options["batch"] !== undefined) {
      this._container.selectAll(".batchElement")
        .attr("opacity", f => options["batch"] !== f ? 0.6 : 1);
    }
  }

  _removeMouseEvent(options = {
  }) {
    if (options["label"] !== undefined) {
      d3.selectAll(".labelGroup")
        .attr("opacity", 1);
    }
    if (options["batch"] !== undefined) {
      d3.selectAll(".batchElement")
        .attr("opacity", 1);
    }
  }

  //添加右上角的三个按钮
  #joinQueryIcon(group, {
    iconAttrs = {
      transform: translate(this._cardWidth - 20, 0),
      class: "iconDetails queryIcon",
      cursor: "pointer",
      oldY: translate(this._cardWidth - 20, 0),
      newY: translate(this._cardWidth - 20, 0)
    },
    circleAttrs = {
      "fill": "white",
      "stroke": "black",
      "stroke-width": 0.25,
      "r": 10,
      "filter": "url(#card-shadow)"
    },
    queryAttrs = {
      "fill": "#53abe5",
      d: d => queryIcon[d],
    }
  } = {}) {
    const icon = createElement(group, "g", iconAttrs);
    icon
      .call(icon => createElement(icon, "circle", circleAttrs))
    icon.append("g")
      .attr("transform", "translate(-10, -10) scale(0.02)")
      .call(g => g.selectAll("path")
        .data([0, 1]).join("path")
        .call(g => updateElement(g, queryAttrs)))
    icon.on("click", (e, d) => {
      this._labelDetails[d].status = !this._labelDetails[d].status;
      this.reRender();
      const current = d3.select(e.target.parentNode.parentNode);
      if (this._labelDetails[d].status) {
        current.append('g')
          .call(g => this.#boxLineChart(g))
      }
      else {
        current.select('.boxLine')
          .remove();
      }
    })
  }

  #joinPinIcon(group, {
    iconAttrs = {
      transform: translate(this._cardWidth - 20, 0),
      class: "iconDetails pinIcon",
      cursor: "pointer",
      visibility: "hidden",
      oldY: translate(this._cardWidth - 20, 0),
      newY: translate(this._cardWidth - 50, 0)
    },
    circleAttrs = {
      "fill": "white",
      "stroke": "black",
      "stroke-width": 0.25,
      "r": 10,
      "filter": "url(#card-shadow)"
    },
    queryAttrs = {
      "fill": "#53abe5",
      d: pinIcon,
    },
    barGroupAttrs = {
      transform: translate([this._cardMargin.left + 350, this._cardMargin.top]),
      height: d => this._labelDetails[d].height - this._cardMargin.top - this._cardMargin.bottom,
      class: "barBorder",
      width: this._barWidth - 10,
      stroke: this._borderStyle.color,
      "stroke-width": 0.01,
      fill: "white",
      rx: this._borderStyle.rx,
      ry: this._borderStyle.ry,
      filter: "url(#batch-shadow)"
    }
  } = {}) {
    const icon = createElement(group, "g", iconAttrs);
    icon
      .call(icon => createElement(icon, "circle", circleAttrs))
    icon.append("g")
      .attr("transform", "translate(-5.5, -6.5) scale(0.013)")
      .append("path")
      .call(g => updateElement(g, queryAttrs))
    icon.on("click", (e, d) => {
      const current = d3.select(e.target.parentNode.parentNode);
      current.select('.lineBox')
        .remove();
      current
        .call(g => this.#joinBatchElement(g))
        .call(g => this.#joinBarElement(g))
        .call(g => this.#joinPinIcon(g))
        .call(g => this.#joinQueryIcon(g));
      // this._labelDetails[d].pattern = this._labelDetails[d].pattern === "river" ? "temporal" : "river";
      // this.#joinBatchElement(d3.selectAll(".labelGroup").filter(e => e === d))
    })
  }

  #renderButtonGroup({
    buttonAttrs = {
      color: "#303133",
      cursor: "pointer",
      rx: 5,
      ry: 5,
      "stroke-width": 0.5,
      height: 18,
      width: 40,
      stroke: "rgb(148, 167, 183)",
      fill: "white"
    },
    textAttrs = {
      x: 20,
      y: 12,
      cursor: "pointer",
      "font-size": "10px",
      "font-family": "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
      "text-anchor": "middle",
      fill: "#94a7b7"
    }
  } = {}) {
    this._container
      .call(g => g.append("g")
        .attr("transform", translate([0, 20]))
        .call(g => updateElement(g.append("rect"), buttonAttrs))
        .call(g => createElement(g, "text", textAttrs).text("sort"))
        .on("click", () => {
          for (let item in this._labelName) {
            this._labelDetails[this._labelName[item]] = {
              name: this._labelName[item],
              status: this._mergeStatus,
              value: Math.random(),
              order: item,
              y: this._viewHeight,
              yScale: null,
              pattern: "temporal"
            }
          }
          this.reRender();
        }))
  }
}