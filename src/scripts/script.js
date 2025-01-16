document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);
    const guiImageUpload = $("gui-image-upload");
    const guiImageLabel = $("gui-image-label");
    const guiImage = $("gui-image");
    const JsonEditor = ace.edit("jsonview");

    window.onclick = (e) => {
        if (!e.target.matches("#mode-change")) $("mode-change-contents")?.classList.add("hidden");
    };
    window.addEventListener("beforeunload", (e) => e.preventDefault());

    const setDragStyle = (isDragging) => {
        if (isDragging) {
            guiImageLabel.textContent = "Drag & Drop to Upload";
            guiImageLabel.style.backgroundColor = "#4a5568";
            guiImageLabel.style.opacity = "0.5";
        } else {
            guiImageLabel.textContent = "Upload GUI Texture";
            guiImageLabel.style.backgroundColor = "";
            guiImageLabel.style.opacity = "1";
        }
    };

    ["dragenter", "dragover"].forEach((ev) =>
        guiImageLabel.addEventListener(ev, (e) => {
            e.preventDefault();
            setDragStyle(true);
        })
    );
    ["dragleave", "drop"].forEach((ev) =>
        guiImageLabel.addEventListener(ev, (e) => {
            e.preventDefault();
            setDragStyle(false);
        })
    );

    guiImageLabel.addEventListener("drop", (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = () => (guiImage.src = reader.result);
            reader.readAsDataURL(file);
        } else alert("Please drop a valid image file.");
    });

    guiImageUpload.addEventListener("change", change_gui_image);

    const setupInput = (id1, id2, callback) => {
        const input1 = $(id1);
        const input2 = $(id2);
        const update = () => callback(input1, input2);
        input1.addEventListener("input", update);
        input2.addEventListener("input", update);
    };
    setupInput("offset-x", "offset-y", (xInput, yInput) =>
        update_preview_gui_position(xInput, yInput, guiImage)
    );
    setupInput("size-width", "size-height", (wInput, hInput) =>
        update_preview_gui_size(wInput, hInput, guiImage)
    );
    $("opacity-gui").addEventListener("input", change_gui_opacity);
    JsonEditor.on("change", () => localStorage.setItem("code", JsonEditor.getValue()));

    window.addEventListener("resize", () => {
        if ($("mode-fonts").classList.contains("flex")) resize_gui_preview();
    });
});

function update_preview_gui_position(GuixInput, GuiyInput, guiimage) {
    const x = parseInt(GuixInput.value * 2)
    const y = parseInt(GuiyInput.value * 2)

    guiimage.style.marginLeft = `${x}px`
    guiimage.style.marginTop = `${y}px`
}

function update_preview_gui_position(GuixInput, GuiyInput, guiimage) {
    const x = parseInt(GuixInput.value * 2)
    const y = parseInt(GuiyInput.value * 2)

    guiimage.style.marginLeft = `${x}px`
    guiimage.style.marginTop = `${y}px`
}

function update_preview_gui_size(GuiWidth, GuiHeight, guiimage) {
    const x = parseInt(GuiWidth.value) || ""
    const y = parseInt(GuiHeight.value) || ""

    guiimage.style.width = x !== "" ? `${x}px` : ""
    guiimage.style.height = y !== "" ? `${y}px` : ""
}

function change_gui_opacity() {
    const opacitySlider = document.getElementById("opacity-gui");
    const opacityValue = parseFloat(opacitySlider.value);

    document.getElementById("gui-image").style.opacity = opacityValue;
    document.getElementById("opacity-label").textContent = `GUI Opacity: ${Math.round(opacityValue * 100)}%`;
}



function change_gui_image(event) {
    if (!event.target.files.length) return
    const reader = new FileReader()
    reader.onload = () => {
        const guiimage = document.getElementById("gui-image")
        guiimage.src = reader.result
    }
    reader.readAsDataURL(event.target.files[0])
}

