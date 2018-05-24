(function (root, factory){
  if(typeof define === 'function' && define.amd){
    define([], function(){
      return (root.alignmentViewer = factory());
    });
  } else if(typeof module === 'object' && module.exports){
    module.exports = factory();
  } else {
    root.alignmentViewer = factory();
  }
}(typeof self !== 'undefined' ? self : this, function(){
	var alignmentViewer = function(seqs, config){
    config = Object.assign({
      width: 1,
      height: 1,
      colors: {
  			'A' : 'lightgreen',
  			'G' : 'orange',
  			'C' : 'yellow',
  			'T' : 'red'
      }
    }, config);
		var longest = 0;
    var n = seqs.length;
    for(var i = 0; i < n; i++){
      var s = seqs[i];
      if(s.length > longest){
        longest = s.length;
      }
    }
    var canvas = document.createElement('canvas');
    canvas.width = longest * config.width;
    canvas.height = seqs.length * config.height;
    var context = canvas.getContext('2d', { alpha: false });
    for(var row = 0; row < n; row++){
      var s = seqs[row].toUpperCase().split('');
      var m = s.length;
      for(var col = 0; col < m; col++){
        var c = s[col];
        if(!c in config.colors) return;
        context.beginPath();
				context.fillStyle = config.colors[c];
        context.fillRect(col*config.width, row*config.height, config.width, config.height);
        context.closePath();
      }
    }
    return new Promise(function(resolve){ resolve(canvas); });
	};
  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return alignmentViewer;
}));
