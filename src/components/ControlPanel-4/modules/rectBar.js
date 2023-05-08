import * as d3 from 'd3';
import {
    SuperGroupView, eventBus
} from '@/utils';
import { util } from '../modules/until'
export default class rectBar extends SuperGroupView {
    constructor({ width, height }, ele, barScale, brushdata, xScale, item) {
        super({ width, height }, ele)
        this._goodColor = '#B1BFCB'
        // 上
        this._badBar = '#DF7E4D'
        // 下
        this.barScale = barScale
        this.brushdata = brushdata
        this.xScale = xScale
        this._keys = util.keys
        this.item = item
    }
    render() {
        // console.log('this.barScale',this.barScale);
        // console.log('this.xScale',this.xScale);
        let goodBar = this._container.append('g')
        goodBar.append('rect').attr('class', 'rect' + this.item)
            .attr('fill', this._goodColor)
            .attr('stroke-width', 2)
            .attr('opacity', 1)
            .attr('stroke', '#94a7b7')
            .attr('x', d => this.xScale.get(this._keys[this.item])(d.x0))
            .attr('y', d => -this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 && d.x0 <=
                e[this._keys[this.item]] && +e.label === 1).length) + 11)
            .attr('height', d => this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 &&
                d.x0 <= e[this._keys[this.item]] && +e.label === 1).length))
            .attr('width', (d, i) => {
                if (0.6 * ((d.x1) - (d.x0)) < 7) {
                    return 7
                } else if (0.6 * ((d.x1) - (d.x0)) > 20) {
                    return 20
                } else { return 0.6 * ((d.x1) - (d.x0)) }
            })
        // .attr('width', 7)
        let badBar = this._container.append('g')
        badBar.append('rect').attr('class', 'rect' + this.item)
            .attr('fill', this._badBar)
            .attr('stroke-width', 2)
            .attr('opacity', 1)
            .attr('stroke', '#c65b24')
            .attr('x', d => this.xScale.get(this._keys[this.item])(d.x0))
            .attr('y', d => -this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 && d.x0 <=
                e[this._keys[this.item]] && +e.label === 1).length) + 11 - this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 &&
                    d.x0 <= e[this._keys[this.item]] && +e.label === 0).length))
            .attr('height', d => this.barScale[this.item](d3.filter(this.brushdata, e => e[this._keys[this.item]] <= d.x1 &&
                d.x0 <= e[this._keys[this.item]] && +e.label === 0).length))
            .attr('width', d => {
                // console.log('this.barScale[this.item](d.x1)',this.barScale[this.item](d.x1));console.log('this.barScale[this.item](d.x0)',this.barScale[this.item](d.x0));
                if (0.6 * ((d.x1) - (d.x0)) < 7) {
                    return 7
                } else if (0.6 * ((d.x1) - (d.x0)) > 20) {
                    return 20
                } else { return 0.6 * ((d.x1) - (d.x0)) }
            })
        // .attr('width', 7)

        //         this._container.append('g')
        //             .append('rect')
        //             .data(d => d.values)
        //             .attr('fill', (d, i) => { console.log('d', d); return i === 0 ? this._goodColor : this._badColor })
        //             .attr('stroke-width', 1)
        //             .attr('opacity', 1)
        //             .attr('stroke', (d, i) => i === 0 ? '#94a7b7' : '#c65b24')
        //             .attr('x', (d, i) => this.xScale.get(this._keys[d.key])(d[0][0]))
        //             .attr('y', (d, i) => -this.barScale[d.key](d[0].data.good.length + d[0].data.bad.length) + 11 - this.barScale[d.key](d[0].data.bad.length))
        //             .attr('height', (d, i) => this.barScale[d.key](d[0].data.bad.length))
        //             .attr('width', 7);


        // width: d => 0.5* (x.get(keys[item])(d.x1) - x.get(keys[item])(d.x0))
        eventBus.on('updateRectBar', ({ brushSelection, currentKeys }) => this._updateRectBar(brushSelection, currentKeys))
    }
    _updateRectBar(selection, key) {
        if (selection === null) {
            this._container.selectAll('.rect' + this._keys.indexOf(key)).attr('opacity', 1);
        } else {
            let brushRange = d3.map(selection, this.xScale.get(key).invert);
            this._container.selectAll('.rect' + this._keys.indexOf(key)).attr('opacity', (d, i) =>
                (d.x0 + d.x1) / 2 >= brushRange[0] && (d.x0 + d.x1) / 2 <= brushRange[1] ? 1 : 0.05);
        }
    }
}