import { unproject } from './geometry.js';

// Screen composition is converted once into editable, isometric world positions.
// Object IDs remain stable so future controllers can address individual pieces.
const at = (id, kind, x, y, options = {}) => ({id, kind, position: unproject(x,y), ...options});
const pink = '#e9aa94', yellow = '#e5bd4b', blue = '#7f9ba8', cream = '#f1e9c7';
const blooms = [[-19,-18,pink,1],[5,-34,pink,.9],[17,-13,pink,.85],[-5,-8,pink,.8]];

// Overlapping, staggered rows read as woodland behind the clearing. The rear
// canopy stays pale; nearer trees add depth without competing with the church.
const forest = [
  ...[
    [281,300,.62],[355,271,.66],[424,263,.68],
    [491,253,.62],[650,249,.64],[724,277,.73],
    [802,303,.7],[875,346,.66]
  ].map(([x,y,scale],i) => at(`forest-distant-${i+1}`,'tree',x,y,{
    scale,distant:true,palette:['#b0bc87','#a1b07b','#95a570']
  })),
  ...[
    [264,381,.7],[331,351,.81],[420,356,.78],
    [477,319,.72],[676,302,.75],[751,344,.85],
    [827,383,.83],[906,413,.72]
  ].map(([x,y,scale],i) => at(`forest-near-${i+1}`,'tree',x,y,{
    scale,peekSide:({0:-1,2:1,3:-1,7:1})[i],palette:['#a6b673','#95a767','#849b5b']
  }))
];

export const scene = {
  viewBox: [0,0,1100,850],
  ground: {cx:550,cy:511,rx:410,ry:270},
  wandering: {minY:535},
  objects: [
    ...forest,
    at('distant-tree-left','tree',234,390,{scale:.57,distant:true}),
    at('distant-tree-far-left','tree',294,309,{scale:.68,distant:true}),
    at('distant-tree-north','tree',452,240,{scale:.65,distant:true}),
    at('distant-tree-northeast','tree',782,270,{scale:.64,distant:true}),
    at('distant-tree-east','tree',897,337,{scale:.66,distant:true}),
    at('back-shrub-left','shrub',413,393,{scale:1.2,opacity:.4}),
    at('back-shrub-right','shrub',788,403,{scale:1.2,opacity:.55}),
    at('tree-left-small','tree',295,451,{scale:.64}),
    at('tree-left-large','tree',365,408,{scale:1.08}),
    at('tree-right-large','tree',848,454,{scale:.78,palette:['#acb968','#9eae5d','#8fa157']}),
    at('tree-right-back','tree',791,354,{scale:.73}),
    {id:'church',kind:'church',position:{u:0,v:0},depthOffset:60},
    at('left-garden-shrub','shrub',446,468,{scale:1.03,flowers:blooms}),
    at('left-tree-flowers','flowers',351,423,{blooms:[[-13,-13,blue,.8],[1,-25,pink,.9],[15,-18,pink,.8]]}),
    at('left-shrub','shrub',287,503,{scale:.74}),
    at('right-garden-shrub','shrub',802,521,{scale:1.02,flowers:blooms}),
    at('entry-shrub','shrub',665,561,{scale:.72,flowers:[[-8,-16,pink,.9]]}),
    at('right-small-shrub','shrub',891,513,{scale:.6,opacity:.5}),
    at('outer-shrub-left','shrub',217,469,{scale:.66,opacity:.25}),
    at('outer-shrub-right','shrub',923,466,{scale:.58,opacity:.2}),
    at('rock-left','rock',301,529,{scale:.72}),
    at('rock-foreground','rock',421,675,{scale:1.05}),
    at('grass-left-rock','grass',315,538,{scale:.6}),
    at('grass-front-rock','grass',447,690,{scale:.75}),
    at('grass-path-left','grass',345,609,{scale:.7}),
    at('grass-right-edge','grass',874,582,{scale:.6,opacity:.65}),
    at('grass-far-front','grass',521,737,{scale:.6,opacity:.4}),
    at('grass-front-right','grass',783,677,{scale:.64}),
    at('flowers-front-left','flowers',358,610,{blooms:[[-11,-31,yellow,1.25],[9,-22,yellow,.9],[17,-46,blue,.65],[-2,-12,cream,.7]]}),
    at('flowers-left-path','shrub',380,650,{scale:.7,flowers:blooms}),
    at('flowers-right-path','flowers',771,670,{blooms:[[1,-15,cream,.9],[25,-33,yellow,.8],[14,-9,cream,.7],[34,-19,yellow,.65]]}),
    at('flowers-right-building','flowers',771,529,{blooms:[[-8,-29,blue,.7],[1,-40,blue,.7],[11,-19,blue,.6]]}),
    at('garden-fence','fence',822,602,{scale:.88}),
    at('figure-beige','character',407,561,{scale:.9,color:'#cfb591'}),
    at('figure-rust','character',563,580,{scale:.94,color:'#a64f50'}),
    at('figure-olive','character',468,646,{scale:.94,color:'#47583c'}),
    at('figure-purple','character',747,617,{scale:.94,color:'#664b60'}),
    at('figure-teal','character',592,724,{scale:.96,color:'#476a6d'}),
    at('forest-devil','devil',264,381,{scale:.64})
  ],
  path: [
    [482,559,.53],[499,581,.7],[533,607,.88],[519,634,.85],
    [548,661,.82],[532,688,.76],[555,715,.74],[574,742,.69],[556,765,.56]
  ].map(([x,y,scale],i) => at(`path-stone-${i+1}`,'stone',x,y,{scale})),
  groundDetails: [
    at('scattered-stone-left','stone',451,513,{scale:.5}),
    at('scattered-stone-right','stone',715,557,{scale:.34})
  ]
};
