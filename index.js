(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return (root.alignmentViewer = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.alignmentViewer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return (seqs, config = {}) => {
    config = Object.assign({
      width: 1,
      height: 1,
      showChar: false
    }, config, {
      colors: Object.assign({
        'A': '#ccff00',
        'C': '#ffff00',
        'G': '#ff9900',
        'T': '#ff6600',
        'ambig': '#ffffff'
      }, ('colors' in config) ? config.colors : {}),
    });

    return new Promise(resolve => {
      let longest = 0;
      let n = seqs.length;
      for (let i = 0; i < n; i++) {
        let s = seqs[i];
        let seq = s.seq.toUpperCase();
        if (seq.length > longest) longest = seq.length;
      }
      let ch = Math.ceil(config.height);
      let cw = Math.ceil(config.width);
      let width = longest * config.width;
      let height = seqs.length * config.height;
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      let context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = config.colors['ambig'];
      context.fillRect(0, 0, width, height);
      Object.keys(config.colors).forEach(nucleotide => {
        if(nucleotide == 'ambig') return;
        context.fillStyle = config.colors[nucleotide];
        for (let row = 0; row < n; row ++) {
          let seq = seqs[row].seq;
          let y = Math.floor(row * ch);
          for (let col = 0; col < longest; col++) {
            let c = seq[col];
            if(!c) break;
            if(c != nucleotide) continue;
            let x = Math.floor(col * cw);
            context.fillRect(x, y, cw, ch);
          }
        }
      });
      if(config.showChar){
        context.font = (config.height - 2) + 'px mono';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        context.fillStyle = 'black';
        for (let row = 0; row < n; row++) {
          let seq = seqs[row].seq;
          let y = row * ch + ch;
          for (let col = 0; col < longest; col++) {
            let c = seq[col];
            if(!c) break;
            let x = col * cw + cw/3;
            context.fillText(c, x, y, cw);
          }
        }
      }
      resolve(canvas);
    });
  };
}));
