(function (root, factory){
  if(typeof define === 'function' && define.amd){
    define(['d3'], function (d3){
      return (root.alignmentViewer = factory(d3));
    });
  } else if(typeof module === 'object' && module.exports){
    module.exports = factory(require('d3'));
  } else {
    root.alignmentViewer = factory(root.d3);
  }
}(typeof self !== 'undefined' ? self : this, function(d3){
	var alignmentViewer = function(target, seqs, width, height, colors){
		if(!width) width = 1;
		if(!height) height = 1;
		if(!colors) colors = {
			'A' : 'lightgreen',
			'G' : 'orange',
			'C' : 'yellow',
			'T' : 'red'
    };
		var longest = 0;
		seqs.forEach(s => { if(s.length > longest){ longest = s.length; }});
    var canvas = d3.select(target).append('canvas')
			.attr('height', height*seqs.length)
			.attr('width', width*longest);
    var context = canvas.node().getContext('2d');
    seqs.forEach(function(s, row){
			if(s.length > longest) longest = s.length;
      s.toUpperCase().split('').forEach(function(c, col){
        if(!c in colors) return;
        context.beginPath();
				context.fillStyle = colors[c];
        context.fillRect(col*width, row*height, width, height);
        context.closePath();
      });
    });
		return canvas;
	};
  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return alignmentViewer;
}));
