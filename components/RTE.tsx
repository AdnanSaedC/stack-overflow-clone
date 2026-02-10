"use client"

import dynamic from "next/dynamic";

import Editor from "@uiw/react-md-editor";

const RTE = dynamic(
    // dynamic make the thing render in realtime
    () =>
        import("@uiw/react-md-editor")
            .then(mod => { return mod.default }),
    { ssr: false } //this is the line which prevent it from rendering in the server side
)

export default RTE;
export const MarkdownPreview = Editor.Markdown;