function copy_code() {
    const code = ace.edit("jsonview").getValue();
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
    const code = ace.edit("jsonview").getValue()
    const code_obj = JSON.parse(code)
    if (document.getElementById("mode-settings").classList.contains("flex")) {
        const material = document.getElementById("material").value
        const blockmaterial = document.getElementById("blockmaterial").value
        const modelengine_model = document.getElementById("modelengine_model").value
        const modelengine_item = document.getElementById("modelengine_item").value
        const modelengine_namespace = document.getElementById("modelengine_namespace").value

        if (material != "") {
            code_obj["material"] = material
        }
        if (blockmaterial != "") {
            code_obj["blockmaterial"] = blockmaterial
        }
        if (modelengine_model != "") {
            if (!code_obj["modelengine"]) {
                code_obj["modelengine"] = {}
            }
            code_obj["modelengine"]["generate_model"] = modelengine_model === "modelengine3" ? modelengine_model : modelengine_model === "true"
            if (modelengine_item != "") {
                code_obj["modelengine"]["item"] = modelengine_item
            }
            if (modelengine_namespace != "") {
                code_obj["modelengine"]["namespace"] = modelengine_namespace
            }
        }

        document.getElementById("material").value = ""
        document.getElementById("blockmaterial").value = ""
        document.getElementById("modelengine_model").value = ""
        document.getElementById("modelengine_item").value = ""
        document.getElementById("modelengine_namespace").value = ""
    } else if (document.getElementById("mode-items").classList.contains("flex")) {
        const item_type = document.getElementById("item_type").value
        const custom_model_data = document.getElementById("custom_model_data").value
        const damage_predicate = document.getElementById("damage_predicate").value
        const path_add = document.getElementById("path_add").value
        let icon_2d = document.getElementById("icon_2d").value
        const allow_offhand = document.getElementById("allow_offhand").value != "" ? document.getElementById("allow_offhand").value.toLowerCase() === "true" : ""
        const unbreakable = document.getElementById("unbreakable").value != "" ? document.getElementById("unbreakable").value.toLowerCase() === "true" : ""
        const armor_type = document.getElementById("armor_type").value
        const armor_texture = document.getElementById("armor_texture").value
        const auto_copy_texture_armor = document.getElementById("auto_copy_armor_texture").value != "" ? document.getElementById("auto_copy_armor_texture").value.toLowerCase() === "true" : ""

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

        if (icon_2d !== "") { properties["icon"] = icon_2d }
        if (allow_offhand !== "") { properties["allow_offhand"] = allow_offhand }
        if (unbreakable !== "") { properties["unbreakable"] = unbreakable }
        if (armor_texture !== "" && armor_type !== "" && auto_copy_texture_armor !== "") {
            properties["armor_layer"] = {
                "type": armor_type,
                "texture": armor_texture + (armor_texture.endsWith(".png") ? "" : ".png"),
                "auto_copy_texture": auto_copy_texture_armor
            }
        }
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
        document.getElementById("armor_type").value = ""
        document.getElementById("armor_texture").value = ""
        document.getElementById("auto_copy_armor_texture").value = ""
    } else {
        const symbol = charToHex(document.getElementById("symbol").value)
        const offset_x = document.getElementById("offset-x").value != "" ? parseInt(document.getElementById("offset-x").value) : ""
        const offset_y = document.getElementById("offset-y").value != "" ? parseInt(document.getElementById("offset-y").value) : ""
        const size_x = document.getElementById("size-width").value != "" ? parseInt(document.getElementById("size-width").value) : ""
        const size_y = document.getElementById("size-height").value != "" ? parseInt(document.getElementById("size-height").value) : ""
        const ignore = document.getElementById("ignore").value != "" ? document.getElementById("ignore").value.toLowerCase() === "true" : ""
        const smallchest = document.getElementById("smallchest").value != "" ? document.getElementById("smallchest").value.toLowerCase() === "true" : ""
        const largechest = document.getElementById("largechest").value != "" ? document.getElementById("largechest").value.toLowerCase() === "true" : ""

        const properties = {}
        if (ignore !== "") { properties["ignore"] = true }
        if (smallchest !== "" || largechest !== "") {
            properties["gui"] = {}
            if (offset_x !== "" || offset_y !== "") { properties["gui"]["offset"] = [offset_x || 0, offset_y || 0] }
            if (size_x !== "" || size_y !== "") { properties["gui"]["size"] = [size_x || "default", size_y || "default"] }
            if (smallchest !== "") { properties["gui"]["smallchest"] = true }
            if (largechest !== "") { properties["gui"]["largechest"] = true }
        }
        if (Object.keys(properties).length !== 0) {
            if (!code_obj["fonts"]) {
                code_obj["fonts"] = {}
            }
            code_obj["fonts"][symbol] = properties
        }

        document.getElementById("symbol").value = ""
        document.getElementById("ignore").value = ""
        document.getElementById("offset-x").value = ""
        document.getElementById("offset-y").value = ""
        document.getElementById("size-width").value = ""
        document.getElementById("size-height").value = ""
        document.getElementById("smallchest").value = ""
        document.getElementById("largechest").value = ""
    }
    const code_str = JSON.stringify(code_obj, (key, value) => { return Array.isArray(value) ? JSON.stringify(value) : value }, "\t").replace(/"\[(.*?)\]"/g, "[$1]")
    ace.edit("jsonview").setValue(code_str)
}

function load_content_file() {
    const file = document.getElementById("file").files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        let result_json = JSON.parse(e.target.result)
        if (result_json && typeof result_json === "object" && !("items" in result_json)) {
            result_json = sprites_to_content(result_json)
        }
        const code_str = JSON.stringify(result_json, null, 4)
        ace.edit("jsonview").setValue(code_str)
    };
    reader.readAsText(file);
}

function download_content() {
    const code = ace.edit("jsonview").getValue()
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
        if (!(`minecraft:${item}` in output.items)) {
            output.items[`minecraft:${item}`] = {}
        }

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

function resize_gui_preview() {
    const preview_width = document.getElementById("preview-gui").clientWidth
    const gui_preview_width = document.getElementById("gui-bg-image").clientWidth
    const zoomgui = preview_width / gui_preview_width
    if (zoomgui < 1) {
        document.getElementById("gui-image").style.zoom = zoomgui * 0.8
        document.getElementById("gui-bg-image").style.zoom = zoomgui * 0.8
    }
}

window.addEventListener("resize", () => { if (document.getElementById("mode-fonts").classList.contains("flex")) resize_gui_preview() })

function change_mode(mode_enable) {
    const modes = ["mode-settings", "mode-items", "mode-fonts"]
    for (const disable_mode of modes) {
        const element = document.getElementById(disable_mode)
        if (element.classList.contains("flex")) element.classList.replace("flex", "hidden")
    }
    document.getElementById(mode_enable).classList.replace("hidden", "flex")
    if (mode_enable === "mode-fonts") resize_gui_preview()
}

function delete_code() { ace.edit("jsonview").setValue("{}") }