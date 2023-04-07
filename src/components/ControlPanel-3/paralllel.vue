<template>
    <div id="brushableParallel" style='height: 100%; width:100%' overflow-y='auto' >
     
    </div>
</template>
<script setup>
import * as d3 from 'd3';
import { addElement, updateElement, updateAsyncElement , updateStyles, stringify } from "./element";

// import { brushPre } from "./dataMonth";
function brushPre(json){
  let result = [];
  for(let item in json){
    let temp = json[item];
    let sin = {};
    sin = {
      cooling_rate1: temp['cooling_rate1'],
      cooling_start_temp: temp['cooling_start_temp'],
      cooling_stop_temp: temp['cooling_stop_temp'],
      label: temp['flag'],
      productcategory: temp['productcategory'],
      slab_thickness: temp['slabthickness'] * 1000,
      steelspec: temp['steelspec'],
      tgtdischargetemp: temp['tgtdischargetemp'],
      tgtplatelength2: temp['tgtplatelength2'],
      tgtthickness: temp['tgtplatethickness'],
      tgttmplatetemp: temp['tgttmplatetemp'],
      tgtwidth: temp['tgtwidth'],
      toc: temp['toc'],
      upid: temp['upid'],
    }
    sin.status_cooling = sin.cooling_rate1 !== null ? 0 : 1;
    result.push(sin);
  }
  return result;
}
function paintParallel(plData) {
	let newBrushData= [	[25, 35],[20, 35],[2.5, 4.0],[250, 300],[1120, 1130],[600, 800],[0, 1]];
	let maxStep= [500, 30, 2.5, 200, 100, 100];
	let brushStep= [10, 1, 0.1, 10, 5, 5];
	let diagnosisArr= [10, 1, 1, 10, 5, 5, 0];
	let diagnosisRange=[]
	let state = {
    isSwitch: true,
    labelColor: [ "#c65b24", "#94a7b7"], //bad good
    noflagColor: '#71797E',
    brushSelectColor: "#c6cacc",
    multiPara: 20,
    curveSize: 0.5,
    hightlightGroup: [],
    }
    var delabelColor = ["#e3ad92",   "#b9c6cd"]
    
    let diagnosisState={
			default: false,
			type: Boolean,
			require: true
		}
    const data = brushPre(plData);
    plData = data;
    let  brushdata = data;
    var width = 355;
    const keys = ['tgtthickness', 'tgtplatelength2', 'tgtwidth','slab_thickness', 'tgtdischargetemp', 'tgttmplatetemp'];
    const newkeys = [...keys, 'status_cooling'];
    brushdata = brushdata.filter(d => keys.every(e => typeof d[e] === 'number'));
    console.log('brushdata',brushdata);
    var margin = { top: 40, right: 40, bottom: 50, left: 20 };	// var margin = {top: 40, right: 20, bottom: 40, left: 20},
    const allArray = [0, 1].map(d => d3.filter(brushdata, (e, f) => e['status_cooling'] == d));	//coolingArray nocoolingArray
    var xCooling = d3
        .scaleBand() //Ordinal scale
        .domain(d3.range(allArray.length))
        .range([margin.left, width - margin.right - margin.left]),
        yCooling = d3
            .scaleLinear()
            .domain([0, d3.max(allArray, d => d.length)])
            .nice()
            .range([40, 0]);
    var brushHeight = 10,
       
        bardata = d3.map(keys, d => d3.map(brushdata, index => index[d])),
        barbin = d3.map(keys, (d, i) => {
            return d3.bin().thresholds(10)(bardata[i]);
        });
    var parpallelDomain = d3.map(barbin, d => [d[0].x0, d.slice(-1)[0].x1]);
    // console.log(d3.scalePow().domain);
    console.log('barbin',barbin)

    var arc = d3.arc().innerRadius(0).outerRadius(6).startAngle(0)
    .endAngle((d, i) => (i ? 2 * Math.PI : -2 * Math.PI));
    var barScale = d3.map(barbin, array => d3.scalePow().domain([0, 1, d3.max(d3.map(array, d => d.length))]).range([0, 5, 35]));
    var width = document.getElementById('ControlPanelMain').offsetWidth;
	console.log(width,width)
    const height = (keys.length + 1) * 80;
    // 建立各个x轴范围
    var parpallelDomain = d3.map(barbin, d => [d[0].x0, d.slice(-1)[0].x1]);
	console.log('parpallelDomain',parpallelDomain);
    var x = new Map(Array.from(keys, (key, index) => [key, d3.scaleLinear(parpallelDomain[index], [margin.left, width - margin.right]).clamp(true)]));
    console.log('x',x)
    var y = d3.scalePoint(newkeys, [margin.top, height - margin.bottom])
    var xScale = d3
            .axisBottom(xCooling)
            .tickSizeOuter(0)
            .tickSizeInner(0);
    x.set('status_cooling', d3.scaleLinear([-1, 2], [margin.left, width - margin.right]));
    var line = d3.line()
	.defined(([, value]) => value != null)
	.x(([key, value]) => x.get(key)(value))
	.y(([key]) => y(key));
	var brushHandle = (g, selection) =>
					g
						.selectAll('.handle--custom')
						.data([{type: 'w'}, {type: 'e'}])
						.join(enter =>
							enter
								.append('path')
								.attr('class', 'handle--custom')
								.attr('fill', 'white')
								.attr('fill-opacity', 1)
								.attr('stroke', '#90a4ae')
								.attr('stroke-width', 2)
								.attr('cursor', 'ew-resize')
								.attr('d', arc)
						)
						.attr('display', selection === null ? 'none' : null)
						.attr('transform', selection === null ? null : (d, i) => `translate(${selection[i]},${0})`);
	let svg = d3.select('#brushableParallel')
				.append('svg')
				.attr('width', width)
				.attr('height', height);
    let brushSelection= new Map();
    // 这里后要改为刷中的数据brushdata
	for (let item in keys) {
				brushSelection.set(keys[item],d3.extent(brushdata,d => d[keys[item]]));

			}
	var selections = brushSelection;
	function deGroupStyle() {
        return state.isSwitch ? (d => +d.label === 0 ? "#e3ad92" : "#b9c6cd") : (d => utils.categoryColor(d.productcategory))
   		 }

    console.log('selections',selections)
    class parallelLines{
        constructor(container) {
           this._container = container;
					this._mainG = null;
					this._g = null;
					this._width = 640;
					this._height = 640;
					this._x = x;
					this._y = y;
					this._objStatus = {
						tgtthickness: true,
						tgtplatelength2: true,
						tgtwidth: false,
						slab_thickness: false,
						tgtdischargetemp: true,
						tgttmplatetemp: true,
						status_cooling: true
					};
					this._cardG = null;
					this._cardAttrs = null;
					this._buttonG = null;
					this._buttonAttrs = null,
					this._rectRectAttrs = null,
					this._rectTextAttrs = null;
					this._rectBarG = null;
					this._rectBarAttrs = null;
					this._brushG = null;
					this._brushHeight = 10;	//brushHeight
					this._lineG = null;
					this._dataMap = d3.group(brushdata, d => d.upid);
        }
		
	// 换文字替换
        _initAttrs(){
            this._cardAttrs = {
                transform: d => `translate(${margin.left - 10},${y(d) - 42})`,
                fill: d => this._objStatus[d] ? '#f7f7f7' : 'white',
                'fill-opacity': d => this._objStatus[d] ? 0.7 : 1,
                stroke: '#e0e0e0',
                'stroke-width': 1,
                'stroke-opacity': d => this._objStatus[d] ? 1 : 0,
                width: width - margin.right - margin.left + 20,
                height: 70,
                rx: 10,
                ry: 10
            };
            this._buttonAttrs ={
                transform: d => `translate(${margin.left + 30},${y(d) + 19 + 6})`
            },
            this._rectRectAttrs = {
                class: 'rectButton',
                x:  -30,
                y: -45,
                width: 56,
                height: 16,
                rx: 5,
                ry: 5,
                fill: d => this._objStatus[d] ? '#94a7b7' : '#ffffff'
            },
            this._rectTextAttrs = {
                'class': 'textButton',
                'x': -1,
                'y': -35,
                'text-anchor': 'middle',
                'fill': d => this._objStatus[d] ? '#ffffff' : '#94a7b7',
                'font-family':"Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
                'font-weight': "Segoe UI",
                'font-size': '12px',
                'cursor': 'pointer',
                text: d => d
                    .replace(/tgtwidth/, 'tgt_wd')
                    .replace(/tgtthickness/, 'tgt_th')
                    .replace(/tgtplatelength2/, 'tgt_len')
                    .replace(/slab_thickness/, 'slab_th')
                    .replace(/tgtdischargetemp/, 'tgt_disch')
                    .replace(/tgttmplatetemp/, 'tgt_temp')
                    .replace(/cooling_start_temp/, 'start_temp')
                    .replace(/cooling_stop_temp/, 'stop_temp')
                    .replace(/cooling_rate1/, 'cooling_rate')
                    .replace(/status_cooling/, 'sta_cool')
            }
        }  
        _initCardG(){
            this._cardG = this._mainG.append('g').attr('class', 'cardG');
            this._cardG.selectAll('rect')
            .data(newkeys)// .data(keys)
            .join('rect')
            .call(g => updateElement(g, this._cardAttrs));
        }
        _initButtonG(){
            const context = this;
            this._buttonG = this._mainG.append('g').attr('class', 'buttonGroup');
            this._buttonG
                .selectAll('g')
                .data(newkeys)	// .data(keys)
                .join('g')
                .call(g => updateElement(g, this._buttonAttrs))
                .call(g => addElement(g, 'rect', this._rectRectAttrs))
                .call(g => addElement(g, 'text', this._rectTextAttrs))
                .on('click', function(e, d) {
                    context._objStatus[d] = !context._objStatus[d];
                    const t = d3.transition()
                        .duration(300)
                        .ease(d3.easeLinear);
                    context._buttonG
                        .transition(t)
                        .call(g => updateElement.call(context, g.selectAll('.rectButton'), context._rectRectAttrs))
                        .call(g => updateElement.call(context, g.selectAll('.textButton'), context._rectTextAttrs))
                    context._cardG
                        .transition(t)
                        .call(g => updateElement(g.selectAll('rect'), context._cardAttrs))
                });
        }
        _initRectBar(){
            const goodBarAttrs = (item) => {
                return {
                    fill: "#94a7b7",
                    stroke: '#eee',
                    class: 'rect' + item,
                    'stroke-width': 0.5,
                    x: d => 0.75 * x.get(keys[item])(d.x0) + 0.25 * x.get(keys[item])(d.x0),
                    y: d => -barScale[item](d3.filter(brushdata, e => e[keys[item]] <= d.x1 && d.x0 <= e[keys[item]] && +e.label === 1)
                        .length) + 1,
                    height: d => barScale[item](d3.filter(brushdata, e => e[keys[item]] <= d.x1 && d.x0 <= e[keys[item]] && +e.label === 1)
                    .length),
                    width: d => 0.5* (x.get(keys[item])(d.x1) - x.get(keys[item])(d.x0))
                }
            },
            badBarAttrs = (item) => {
                return {
                    fill:"#c65b24",
                    stroke: '#eee',
                    class: 'rect' + item,
                    'stroke-width': 0.5,
                    x: d => 0.75 * x.get(keys[item])(d.x0) + 0.25 * x.get(keys[item])(d.x0),
                    y: 10,
                    height: d => barScale[item](d3.filter(brushdata, e => e[keys[item]] <= d.x1 && d.x0 <= e[keys[item]] && +e.label === 0)
                    .length),
                    width: d => 0.5* (x.get(keys[item])(d.x1) - x.get(keys[item])(d.x0))
                }
            }
            this._rectBarG = this._mainG.append('g').attr('class', 'rectBar');
            for (let item in keys) {
                // 柱状图
                this._rectBarG
                    .append('g')
                    .attr('transform', `translate(0,${y(keys[item])})`)
                    .selectAll('.rect' + item)
                    .data(barbin[item])
                    .join('g')
                    .call(g => addElement(g, 'rect', goodBarAttrs(item)))
                    .call(g => addElement(g, 'rect', badBarAttrs(item)));
            }
            this._rectBarG.raise();
        }
        _updateRectBar(selection, key){
			if (selection === null) {
				this._rectBarG.selectAll('.rect' + keys.indexOf(key)).attr('opacity', 0.5);
			} else {
				let brushRange = d3.map(selection, x.get(key).invert);
				// console.log('brushRange',brushRange)
				this._rectBarG.selectAll('.rect' + keys.indexOf(key)).attr('opacity', (d, i) =>
					(d.x0 + d.x1) / 2 >= brushRange[0] && (d.x0 + d.x1) / 2 <= brushRange[1] ? 0.5 : 0.05
					);
			}
		}
        _initCoolBar(){
			// rectcooling是否过冷却
			const goodAttrs = {
				x: (d, i) => x.get('status_cooling')(i) - 9.375,
				y: d => yCooling(d3.filter(d, e => e['label'] == '1').length),
				height: d => yCooling(0) - yCooling(d3.filter(d, e => e['label'] == '1').length),
				width: 20,
				fill: "#94a7b7",
				opacity: 0.5,
				stroke: '#eee',
				'stroke-width': 1
			},
			badAttrs = {
				x: (d, i) => x.get('status_cooling')(i) - 9.375,
				y: 50,
				height: d => yCooling(0) - yCooling(d3.filter(d, e => e['label'] == '0').length),
				width: 20,
				fill: "#c65b24",
				opacity: 0.5,
				stroke: '#eee',
				'stroke-width': 1
			};
			const coolBarG = this._mainG.append('g');
				coolBarG
				.attr('class', 'rectCooling')
				.attr('transform', `translate(0,${height - 95})`)
				.selectAll('rect')
				.data(allArray)
				.join('g')
				.call(g => addElement(g, 'rect', goodAttrs))
				.call(g => addElement(g, 'rect', badAttrs));
		}
		// 底部的按钮
        _initBottomButtonG(){
			const groupAttrs = {
			transform: (d, i) => `translate(${[x.get('status_cooling')(i) - 5.5, height - 10]})`,
			class: (d, i) => 'coolingButton' + i
		},
		borderAttrs = {
			fill: 'none',
			stroke: '#ccc',
			'stroke-width': 2,
			width: 10,
			height: 10
		};
		this._mainG
			.append('g')
			.attr('class', 'bottomButton')
			.selectAll('g')
			.data(['cooling', 'nocooling'])
			.join('g')
			.call(g => updateElement(g, groupAttrs))
			.call(g => addElement(g, 'rect', borderAttrs))
		} 
		// 底部的按钮的点击更新
        _updateButtomButtonG(selected){
					const iconAttrs ={
						class: 'successIcon',
						width: '10px',
						height: '10px',
						// href: success,
						visibility: (d, i) => selected.some(d => d.status_cooling === i) ? 'visible' : 'hidden'
					};
					this._mainG.selectAll('.successIcon').remove();
					this._mainG.select('.bottomButton').selectAll('g')
						.call(g => addElement(g, 'image', iconAttrs))
		}
        _brushFunc(selection, key){
					let selected = [];
					this._updateRectBar(selection, key);
					this._updateLine(selected);
					selected = Array.from(new Set(selected));
					this._container.property('value', selected).dispatch('input');
					this._brushSlider();
					this._updateButtomButtonG(selected);
				}
		// 有注释
        _initBrush(){
					const brush = d3
						.brushX()
						.extent([
							[margin.left, -(brushHeight / 2)],
							[width - margin.right, brushHeight / 2]
						])
						.on('start brush end', basebrushed);
					const context = this;
					function basebrushed({selection}, key) {
						// if(diagnosisState.default)return;			
						d3.select(this).call(brushHandle, selection);
						// if(diagnosisState.default && svgChart['instance']._objStatus[key])return;
						// if (selection === null) selections.delete(key);
						 selections.set(key, selection.map(x.get(key).invert));
						svgChart['instance']._brushFunc(selection, key);
					}
					const brushAttrs ={
						transform: d => `translate(0,${y(d) + 6})`,
						id: (d, i) => 'parallel' + i
					}
					this._brushG = this._mainG
						.append('g')
						.attr('class', 'baseBrush');
					this._brushG.selectAll('g')
					.data(keys)	// .data(newkeys)
					.join('g')
					.call(g => updateElement(g, brushAttrs))
					.each(function(d, i) {
						d3.select(this).call(
							d3.axisBottom(x.get(d))
								.ticks(5));
					})
					.call(g => g.selectAll('.domain').remove())
					.call(brush)
					.attr('class', (d, i) => 'brushX' + i)
					.call(brush.move, (d, i) => selections.get(d).map(x.get(d)));
					this._brushG
						.append('rect')
							.attr('transform', `translate(${0},${height - margin.bottom - 15})`)
							.attr('x', 20)
							.attr('y', 10)
							.attr('width', width - margin.left - margin.right)
							.attr('height', this._brushHeight)
							.attr('class', 'overlay')
							.raise();
				}
        _brushSlider(){
					const overLayAttrs = {
							fill: '#eeeeee',
							rx: 5,
							ry: 5,
							stroke: '#bbbbbb',
							'stroke-width': 1
						}
					const selectionAttrs = {
						rx: 5,
						ry: 5,
						stroke: '#aaa',
						'stroke-width': 1
					}
					const tickTextAttrs = {
						stroke: 'none',
						'font-family': "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
						color: "#2c3e50",
						'font-size':"12px",
						'font-weight': "normal",
						'font-style': "normal"
					}
					updateElement(this._brushG.selectAll('.overlay'), overLayAttrs).raise();
					updateElement(this._brushG.selectAll('.selection'), selectionAttrs).raise();
					this._brushG.selectAll('.handle--custom').raise();
					updateElement(this._brushG.selectAll('.tick text'), tickTextAttrs);
					this._raise();
				}
        //这里有鼠标事件还没绑定 
		// 线的样式需要更改
        _initLine(){
					const lineAttrs = {
						// 此处
						stroke: "#e3ad92",
						id: d => `paraPath${d.upid}`,
						d: d => line(d3.cross(newkeys, [d], (key, d) => [key, d[key]])),
						// d3.cross([1, 2], ["x", "y"], (a, b) => a + b); // returns ["1x", "1y", "2x", "2y"]
						// line = d3.line().defined(([, value]) => value != null).x(([key, value]) => x.get(key)(value)).y(([key]) => y(key));
						class: 'steelLine',
						fill: 'none',
						'stroke-width': 1,
						'stroke-opacity': 0.6
					}
					this._lineG = this._mainG.append('g').attr('class', 'parallelPath');
					this._lineG.selectAll('path')
						.data(Object.values(brushdata).sort((a, b) => d3.ascending(a['upid'], b['upid'])))
						.join('path')
						.call(g => updateElement(g, lineAttrs))
						// .on('mouseover', pathover)
						// .on('mouseout', pathout);
				}
		// 用到vuex中的deGroupStyle
        _updateLine(selected){
			// console.log('新的selections',selections)
					this._lineG.selectAll('path').each(function(d){
						
						const active = Array.from(selections).every(
							([key, [min, max]]) => d[key] >= min && d[key] <= max
						);
						d3.select(this).attr('stroke', active ? deGroupStyle() : 'none');
// function deGroupStyle() { return state.isSwitch ? (d => +d.label === 0 ? "#e3ad92" : "#b9c6cd") : (d => utils.categoryColor(d.productcategory))}
						if(active){
							d3.select(this).raise();
							selected.push(d);
						}
					});
				}
        _raise(){
					['.rectBar', '.cardG'].map(d => this._mainG.selectAll(d).lower());
					this._mainG.select('.bottomButton').raise();
				}
		_initControl(){
					const context = this, vN = context.vNode;
					const minusG = this._mainG.append('g').attr('class', 'minusG');
					const plusG = this._mainG.append('g').attr('class', 'plusG');
					const textG = this._mainG.append('g').attr('class', 'textG');
					const minusAttrs ={
						transform: d => `translate(${width - margin.right / 2},${y(d) + 25 - 7.5})  scale(0.8)`
					},
					minusRect = {
						height: 15,
						width: 20,
						rx: 2,
						ry: 2,
						stroke: "#b9c6cd",
						fill: '#ffffff',
						'cursor': 'pointer'
					},
					minusText = {
						x: 10,
						y: 14,
						text: '-',
						'text-anchor': 'middle',
						'fill': '#94a7b7',
						'font-family': "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
						'font-weight':  "normal",
						'font-style':  "normal",
						'font-size': '22px',
						'cursor': 'pointer'
					},
					plusAttrs ={
						transform: d => `translate(${width - margin.right / 2 },${y(d) - 25 + 7.5})  scale(0.8)`
					},
					plusRect = {
						height: 15,
						width: 20,
						rx: 2,
						ry: 2,
						stroke: "#b9c6cd",
						fill: '#ffffff',
						'cursor': 'pointer'
					},
					plusText = {
						x: 10,
						y: 14,
						text: '+',
						'text-anchor': 'middle',
						'fill': '#94a7b7',
						'font-family':"Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
						'font-weight': "normal",
						'font-style':  "normal",
						'font-size': '18px',
						'cursor': 'pointer'
					};
					minusG
						.selectAll('g').data(keys).join('g')
							.call(g => updateElement(g, minusAttrs))
							.call(g => addElement(g, 'rect', minusRect))
							.call(g => addElement(g, 'text', minusText))
							.on('click', function(e, d){
								const i = keys.indexOf(d);
								if(!context._objStatus[d])return;
								if(diagnosisRange[i][1] - diagnosisRange[i][0] < 2 * brushStep[i])return;
								diagnosisArr[i] = +(diagnosisArr[i] - brushStep[i]).toFixed(1);
								diagnosisRange = newBrushData.map((d, i) => d.map((e, f) => e  + (-1 + 2 * f) *diagnosisArr[i])).slice(0, -1);
								context._updateDiagnosis()
							});
					plusG
						.selectAll('g').data(keys).join('g')
							.call(g => updateElement(g, plusAttrs))
							.call(g => addElement(g, 'rect', plusRect))
							.call(g => addElement(g, 'text', plusText))
							.on('click', function(e, d){
								const i = keys.indexOf(d);
								if(!context._objStatus[d])return;
								if( brushStep[i] + diagnosisArr[i] > maxStep[i])return;
								diagnosisArr[i] = +(diagnosisArr[i] + brushStep[i]).toFixed(1);
								diagnosisRange = newBrushData.map((d, i) => d.map((e, f) => e  + (-1 + 2 * f) *diagnosisArr[i])).slice(0, -1);
								context._updateDiagnosis()
							});
					const valueAttrs ={
						transform: d => `translate(${width - margin.right / 2 - 2},${y(d)})  scale(0.8)`
					},
					valueText = {
						x: 12,
						y: 14,
						text: (d, i) => diagnosisArr[i],
						'fill': '#94a7b7',
					},
					valueStyle = {
						'text-anchor': 'middle',
						'font-family':"Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
						'font-weight':  "normal",
						'font-style':  "normal",
						'font-size': '18px',
						'cursor': 'pointer'
					};
					textG.selectAll('g').data(keys).join('g')
							.call(g => updateElement(g, valueAttrs))
							.call(g => addElement(g, 'text', valueText))
					textG.call(g => updateStyles(g.selectAll('text'), valueStyle))
				}		
        render(){
           this._mainG = this._container.append('g').attr('class', 'mainG');
            this._initAttrs();
            this._initCardG();
            this._initRectBar();
            this._initCoolBar();
            this._initButtonG();
            this._initBottomButtonG();
            this._initLine();
			this._initBrush();
			this._brushSlider(); 
			this._initControl();           
            return this;
        }  
    }
    console.log('this',this )
    let svgChart={}
    svgChart['instance'] = new parallelLines(svg);
    svgChart['instance'].render();

}
defineExpose({ paintParallel });
</script>
<style scoped>
#brushableParallel{
	overflow-y:auto
}
</style>