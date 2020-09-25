function lset(key, value) {
    return localStorage.setItem(key, JSON.stringify(value))
}

function lget(key) {
    return JSON.parse(localStorage.getItem(key))
}

function createElement(type, options = {}) {
    let attributes = options.attributes
    let classes = options.classes
    let id = options.id
    let event = options.event
    let text = options.text
    let html = options.html

    let el = document.createElement(type)

    if (isEmptyObject(options) === false) {
        if (attributes) {
            for (let attr in attributes) {
                el.setAttribute(attr, attributes[attr])
            }
        }

        if (classes) {
            for (item of classes) {
                el.classList.add(item)
            }
        }

        if (id) {
            el.id = id
        }

        if (event) {
            for (let item in event) {
                el.addEventListener(item, event[item])
            }
        }

        if (text) {
            el.textContent = text
        }

        if (html) {
            el.innerHTML = html
        }

        return el
    }

    return el
}

function isEmptyObject(obj) {
    return Object.keys(obj).length === 0
}
