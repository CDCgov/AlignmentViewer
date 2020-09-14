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
  return (seqs, config) => {
    config = Object.assign({
      width: 1,
      height: 1,
      colors: {
        'A': '#ccff00',
        'C': '#ffff00',
        'G': '#ff9900',
        'T': '#ff6600',
        'ambig': '#ffffff'
      },
      showChar: false,
      useWorker: true
    }, config);

    return new Promise(resolve => {
      let longest = 0;
      let n = seqs.length;
      for (let i = 0; i < n; i++) {
        let s = seqs[i];
        let seq = s.seq.toUpperCase();
        if (seq.length > longest) longest = seq.length;
      }
      config.height |= 0;
      config.width |= 0;
      let width = longest * config.width;
      let height = seqs.length * config.height;
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      let context = canvas.getContext('2d', { alpha: false });
      for (let row = 0; row < n; row ++) {
        let seq = seqs[row].seq;
        let y = row * config.height;
        for (let col = 0; col < longest; col++) {
          let c = seq[col];
          if(!c) break;
          let x = col * config.width;
          context.fillStyle = (c in config.colors) ? config.colors[c] : config.colors['ambig'];
          context.fillRect(x, y, config.width, config.height);
        }
      }
      if(config.showChar){
        context.font = (config.height - 2) + 'px mono';
        context.textAlign = 'left';
        context.textBaseline = 'bottom';
        context.fillStyle = 'black';
        for (let row = 0; row < n; row++) {
          let seq = seqs[row].seq;
          let y = row * config.height + config.height;
          for (let col = 0; col < longest; col++) {
            let c = seq[col];
            if(!c) break;
            let x = col * config.width + config.width/3;
            context.fillText(c, x, y, config.width);
          }
        }
      }
      resolve(canvas);
    });
  };
}));
