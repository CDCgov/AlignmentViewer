# AlignmentViewer

Alignment Viewer is a simple, dependency-free widget to visualize multiple genome sequences.

This repository was created for use by CDC programs to collaborate on public health surveillance related projects in support of the CDC Surveillance Strategy.  Github is not hosted by the CDC, but is used by CDC and its partners to share information and collaborate on software.

## Demo

```{javascript}
sequences = [
  'ACTGACTAGCTAGCTAACTG',
  'GCATCGTAGCTAGCTACGAT',
  'CATCGATCGTACGTACGTAG',
  'ATCGATCGATCGTACGATCG'
];
alignmentViewer(sequences).then(function(canvas){
  document.body.appendChild(canvas);
});
```
![][sampleOutput]

See [the Source Code](https://github.com/cdcgov/AlignmentViewer/blob/master/demo/index.html) of [the Demo](https://cdcgov.github.io/AlignmentViewer/demo) for a slightly fleshier [live version](https://cdcgov.github.io/AlignmentViewer/demo).

## Syntax

`alignmentViewer(seqs, config)` where:
* `seqs` - an array of sequence strings
* `config` - OPTIONAL, an object containing any of the following attributes:
* `config.width` - OPTIONAL, the width (in pixels) _of each cell_. Please note that this is not the width of the output figure. Defaults to 10
* `config.height` - OPTIONAL, the height (in pixels) _of each cell_. Please note that this is not the height of the output figure. Defaults to 10
* `config.showChar` - OPTIONAL, should the character be rendered in the cell? Defaults to false
* `config.colors` - OPTIONAL, an object mapping from the nucleotide to the color of the corresponding cell in the output image. Defaults to the [Taylor color scheme](http://www.jalview.org/help/html/colourSchemes/taylor.html):
```
{
  'A' : 'lightgreen',
  'G' : 'orange',
  'C' : 'yellow',
  'T' : 'red',
  'ambig': 'white'
}
```

Fun fact: It's actually alphabet-agnostic, so you can map any character to a color and see it. So you can visualize, say, protein sequences by just setting `config.colors` to an object mapping from the IUPAC 1-letter codes to the desired color.

## Isn't this what [MSAViewer](http://msa.biojs.net/) is for?

Yup.

## So why build another?

MSAViewer is [an awesome App](http://msa.biojs.net/app/). However, it's a difficult widget. What I mean is, it works great on pages where it's the only thing happening. But it has some annoying behaviors. For example, it imports [underscore](http://underscorejs.org). While this is fine and common, [it overwrites `window._`](https://github.com/wilzbach/msa/issues/236), which is a huge annoyance when you're using, say [lodash](https://lodash.com/).

A big cause of this is the simple fact that MSAViewer _does too much_. I want a widget that can visualize sequences to judge their alignments at a glance. To accomplish this, I _don't_ need: Fasta importing and exporting (from URLs OR Local files), Consensus Computation, Motif searching, Sorting, filtering, etc. I mean, all of these are cool features, but they should be *more available to the programmer than they are to the user*. MSAViewer is based on sort-of the opposite principle. It's surprisingly difficult to customize which of these features are made available to the user within MSAViewer. That's how it became a great app, but a terrible widget.

## OK, so what *does* this do?

It draws large numbers of enormous sequences [blisteringly fast](https://aaboyles.github.io/AlignmentViewer/benchmark/) using HTML5's [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). In case you have so many sequences that are so long it begins to get sluggish, it's also [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)-based, so you can manage it asynchronously.

## Anything else?

Not really, but down the road, I may add some complementary visual elements like sequence logos or gap weights. If you need that stuff, [please let me know](https://github.com/AABoyles/AlignmentViewer/issues/new). Until you do, they're a distant second priority.

[sampleOutput]:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAoCAYAAAC7HLUcAAACO0lEQVR4Xu2d7U3EMBBENyVAV7QARYRSkiKOFujqKCEIR+KXNxpk6zI4735bOjPZ59kPX5iW+7KF8Jmf3oVVETFpy+KmrVtfFmlh7/2td/F7P0VdXqU/Q9ZvlP2JqkTv56vG3wQg9Uc0SgDO5gADSKYADlJXRnTgUQAGEADZFSDFUlmoriPFSuSjBhk7BVSpARAA2RUgxcJBigLUINQgqn1E0MXKtCLFIsX6UYAUixSLFOvAUQAEQADEEZDtFtIkXW1Trl/iBPpZnEBru4v4EBPaN23dKHMG90Gh7Azi85VTcjH+JgAZO8cHkPrznQEkcQocpC7MWYNM9Y4fDpIENClWVZhhUkAAabM4sUKiBknOF1KstvijBsm6Z1x3f8wgEwdpIxgHGbyJACAAUhQ4qwg2/z0Ibd4sNxbbbDgIDlIUoItFF6socLHbvP4OsmlntPuEvPcEVVNFP9mi9/ylc+5+uf2Jqee0AUjdutznLwDykPkQgGRXswCkLQDdAcZBBu+euQeg+/4ABED+0v2hBknmotQg/7R75n5Cu+8PB8FBcJCswIxQ76hRpFOk7wpcrQ2Ng+AgOAgO8qsAg8IkGMQrGjhIUqTLL68+6e6Ue+C778898N3109/uDiD1wZn67xlO0g9A2pwVQLI0VUxN3E9AAAGQooD6lorelxABpC0A3fXDQXCQooD8EojOA0AAGTwA3R8wKVabw+EggwMMIABCDZLPw+wn5O4OjIPgINQgBwcMgAAIgBwA8g1c/Ftcy+TYYAAAAABJRU5ErkJggg==

## Public Domain
This repository constitutes a work of the United States Government and is not
subject to domestic copyright protection under 17 USC § 105. This repository is in
the public domain within the United States, and copyright and related rights in
the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
All contributions to this repository will be released under the CC0 dedication. By
submitting a pull request you are agreeing to comply with this waiver of
copyright interest.

## License
The repository utilizes code licensed under the terms of the Apache Software
License and therefore is licensed under ASL v2 or later.

This source code in this repository is free: you can redistribute it and/or modify it under
the terms of the Apache Software License version 2, or (at your option) any
later version.

This soruce code in this repository is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the Apache Software License for more details.

You should have received a copy of the Apache Software License along with this
program. If not, see http://www.apache.org/licenses/LICENSE-2.0.html

The source code forked from other open source projects will inherit its license.


## Privacy
This repository contains only non-sensitive, publicly available data and
information. All material and community participation is covered by the
Surveillance Platform [Disclaimer](https://github.com/CDCgov/template/blob/master/DISCLAIMER.md)
and [Code of Conduct](https://github.com/CDCgov/template/blob/master/code-of-conduct.md).
For more information about CDC's privacy policy, please visit [http://www.cdc.gov/privacy.html](http://www.cdc.gov/privacy.html).

## Contributing
Anyone is encouraged to contribute to the repository by [forking](https://help.github.com/articles/fork-a-repo)
and submitting a pull request. (If you are new to GitHub, you might start with a
[basic tutorial](https://help.github.com/articles/set-up-git).) By contributing
to this project, you grant a world-wide, royalty-free, perpetual, irrevocable,
non-exclusive, transferable license to all users under the terms of the
[Apache Software License v2](http://www.apache.org/licenses/LICENSE-2.0.html) or
later.

All comments, messages, pull requests, and other submissions received through
CDC including this GitHub page are subject to the [Presidential Records Act](http://www.archives.gov/about/laws/presidential-records.html)
and may be archived. Learn more at [http://www.cdc.gov/other/privacy.html](http://www.cdc.gov/other/privacy.html).

## Records
This repository is not a source of government records, but is a copy to increase
collaboration and collaborative potential. All government records will be
published through the [CDC web site](http://www.cdc.gov).

## Notices
Please refer to [CDC's Template Repository](https://github.com/CDCgov/template)
for more information about [contributing to this repository](https://github.com/CDCgov/template/blob/master/CONTRIBUTING.md),
[public domain notices and disclaimers](https://github.com/CDCgov/template/blob/master/DISCLAIMER.md),
and [code of conduct](https://github.com/CDCgov/template/blob/master/code-of-conduct.md).
