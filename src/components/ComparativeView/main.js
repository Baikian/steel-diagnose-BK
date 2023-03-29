import * as d3 from 'd3';
import { SuperSVGView, curry } from "@/utils";
import { dir } from '../Tooltip/main';
import SeriesContent from "./modules/SeriesContent";
import Series from "./modules/Series";
import { dragDisable } from 'd3';


export class ComparativeView {
  constructor({ width, height }, ele) {

    this.width = width;
    this.height = height;

    this._margin = { top: 5, bottom: 5, left: 5, right: 5 };
    this._rawData = [];
    this._extend = null;

    this._seriesHeight = 80;  // 序列高度
    this._seriesGap = 0;     // 序列之间的空隙

    this._container = d3.select(ele)

  }

  joinData(value) {
    this._rawData = value;
    return this;
  }

  render() {

    //排序按钮
    this._container.select('#yieldSort')
    .on('click', sortFunction)

    this._container.select('#qualitySort')
    .on('click', sortFunction2)

    this._container.select('#matchSort')
    .on('click', sortFunction3)


    //外层的div和svg
    let rootSvg = this._container.append('div')
      .attr('class', 'rootDiv')
      .style('position', 'absolute')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    //储存序列横坐标
    let postion = [0, 0, 0, 0, 0, 0];

    //生成序列
    rootSvg.selectAll('seriesGroup')
      .data(this._rawData)
      .join(
        enter => enter.append('g')
          .attr('class', 'seriesGroup')
          .attr('id', function (d, i) {
            return `${i}`
          })
          .attr('width', d => {
            const _length = d.length;
            return _length * 70 + 20;
          })
          .attr('height', this._seriesHeight)
          .attr('transform', (d, i) => {
            const len = d.length;
            let num = 0;                       //该批次之前图元个数
            for (let k = 0; k < len; k++) {
              if (d[k].match == 0)
                num++;
              else
                break;
            }
            postion[i] = -num * 70;
            return `translate(${[postion[i], i * 80]})`
          })
          .attr('custom--handle', function (d, i) {  // 自定义执行内容
            const instance1 = new Series(d3.select(this));
            instance1.joinData(d)
              .render();
          })
      )
      .on('mousewheel', seriesSlide)
      .on('mouseover', bigerbiger)
      .on('mouseout', smaller)
      .on('click', toolTip)


    //生成序号
    rootSvg.selectAll('seriesNumber')
      .data(this._rawData)
      .enter()
      .append('text')
      .attr('class', 'seriesNumber')
      .text((d, i) => {
        const flag = i + 1;
        if (flag == 2)
          return `${flag}nd`
        else if (flag == 3)
          return `${flag}rd`
        else
          return `${flag}th`
      })
      .attr('transform', (d, i) => `translate(${[0, i * 80 + 20]})`)

    //生成抽屉
    const chouti = this._container.select('.rootDiv')
      .append('div')
      .attr('id', 'tool-tip')
      .style('position', 'absolute')
      .style('width', '600px')
      .style('height', '100px')
      .style('background-color', 'white')
      .style('-webkit-border-radius', '10px')
      .style('-moz-border-radius', '10px')
      .style('border-radius', '10px')
      .style('-webkit-box-shadow', '4px 4px 10px rgba(0, 0, 0, 0.4)')
      .style('-moz-box-shadow', '4px 4px 10px rgba(0, 0, 0, 0.4)')
      .style('box-shadow', '4px 4px 10px rgba(0, 0, 0, 0.4)')
      //.style('pointer-events', 'none')
      .style('display', 'none')
      .on('click', removeTooltip)


    //序列随滚轮滑动
    const currentWidth1 = this.width;
    function seriesSlide(event) {

      const current_g = d3.select(this);
      const currentWidth = current_g.attr('width');
      const rightBorder = -(currentWidth - currentWidth1);
      const currentID = current_g.attr('id');

      if (postion[currentID] >= 0 && event.deltaY < 0) {
        current_g
          .attr('transform', `translate(${[0, currentID * 80]})`)
      }
      else if (postion[currentID] <= rightBorder && event.deltaY > 0) {
        current_g
          .transition()
          .duration(15)
          .attr('transform', `translate(${[rightBorder, currentID * 80]})`)
      }
      else {
        //postion[currentID] = postion[currentID] + event.deltaY / 5;
        current_g
          .attr('bilibili', function (d, i) {
            postion[currentID] = postion[currentID] - event.deltaY / 5;
            console.log(postion[currentID])
          })
          .transition()
          .duration(15)
          .attr('transform', `translate(${[postion[currentID], currentID * 80]})`)
      }
      event.preventDefault(); //组织默认事件，防止页面随滚轮上下滚动
    }

    //序列高亮
    function bigerbiger() {
      const current_g = d3.select(this);

      current_g.selectAll('.batch')
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

      current_g.select('.yitiaoxian')
        .attr('stroke', '#A9A9A9')
        .attr('stroke-width', 2.3)

      current_g.selectAll('.beijing')
        .attr('r', 24)
        .attr('fill', 'white')

      current_g.selectAll('.chanliang')
        .attr('r', 6.5)

      const outerPath = d3.arc().outerRadius(22).innerRadius(15).padAngle(0.07);
      current_g.selectAll('.outerArc')
        .attr("d", outerPath)
    }

    function smaller() {
      const current_g = d3.select(this);

      current_g.selectAll('.batch')
        .attr('height', 66)
        .attr('stroke-width', 1.2)
        .attr('stroke', '#ccc')
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
          return `translate(${[50 - 70 / 2 + num1 * 70, 7]})`
        })

