import * as d3 from 'd3';
import { SuperSVGView, curry } from "@/utils";
import { dir } from '../Tooltip/main';
import img from './example.jpg'


import { dragDisable, text } from 'd3';
import { viewDepthKey } from 'vue-router';

export class Whatifview extends SuperSVGView {
  constructor({ width }, ele) {
    super({ width }, ele);
    this._container.attr('id', 'Whatifview');
    this._grandpaNode = ele.parentNode.parentNode;
    this._ele = d3.select(ele);
    this._margin = { top: 10, bottom: 10, left: 10, right: 10 };
    this._card = null
    this._rowdata = null
    this._hight = null
    this._test = null
    this._ladder = null
    this._batch_id = null
    this._title = null
    this._table = null
    this.filtered_flag_names = null
  }
  join(testdata) {
    // console.log('testdata', testdata);
    this._rowdata = testdata
    this._container.attr('height', 40 * testdata.length+500)
    return this
  }
  render() {
    const that = this;
    let batch_id = 2102021_01
    this._batch_id = this._container.append('g').attr('class', 'batch_id')
    this._batch_id.selectAll("text").data([batch_id]).join("text").text(d => 'Batch  Id : ')
      .attr('transform', (d, i) => `translate(10,30)`)
      .attr('fill', '#4c576b').attr("font-size", "20");
    this._batch_id.append("text").text(batch_id).attr('transform', (d, i) => `translate(100,30)`).attr('fill', '#4c576b').attr("font-size", "20");
    this._title = this._container.append('g').attr('class', 'title').attr('transform', `translate(0,50)`)
    this._title.selectAll('rect')
      .data([{ type: 'w' }])
      .join('rect')
      .attr('class', 'rect')
      .attr('fill', '#d7dadd')
      .attr('stroke', 'white')
      .attr('width', 400)
      .attr('height', 40)
      .attr('transform', (d, i) => `translate(${0},0)`)
    this._title.append('text').text('upid').attr('transform', `translate(10,25)`).attr('fill', '#5e5e5f').attr("font-size", "20");
    this._title.append('text').text('label').attr('transform', `translate(120,25)`).attr('fill', '#5e5e5f').attr("font-size", "20");
    this._title.append('text').text('tgt_th').attr('transform', `translate(240,25)`).attr('fill', '#5e5e5f').attr("font-size", "20");
    console.log('this._rowdata', this._rowdata);
    // 创建 upid_title 元素
    this._table = this._container.append('g')
      .attr('class', 'title1')
      .attr('transform', 'translate(5,95)');
    this._table.selectAll('g')
      .data(this._rowdata)
      .join('g')
      .attr('class', (d, i) => `row`)
      // .on('mouseover', function (event, d) {
      //   that._table.selectAll('.row')
      //     .attr('opacity', 0.1)
      //   const current = d3.select(this);
      //   // console.log('current', d);
      //   current.attr('opacity', 1)
      // })
      // .on('mouseout', function () {
      //   that._table.selectAll('.row')
      //     .attr('opacity', 1)

      // })
      .on('click', function (event, d) {
        that._container.selectAll(".tooltip").remove();
        that._table.selectAll('.row')
          .attr('opacity', 0.1)
        const current = d3.select(this);
        // console.log('current', d);
        current.attr('opacity', 1)
        console.log('that._rowdata.length', that._rowdata.length);
        const tooltip = that._container
          .append("g")
          .attr("class", "tooltip")
          .attr('transform', `translate(10, ${that._rowdata.length * 40 + 130})`)

        tooltip.append('image')
          .attr('xlink:href', img)
          .attr('width', 200)
          .attr('height', 150)
        // const arrow = d3.symbol().type(d3.symbolTriangle).size(200);
        let cardG = that._container.append('g')
          .attr("class", "tooltip")
          .attr('transform', `translate(10, ${that._rowdata.length * 40 + 130})`)
        cardG
          .append('rect')
          .attr('class', 'cardG')
          .attr('fill', '#f7f7f7')
          .attr('stroke', '#e0e0e0')
          .attr('stroke-width', 2)
          .attr('width', 60)
          .attr('height', 20)
          .attr('x', 200)
          .attr('rx', 0)
          .attr('ry', 0)
        cardG
          .append('text')
          .attr('x', 214)
          .attr('y', 15)
          .attr('fill', '#4c576b')
          .attr('font-size', '15px')
          .text('诊断')
        const path =cardG.append('path').attr('d', 'M50 50 L100 100')
          .attr('stroke', 'red')
          .attr('fill', 'red')
          // .attr('x', 314)
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead)')
          .attr("transform", "translate(230,-40) rotate(45)")
        cardG.append('defs').append('marker')
          .attr('id', 'arrowhead')
          .attr('markerWidth', 10)
          .attr('markerHeight', 7)
          .attr('refX', 0)
          .attr('refY', 3.5)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M 0 0 L 10 3.5 L 0 7 z').attr('stroke', 'red').attr('fill','red' );
      })
      .call(g => {
        g.append('rect')
          .attr('class', (d, i) => `rect${i}`)
          .attr('id', (d, i) => `rect${i}`)
          .attr('transform', (d, i) => `translate(-50, ${i * 40})`)
          .attr('fill', '#f4f5f5')
          .attr('stroke', 'white')
          .attr('stroke-width', 5)
          .attr('width', 500)
          .attr('height', 40)
      })
      .call(g => {
        g.append('text')
          .attr('class', (d, i) => `text${i}`)
          .attr('id', (d, i) => `text${i}`)
          .attr('transform', (d, i) => `translate(0, ${i * 40 + 30})`)
          .attr('fill', '#7b7a79')
          .attr('font-size', '20')
          .text(d => d.upid.slice(5));
      })
      .call(g => {
        g.append('text')
          .attr('class', (d, i) => `text${i}`)
          .attr('id', (d, i) => `text${i}`)
          .attr('transform', (d, i) => `translate(220, ${i * 40 + 30})`)
          .attr('fill', '#7b7a79')
          .attr('font-size', '20')
          .text(d => d.tgtthickness);
      })
      .call(g => {
        g.append('text')
          .attr('class', (d, i) => `text${i}`)
          .attr('id', (d, i) => `text${i}`)
          .attr('transform', (d, i) => `translate(100, ${i * 40 + 30})`)
          .attr('fill', '#7b7a79')
          .attr('font-size', '20')
          .text(d => this.formatFqcLabel(d));
      })
  }
  formatFqcLabel(d) {
    let fqcLabel = d.fqc_label;
    return fqcLabel && fqcLabel.length > 0 ? fqcLabel.join(',')
      .replace(/bend/, 'B')
      .replace(/abnormalThickness/, 'A')
      .replace(/horizonWave/, 'H')
      .replace(/leftWave/, 'L')
      .replace(/rightWave/, 'R')
      : 'N';
  }
}
