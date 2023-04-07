import * as d3 from 'd3';
import {
    SuperGroupView, eventBus
} from '@/utils';
import { util } from '../modules/until'
export default class rectBar extends SuperGroupView {
    constructor({ width, height }, ele, barScale, brushdata, xScale, item) {
        super({ width, height }, ele)
        this._goodColor = '#94a7b7'
        // 上
        this._badBar = '#c65b24'
        // 下
        this.barScale = barScale
        this.brushdata = brushdata
        this.xScale = xScale
        this._keys = util.keys
        this.item = item
    }
    render() {
        // console.log('this.xScale',this.xScale);
        let goodBar = this._container.append('g')
        goodBar.append('rect').attr('class', 'rect' + this.item)
            .attr('fill', this._goodColor)
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5)
            .attr('stroke', '#eee')
            .attr('x', d => this.xScale.get(this._keys[this.item])(d.x0))
            .attr('y', d => -this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 && d.x0 <=
                e[this._keys[this.item]] && +e.label === 1).length) + 11)
            .attr('height', d => this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 &&
                d.x0 <= e[this._keys[this.item]] && +e.label === 1).length))
            // .attr('width', d => 0.5 * (this.xScale.get(this._keys[this.item])(d.x1) - this.xScale.get(this._keys[this.item])(d.x0)))
            .attr('width', 7)
        let badBar = this._container.append('g')
        badBar.append('rect').attr('class', 'rect' + this.item)
            .attr('fill', this._badBar)
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.5)
            .attr('stroke', '#eee')
            .attr('x', d => this.xScale.get(this._keys[this.item])(d.x0))
            .attr('y',d=> -this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 && d.x0 <=
                e[this._keys[this.item]] && +e.label === 1).length) + 11 -this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 &&
                    d.x0 <= e[this._keys[this.item]] && +e.label === 0).length))
            .attr('height', d => this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 &&
                d.x0 <= e[this._keys[this.item]] && +e.label === 0).length))   
            .attr('width', 7)
        // width: d => 0.5* (x.get(keys[item])(d.x1) - x.get(keys[item])(d.x0))
        eventBus.on('updateRectBar', ({ brushSelection, currentKeys }) => this._updateRectBar(brushSelection, currentKeys))
    }
    _updateRectBar(selection, key) {
        if (selection === null) {
            this._container.selectAll('.rect' + this._keys.indexOf(key)).attr('opacity', 0.5);
        } else {
            let brushRange = d3.map(selection, this.xScale.get(key).invert);
            this._container.selectAll('.rect' + this._keys.indexOf(key)).attr('opacity', (d, i) =>
                (d.x0 + d.x1) / 2 >= brushRange[0] && (d.x0 + d.x1) / 2 <= brushRange[1] ? 0.5 : 0.05);
        }
    }
}