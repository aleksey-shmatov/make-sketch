import getStroke from 'perfect-freehand'
import { parsePath, normalize, absolutize } from 'path-data-parser'

const average = (a: number, b: number) => (a + b) / 2

function getSvgPathFromStroke(points: number[][]) {
    const len = points.length

    if (!len) {
        return ''
    }

    const first = points[0]
    let result = `M${first[0].toFixed(3)},${first[1].toFixed(3)}Q`

    for (let i = 0, max = len - 1; i < max; i++) {
        const a = points[i]
        const b = points[i + 1]
        result += `${a[0].toFixed(3)},${a[1].toFixed(3)} ${average(
            a[0],
            b[0]
        ).toFixed(3)},${average(a[1], b[1]).toFixed(3)} `
    }

    result += 'Z'

    return result
}

/*
    <path
    d={pathData}
    transform={transformAttribute}
    fill={element.stroke.color}
    fillOpacity={element.stroke.opacity}
    data-target_data={targetData}
/>
*/

const processNode = (element: SVGElement) => {
    const copy = element.cloneNode() as SVGElement;
    if (element.tagName === 'path') {
        const pathData = element.getAttribute('d') ?? ''
        if (!pathData) {
            return copy
        }
        const segments = normalize(absolutize(parsePath(pathData)))
        const points: number[][] = segments.flatMap((segment) => {
            const segmentPoints = []
            for (let i = 0; i < segment.data.length; i += 2) {
                segmentPoints.push([segment.data[i], segment.data[i + 1]])
            }
            return segmentPoints;
        })
        const d = getStroke(points, {
            size: 15,
            thinning: 0.65,
            streamline: 0.3,
            smoothing: 1,
        })
        copy.setAttribute('d', getSvgPathFromStroke(d))
        copy.setAttribute('fill', element.getAttribute('stroke') ?? 'none')
        copy.setAttribute('stroke', 'none')
    }
    for (let i = 0; i < element.children.length; i++) {
        const childCopy = processNode(
            element.children.item(i) as SVGElement,
        )
        if (childCopy) {
            copy.appendChild(childCopy)
        }
    }
    return copy;
}

export const applyFreehand = (    element: SVGSVGElement    ) => {
    const copy = element.cloneNode() as SVGElement
    for (let i = 0; i < element.children.length; i++) {
        const childCopy = processNode(
            element.children.item(i) as SVGElement,
        )
        if (childCopy) {
            copy.appendChild(childCopy)
        }
    }
    return copy;
}