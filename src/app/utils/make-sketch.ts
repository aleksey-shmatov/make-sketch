import { applyFreehand } from "./apply-freehand";
import { applyRough } from "./apply-rough";

export type RoughStyle = {
    roughness: number,
    seed: number,
    multistroke: boolean,
}

export const makeSketch = (markup: string, roughStyle: RoughStyle, freehand: boolean) => {
    const divNode = document.createElement('div');
    divNode.innerHTML = markup;
    divNode.style.position = 'absolute';
    document.body.appendChild(divNode);    
    let resultSVG = applyRough(divNode.getElementsByTagName('svg')[0], roughStyle) as SVGSVGElement
    divNode.remove();

    if (freehand) {
        resultSVG = applyFreehand(resultSVG) as SVGSVGElement
    }
    resultSVG.style.overflow = 'visible';
    return resultSVG.outerHTML;
}