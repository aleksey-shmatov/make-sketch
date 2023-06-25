import { RoughSVG } from 'roughjs/bin/svg'
import { Point } from 'roughjs/bin/geometry'
import { Options } from 'roughjs/bin/core'
import roughjs from 'roughjs/bin/rough'
import { RoughStyle } from './make-sketch'

const styledElementsArray = [
    'circle',
    'ellipse',
    'line',
    'path',
    'polygon',
    'polyline',
    'rect',
]

const styledElements = new Set(styledElementsArray)

type Styles = {
    rough: RoughStyle
}

const styleToRoughOptions = ({  rough }: Styles): Options => ({
    roughness: rough.roughness,
    seed: rough.seed,
    preserveVertices: true,
    curveFitting: 1,
    disableMultiStroke: !rough.multistroke,
})

const roughRenderers: any = {
    circle: (
        element: SVGCircleElement,
        roughContext: RoughSVG,
        options: Options,
        scaleX: number,
        scaleY: number
    ) => {
        const cx = scaleX * element.cx.baseVal.value
        const cy = scaleY * element.cy.baseVal.value
        const dx = scaleX * element.r.baseVal.value * 2
        const dy = scaleY * element.r.baseVal.value * 2
        return roughContext.ellipse(cx, cy, dx, dy, options)
    },
    ellipse: (
        element: SVGEllipseElement,
        roughContext: RoughSVG,
        options: Options,
        scaleX: number,
        scaleY: number
    ) => {
        const cx = scaleX * element.cx.baseVal.value
        const cy = scaleY * element.cy.baseVal.value
        const dx = scaleX * element.rx.baseVal.value * 2
        const dy = scaleY * element.ry.baseVal.value * 2
        return roughContext.ellipse(cx, cy, dx, dy, options)
    },
    rect: (
        element: SVGRectElement,
        roughContext: RoughSVG,
        options: Options,
        scaleX: number,
        scaleY: number
    ) => {
        const x = scaleX * element.x.baseVal.value
        const y = scaleY * element.y.baseVal.value
        const width = scaleX * element.width.baseVal.value
        const height = scaleY * element.height.baseVal.value
        return roughContext.rectangle(x, y, width, height, options)
    },
    path: (
        element: SVGPathElement,
        roughContext: RoughSVG,
        options: Options
    ) => {
        const path = element.getAttribute('d') ?? ''
        return roughContext.path(path, options)
    },
    line: (
        element: SVGLineElement,
        roughContext: RoughSVG,
        options: Options,
        scaleX: number,
        scaleY: number
    ) => {
        const x1 = scaleX * element.x1.baseVal.value
        const y1 = scaleY * element.y1.baseVal.value
        const x2 = scaleX * element.x2.baseVal.value
        const y2 = scaleY * element.y2.baseVal.value
        return roughContext.line(x1, y1, x2, y2, options)
    },
    polygon: (
        element: SVGPolygonElement,
        roughContext: RoughSVG,
        options: Options,
        scaleX: number,
        scaleY: number
    ) => {
        const points: Point[] = []
        for (let i = 0; i < element.points.length; i++) {
            const point = element.points.getItem(i)
            points.push([point.x * scaleX, point.y * scaleY])
        }
        return roughContext.polygon(points, options)
    },
    polyline: (
        element: SVGPolylineElement,
        roughContext: RoughSVG,
        options: Options,
        scaleX: number,
        scaleY: number
    ) => {
        const points: Point[] = []
        for (let i = 0; i < element.points.length; i++) {
            const point = element.points.getItem(i)
            points.push([point.x * scaleX, point.y * scaleY])
        }
        return roughContext.linearPath(points, options)
    },
}


const applyStyles = (
    element: SVGElement,
    targetData: string,
    style: Styles,
    roughContext: RoughSVG | null,
    options: Options | null
) => {
    let copy: SVGElement
    if (styledElements.has(element.tagName)) {
        if (roughContext) {
            const renderer = roughRenderers[element.tagName] as any
            let newOptions = options
            copy = renderer(element, roughContext, newOptions, 1, 1)
        } else {
            copy = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            const elementCopy = element.cloneNode() as SVGElement
            copy.append(elementCopy)
        }
    } else {
        copy = element.cloneNode() as SVGElement
    }
    if (element.children && element.children.length) {
        for (let i = 0; i < element.children.length; i++) {
            const childCopy = applyStyles(
                element.children.item(i) as SVGElement,
                targetData,
                style,
                roughContext,
                options,
            )
            if (childCopy) {
                copy.appendChild(childCopy)
            }
        }
    }
    return copy
}

const applyStylesRoot = (
    element: SVGSVGElement,
    elementId: string,
    style: Styles,
): SVGElement => {
    const copy: SVGSVGElement = element.cloneNode() as SVGSVGElement
    let roughContext: RoughSVG | null = null
    let options: Options | null = null

    if (style.rough.roughness > 0) {
        roughContext = roughjs.svg(copy)
        options = styleToRoughOptions(style)
    }
    if (element.children && element.children.length) {
        for (let i = 0; i < element.children.length; i++) {
            const childCopy = applyStyles(
                element.children.item(i) as SVGElement,
                elementId,
                style,
                roughContext,
                options
            )
            if (childCopy) {
                copy.appendChild(childCopy)
            }
        }
    }
    return copy
}

export const applyRough = (    element: SVGSVGElement, rough: RoughStyle    ) => {
    return applyStylesRoot(element, element.id, {
        rough,
    })
}