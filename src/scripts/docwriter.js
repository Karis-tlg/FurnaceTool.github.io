import { marked } from "marked"
import { gfmHeadingId } from "marked-gfm-heading-id"

const renderer = new marked.Renderer()

renderer.blockquote = (quote) => {
    let clazz = ""
    let text = quote.text
    if (quote.text.startsWith("[!CAUTION]\n")) {
        clazz = "caution"
        text = text.replace("[!CAUTION]\n", '<i class="fa-solid fa-circle-info"></i> ')
    }else if (quote.text.startsWith("[!WARNING]\n")) {
        clazz = "warning"
        text = text.replace("[!WARNING]\n", '<i class="fa-solid fa-circle-exclamation"></i> ')
    }else if (quote.text.startsWith("[!NOTE]\n")) {
        clazz = "note"
        text = text.replace("[!NOTE]\n", '<i class="fa-solid fa-circle-info"></i> ')
    }
    return `<blockquote class="${clazz}">${text}</blockquote>`
}

marked.use(gfmHeadingId({prefix: "doc"}))
marked.setOptions({ gfm: true, breaks: true })
window.addEventListener("DOMContentLoaded", () => {
    openDoc("home")
    const docButtons = document.querySelectorAll('[id^="docs-sidebar-btn-"]')
    docButtons.forEach(button => button.onclick = () => {
        openDoc(button.id.replace("docs-sidebar-btn-", ""))
    })

    const docs = document.getElementById("docs")
    const docs_sidebar = document.getElementById("docs-sidebar")
    const docs_sidebar_btn = document.getElementById("docs-sidebar-btn")
    change_siderbar(docs, docs_sidebar)
    docs_sidebar_btn.onclick = () => docs_sidebar.classList.toggle("hidden")
    window.addEventListener("resize", () => change_siderbar(docs, docs_sidebar))
})

function change_siderbar(docs, docs_sidebar) {
    if (docs.clientWidth < 192 * 5) {
        docs_sidebar.classList.add("hidden")
        document.getElementById("docs-sidebar-btn").classList.remove("hidden")
    }else {
        docs_sidebar.classList.remove("hidden")
        document.getElementById("docs-sidebar-btn").classList.add("hidden")
    }
}

function openDoc(path) {
    fetch(`/src/docs/${path}.md`)
        .then(res => res.text())
        .then(text => marked.parse(text, {renderer: renderer}))
        .then(text => document.getElementById("doc-content").innerHTML = text)
}

