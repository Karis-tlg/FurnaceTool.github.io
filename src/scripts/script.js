document.addEventListener("DOMContentLoaded", (event) => {
    const code = localStorage.getItem("code")
    if (code) {
        document.getElementById("code").value = code
    }
})

function copy_code() {
    const code = document.getElementById("code").value;
    navigator.clipboard.writeText(code);
}

function charToHex(char) {
    if (char.length == 1) {
        const code = char.charCodeAt(0);
        return `0x${code.toString(16).padStart(4, '0')}`;
    }
    return char
}

function add_content() {
    const code = document.getElementById("code").value
    const code_obj = JSON.parse(code)
    if (document.getElementById("mode-settings").classList.contains("flex")){
        const material = document.getElementById("material").value
        const blockmaterial = document.getElementById("blockmaterial").value

        if (material != ""){
            code_obj["material"] = material
        }
        if (blockmaterial != "") {
            code_obj["blockmaterial"] = blockmaterial
        }
        
        document.getElementById("material").value = ""
        document.getElementById("blockmaterial").value = ""
    } else if (document.getElementById("mode-items").classList.contains("flex")) {
        const item_type = document.getElementById("item_type").value
        const custom_model_data = document.getElementById("custom_model_data").value
        const damage_predicate = document.getElementById("damage_predicate").value
        const path_add = document.getElementById("path_add").value
        let icon_2d = document.getElementById("icon_2d").value
        const allow_offhand = document.getElementById("allow_offhand").value != ""? document.getElementById("allow_offhand").value.toLowerCase() === "true" : ""
        const unbreakable = document.getElementById("unbreakable").value != ""? document.getElementById("unbreakable").value.toLowerCase() === "true" : ""

        if (!item_type || (!custom_model_data && !damage_predicate)) {
            return
        }
        if (path_add && icon_2d) {
            icon_2d = path_add + icon_2d
        }
        const item = "minecraft:" + item_type

        if (!code_obj["items"]) {
            code_obj["items"] = {};
        }
        if (!code_obj["items"][item]) {
            code_obj["items"][item] = {};
        }
        if (custom_model_data && !code_obj["items"][item]["custom_model_data"]) {
            code_obj["items"][item]["custom_model_data"] = {};
        }
        if (damage_predicate && !code_obj["items"][item]["damage_predicate"]) {
            code_obj["items"][item]["damage_predicate"] = {};
        }

        const properties = {}

        if (icon_2d !== "") {properties["icon"] = icon_2d}
        if (allow_offhand !== "") {properties["allow_offhand"] = allow_offhand}
        if (unbreakable !== "") {properties["unbreakable"] = unbreakable}

        if (Object.keys(properties).length > 0) {
            if (custom_model_data) {
                code_obj["items"][item]["custom_model_data"][custom_model_data] = properties
            } else if (damage_predicate) {
                code_obj["items"][item]["damage_predicate"][damage_predicate] = properties
            }
        }

        document.getElementById("allow_offhand").value = ""
        document.getElementById("unbreakable").value = ""
        document.getElementById("custom_model_data").value = ""
        document.getElementById("damage_predicate").value = ""
        document.getElementById("icon_2d").value = ""
    } else {
        const symbol = charToHex(document.getElementById("symbol").value)
        const offset_x = document.getElementById("offset-x").value != "" ? Number(document.getElementById("offset-x").value) : ""
        const offset_y = document.getElementById("offset-y").value != "" ? Number(document.getElementById("offset-y").value) : ""
        const ignore = document.getElementById("ignore").value != "" ? document.getElementById("ignore").value.toLowerCase() === "true" : ""
        const smallchest = document.getElementById("smallchest").value != "" ? document.getElementById("smallchest").value.toLowerCase() === "true" : ""
        const largechest = document.getElementById("largechest").value != "" ? document.getElementById("largechest").value.toLowerCase() === "true" : ""

        const properties = {}
        if (ignore !== "") {properties["ignore"] = true}
        if (offset_x !== "" || offset_y !== "" || smallchest !== "" || largechest !== ""){
            properties["gui"] = {}
            if (offset_x !== "" || offset_y !== "") {properties["gui"]["offset"] = [offset_x, offset_y]}
            if (smallchest !== "") {properties["gui"]["smallchest"] = true}
            if (largechest !== "") {properties["gui"]["largechest"] = true}
        }
        if (Object.keys(properties).length !== 0) {
            if (!code_obj["fonts"]){
                code_obj["fonts"] = {}
            }
            code_obj["fonts"][symbol] = properties
        }

        document.getElementById("symbol").value = ""
        document.getElementById("ignore").value = ""
        document.getElementById("offset-x").value = ""
        document.getElementById("offset-y").value = ""
        document.getElementById("smallchest").value = ""
        document.getElementById("largechest").value = ""
    }
    const code_str = JSON.stringify(code_obj, null, 4)
    document.getElementById("code").value = code_str
    localStorage.setItem("code", code_str)
}

function load_content_file() {
    const file = document.getElementById("file").files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        let result_json = JSON.parse(e.target.result)
        if (result_json && typeof result_json === "object" && !("items" in result_json)) {
            result_json = sprites_to_content(result_json)
        }
        const code_str = JSON.stringify(result_json, null, 4)
        document.getElementById("code").value = code_str
        localStorage.setItem("code", code_str)
    };
    reader.readAsText(file);
}

function download_content() {
    const code = document.getElementById("code").value
    const blob = new Blob([code], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = 'furnace.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}


function sprites_to_content(input) {
    const output = { items: {} }

    for (const item in input) {
        output.items[`minecraft:${item}`] = {}

        input[item].forEach(data => {
            if (data.custom_model_data !== undefined) {
                if (!("custom_model_data" in output.items[`minecraft:${item}`])) {
                    output.items[`minecraft:${item}`]["custom_model_data"] = {}
                }
                output.items[`minecraft:${item}`].custom_model_data[data.custom_model_data] = {
                    unbreakable: data.unbreakable,
                    allow_offhand: data.allow_offhand,
                    icon: data.sprite
                }
            }
            if (data.damage_predicate !== undefined) {
                if (!("damage_predicate" in output.items[`minecraft:${item}`])) {
                    output.items[`minecraft:${item}`]["damage_predicate"] = {}
                }
                output.items[`minecraft:${item}`].damage_predicate[data.damage_predicate] = {
                    unbreakable: data.unbreakable,
                    allow_offhand: data.allow_offhand,
                    icon: data.sprite
                }
            }
        })
    }

    return output
}

function change_mode() {
    if (document.getElementById("mode-settings").classList.contains("flex")){
        document.getElementById("mode-items").classList.replace("hidden", "flex")
        document.getElementById("mode-settings").classList.replace("flex", "hidden")
    } else if (document.getElementById("mode-items").classList.contains("flex")){
        document.getElementById("mode-fonts").classList.replace("hidden", "flex")
        document.getElementById("mode-items").classList.replace("flex", "hidden")
    } else {
        document.getElementById("mode-settings").classList.replace("hidden", "flex")
        document.getElementById("mode-fonts").classList.replace("flex", "hidden")
    }

    const code = document.getElementById("code")
    const code_pre = document.querySelector(".highlighted-code")

    const box = code.getBoundingClientRect()

    code_pre.style.top = `${box.top}px`
    code_pre.style.left = `${box.left}px`
}

function delete_code() {
    document.getElementById("code").value = "{}"
    localStorage.setItem("code", "{}")
}