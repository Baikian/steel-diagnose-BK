import * as d3 from 'd3';
import {
  SuperGroupView,
  labelColor,
  labelColorMap,
  getColor,
  eventBus,
  debounce,
} from '@/utils';
import { Boundary } from './Boundary';
import InfoView from './InfoView';
import { MOVE_GANTT } from '../main';
import {
  getTransformFromXScales,
  getBatchDisplayInfoData,
  getBatchDisplayInfoData_2,
  getDispalyDiagnosisData,
  allInfoData,
  comeFromRight,
} from './utils';
import { group } from 'd3';
import leanerIcon from "../../../assets/images/leanerIcon_opera.svg"
import ACCIcon from '../../../assets/images/ACCIcon.svg'
import DQIcon from '../../../assets/images/DQIcon.svg'
import FmTotalIcon from '../../../assets/images/FmTotalIcon.svg'

export default class GanttView extends SuperGroupView {
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
    this._margin = { top: 50, bottom: 10, left: 10, right: 10 };
    this._rawData = undefined;    // 原始数据
    this._infoData = undefined;   // 全部批次的规格绘图数据
    this._infoExtent = undefined; // 规格范围
    this._xScale = null;
    this._displayScale = null;
    this._infoDataGroup = [];
    this._curInfoData = [];
    this._currentKeys = [];
    this._width = width;
    this._height = height;
    this._curIndex = []

    this._batchDisplayMap = new Map();  // 储存显示的图元实例
    this._batchDisplayDat = new Map();  // 储存需要显示的数据
    this._offsetMap = undefined;        // 计算规格视图图元的偏移量

    this._batchWidth = [];
    this._batchPositon = [];

