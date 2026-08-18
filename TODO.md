1 walk all new vis to see if i like and have autoratative repos vet new graphics in posts
2 convert the 3 meta posts into an actual series about making this website
3 heros feel too large, have ai generate them to be aspect ratio of 2.5, then render the center 60% or so
4 make series also get a fresh image, not reuse the first post's
5 once series heroes exist in src/config/series.ts: pass that hero into meta.image/imageAlt/imageWidth/imageHeight in src/pages/series/[slug].astro (getSeriesHero already resolves it, heroes are already 1200x630) so series pages stop sharing the generic /og/site.jpg card - note hero.src.src is already base-prefixed, so do NOT run it through href()/absoluteUrl a second time
6 add portfolio
7 add resume
