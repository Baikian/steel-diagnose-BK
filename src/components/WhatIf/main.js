import { SuperSVGView, eventBus } from '@/utils';
import TooltipClass from '@/components/Tooltip/main';
import TrendView from './modules/TrendView';
import GanttView from './modules/GanttView';
import TemporalView from './modules/TemporalView';
import { TREND_HEIGHT, GANTT_HEIGHT, TEMPORAL_HEIGHT } from './size';
import testData from "./modules/testData.json"

export const TREND = 'trend';
export const GANTT = 'gantt';
export const TEMPORAL = 'temporal';

// 跨视图交互 订阅 key
export const MOVE_GANTT = 'move_gantt';


export class WhatIfView extends SuperSVGView {
  constructor ({ width, height }, ele) {
    super({ width, height }, ele);

    this._container.attr('id', 'what-if-view');
    this._tooltipInstance = new TooltipClass({width: 0, height: 0}, ele, 'tooltip-what-if');
    
    this._temporalView = new TemporalView({ width: width, height: height - TEMPORAL_HEIGHT, moveY: TEMPORAL_HEIGHT - 20 }, this._container, this._tooltipInstance, 'temporal-view-root');
    this._trendView = new TrendView({ width: width - 50, height: TREND_HEIGHT, moveY: 0 }, this._container, this._tooltipInstance, 'trend-view-root');
    this._ganttView = new GanttView({ width: width, height: GANTT_HEIGHT, moveY: 80 }, this._container, this._tooltipInstance, 'gantt-view-root');
    // this._temporalView.joinData(TEMPORAL, testData);
    eventBus.on(MOVE_GANTT, ({diagData}) => {if(diagData && diagData.length !== 0){this._temporalView.joinData(TEMPORAL, diagData)}}); // 订阅, 当gantt视图拖动的时候，更新趋势视图的x轴小三角
  }

  render(key, value) {
    switch(key) {
      case TREND:
        this._trendView.joinData(TREND, value).render();
        // eventBus.on(MOVE_GANTT, ({ domain }) => this._trendView.updateXSelect(domain)); // 订阅, 当gantt视图拖动的时候，更新趋势视图的x轴小三角
        eventBus.on('batchNum', (d) => this._trendView.thumbnail(d));
        break;
      case GANTT:
        this._ganttView.joinData(GANTT, value).render();
      case TEMPORAL:
        // console.log('TEMPORAL')
        this._temporalView.joinData(TEMPORAL, value)
        break;
      default:
        break;
    }

    return this;
  }
}