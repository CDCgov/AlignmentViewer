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
    // Sequences are uppercased below, so uppercase single-character color keys
    // to match. Longer keys such as 'ambig' are kept as they are.
    const given = Object.assign({}, config.colors);
    const colors = {};
    Object.keys(given).forEach(key => {
      colors[key.length === 1 ? key.toUpperCase() : key] = given[key];
    });
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
      }, colors),
    });

    return new Promise((resolve, reject) => {
      let longest = 0;
      let n = seqs.length;
      const rows = [];
      for (let i = 0; i < n; i++) {
        let seq = seqs[i].seq.toUpperCase();
        rows.push(seq);
        if (seq.length > longest) longest = seq.length;
      }
      let ch = Math.ceil(config.height);
      let cw = Math.ceil(config.width);
      let width = longest * cw;
      let height = n * ch;
      let fail = () => reject(new Error('alignmentViewer: cannot create a ' + width + 'x' + height +
        " canvas (invalid size, or exceeds this browser's canvas limits)"));
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      if (canvas.width !== width || canvas.height !== height) return fail();
      let context = canvas.getContext('2d', { alpha: false });
      if (!context) return fail();
      context.fillStyle = config.colors['ambig'];
      context.fillRect(0, 0, width, height);
      if ((width > 8192 || height > 8192 || width * height >= 16777216) && width && height) {
        // Oversized canvases may be silently unusable; alpha:false means a working one reads alpha 255.
        let px;
        try {
          px = context.getImageData(0, 0, 1, 1).data;
        } catch {
          return fail();
        }
        if (!px[0] && !px[1] && !px[2] && !px[3]) return fail();
      }
      Object.keys(config.colors).forEach(nucleotide => {
        if(nucleotide == 'ambig') return;
        context.fillStyle = config.colors[nucleotide];
        for (let row = 0; row < n; row ++) {
          let seq = rows[row];
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
        context.font = Math.max(1, ch - 2) + 'px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';
        for (let row = 0; row < n; row++) {
          let seq = rows[row];
          let y = row * ch + ch / 2;
          for (let col = 0; col < longest; col++) {
            let c = seq[col];
            if(!c) break;
            let x = col * cw + cw / 2;
            context.fillText(c, x, y, cw);
          }
        }
      }
      resolve(canvas);
    });
  };
}));
