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
  var alignmentViewer = function (seqs, config) {
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
      showID: true,
      useWorker: true
    }, config);

    return new Promise(function (resolve) {
      var longest = 0;
      var offset = 0;
      var n = seqs.length;
      var output = [];
      for (var i = 0; i < n; i++) {
        var s = seqs[i];
        var seq = s.seq.toUpperCase();
        var id = s.id;
        if (seq.length > longest) longest = seq.length;
        if (id.length > offset) offset = id.length;
        for (var j = 0; j < seq.length; j++) {
          if (!output[j]) output.push({ A: 0, C: 0, G: 0, T: 0, '-': 0 });
          output[j][seq[j]]++;
        }
      }
      var consensus = "";
      var m = output.length;
      var entry, maxKey, maxVal;
      for (var k = 0; k < m; k++) {
        entry = output[k];
        maxKey = 'A';
        maxVal = entry[maxKey];
        Object.keys(entry).forEach(char => {
          if (maxVal <= entry[char]) {
            maxVal = entry[char];
            maxKey = char;
          }
        });
        consensus += maxKey;
      }
      config.height |= 0;
      config.width |= 0;
      offset *= Math.ceil(config.height / 2);
      var xSpacer = Math.floor(config.width / 2), ySpacer = Math.floor(config.height / 2);
      var width = longest * config.width + offset;
      var height = seqs.length * config.height;
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = (config.height - 2) + 'px mono';
      var o = consensus.length;
      for (var col = 0; col < o; col++) {
        var c = consensus[col];
        context.fillStyle = (c in config.colors) ? config.colors[c] : config.colors['ambig'];
        var x = col * config.width + offset;
        context.fillRect(x, height, config.width, config.height);
      }
      // for (var row = 0; row < n; row++) {
      //   var s = seqs[row].seq.toUpperCase();
      //   var m = s.length;
      //   var y = row * config.height;
      //   if (config.showID) {
      //     context.textAlign = 'right';
      //     context.textBaseline = 'middle';
      //     context.fillStyle = 'black';
      //     context.fillText(seqs[row].id, offset, y + ySpacer, offset);
      //   }
      //   for (var col = 0; col < m; col++) {
      //     var c = s[col];
      //     if (c == consensus[col]) continue;
      //     context.fillStyle = (c in config.colors) ? config.colors[c] : config.colors['ambig'];
      //     var x = col * config.width + offset;
      //     context.fillRect(x, y, config.width, config.height);
      //     if (config.showChar) {
      //       context.textAlign = 'center';
      //       context.textBaseline = 'middle';
      //       context.fillStyle = 'black';
      //       context.fillText(c, x + xSpacer, y + ySpacer, config.width);
      //     }
      //   }
      // }
      resolve(canvas);
    });
  };
  return alignmentViewer;
}));
