(function($){
	$.fn.AlignmentViewer = function(options){
		let opts = $.extend({}, $.fn.AlignmentViewer.defaults, options);
		if($('head > style.alignment-styles').length == 0){
			$('head').append(`<style class="alignment-styles">
	.av-row {font-family: monospace;}
	.av-n-A, .av-n-a {background-color: lightgreen;}
	.av-n-C, .av-n-c {background-color: yellow;}
	.av-n-G, .av-n-g {background-color: lightorange;}
	.av-n-T, .av-n-t {background-color: lightsalmon;}
</style>`);
		}
		let n = opts.sequences.length;
		for(let i = 0; i < n; i++){
			let content = opts.sequences[i].seq
				.toUpperCase()
				.split('')
				.map(n => `<span class="av-n-${n}">${n}</span>`)
				.join('');
			this.append(`<div class='av-row av-theme-default'>${content}</div>`);
		}
		return this;
	};
	$.fn.AlignmentViewer.defaults = {};
}(jQuery));
