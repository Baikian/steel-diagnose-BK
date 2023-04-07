import * as d3 from 'd3';
import {
    SuperGroupView, eventBus
} from '@/utils';
import deGroupStyle from "../modules/until";
import { until } from '../modules/until'
export default class line extends SuperGroupView {
    constructor({ width, height }, ele, line, newkeys, selections,group,rootparent) {
        super({ width, height }, ele)
        this.line = line
        this.newkeys = newkeys
        this.selections = selections
        this.sunLine =null
        this.group = group
        this._rootparent=rootparent

        this.myTooltip = group
    }
    render() {
        // console.log('this._container',this._container);
        let that =this
        let paintLine = this._container.append('g')
        paintLine.append('path')
            // .attr('stroke', deGroupStyle())
            .attr('id', d => `paraPath${d.upid}`)
            .attr('d', d => this.line(d3.cross(this.newkeys, [d], (key, d) => [key, d[key]])))
            .attr('class', 'steelLine')
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 1)
            .on("mouseover",(event,d)=> this.pathover(event,d))
            .on("mouseout", (event,d)=>  this.pathout(event,d));
        eventBus.on('updateLine', ({ updataSelect }) => this._updateLine(updataSelect))

    }
    _updateLine(selected) {
        const that = this
        this._container.selectAll('path').each(function (d) {
            // console.log('selections',that.selections)
            const active = Array.from(that.selections).every(
                ([key, [min, max]]) => d[key] >= min && d[key] <= max
            );
            d3.select(this).attr('stroke', active ? deGroupStyle() : 'none');
            // if (active) {
            //     d3.select(this).raise();
            //     selected.push(d);
            // }
        });
    }
    pathover(event, d) {
        const that = this
        let data1=d
        console.log('d',d);
        const tooltip = this._rootparent
            .append("g")
            .attr("class", "tooltip")
            .style("font", "12px DIN")
        const path = tooltip
            .append("path")
            .attr("stroke", "rgba(148, 167, 183, 0.4)")
            .attr("fill", "white");
        const text = tooltip.append("text");
        const line1 = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", 0)
            .style("font-family", until.tabularTooltipAttr.line1.fontFamily)
            .style("font-size", until.tabularTooltipAttr.line1.fontSize)
            .style("font-weight", until.tabularTooltipAttr.line1.fontWeight)
            .style("font-style", until.tabularTooltipAttr.line1.fontStyle);
        const line2 = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", "1.1em")
            .style("font-family", until.tabularTooltipAttr.line2.fontFamily)
            .style("font-size", until.tabularTooltipAttr.line2.fontSize)
            .style("font-weight", until.tabularTooltipAttr.line2.fontWeight)
            .style("font-style", until.tabularTooltipAttr.line2.fontStyle);
        const line3 = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", "2.2em")
            .style("font-family", until.tabularTooltipAttr.line3.fontFamily)
            .style("font-size", until.tabularTooltipAttr.line3.fontSize)
            .style("font-weight", until.tabularTooltipAttr.line3.fontWeight)
            .style("font-style", until.tabularTooltipAttr.line3.fontStyle);
        tooltip.style("display", null).attr("fill", d => data1['label'] === 0 ? "#e3ad92" : "#b9c6cd");
        line1.text(`upid:` + data1.upid);
        line2.text(`steelspec: ` + data1.steelspec);
        line3.text(`time:` + data1.toc);
        path.attr("stroke",  data1['label'] === 0 ? "#e3ad92" : "#b9c6cd").attr("fill", "white");
        const box = text.node().getBBox();
        let x = event.offsetX,
            y = event.offsetY;
        path.attr(
            "d",
            ` M${box.x - 10},${box.y - 10}
                        H${box.width / 2 - 5}l5,15l5,-15
                        H${box.width + 10}
                        v-${box.height + 20}
                        h-${box.width + 20}
                        z
                    `
        );
        text.attr(
            "transform",
            `translate(${[box.x, box.y - box.height - 10]})`
        );
        tooltip.attr("transform", `translate(${[x - box.width / 2 , y + 5]})`);
        // that.group.select('.tooltip').moveToFront()
        that.group
        .selectAll(`.steelLine`)
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 0);
        that.group
        .select(`#paraPath${data1.upid}`)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", 1.75);
    }
    pathout(event,d){
        this.group
          .selectAll(`.steelLine`)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", 1);
          this._rootparent.selectAll(".tooltip").remove();
    }
}