      current_g.select('.yitiaoxian')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2)

      current_g.selectAll('.beijing')
        .attr('r', 22)
        .attr('fill', 'white')

      current_g.selectAll('.chanliang')
        .attr('r', 6)

      const outerPath = d3.arc().outerRadius(20).innerRadius(14).padAngle(0.07);
      current_g.selectAll('.outerArc')
        .attr("d", outerPath)
    }

    //抽屉
    function toolTip(){
      const current_g = d3.select(this);
      const index = Number(current_g.attr('id'));

      console.log(index)
      d3.select("#tool-tip")
        .style('top', (index + 1 ) * 80 + 10 +'px')
        .style('right', '10px')
        .style('display', 'inline');
    }

    function removeTooltip(){
      d3.select("#tool-tip")
        .style('display', 'none');
    }

    //排序实现
    function sortFunction() {
      //序列重新排序
      console.log('点到我了');
      rootSvg.selectAll('.seriesGroup')
        .sort(function (a, b) {
          let len_a = a.length;
          let len_b = b.length;
          let sum1 = 0;
          let sum2 = 0;
          for (let i = 0; i < len_a; i++) {
            if (a[i].match == 1)
              sum1 = sum1 + a[i].num;
          }
          for (let j = 0; j < len_b; j++) {
            if (b[j].match == 1)
              sum2 = sum2 + b[j].num;
          }
          return d3.descending(sum1, sum2);
        })
        .transition()
        .duration(1000)
        // .attr('transform', (d, i) => `translate(${[postion[i], i * 80]})`)
        .attr('transform', (d, i) => {
          const len = d.length;
          let num = 0;                       //该批次之前图元个数
          for (let k = 0; k < len; k++) {
            if (d[k].match == 0)
              num++;
            else
              break;
          }
          postion[i] = -num * 70;
          return `translate(${[postion[i], i * 80]})`
        })
        .attr('id', function (d, i) {
          return `${i}`
        });

      //序号重新排序
      rootSvg.selectAll('.seriesNumber')
        .sort(function (a, b) {
          let len_a = a.length;
          let len_b = b.length;
          let sum1 = 0;
          let sum2 = 0;
          for (let i = 0; i < len_a; i++) {
            if (a[i].match == 1)
              sum1 = sum1 + a[i].num;
          }
          for (let j = 0; j < len_b; j++) {
            if (b[j].match == 1)
              sum2 = sum2 + b[j].num;
          }
          return d3.descending(sum1, sum2);
        })
        .transition()
        .duration(1000)
        .attr('transform', (d, i) => `translate(${[0, i * 80 + 20]})`)
        .attr('id', function (d, i) {
          return `${i}`
        })
        .text((d, i) => {
          const flag = i + 1;
          if (flag == 2)
            return `${flag}nd`
          else if (flag == 3)
            return `${flag}rd`
          else
            return `${flag}th`
        });
    }

    //序列重新排序
    function sortFunction2() {
      rootSvg.selectAll('.seriesGroup')
        .sort(function (a, b) {
          let len_a = a.length;
          let len_b = b.length;
          let sum1 = 0;
          let sum2 = 0;
          let sum3 = 0;
          let sum4 = 0;
          for (let i = 0; i < len_a; i++) {
            if (a[i].match == 1)
              sum1 = sum1 + a[i].num;  //批次总产量
            sum3 = sum3 + a[i].good; //质量合格钢板产量
          }
          for (let j = 0; j < len_b; j++) {
            if (b[j].match == 1)
              sum2 = sum2 + b[j].num;
            sum4 = sum4 + b[j].good;
          }
          return d3.descending(sum3 / sum1, sum4 / sum2);
        })
        .transition()
        .duration(1000)
        // .attr('transform', (d, i) => `translate(${[postion[i], i * 80]})`)
        .attr('transform', (d, i) => {
          const len = d.length;
          let num = 0;                       //该批次之前图元个数
          for (let k = 0; k < len; k++) {
            if (d[k].match == 0)
              num++;
            else
              break;
          }
          postion[i] = -num * 70;
          return `translate(${[postion[i], i * 80]})`
        })
        .attr('id', function (d, i) {
          return `${i}`
        });

      //序号重新排序
      rootSvg.selectAll('.seriesNumber')
        .sort(function (a, b) {
          let len_a = a.length;
          let len_b = b.length;
          let sum1 = 0;
          let sum2 = 0;
          let sum3 = 0;
          let sum4 = 0;
          for (let i = 0; i < len_a; i++) {
            if (a[i].match == 1)
              sum1 = sum1 + a[i].num;  //批次总产量
            sum3 = sum3 + a[i].good; //质量合格钢板产量
          }
          for (let j = 0; j < len_b; j++) {
            if (b[j].match == 1)
              sum2 = sum2 + b[j].num;
            sum4 = sum4 + b[j].good;
          }
          return d3.descending(sum3 / sum1, sum4 / sum2);
        })
        .transition()
        .duration(1000)
        .attr('transform', (d, i) => `translate(${[0, i * 80 + 20]})`)
        .attr('id', function (d, i) {
          return `${i}`
        })
        .text((d, i) => {
          const flag = i + 1;
          if (flag == 2)
            return `${flag}nd`
          else if (flag == 3)
            return `${flag}rd`
          else
            return `${flag}th`
        });
    }

    //序列重新排序
    function sortFunction3() {
      rootSvg.selectAll('.seriesGroup')
        .sort(function (a, b) {
          let len_a = a.length;
          let len_b = b.length;
          let sum1 = 0;
          let sum2 = 0;
          let degree1 = 0;
          let degree2 = 0;
          for (let i = 0; i < len_a; i++) {
            if (a[i].match == 1)
              sum1++;
          }
          if (sum1 > 3)
            degree1 = 3 / sum1;
          else
            degree1 = sum1 / 3;
          for (let j = 0; j < len_b; j++) {
            if (b[j].match == 1)
              sum2++;
          }
          if (sum2 > 3)
            degree2 = 3 / sum2;
          else
            degree2 = sum2 / 3;
          return d3.descending(degree1, degree2);
        })
        .transition()
        .duration(1000)
        // .attr('transform', (d, i) => `translate(${[postion[i], i * 80]})`)
        .attr('transform', (d, i) => {
          const len = d.length;
          let num = 0;                       //该批次之前图元个数
          for (let k = 0; k < len; k++) {
            if (d[k].match == 0)
              num++;
            else
              break;
          }
          postion[i] = -num * 70;
          return `translate(${[postion[i], i * 80]})`
        })
        .attr('id', function (d, i) {
          return `${i}`
        });

      //序号重新排序
      rootSvg.selectAll('.seriesNumber')
        .sort(function (a, b) {
          let len_a = a.length;
          let len_b = b.length;
          let sum1 = 0;
          let sum2 = 0;
          let degree1 = 0;
          let degree2 = 0;
          for (let i = 0; i < len_a; i++) {
            if (a[i].match == 1)
              sum1++;
          }
          if (sum1 >= 3)
            degree1 = 3 / sum1;
          else
            degree1 = sum1 / 3;
          for (let j = 0; j < len_b; j++) {
            if (b[j].match == 1)
              sum2++;
          }
          if (sum2 >= 3)
            degree2 = 3 / sum2;
          else
            degree2 = sum2 / 3;
          return d3.descending(degree1, degree2);
        })
        .transition()
        .duration(1000)
        .attr('transform', (d, i) => `translate(${[0, i * 80 + 20]})`)
        .attr('id', function (d, i) {
          return `${i}`
        })
        .text((d, i) => {
          const flag = i + 1;
          if (flag == 2)
            return `${flag}nd`
          else if (flag == 3)
            return `${flag}rd`
          else
            return `${flag}th`
        });
    }

    return this;
  }

  //#computeWidth = () => this._viewWidth- this._margin.left - this._margin.right

}