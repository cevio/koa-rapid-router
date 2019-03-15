module.exports = class StringToRegExp {
  static isStatic(str) {
    // return !/\{([^\}]+)\}/.test(str);
    // use indexof instead of regexp
    // 100000000 times loop
    // example: 
    // var t = Date.now();
    // var i = 0;
    // var string = '/interface/api/{xxx:zzz}/dist';
    // var reg = /\{[^\}]+\}/;
    // var time = 100000000;
    // for (i = 0; i < time; i++) {
    //   reg.test(string);
    // }
    // console.log(Date.now() - t); // 2879
    // t = Date.now();
    // for (i = 0; i < time; i++) {
    //   string.indexOf('{') > -1 && string.indexOf('}') > -1;
    // }
    // console.log(Date.now() - t); // 54
    return str.indexOf('{') === -1;
  }

  constructor(string, expressions = {}) {
    this.string = string;
    this.match_regexp = null;
    this.exec_regexp = null;
    this.params = null;
    this.greedy = false;
    this.expressions = Object.assign(expressions, {
      any: '.+',
      string: '[a-zA-Z0-9]+',
      number: '\\d+',
    });
    this.init();
  }

  addType(name, value) {
    if (typeof value !== 'string') {
      throw new Error('SuperUrlPath.addType excpect a value of string, but got a value of ' + typeof value);
    }
    this.expressions[name] = value;
  }

  init() {
    const strArray = this.string.split(/\{([^\}]+)\}/g);
    const match_pathes = [];
    const exec_pathes = [];
    const params = {};
    let _idx = 0;
    for (let j = 0; j < strArray.length; j++) {
      const item = strArray[j];
      if (j % 2 === 1) {
        const { token, regexp, ignore } = format(item);
        params[token] = {
          index: ++_idx,
          regexp, ignore
        };
        if (regexp === 'any' && ignore) {
          if (this.greedy) throw new Error('you can not use `?:any` any more.');
          this.greedy = true;
        }
        exec_pathes.push(ignore ? '(.+?)?' : '(.+?)');
        if (!this.expressions[regexp]) throw new Error('can not find the type of ' + regexp);
        if (ignore) {
          match_pathes.push(`(${this.expressions[regexp]})?`);
        } else {
          match_pathes.push(`(${this.expressions[regexp]})`);
        }
      } else {
        const _value = transformRegExp(item);
        exec_pathes.push(_value);
        match_pathes.push(_value);
      }
    }
    this.match_regexp = new RegExp('^' + match_pathes.join('') + '$');
    this.exec_regexp = new RegExp('^' + exec_pathes.join('') + '$');
    this.params = params;
  }

  match(str) {
    return this.match_regexp.test(str);
  }

  exec(str, callback) {
    const exec = this.exec_regexp.exec(str);
    const res = {};
    for (const i in this.params) {
      const index = this.params[i].index;
      callback && callback(i, exec[index]);
      res[i] = exec[index];
    }
    return res;
  }
}

function format(exp) {
  const _exp = exp.split(':');
  let token = _exp[0].trim();
  const regexp = _exp[1] ? _exp[1].trim() : 'any';
  const ignore = token[token.length - 1] === '?';
  if (ignore) {
    token = token.substr(0, token.length - 1);
  }
  const tokenRegExp = /^[a-zA-Z_\$]([a-zA-Z0-9_\$]+)?$/;
  if (!tokenRegExp.test(token)) throw new Error(`token<${token}> formatted error, only '${tokenRegExp.toString()}' can been accepted.`);
  return {
    token, regexp, ignore
  }
}

function transformRegExp(str) {
  const detail = '^$.*+-?=!:|\/()[]{}';
  for (let i = 0; i < detail.length; i++) {
    str = str.replace(new RegExp('\\' + detail[i], 'g'), `\\${detail[i]}`);
  }
  return str;
}