import * as d3 from 'd3';
export const util = {
    labelColor: ["#c65b24", "#94a7b7"],
    GillSans: "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif",
    SegoeUI: "Segoe UI",
    brushStep: [10, 1, 0.1, 10, 5, 5],
    maxStep: [500, 30, 2.5, 200, 100, 100],
    keys: ['tgtthickness', 'tgtplatelength2', 'tgtwidth',
        'slab_thickness', 'tgtdischargetemp', 'tgttmplatetemp'],
    diagnosisArr: [10, 1, 1, 10, 5, 5, 0],//[20, 10, 1, 10, 5, 5, 0]
    newBrushData: [
        [25, 35],
        [20, 35],
        [2.5, 4.0],
        [250, 300],
        [1120, 1130],
        [600, 800],
        [0, 1]
    ],
    brushRange: [],
    diagnosisRange: [],
    lastSelections: new Map(),
    rangeData: [],
    mouseList: undefined,
    brushdata: undefined,
    svgChart: {},
    plData: undefined,
    tgtThicknessStation: 0,
    lengthStation: 0,
    widthStation: 0,
    newBrushSelection: new Map(),
}
var GillSans = "Gill Sans,Gill Sans MT,Calibri,Trebuchet MS,sans-serif"
var SegoeUI = "Segoe UI"
var tabularTooltipAttr = {
    line1: setAttr(GillSans, "white", "12px", "bold", "normal"),
    line2: setAttr(GillSans, "white", "12px", "normal", "normal"),
    line3: setAttr(GillSans, "white", "12px", "normal", "normal")
  }
function setAttr(family, color, size, weight, style) {
    return {
      fontFamily: family,
      fontColor: color,
      fontSize: size,
      fontWeight: weight, // normal | bold | bolder | number
      fontStyle: style    // normal | italic
    }
  }
export const until ={
    tabularTooltipAttr : tabularTooltipAttr
}
export default function deGroupStyle() {

    return d => +d.label === 0 ? "#e3ad92" : "#b9c6cd"}