import * as d3 from 'd3';
import { SuperSVGView, curry } from '@/utils';
import { eventBus } from '@/utils';
import { detailsExtent } from './modules/utils';
import ScatterPoint from './modules/ScatterPoint';
import ProcessView from './modules/ProcessView';
import { dir } from '@/components/Tooltip/main';

export let scatterTooltip = null;
export function getTooltipInstance(instance) {
  scatterTooltip = instance;
}

export class OverView extends SuperSVGView {
  constructor({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'over-view');
    this._grandpaNode = ele.parentNode.parentNode;
    this._ele = d3.select(ele);

    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
    this._rawData = [];     // 原始数据
    this._paintData = {};   // 散点图数据映射
    this._idList = [];      // 散点图显示的列表
    this._pointMap = new Map(); // 保存散点图图元实例
    this._processExtent = {}; // 工序图元的数据范围（最大值）

    this._scaleX = null;  // x 标尺
    this._scaleY = null;  // y 标尺
    this._scaleR = null;  // 图元半径 标尺
  }

  joinData(value) {
    this._rawData = value.filter(d => d.x !== undefined);
    this._rawData.sort((a, b) => (a.good + a.bad + a.no) - (b.good + b.bad + b.no));
    this._rawData.forEach(d => {
      const id = `${d.bid}-${d.cid}`;
      this._idList.push(id);
      this._paintData[id] = d;
    });
    this._processExtent = detailsExtent(this._rawData);

    const xList = this._rawData.map(d => d.x ? d.x : 0);
    const yList = this._rawData.map(d => d.y ? d.y : 0);
    const nList = this._rawData.map(d => d.details.production_rhythm);  // 定义产能标尺
    const xDomain = d3.extent(xList);
    const yDomain = d3.extent(yList);
    const rDomain = d3.extent(nList);
    const xRange = [this._margin.left + 25, this._viewWidth - this._margin.right - 25];
    const yRange = [this._margin.top + 25, this._viewHeight - this._margin.bottom - 25];
    const rRange = [0, 15];

    this._scaleX = d3.scaleLinear(xDomain, xRange);
    this._scaleY = d3.scaleLinear(yDomain, yRange);
    this._scaleR = d3.scaleLinear(rDomain, rRange);

    return this;
  }

  render() {

    this._container.selectAll('.scatterGroup')
      .data(this._idList)
      .join(
        enter => this.#enterHandle(enter),
        update => this.#updateHandle(update),
        exit => this.#exitHandle(exit)
      )

    eventBus.on('发往Overview', (d) => {

      let curData = d.data;
      console.log('发来的数据对吗', curData);
      this.#unfoucs(curData.cids);

    })

    return this;
  }

  #enterHandle(group) {
    const that = this;

    const scatterGroup = group.append('g')
      .attr('class', 'scatterGroup')
      .attr('opacity', 1)
      .attr('transform', id => {
        const datum = that._paintData[id];
        const x = that._scaleX(datum.x);
        const y = that._scaleY(datum.y);
        return `translate(${[x, y]})`;
      })
      .attr('custom--handle', function (id) {
        const datum = that._paintData[id];
        const r = 25;
        const instance = new ScatterPoint({ width: r, height: r }, d3.select(this), id);
        instance.joinData(datum).render();
        that._pointMap.set(id, instance);
      })

    scatterGroup
      .on('mouseenter', (e, d) => this.#mouseenterHandle(e, d))
      .on('mouseleave', (e, d) => this.#mouseleaveHandle(e, d))

    eventBus.on('select监听', (d) => {
      let curData = d.data;
      console.log('curData', curData);
      if (curData == 'Option1') {
        const xList = that._rawData.map(d => d.x ? d.x : 0);
        const yList = that._rawData.map(d => d.y ? d.y : 0);
        const xDomain = d3.extent(xList);
        const yDomain = d3.extent(yList);
        const xRange = [that._margin.left + 25, that._viewWidth - that._margin.right - 25];
        const yRange = [that._margin.top + 25, that._viewHeight - that._margin.bottom - 25];
        const tSNEscaleX = d3.scaleLinear(xDomain, xRange);
        const tSNEscaleY = d3.scaleLinear(yDomain, yRange);

        that._container.selectAll('.scatterGroup')
          .transition()
          .duration(1000)
          .attr('transform', id => {
            const datum = that._paintData[id];
            const x = tSNEscaleX(datum.x);
            const y = tSNEscaleY(datum.y);
            return `translate(${[x, y]})`;
          })
      }
      else if (curData == 'Option2') {
        const xList = that._rawData.map(d => d.pca_x ? d.pca_x : 0);
        const yList = that._rawData.map(d => d.pca_y ? d.pca_y : 0);
        const xDomain = d3.extent(xList);
        const yDomain = d3.extent(yList);
        const xRange = [that._margin.left + 25, that._viewWidth - that._margin.right - 25];
        const yRange = [that._margin.top + 25, that._viewHeight - that._margin.bottom - 25];
        const tSNEscaleX = d3.scaleLinear(xDomain, xRange);
        const tSNEscaleY = d3.scaleLinear(yDomain, yRange);

        that._container.selectAll('.scatterGroup')
          .transition()
          .duration(1000)
          .attr('transform', id => {
            const datum = that._paintData[id];
            const x = tSNEscaleX(datum.pca_x);
            const y = tSNEscaleY(datum.pca_y);
            return `translate(${[x, y]})`;
          })
      } else {
        const xList = that._rawData.map(d => d.MDS_x ? d.MDS_x : 0);
        const yList = that._rawData.map(d => d.MDS_y ? d.MDS_y : 0);
        const xDomain = d3.extent(xList);
        const yDomain = d3.extent(yList);
        const xRange = [that._margin.left + 25, that._viewWidth - that._margin.right - 25];
        const yRange = [that._margin.top + 25, that._viewHeight - that._margin.bottom - 25];
        const tSNEscaleX = d3.scaleLinear(xDomain, xRange);
        const tSNEscaleY = d3.scaleLinear(yDomain, yRange);

        that._container.selectAll('.scatterGroup')
          .transition()
          .duration(1000)
          .attr('transform', id => {
            const datum = that._paintData[id];
            const x = tSNEscaleX(datum.MDS_x);
            const y = tSNEscaleY(datum.MDS_y);
            return `translate(${[x, y]})`;
          })
      }

    })
  }

  #updateHandle(group) {
  }
  #exitHandle(group) {
  }

  #unfoucs(cidarray) {
    this._container.selectAll('.scatterGroup')
      .transition()
      .duration(100)
      .attr('opacity', id => {
        for (let index in cidarray) {
          if (id === cidarray[index]) {
            return 1
          }
        }
        return 0.1
      })
  }

  #mouseenterHandle(event, id) {
    const that = this;
    const datum = this._paintData[id];
    const contentWidth = 100;
    scatterTooltip && scatterTooltip.showTooltip({
      id: id,
      x: event.pageX, y: event.pageY - 2,
      direction: dir.up,
      displayText: false,
      chartFun: curry(paintContent, datum, this._processExtent),
      box: { width: contentWidth * 2, height: contentWidth },
    })

    function paintContent(data, extent, group) {
      const instance = new ProcessView({ width: contentWidth * 2, height: contentWidth }, group, `${id}-content`);
      instance.joinData(data, extent, that._scaleR).render();
    }
  }

  #mouseleaveHandle(event, data) {
    scatterTooltip && scatterTooltip.removeTooltip();
  }
}
