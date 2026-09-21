import { osm, inlineSources } from '@versatiles/style';

export async function getStyle(){
  const style = await inlineSources(osm({
    features: {
      landcover: true
    },
    theme: "natural",
    urls: {
      base: "https://tiles.versatiles.org"
    }
  }));
  
  return style;
};