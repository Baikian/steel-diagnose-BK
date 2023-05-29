import * as d3 from 'd3';
import { eventBus, SuperGroupView } from '@/utils';
import cardG from "./modules/card";
import rectBar from "./modules/rectBar";
import line from "./modules/line";
import singlearea from './modules/singlearea'
import area from "./modules/area";
import singleData from './single.json'
import { brushPre1, brushPre, updata, updateElement, brushPre2, updateStyles, stringify } from "./element";
import { util } from './modules/until'
import { group, svg } from 'd3';
import { TREND_HEIGHT } from '../WhatIf/size';
export default class Parallel extends SuperGroupView {
    constructor({
        width,
        height,
    } = {}, parentNode, tooltipIns, rootName, rootparent) {
        super({ width, height }, parentNode, rootName);
        this._rootparent = rootparent
        this._rootName = rootName;
        this._tooltip = tooltipIns;
        this.brushdata = undefined;    // 原始数据
        this._keys = util.keys
        this.keys = ['slabthickness', 'tgtdischargetemp', 'tgtlength', 'tgtthickness', 'tgttmplatetemp', 'tgtwidth']

        this._newkeys = [...this._keys, 'status_cooling']
        this._margin = { top: 40, right: 40, bottom: 50, left: 20 };
        // this._allArray = []
        this._xColling = null
        this._yColling = null
        this._brushSelection = new Map()
        // this._brushSelection 可能需要其他替换赋值
        this._width = width + 10
        this._x = null
        this._y = null
        this.xRange = [this._margin.left, this._width]
        this.barbin = null
        this.height = this._newkeys.length * 80
        this.brushHandle = null
        this.barScale = null
        this.arc = null
        this.line = null
        this._brushHeight = 10
        this._brushG = null
        this.mid = null
        this.newtest = null
        this.area = null
        this.singleData = null
    }
    joinData(value, mid, newtest) {
        console.log('this._width',this._width);
        this.brushdata = brushPre(value);
        this.mid = brushPre1(mid)
        this.newtest = [brushPre1(newtest)]
        this.singleData = updata(singleData)

        // console.log('singleData', this.singleData);
        // console.log('mid', this.mid);
        // console.log('this.newtest', this.newtest);
        // console.log('this.brushdata', this.brushdata);
        // 过滤出数据里Undefine的情况
        this.brushdata = this.brushdata.filter(d => this._keys.every(e => typeof d[e] === 'number'));
        // console.log('过滤后的this.brushdata', this.brushdata);
        //coolingArray nocoolingArray 0代表过冷却 1代表没过冷却
        // this._allArray = [0, 1].map(d => d3.filter(this.brushdata, (e, f) => e['status_cooling'] == d));
        // // console.log('this._allArray',this._allArray);
        for (let item in this._keys) {
            this._brushSelection.set(this._keys[item], d3.extent(this.brushdata, d => d[this._keys[item]]))
        }
        let bardata = d3.map(this._keys, d => d3.map(this.brushdata, index => index[d]))
        console.log('this.bardata', bardata)
        // d3.bin() 函数用于将数据分组为多个子集，每个子集包含指定数量的数据。.thresholds(10) 参数用于指定每个子集包含的数据数量，
        // 此处为 10。然后该函数返回一个函数对象，可用于将输入的数据集转换为分组后的数据集。
        this.barbin = d3.map(this._keys, (d, i) => { return d3.bin().thresholds(10)(bardata[i])});
        console.log('this.barbin ', this.barbin);
        // d3.scalePow().domain([最小值,中间值,最大值]).range([最小值,中间值,最大值]))
        this.barScale = d3.map(this.barbin, array => d3.scalePow().domain([0, 1, d3.max(d3.map(array, d => d.length))]).range([0, 5, 35]))
        let parpallelDomain = d3.map(this.barbin, d => [d[0].x0, d.slice(-1)[0].x1]);
        console.log('parpallelDomain', parpallelDomain);
        this._x = new Map(Array.from(this._keys, (key, index) => [key, d3.scaleLinear(this.mid[key], this.xRange).clamp(true)]));
        console.log('this._x', this._x);
        this._y = d3.scalePoint(this._keys, [this._margin.top, this.height - this._margin.bottom])
        console.log('this._y', this._y);
        // this.arc = d3.arc().innerRadius(0).outerRadius(6).startAngle(0).endAngle((d, i) => (i ? 2 * Math.PI : -2 * Math.PI));
        this.line = d3.line().defined(([, value]) => value != null)
            .x(([key, value]) => this._x.get(key)(value))
            .y(([key]) => this._y(key));
        this.brushHandle = (g, selection) => g
            .selectAll('.handle--custom')
            .data([{ type: 'w' }, { type: 'e' }])
            .join(enter =>
                enter
                    .append('rect')
                    .attr('class', 'handle--custom')
                    .attr('fill', 'white')
                    .attr('fill-opacity', 1)
                    .attr('stroke', '#90a4ae')
                    .attr('stroke-width', 2)
                    .attr('cursor', 'ew-resize')
                    .attr('y', -6)
                    .attr('ry', 4)
                    .attr('rx', 4)
                    .attr('width', 12)
                    .attr('height', 12)
                // .attr('d', this.arc)
            )
            .attr('display', selection === null ? 'none' : null)
            .attr('transform', selection === null ? null : (d, i) => `translate(${selection[i]},${0})`);
        this.area = d3.area()
            .y(([key]) => this._y(key))
            .x0(([key, value]) => this._x.get(key)(value[0]))
            .x1(([key, value]) => this._x.get(key)(value[1]));
        return this;
    }
    render() {
        console.log('this._container ', this._container);
        this._container.selectChildren('*').remove();
        this._container.append('g').selectAll('.cardG')
            .data(this._keys)
            .join(enter => this.#entercardG(enter),
                update => update,
                exit => exit)
        const rectBarG = this._container.append('g')
        console.log('this.barbin', this.barbin);

        for (let item in this._keys) {
            rectBarG.selectAll('.rectBarG' + item)
                .data(this.barbin[item])
                .join(
                    enter => this.#enterRectBar(enter, item),
                    update => update,
                    exit => exit
                )
        }
        const areaG = this._container.append('g')
        areaG.selectAll('.parallelPath1')
            .data(this.newtest)
            .join(
                enter => this.#enterArea(enter),
                update => update,
                exit => exit)
        areaG.selectAll('.singleparallelPath')
            .data(this.singleData)
            .join(
                enter => this.#enterSingleArea(enter),
                update => update,
                exit => exit)
        this._initBrush()
        this._brushSlider()

        return this;
    }
    _brushFunc(selection, key) {
        let domin = { brushSelection: selection, currentKeys: key }
        eventBus.emit('updateRectBar', domin)
        let selected = []
        let lineDomin = { updataSelect: selected }
        eventBus.emit('updateLine', lineDomin)
    }
    _initBrush() {
        const x = this._x
        const brushHandle = this.brushHandle
        let brushSelection = this._brushSelection
        const brush = d3
            .brushX()
            .extent([
                [this._margin.left, -5], [this._width, 5]
            ])
            .on('start brush end', basebrushed);
        console.log('this.margin.right', this._width);
        const that = this
        function basebrushed({ selection }, key) {
            d3.select(this).call(brushHandle, selection);
            brushSelection.set(key, selection.map(x.get(key).invert));
            that._brushFunc(selection, key)
        }
        // 
        const brushAttrs = {
            transform: d => `translate(0,${this._y(d) + 6})`,
            id: (d, i) => 'parallel' + i
        }
        this._brushG = this._container
            .append('g')
            .attr('transform', `translate(25,10)`)
            .attr('class', 'baseBrush');
        this._brushG.selectAll('g')
            .data(this._keys)	// .data(newkeys)
            .join('g')
            .call(g => updateElement(g, brushAttrs),
            )
            .each(function (d, i) {
                d3.select(this).call(
                    d3.axisBottom(x.get(d))
                        .ticks(5))
            })
            .call(g => g.selectAll('.domain').remove())
            .call(brush)
            .attr('class', (d, i) => 'brushX' + i,
            )
            .call(brush.move, (d, i) => brushSelection.get(d).map(this._x.get(d)));
        return this;
    }
    _brushSlider() {
        const overLayAttrs = {
            fill: '#eeeeee',
            rx: 2,
            ry: 2,
            stroke: '#bbbbbb',
            'stroke-width': 1
        }
        const selectionAttrs = {
            rx: 2,
            ry: 2,
            stroke: '#aaa',
            'stroke-width': 1
        }
        const tickTextAttrs = {
            stroke: 'none',
            'font-family': "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
            color: "#2c3e50",
            'font-size': "12px",
            'font-weight': "normal",
            'font-style': "normal"
        }
        updateElement(this._brushG.selectAll('.overlay'), overLayAttrs).raise();
        updateElement(this._brushG.selectAll('.selection'), selectionAttrs).raise();
        this._brushG.selectAll('.handle--custom').raise();
        updateElement(this._brushG.selectAll('.tick text'), tickTextAttrs);
    }
    #entercardG(group) {
        const cardGexample = group.append('g').attr('class', 'cardG')
            .attr('transform', (d, i) => `translate(${this._margin.left - 10},${this._y(d) - 35})`)
            .attr('custom--handle', function (d) {
                const cardGinstance = new cardG({ width: this._width - 40, height: 70 }, d3.select(this))
                cardGinstance.render()
            })
    }
    #enterRectBar(group, item) {
        const that = this;
        let rectBarExample = group.append('g').attr('class', 'rectBarG' + item)
            .attr('transform', `translate(25,${this._y(this._keys[item])})`)
            .attr('custom-handle', function (d) {
                let rectBarInstance = new rectBar({ width: this._width, height: 70 }, d3.select(this), that.barScale, that.brushdata, that._x, item)
                rectBarInstance.render()
            })
    }

    #enterArea(group) {
        const that = this;
        let LineExample = group.append('g').attr('class', 'parallelPath1')
            .attr('transform', `translate(25,10)`)
            .attr('custom-handle', function (d) {
                let LineInstance = new area({ width: this._width, height: 70 }, d3.select(this), that.area, that._keys, group)
                LineInstance.render()
            })
    }
    #enterSingleArea(group) {
        const that = this;
        let LineExample = group.append('g').attr('class', 'singleparallelPath')
            .attr('transform', `translate(25,10)`)
            .attr('custom-handle', function (d) {
                let LineInstance = new singlearea({ width: this._width, height: 70 }, d3.select(this), that.area, that._keys, group)
                LineInstance.render()
            })
    }
}
