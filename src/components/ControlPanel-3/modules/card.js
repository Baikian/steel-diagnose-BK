import * as d3 from 'd3';
import {
    SuperGroupView,
} from '@/utils';

export default class cardG extends SuperGroupView {
    constructor({ width, height }, ele) {
        super({ width, height }, ele);
        this._switch = {
            tgtthickness: true,
            tgtplatelength2: true,
            tgtwidth: false,
            slab_thickness: false,
            tgtdischargetemp: true,
            tgttmplatetemp: true,
            cooling_start_temp: false,
            cooling_stop_temp: false,
            cooling_rate1: false,
            status_cooling: true
        };
        this.width=width
        this.height =height
    }
    joinData() {
        return this
    }
    render() {
        let cardG = this._container.append('g')
        cardG
            .append('rect')
            .attr('class','cardG')
            
            .attr('fill', (d, i) => this._switch[d] ? '#f7f7f7' : 'white' )
            .attr('stroke', '#e0e0e0')
            .attr('width', 250)
            .attr('height', 70)
            .attr('rx', 10)
            .attr('ry', 10)
        let buttonG = this._container.append('g')
        buttonG
            .append('rect')
            .attr('class','min_card_rect')
            .attr('fill', (d, i) => this._switch[d] ? '#94a7b7' : '#ffffff')
            .attr('stroke', '#e0e0e0')
            .attr('width', 56)
            .attr('height', 16)
            .attr('x', 10)
            .attr('y', 10)
            .attr('rx', 5)
            .attr('ry', 5)
        buttonG
            .append('text')
            .attr('x', 20)
            .attr('y', 20)
            .attr('fill', (d, i) => this._switch[d] ? '#ffffff' : '#94a7b7')
            .attr('font-size', '12px')
            .text(d => d
                .replace(/tgtwidth/, 'tgt_wd')
                .replace(/tgtthickness/, 'tgt_th')
                .replace(/tgtplatelength2/, 'tgt_len')
                .replace(/slab_thickness/, 'slab_th')
                .replace(/tgtdischargetemp/, 'tgt_disch')
                .replace(/tgttmplatetemp/, 'tgt_temp')
                .replace(/cooling_start_temp/, 'start_temp')
                .replace(/cooling_stop_temp/, 'stop_temp')
                .replace(/cooling_rate1/, 'cooling_rate')
                .replace(/status_cooling/, 'sta_cool'))
        buttonG.on('click',(e,d)=>{
                this._switch[d] = !this._switch[d]

                this.changeColor(buttonG,cardG)
            })
    }
    changeColor(group,cardG){
        group.selectAll('text')
        .attr('fill', (d, i) => this._switch[d] ? '#ffffff' : '#94a7b7')
        group.selectAll('.min_card_rect')
        .attr('fill', (d, i) => this._switch[d] ? '#94a7b7' : '#ffffff')
        cardG.selectAll('.cardG')
        .attr('fill', (d, i) => this._switch[d] ? '#f7f7f7' : 'white')
    }
}