    this._instanceKey = [];
    this._ganttHeight = 3;
  }

  // 添加原始数据，并转换为绘图数据
  //传进来的是 GANTT  和接口取到的数据
  joinData(key, value) {
    // console.log('value', value);
    this._rawData = value;
    this._rawData.sort((a, b) => {
      let ta = new Date(a.startTime).getTime();
      let tb = new Date(b.startTime).getTime();
      return ta - tb;
    });
    let result = allInfoData(this._rawData);
    //每个规格的信息，包含起止时间，批次号，板坯号，详细upid，规格平均长宽高等
    this._infoData = result.data;

    console.log('result', result);
    //所有规格的长宽高范围
    this._infoExtent = result.extent;

    //将this._infoData分组，用来在批次框内画规格图元
    let arr = [];
    let index = 1;
    this._infoData.forEach((d, i) => {
      if (d.batch == index) {
        arr.push(d);
      }
      else {
        this._infoDataGroup.push(arr);
        arr = [];
        arr.push(d);
        index = index + 1;
      }
    })
    this._infoDataGroup.push(arr);
    this._infoDataGroup.forEach((_, i) => {
      this._curIndex[i] = 0;
    })


    this._yieldGroup =
      this._infoDataGroup.map(d => d.map(e => e.detail.length)).map(d => {
        const Object = {};
        Object.cateSum = d.length;
        Object.domain = d3.extent(d);
        return Object;
      })
    console.log('this._yieldGroup', this._yieldGroup);

    const cateDomain = d3.extent(this._infoDataGroup.map(d => d.length))
    const yieldsumScale = d3.scaleLinear().domain(cateDomain).range([6, 8]);
    this._yieldGroup.forEach(d => {
      d.scaleH = d3.scaleLinear().domain([1, d.cateSum]).range([3, yieldsumScale(d.cateSum)]);
    })
    this._yieldGroup.forEach(d => {
      d.scaleW = d3.scaleLinear().domain(d.domain).range([2, 3]);
    })

    const numScale = d3.scaleLinear().domain([0, 500]).range([3, 5]);
    this._infoDataGroup.forEach((d, i) => {
      let num = 0;
      for (let item in d) {
        if (item == 0) {
          d[item].prevH = 0;
          d[item].curH = numScale(d[item].detail.length);
          d[item].prevNum = 0;
          d[item].curNum = d[item].detail.length;
          d[item].sumNum = 1;
        }
        else {
          d[item].prevH = d[item - 1].prevH + d[item - 1].curH - 1;
          d[item].curH = numScale(d[item].detail.length);
          d[item].prevNum = d[item - 1].prevNum + d[item - 1].curNum;
          d[item].curNum = d[item].detail.length;
          d[item].sumNum = d[item - 1].sumNum + 1;
        }
      }
    })

    // console.log('this._rawData', this._rawData);
    console.log('this._infoDataGroup', this._infoDataGroup);

    let len = this._rawData.length;
    let xDomain = d3.extent(this._rawData, (d, i) => {
      return i < len - 1 ? new Date(d.startTime) : new Date(d.endTime);
    });
    let xRange = [this._margin.left, this._viewWidth - this._margin.right];
    this._xScale = d3.scaleTime(xDomain, xRange);
    return this;
  }

  // 绘制内容
  render() {
    // console.log('绘制甘特图', this)
    // console.log('数据:', this._rawData);

    //this._container 父元素内建的g



    const that = this;
    // this._container.attr('transform', `translate(${[moveX, moveY]})`);
    this._container.selectChildren('*').remove();

    const xDomain = this._xScale.domain();
    const timeSpan = (xDomain[1].getTime() - xDomain[0].getTime()) * 0.3;
    const xMock = this._xScale.copy().domain([new Date(xDomain[0].getTime() + timeSpan), new Date(xDomain[1].getTime() - timeSpan)]);
    this._displayScale = xMock;

    //跨试图交互，传递给trend视图
    this.#updateOtherInstance();
    // this.#renderZoom(xMock);

    //生成批次
    let batchWidth = [];
    this.#batchWidth(batchWidth);
    let batchPosition = [];
    this.#batchPosition(batchWidth, batchPosition);
    this._batchWidth = batchWidth;
    this._batchPositon = batchPosition;
    console.log('this._batchPositon', this._batchPositon);

    this._infoDataGroup.forEach((d, i) => {
      for (let item in d) {
        d[item].oldX = item * 110 + 10;
        if (item >= this._curIndex[i] && item < this._curIndex[i] + batchWidth[i] / 110) {
          d[item].X = item * 110 + 10;
        }
      }
    })

    this._infoDataGroup.forEach((d, i) => {
      let arr = [];
      for (let item in d) {
        if (item < this._curIndex[i] + batchWidth[i] / 110) {
          arr.push({
            key: i,
            data: item
          })
        }
      }
      this._currentKeys.push(arr);
    })
    // console.log('_infoDataGroup', this._infoDataGroup);
    // console.log('this._currentKeys', this._currentKeys);



    this._container.append('rect')
      .attr('width', 2000)
      .attr('height', this._height - 50)
      .attr('fill', 'white')
      .attr('transform', `translate(${0}, ${this._margin.top - 23})`)


    const ganttBatch = this._container.selectAll('.ganttBatch')
      .data(this._currentKeys, d => d.data)
      .join(enter => enter.append('g')
        .attr('class', (d, i) => `ganttBatch`)
        .attr('id', (_, i) => i)
        .attr('transform', (_, i) => `translate(${batchPosition[i]}, ${this._margin.top + 5})`)
        // .attr('transform', translate([0, 0]))
        .call(g => this.#batchBoundary(g, batchWidth, batchPosition))  // 批次边界
        .call(g => this.#ganttContent(g))
        //批次内滑动
        .on("wheel", function (e) {

          e.stopPropagation();
          e.preventDefault();

          //当前批次的i,显示的规格数量，绑定的数据
          const curID = d3.select(this).attr('id');
          const curNum = batchWidth[curID] / 110;
          const curData = that._infoDataGroup[curID];

          if (that._curIndex[curID] + curNum < curData.length && e.deltaY > 0) {
            that._curIndex[curID] += 1;
          }
          else if (that._curIndex[curID] > 0 && e.deltaY < 0) {
            that._curIndex[curID] += -1;
          }

          that._curInfoData[curID] = [];
          that._currentKeys[curID] = [];

          let movex = 10;
          let i = 0;

          for (let item in that._infoDataGroup[curID]) {
            if (item >= that._curIndex[curID] && item < that._curIndex[curID] + batchWidth[curID] / 110) {
              that._currentKeys[curID].push({
                key: Number(curID),
                data: item
              });
              that._infoDataGroup[curID][item].X = i * 110 + 10;
              i = i + 1;
            }


          }
          that.#updateContent(d3.select(this), that._currentKeys[curID], e.deltaY, batchWidth)
        })
        .on('mouseover', function (e) {
          let id = Number(d3.select(this).attr('id'));
          console.log('id', id);
          d3.selectAll('.ganttBatch')
            .attr('opacity', (d, i) => {
              if (i = id) {
                return 1;
              } else {
                return 0.5;
              }
            })
        })
        .on('mouseout', function (e) {
        
        })
      )

    this.#ganttEvent();
    //实现gantt图滑动
    this._container.on('mousewheel', batchSlide)
    let position = 0; //记录g当前位置
    let oldArray = [0, 1, 2];

    function batchSlide(event) {
      // this._batchWidth = [];
      // this._batchPositon = [];
      let length = that._batchWidth.length;
      const current_g = d3.select(this);
      // console.log('current_g', current_g);
      const currentWidth = that._batchPositon[length - 1] + that._batchWidth[length - 1] + 10;
      const rightBorder = -(currentWidth);
      if (position >= 0 && event.deltaY < 0) {
        current_g
          .attr('transform', `translate(${[0, 70]})`)
      }
      else if (position <= rightBorder && event.deltaY > 0) {
        current_g
          .transition()
          .duration(15)
          .attr('transform', `translate(${[rightBorder, 70]})`)
      }
      else {
        //position= position+ event.deltaY / 5;
        current_g
          .attr('bilibili', function (d, i) {
            position = position - event.deltaY;
          })
          .transition()
          .duration(200)
          .ease(d3.easeLinear)
          .attr('transform', `translate(${[position, 70]})`)
      }
      console.log('position', position);
      let curArray = new Array();
      that._batchPositon.forEach((d, i) => {
        let curPosition = d + position;
        if (curPosition >= 0 && curPosition < that._width) {
          curArray.push(i);
        }
      })
      if (oldArray.toString() !== curArray.toString()) {
        eventBus.emit('发往Trend', { data: curArray });
        oldArray = curArray;
      }

      event.preventDefault(); //组织默认事件，防止页面随滚轮上下滚动
    }

    eventBus.on('发往Gantt', (d) => {
      let position = -this._batchPositon[d.data]
      const current_g = d3.select('#gantt-view-root');

      current_g
        .transition()
        .duration(400)
        .ease(d3.easeLinear)
        .attr('transform', `translate(${[position + 8, 70]})`)
    })

    return this;
  }

  //事件带
  #ganttEvent() {
    //图元大小
    const cx = 17;
    const bandHeight = 30;

    const event_g = this._container.append('g')
      .attr('class', 'event_g')
      .attr('transform', `translate(${0}, ${this._margin.top - 30})`)

    //背景，灰色带
    event_g.append('rect')
      .attr('class', 'eventRect')
      .attr('width', 2000)
      .attr('height', bandHeight)
      .attr('fill', 'rgb(246,244,240)')

    //图标
    const iconGroup = event_g.selectAll('ACCEventIcon')
      .data(this._currentKeys)
      .enter()
      .append('g')
      .attr('class', 'ACCEventIcon')
      .attr('transform', (_, i) => `translate(${[this._batchPositon[i] + 10, bandHeight / 2]})`)

    this._renderIcon(iconGroup, cx, ACCIcon);
  }

  //批次边框
  #batchBoundary(group, batchWidth, positionarray) {

    const width = 10;
    const height = width;

    group.append('rect')
      .attr('class', 'batchFrame')
      .attr('stroke', "#7C8C99")
      .attr('stroke-width', 3)
      .attr('fill', 'white')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d, i) => {
        return batchWidth[i];
      })
      .attr('height', 175)

    group.append('rect')
      .attr('class', 'batchFrame-top')
      .attr('fill', 'white')
      .attr('x', (d, i) => {
        return 30;
      })
      .attr('y', -2)
      .attr('width', 70)
      .attr('height', 5)
      .attr('width', (d, i) => {
        return batchWidth[i];
      })


    // group.append('rect')
    //   .attr('class', 'shelter')
    //   // .attr('stroke', "#7C8C99")
    //   // .attr('stroke-width', 3)
    //   .attr('fill', 'white')
    //   .attr('x', -9)
    //   .attr('y', -3)
    //   .attr('width', '8')
    //   .attr('height', '180')

    // group.attr('fill', '#7C8C99')

    // group.append('path')
    //   .attr('class', 'batch-boundary')
    //   .attr('transform', (d, i) => `translate(0, 0)`)
    //   .attr('d', Boundary.batch({ width, height }))
  }

  #ganttContent(group) {
    const that = this;
    const transY = 70;  // 规格信息group起始高度
    const infoW = 90;
    const infoH = 90;

    function updateGroupFunc(enter) {
      enter
        .transition().duration(500).ease(d3.easeLinear)
        .attr('transform', d => `translate(${[that._infoDataGroup[d.key][d.data].X, transY]})`)
    }

    group.selectAll('.info-root')
      .data((d, i) => {
        return d;
      })
      .join(enterHandle);

    function enterHandle(enter) {
      enter.append('g')
        .attr('class', 'info-root')
        .attr('transform', d => `translate(${[that._infoDataGroup[d.key][d.data].oldX, transY]})`)
        .call(enter => updateGroupFunc(enter))
        .attr('custom--handle', function (d) {
          const data = that._infoDataGroup[d.key][d.data];
          const yieldGroup = that._yieldGroup[d.key];
          // console.log('data', data);
          const id = data.id;
          const instance = new InfoView({ width: infoW, height: infoH }, d3.select(this), null, id);
          instance.joinData(data, yieldGroup, that._infoExtent)
            .render();
        })
    }
  }

  #updateContent(group, curData, mode, batchWidth) {
    const that = this;
    const transY = 70;  // 规格信息group起始高度
    const infoW = 90;
    const infoH = 90;

    group.selectAll('.info-root')
      .data(curData, d => d.data)
      .join(enterHandle, updateHandle, exitHandle);

    function enterHandle(enter) {
      enter.append('g')
        .attr('class', 'info-root')
        .attr('opacity', 1)
        .attr('transform', d => {
          if (mode > 0) {
            return `translate(${[batchWidth[d.key] + 10, transY]})`
          }
          else {
            return `translate(${[-100, transY]})`
          }
        })
        .transition().duration(350).ease(d3.easeLinear)
        .attr('opacity', 1)
        .attr('transform', d => `translate(${[that._infoDataGroup[d.key][d.data].X, transY]})`)
        .attr('custom--handle', function (d) {
          const data = that._infoDataGroup[d.key][d.data];
          const yieldGroup = that._yieldGroup[d.key];
          const id = data.id;
          const instance = new InfoView({ width: infoW, height: infoH }, d3.select(this), null, id);
          instance.joinData(data, yieldGroup, that._infoExtent)
            .render();
        })
    }
    function updateHandle(update) {
      update
        .transition().duration(350).ease(d3.easeLinear)
        .attr('transform', d => {

          return `translate(${[that._infoDataGroup[d.key][d.data].X, transY]})`
        })
    }
    function exitHandle(exit) {
      exit
        .attr('opacity', 1)
        .transition().duration(0).ease(d3.easeLinear)
        .attr('opacity', 0.3)
        .attr('transform', d => {
          if (mode > 0) {
            return `translate(${[-100, transY]})`
          }
          else {
            return `translate(${[batchWidth[d.key] + 10, transY]})`
          }
        })
        .remove();
    }
  }



  //计算批次宽度
  #batchWidth(width) {
    //先计算比例尺，将时间跨度映射到宽度，后续把这段写到开头
    let xDomain = d3.extent(this._rawData, (d, i) => {
      let batchStart = new Date(d.startTime);
      let batchEnd = new Date(d.endTime);
      let batchtimeSpan = batchEnd.getTime() - batchStart.getTime();
      return batchtimeSpan;
    });
    let xRange = [2, 6];
    let widthScale = d3.scaleTime(xDomain, xRange);
    //根据比例尺，求出传进来的批次
    let len = this._rawData.length;
    for (let i = 0; i < len; i++) {
      let batchStart = new Date(this._rawData[i].startTime);
      let batchEnd = new Date(this._rawData[i].endTime);
      width[i] = Math.round(widthScale(batchEnd.getTime() - batchStart.getTime())) * 110;
    }
  }

  //计算批次起始位置
  #batchPosition(widtharray, positionarray) {
    for (let i = 0; i < this._rawData.length; i++) {
      if (i == 0) {
        positionarray[i] = 10;
      }
      else {
        positionarray[i] = positionarray[i - 1] + widtharray[i - 1] + 10;
      }
    }
  }

  //组件间通信
  #updateOtherInstance() {
    const disDomain = this._displayScale.domain();
    const option = { domain: disDomain };
    eventBus.emit(MOVE_GANTT, option);
    eventBus.emit('batchNum', this._infoDataGroup.length);
  }

  _renderIcon(iconGroup, cx, iconURL) {
    const color = '#C65B24'
    const color1 = '#94a7b7'

    const background_color = "white";
    const stroke_color = "#94a7b7";
    iconGroup
      .call(g =>
        g.append('defs')
          .append('filter')
          .attr('id', 'shadowicon')
          .append('feDropShadow')
          .attr('dx', 0)
          .attr('dy', 0)
          .attr('stdDeviation', 1)
          .attr('flood-color', stroke_color)
      )
      .call(g =>
        g.append('circle')
          .attr('class', 'inner_circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 0.68 * cx)
          .attr('fill', background_color)
          .attr('stroke', 'black')
          .attr('stroke-width', 0.25)
          .attr('filter', 'url(#shadowicon)')
      )
      .call(g =>
        g.append('image')
          .attr('transform', `translate(${-0.45 * cx},${-0.45 * cx})`)
          .attr('class', 'iconwarning')
          .attr('width', 0.9 * cx)
          .attr('height', 0.9 * cx)
          .attr('href', iconURL)
      )
  }
}