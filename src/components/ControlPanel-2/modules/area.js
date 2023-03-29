import * as d3 from 'd3';
import {
    SuperGroupView, eventBus
} from '@/utils';
import deGroupStyle from "../modules/until";
import { until } from '../modules/until'
export default class area extends SuperGroupView {
    constructor({ width, height }, ele, line, newkeys, group) {
        super({ width, height }, ele)
        this.line = line
        this.newkeys = newkeys
        // this.selections = selections
        this.sunLine =null
        this.group = group
    }
    render() {
        // console.log('this._container',this._container);
        let that =this
        let paintLine = this._container.append('g')
        paintLine.append('path')
            .attr('stroke', deGroupStyle())
            .attr('id', d => `paraPath${d.bid}`)
            .attr('d', d => this.line(d3.cross(this.newkeys, [d], (key, d) => [key, d[key]])))
            .attr('class', 'steelLine')
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 1)
            // .on("mouseover",(event,d)=> this.pathover(event,d,that))
            // .on("mouseout", (event,d)=> this.pathout(event,d,that));
        // eventBus.on('updateLine', ({ updataSelect }) => this._updateLine(updataSelect))

    }
}