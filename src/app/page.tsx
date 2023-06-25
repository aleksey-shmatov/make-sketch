'use client'
import { use, useCallback, useMemo, useState } from "react"
import { SelectFile } from "./components/SelectFile"
import { RoughStyle, makeSketch } from "./utils/make-sketch"

export default function Home() {
    const [markup, setMarkup] = useState("")
    const [freehand, setFreehand] = useState(false)
    const [roughStyle, setRoughStyle] = useState<RoughStyle>({
        roughness: 1,
        seed: 1,
        multistroke: false
    })
    const handleChangeRougness = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setRoughStyle(x => ({ ...x, roughness: parseFloat(e.target.value) }))
        },
        []
    )

    const handleChangeMultistroke = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setRoughStyle(x => ({ ...x, multistroke: e.target.checked }))
        },
        []
    )
    const handleRandomize = useCallback(() => {
        setRoughStyle(x => ({
            ...x,
            seed: Math.random() * 1000,
        }))
    }, [])

    const handelChangeFreehand = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFreehand(e.target.checked)
    }, [])

    const sketchMarkup = useMemo(() => {
        return markup ? makeSketch(markup, roughStyle, freehand) : '';
    }, [roughStyle, markup, freehand])
    return (
        <main className="flex min-h-screen flex-row p-24">
            <div className="flex flex-col p-6 gap-6 border-solid border-2 border-indigo-600">
                <SelectFile onSelect={setMarkup} />
                <input
                    type="range"
                    className="transparent h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
                    min={0}
                    max={3}
                    value={roughStyle.roughness}
                    step={0.05}
                    onChange={handleChangeRougness} />
                <label>
                    <input type="checkbox" className="mr-2" checked={roughStyle.multistroke} onChange={handleChangeMultistroke} />
                    Multistroke
                </label>
                <button
                    type="button"
                    onClick={handleRandomize}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Randomize
                </button>
                <label>
                    <input className="mr-2" type="checkbox" checked={freehand} onChange={handelChangeFreehand} />
                    Apply Freehand
                </label>
            </div>
            <div className="ml-2 border-solid border-2 border-indigo-600 w-full flex items-center	justify-center">
                <div dangerouslySetInnerHTML={{ __html: sketchMarkup }}>

                </div>
            </div>
        </main>
    )
}
