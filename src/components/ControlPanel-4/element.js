export function addElement(g, tag, attrs) {
    let element = g.append(tag);
    return updateElement(element, attrs);
}
export function updateElement(element, attrs) {
    for (let item in attrs) {
        if (item == 'text') {
            element.text(attrs[item])
        } else if (item == 'datum') {
            element.datum(attrs[item])
        } else {
            element.attr(item, attrs[item])
        }
    }
    return element;
}
export function updateStyles(element, styles) {
    for (let item in styles) {
        element.style(item, styles[item])
    }
    return element;
}
export function updateAsyncElement(element, attrs) {
    for (let item in attrs) {
        if (attrs[item] instanceof Function) {
            if (item == 'text') {
                element.text(attrs[item])
            } else {
                element.attr(item, attrs[item])
            }
        }
    }
    return element;
}
export function stringify(num, digits){
    if(num % 1 === 0)return num;
    let str = '';
    if(digits !== undefined){
      str = num.toFixed(digits)
    }else{
      if(Math.floor(num) === 0){
        str = num.toFixed(3)
      }else{
        str = num.toFixed(2)
      }
    }
    let len = str.length;
    while(str[len - 1] === '.' || str[len - 1] === '0'){
      if(str[len - 1] === '.'){
        len --;
        break;
      }
      len --;
    }
    return str.slice(0, len)
}
export function brushPre(json){
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
  export function brushPre1(json){

    let sin = {};
    sin = {
        bid: json['bid'],
        cid: json['cid'],
        platetype: json['platetype'],
        mergeLimit: json['mergeLimit'],
        status_cooling: json['cooling'],
        slab_thickness: Array.isArray(json['slabthickness']) ? json['slabthickness'].map(num => num * 1000) : [],
        tgtdischargetemp: json['tgtdischargetemp'],
        tgtplatelength2: json['tgtlength'],
        tgtthickness: Array.isArray(json['tgtthickness']) ? json['tgtthickness'].map(num => num * 1000) : [],
        tgttmplatetemp: json['tgttmplatetemp'],
        tgtwidth: json['tgtwidth'],
        timeDiff:json['timeDiff']   
    }
 

    return sin;
  }
  export function brushPre2(json){
    let result = [];
    for(let item in json){
      let temp = json[item];
      let sin = {};
      sin = {
        bid: temp['bid'],
        cid: temp['cid'],
        slab_thickness: Array.isArray(temp['slabthickness']) ? temp['slabthickness'].map(num => num * 1000) : [],
        tgtdischargetemp: temp['tgtdischargetemp'],
        tgtplatelength2: temp['tgtlength'],
        tgtthickness: Array.isArray(temp['tgtthickness']) ? temp['tgtthickness'].map(num => num * 1000) : [],
        tgttmplatetemp: temp['tgttmplatetemp'],
        tgtwidth: temp['tgtwidth'],
        timeDiff:temp['timeDiff']  
      }
      result.push(sin);
    }
    return result;
  }
  export function updata(json){
    let result = [];
    for(let item in json){
      let temp = json[item];
      let sin = {};
      function exchange(data) {
        
        return [((data[1]+data[0])/2)-((data[1]-data[0])/4),((data[1]+data[0])/2)+((data[1]-data[0])/4)]
      }
      sin = {
        bid: temp['bid'],
        cid: temp['cid'],
        slab_thickness: Array.isArray(exchange(temp['slabthickness'])) ?exchange(temp['slabthickness']).map(num => num * 1000) : [],
        tgtdischargetemp: exchange(temp['tgtdischargetemp']),
        tgtplatelength2: exchange(temp['tgtlength']),
        tgtthickness: Array.isArray(exchange(temp['tgtthickness'])) ? exchange(temp['tgtthickness']).map(num => num * 1000) : [],
        tgttmplatetemp: exchange(temp['tgttmplatetemp']),
        tgtwidth: exchange(temp['tgtwidth']),
        timeDiff:temp['timeDiff']  
      }
      result.push(sin);
    }
    return result;
  }
