import * as d3 from 'd3';
import SeriesContent from "./SeriesContent";
import { curry } from "@/utils";
import { dir } from '@/components/Tooltip/main';

let tooltip = null;
export function getTooltipInstance(instance) {
    tooltip = instance;
}

export default class Series {
    constructor(parentNode) {

        // this.width = width;
        // this.height = height;
        this._container = parentNode;
        this._rawData = [];
        this._seriesHeight = 80;
        this._seriesLength = null;
    }

    joinData(value) {
        //value是代表一个序列的数组
        //用value生成一个新的二维数组，每一行都是完整的序列数据
        const dataset = value;
        this._seriesLength = dataset.length;                   //该序列的长度
        let num = dataset[this._seriesLength - 1].batch;           //该序列的批次数量
        this._rawData = new Array(num);
        for (let i = 0; i < num; i++) {
            this._rawData[i] = dataset;
        }

        // let index_1 = 0;                          
        // for (let i = 0; i < this._batchnum; i++){
        //     let index_2 = 0;
        //     for (let j = 0; j < len; j++){

        //         if (dataset[j].batch == i + 1){
        //             index_2++;
        //         }
        //     }
        //     this._rawData[i] = new Array(index_2);
        //     for (let k = 0; k < index_2; k++){
        //         this._rawData[i][k] = dataset[index_1 + k];
        //     }
        //     index_1 = index_1 + index_2;
        // }
        return this;
    }

    render() {

        //序列外面的框
        // this._container.append('rect')
        //     //.attr('stroke-dasharray', '10')
        //     .attr('class', 'series-bgc')
        //     .attr('width', d => {
        //         const _length = d.length;
        //         return _length * 70;
        //     })
        //     .attr('height', this._seriesHeight)
        //     .attr('fill', 'white')
        //     .attr('stroke', '#ccc')
        //     .attr('stroke-width', 1)

        //批次外面的框
        const len = this._seriesLength;
        this._container.selectAll('batch')
            .data(this._rawData)
            .join('rect')
            .attr('class', 'batch')
            .attr('width', function (d, i) {
                let num = 0;                       //该批次图元个数
                for (let k = 0; k < len; k++) {
                    if (d[k].batch == i + 1)
                        num++;
                }
                return num * 70;
            })
            .attr('height', '66')
            .attr('fill', 'white')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1.2)
            .attr('stroke-dasharray', (d, i) => {
                let num = 0;                       //该批次图元个数
                for (let k = 0; k < len; k++) {
                    if (d[k].batch == i + 1) {
                        if (d[k].match == 1)
                            return 0;
                        else
                            return 5;
                    }
                }
                return num * 70;
            })
            .attr('transform', (d, i) => {
                let num1 = 0;                       //该批次之前图元个数
                let num2 = 0;                       //该批次图元个数
                for (let k = 0; k < len; k++) {
                    if (d[k].batch <= i)
                        num1++;
                    else if (d[k].batch == i + 1)
                        num2++;
                    else
                        break;
                }
                return `translate(${[50 - 70 / 2 + num1 * 70, 7]})`
            })

        //中间的线
        const head = 15;
        this._container.append('path')
            .attr('class', 'yitiaoxian')
            .attr('d', (d, i) => {
                const _length = d.length;
                return d3.line()([
                    [head, this._seriesHeight / 2],
                    [_length * 70, this._seriesHeight / 2],
                ])
            })
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2)

        //每一个图元，g->g->（circle,path,,）
        const width = 30;
        const gap = 40;
        this._container.selectAll('content')
            .data(d => d)
            .join(
                enter => enter.append('g')
                    .attr('class', 'content')
                    // .attr('x', (d, i) => (30 + gap) * i + width + 20)
                    .attr('transform', (d, i) => `translate(${[(width + gap) * i + width + 20, this._seriesHeight / 2]})`)
                    .attr('custom--handle1', function (d, i) {  // 自定义执行内容
                        const instance = new SeriesContent({ width: width, height: width }, d3.select(this), `${i}`);
                        instance.joinData(d)
                            .render();
                    })
                    .on('mouseover', enterHandle)
                    .on('mouseout', outHandle)
                // .on('mouseenter', enterHandle)
                // .on('mouseleave', outHandle)
            )

        function enterHandle(event, data) {
            const current_g = d3.select(this);
            const current_parent = d3.select(this.parentNode);

            current_parent.selectAll('.batch')
                .attr('height', 70)
                .attr('stroke-width', 2)
                .attr('stroke', '#AAA')
                .attr('transform', (d, i) => {
                    const len = d.length;
                    let num1 = 0;                       //该批次之前图元个数
                    let num2 = 0;                       //该批次图元个数
                    for (let k = 0; k < len; k++) {
                        if (d[k].batch <= i)
                            num1++;
                        else if (d[k].batch == i + 1)
                            num2++;
                        else
                            break;
                    }
                    return `translate(${[50 - 70 / 2 + num1 * 70, 5]})`
                })

            current_parent.select('.yitiaoxian')
                .attr('stroke', '#A9A9A9')
                .attr('stroke-width', 2.3)

            current_parent.selectAll('.beijing')
                .attr('r', 24)
                .attr('fill', 'white')

            current_parent.selectAll('.chanliang')
                .attr('r', 6.5)

            const outerPath = d3.arc().outerRadius(22).innerRadius(15).padAngle(0.07);
            current_parent.selectAll('.outerArc')
                .attr("d", outerPath)

            current_g.selectAll('.chanliang')
                .attr('r', 7)

            const outerPath1 = d3.arc().outerRadius(23).innerRadius(15.3).padAngle(0.07);
            current_g.selectAll('.outerArc')
                .attr("d", outerPath1)

            // console.log(current_g)

            event.stopPropagation();

            // tooltip && tooltip.showTooltip({
            //     id: 'ddihdafljadsjfjiasdfjk',
            //     x: event.pageX, y: event.pageY - 2,
            //     direction: event.pageY < 100 ? dir.down : dir.up,
            //     displayText: false,
            //     chartFun: curry(paintContent, { a: 1 }),
            //     box: { width: 60, height: 60 },
            // });
        }

        function outHandle(event, data) {
            tooltip && tooltip.removeTooltip();
        }

        function paintContent(data, group) {
            group.append('rect')
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', 'red')
            group.append('text')
                .text('老黄真帅')
            group.append('circle')
                .attr('r', 5)
        }
    }

}