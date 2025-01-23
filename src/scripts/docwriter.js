import { marked } from "marked"
import { gfmHeadingId } from "marked-gfm-heading-id"
import hljs from "highlight.js"

const doc_files = [
    ["Home", "fa-home", ""],
    ["Sprites To Furnace", "fa-feather", "editor"]
]
const renderer = new marked.Renderer()

renderer.blockquote = (quote) => {
    const icons = {
        "[!CAUTION]\n": "fa-circle-info",
        "[!WARNING]\n": "fa-circle-exclamation",
        "[!NOTE]\n": "fa-circle-info"
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (quote.text.startsWith(key)) {
            const clazz = key.toLowerCase().slice(3, -2);
            const text = quote.text.replace(key, `<i class="fa-solid ${icon}"></i> `);
            return `<blockquote class="${clazz}">${text}</blockquote>`;
        }
    }
    
    return `<blockquote>${quote.text}</blockquote>`;
}

renderer.link = (link) => {
    if (link.text.endsWith(">>>"))  return `<a href="${link.href}" class="rounded-sm shadow-sm flex items-center justify-between bg-[#282c38] pl-1.5 h-8 max-w-96 w-full hover:bg-[#222831]">${link.text.slice(0, -3)} <i class="fa-solid fa-arrow-right"></i></a>`
    return `<a href="${link.href}">${link.text}</a>`
}

renderer.code = (code) => {
    const validLang = hljs.getLanguage(code.lang) ? code.lang : 'plaintext'
    const highlighted = hljs.highlight(code.text, { language: validLang })
    return `<pre class="bg-[#282c38] rounded-sm shadow-sm p-5 mb-5"><code>${highlighted.value}</code></pre>`
}

marked.use(gfmHeadingId({prefix: "doc"}))
marked.setOptions({ gfm: true, breaks: true })

window.addEventListener("DOMContentLoaded", () => {
    for (const [doc, icon, group] of doc_files) {
        const button = document.createElement("button")
        button.id = `docs-sidebar-btn-${group}/${doc}`
        button.classList.add("rounded-sm", "w-full", "h-8", "flex", "gap-x-1.5", "items-center", "justify-left", "hover:bg-white", "hover:opacity-25")
        button.innerHTML = `<i class="fa-solid ${icon}"></i> ${doc}`
        getDocGroup(group).appendChild(button)
    }

    const url = new URL(window.location.href)
    openDoc(url.searchParams.get("page") ?? "Home")

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
    fetch(`/src/docs/${path.replaceAll(" ", "_")}.md`)
        .then(res => res.text())
        .then(text => marked.parse(text, {renderer: renderer}))
        .then(text => document.getElementById("doc-content").innerHTML = text)
    const url = new URL(window.location.href)
    url.searchParams.set("page", path)
    history.pushState(null, null, url.pathname + url.search)
}

function getDocGroup(group) {
    if (group == null) return document.getElementById("docs-sidebar")
    if (document.getElementById(`doc-group-${group}`) == null) {
        const doc_group = document.createElement("div")
        const title = document.createElement("span")
        title.classList.add("text-sm", "font-bold", "block")
        title.innerText = group.toUpperCase()
        doc_group.id = `doc-group-${group}`
        doc_group.appendChild(title)
        document.getElementById("docs-sidebar").appendChild(doc_group)
    } 
    return document.getElementById(`doc-group-${group}`)
}