# AlignmentViewer

Alignment Viewer is a simple widget to visualize multiple genome sequences.

## Demo

```{javascript}
sequences = [
  'ACTGACTAGCTAGCTAACTG',
  'GCATCGTAGCTAGCTACGAT',
  'CATCGATCGTACGTACGTAG',
  'ATCGATCGATCGTACGATCG'
];
alignmentViewer('body', sequences);
```
![][sampleOutput]

## Syntax

`alignmentViewer(target, seqs, width, height, colors)` where:
* `target` - a CSS selector for the DOM Node into which the Canvas should be inserted
* `seqs` - an array of sequence strings
* `width` - OPTIONAL, the width (in pixels) _of each cell_. Please note that this is not the width of the output figure. Defaults to 10
* `height` - OPTIONAL, the height (in pixels) _of each cell_. Please note that this is not the height of the output figure. Defaults to 10
* `colors` - OPTIONAL, an object mapping from the nucleotide to the color of the corresponding cell in the output image. Defaults to a close analog of the [Taylor color scheme](http://www.jalview.org/help/html/colourSchemes/taylor.html):
```
colors = {
  'A' : 'lightgreen',
  'G' : 'orange',
  'C' : 'yellow',
  'T' : 'red'
}
```

## Isn't this what [MSAViewer](http://msa.biojs.net/) is for?

Yup.

## So why build another?

MSAViewer is [an awesome App](http://msa.biojs.net/app/). However, it's a difficult widget. What I mean is, it works great on pages where it's the only thing happening. But it has some annoying behaviors. For example, it imports [underscore](http://underscorejs.org). While this is fine and common, [it overwrites `window._`](https://github.com/wilzbach/msa/issues/236), which is a huge annoyance when you're using, say [lodash](https://lodash.com/).

A big cause of this is the simple fact that MSAViewer _does too much_. I want a widget that can visualize sequences to judge their alignments at a glance. To accomplish this, I _don't_ need: Fasta importing and exporting (from URLs OR Local files), Consensus Computation, Motif searching, Sorting, filtering, etc. I mean, all of these are cool features, but they should be *more available to the programmer than they are to the user*. MSAViewer is based on sort-of the opposite principle. It's surprisingly difficult to customize which of these features are made available to the user within MSAViewer. That's how it became a great app, but a terrible widget.

## OK, so what *will* this do?

It draws large numbers of enormous sequences blisteringly fast using HTML5 canvas. Down the road, I may add some complementary visual elements like sequence logos or gap weights, but that's a distant second priority.

[sampleOutput]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAoCAYAAAC7HLUcAAACO0lEQVR4Xu2d7U3EMBBENyVAV7QARYRSkiKOFujqKCEIR+KXNxpk6zI4735bOjPZ59kPX5iW+7KF8Jmf3oVVETFpy+KmrVtfFmlh7/2td/F7P0VdXqU/Q9ZvlP2JqkTv56vG3wQg9Uc0SgDO5gADSKYADlJXRnTgUQAGEADZFSDFUlmoriPFSuSjBhk7BVSpARAA2RUgxcJBigLUINQgqn1E0MXKtCLFIsX6UYAUixSLFOvAUQAEQADEEZDtFtIkXW1Trl/iBPpZnEBru4v4EBPaN23dKHMG90Gh7Azi85VTcjH+JgAZO8cHkPrznQEkcQocpC7MWYNM9Y4fDpIENClWVZhhUkAAabM4sUKiBknOF1KstvijBsm6Z1x3f8wgEwdpIxgHGbyJACAAUhQ4qwg2/z0Ibd4sNxbbbDgIDlIUoItFF6socLHbvP4OsmlntPuEvPcEVVNFP9mi9/ylc+5+uf2Jqee0AUjdutznLwDykPkQgGRXswCkLQDdAcZBBu+euQeg+/4ABED+0v2hBknmotQg/7R75n5Cu+8PB8FBcJCswIxQ76hRpFOk7wpcrQ2Ng+AgOAgO8qsAg8IkGMQrGjhIUqTLL68+6e6Ue+C778898N3109/uDiD1wZn67xlO0g9A2pwVQLI0VUxN3E9AAAGQooD6lorelxABpC0A3fXDQXCQooD8EojOA0AAGTwA3R8wKVabw+EggwMMIABCDZLPw+wn5O4OjIPgINQgBwcMgAAIgBwA8g1c/Ftcy+TYYAAAAABJRU5ErkJggg==
