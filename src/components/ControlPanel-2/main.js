import TooltipClass from '@/components/Tooltip/main';
import Parallel from "./Parallel";
import { SuperSVGView} from '@/utils';
export class parallelCoordinates extends SuperSVGView {
    constructor({ width, height }, ele) {
        super({ width, height }, ele);
        this._tooltipInstance = new TooltipClass({ width: 0, height: 0 }, ele, 'ControlPanelMain');
        this._container.attr('id', 'parallel-coordinates');
        // const container=this._container.append('g');
        this._parallel = new Parallel({ width: 190, height: 480 }, this._container, this._tooltipInstance, 'ControlPanelMain',this._container);
    }
    render(value,mid) {
        this._parallel.joinData(value,mid).render()
        // ._initBrush()._brushSlider()
    }
}
