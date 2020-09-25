//
// ──────────────────────────────────────────────────────────────────────── I ───────
//   :::::: G E N E R A T E   F I L T E R S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────────────────────
//

let categoriesList = document.querySelector('#categories-list')
let cuisinesList = document.querySelector('#cuisines-list')
let menuList = document.querySelector('#menu-list')

console.log(database)
lset('menu', database)

function generateFilters() {
    let types = []
    let cuisines = []

    for (let item of database) {
        for (let type of item.dishTypes) {
            if (types.includes(type) === false) {
                types.push(type)
            }
        }

        types = types.sort()

        for (let cuisine of item.cuisines) {
            if (cuisines.includes(cuisine) === false) {
                cuisines.push(cuisine)
            }
        }

        cuisines = cuisines.sort()
    }

    return { types, cuisines }
}

let filtersList = generateFilters()

for (let item of filtersList.types) {
    let li = createElement('li', { id: 'categories-list-item' })

    let button = createElement('button', {
        attributes: { type: 'button', 'data-filter': item },
        event: {
            click: function () {
                filterMenu('dishTypes', this.getAttribute('data-filter'))
            },
        },
        classes: ['button', 'button-dishtype'],
        text: item,
    })

    li.appendChild(button)

    categoriesList.appendChild(li)
}

for (let item of filtersList.cuisines) {
    let li = createElement('li', { id: 'cuisines-list-item' })

    let button = createElement('button', {
        attributes: { type: 'button', 'data-filter': item },
        classes: ['button', 'button-cuisine'],
        event: {
            click: function () {
                filterMenu('cuisines', this.getAttribute('data-filter'))
            },
        },
        text: item,
    })

    li.appendChild(button)

    cuisinesList.appendChild(li)
}

//
// ────────────────────────────────────────────────────────────────────────────────────────────────── II ──────
//   :::::: G E N E R A T E   M E N U   A N D   O R D E R S   L I S T : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────
//

if (localStorage.getItem('filteredMenu')) {
    let filteredMenu = lget('filteredMenu')
    renderMenu(filteredMenu.menu, filteredMenu.type, filteredMenu.filter)
}

if (localStorage.getItem('orders')) {
    let orders = lget('orders')
    renderOrders(orders)
}

function filterMenu(type, filter) {
    let filteredMenu = []

    type === 'cuisines'
        ? (filteredMenu = database.filter((item) =>
              item.cuisines.includes(filter),
          ))
        : (filteredMenu = database.filter((item) =>
              item.dishTypes.includes(filter),
          ))

    lset('filteredMenu', { menu: filteredMenu, type, filter })

    renderMenu(filteredMenu, type, filter)
}

document
    .querySelector('.button-checkout')
    .addEventListener('click', function () {
        console.log('checkout')
        showCheckoutModal()
    })
//
// ────────────────────────────────────────────────────────── III ─────
//   :::::: M E N U   L I S T : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────
//

// renderMenu() : Update menu list HTML
function renderMenu(filteredMenu, type, filter) {
    // Filtered menu info on top of menu cards list
    let filterInfo = document.querySelector('#filter-info')
    filterInfo.innerHTML = `There ${
        filteredMenu.length > 1 ? 'are' : 'is only'
    } <span>${filteredMenu.length}</span> menu item${
        filteredMenu.length > 1 ? 's' : ''
    } based on <span>${
        type === 'dishTypes' ? 'Dish Type:' : 'Cuisine Type:'
    } ${filter}</span>`

    let fragment = document.createDocumentFragment()
    for (let item of filteredMenu) {
        let li = createElement('li', {
            classes: ['menu-list-item'],
        })

        // Menu card
        let card = createElement('div', { classes: ['card', 'menu-card'] })

        // Menu image
        let imgWrapper = createElement('div', {
            classes: ['menu-image-wrapper'],
        })
        let img = createElement('img', {
            attributes: { src: item.image },
            classes: ['menu-image'],
        })

        imgWrapper.append(img)

        // Menu details wrapper

        let details = createElement('div', { classes: ['menu-details'] })

        // Menu name
        let title = createElement('p', {
            classes: ['menu-title'],
            text: item.title,
        })

        // Group score and price

        let scorePriceWrapper = createElement('div', {
            classes: ['score-price-wrapper'],
        })

        // Group star image and score
        let scoreWrapper = createElement('div', { classes: ['score-wrapper'] })

        // Star image
        let star = createElement('img', {
            attributes: { src: './img/icons8-star-filled-50.png' },
            classes: ['menu-star'],
        })

        // Menu score
        let score = createElement('p', {
            classes: ['menu-score'],
            text: `${item.spoonacularScore / 20} of 5`,
        })

        scoreWrapper.append(star, score)

        // Menu price
        let price = createElement('p', {
            classes: ['menu-price'],
            text: Math.floor((item.pricePerServing / 100) * 100) / 100,
        })

        scorePriceWrapper.append(scoreWrapper, price)

        // Button: add menu item to orders list
        let button = createElement('button', {
            attributes: {
                type: 'button',
                'data-id': item.id,
            },
            classes: ['button', 'menu-button', `button-add-order-${item.id}`],
            event: {
                click: function () {
                    updateOrder(this.getAttribute('data-id'), 'plus')
                    this.textContent = 'Added'
                    this.setAttribute('disabled', true)
                    this.classList.add('added')
                },
            },
            text: lget('orders')
                ? lget('orders')[parseInt(item.id)]
                    ? 'Added'
                    : 'Add  +'
                : 'Add  +',
        })

        // If menu item is on orders list, disable 'add' button
        if (lget('orders') && lget('orders')[parseInt(item.id)]) {
            button.setAttribute('disabled', true)
        }

        details.append(title, scorePriceWrapper)

        card.append(imgWrapper, details)

        li.append(card, button)

        fragment.append(li)
    }

    // Replace current menu list HTML
    menuList.textContent = ''
    menuList.append(fragment)
}

//
// ────────────────────────────────────────────────────────────── IV ──────
//   :::::: O R D E R S   L I S T : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────
//

// updateOrder() : Increase or decrease order quantity
function updateOrder(id, type) {
    let orders = {}

    //Get current orders from localStorage
    if (localStorage.getItem('orders')) {
        orders = JSON.parse(localStorage.getItem('orders'))
    }

    //Update order quantity
    if (!orders[id]) {
        orders[id] = 0
    }

    if (type === 'plus') {
        orders[id]++
        if (!document.querySelector(`#order-list-item-${id}`)) {
            addOrder(id, orders[id])
        }
    } else {
        if (orders[id] <= 1) {
            let removeLi = document.querySelector(`#order-list-item-${id}`)
            removeLi.parentNode.removeChild(removeLi)

            if (document.querySelector(`.button-add-order-${id}`)) {
                document
                    .querySelector(`.button-add-order-${id}`)
                    .removeAttribute('disabled')
                document.querySelector(`.button-add-order-${id}`).textContent =
                    'Add  +'
            }

            delete orders[id]
        } else {
            orders[id]--
        }
    }

    //Save updated orders to localStorage
    lset('orders', orders)

    //Update total price
    updateTotalPrice()

    //If menu item is already in orders list, update its quantity
    if (document.querySelector(`#quantity-${id}`)) {
        document.querySelector(`#quantity-${id}`).textContent = orders[id]
    }
}

// renderOrders() : render ALL menu items to orders list
function renderOrders(orders) {
    for (let item in orders) {
        addOrder(parseInt(item), orders[item])
    }
}

// addOrder() : render ONE menu item to orders list
function addOrder(id, quantity) {
    let menu = getMenuDetails(id)

    let li = createElement('li', {
        id: `order-list-item-${id}`,
        classes: ['order-list-item'],
    })

    // Group image and title into one div
    let img_title = createElement('div', { classes: ['image-title'] })

    let imgWrapper = createElement('div', { classes: ['order-image-wrapper'] })
    let img = createElement('img', {
        attributes: { src: menu.image },
        classes: ['order-image'],
    })

    imgWrapper.append(img)

    let title = createElement('p', {
        text: menu.title,
        classes: ['order-title'],
    })

    img_title.append(imgWrapper, title)

    // Group price, heart, add notes, and quantity into one div
    let price_qtt = createElement('div', { classes: ['price-qtt'] })

    let price = createElement('p', {
        text: `$ ${Math.floor((menu.pricePerServing / 100) * 100) / 100}`,
        classes: ['order-price'],
    })

    // ! TO BE IMPLEMENTED
    // let heart = createElement('div', {
    //     classes: ['heart', isFavorite(id) ? 'favorite' : ''],
    //     event: { click: () => toggleFavorite(id) },
    // })

    // let heartImg = createElement('img', {
    //     attributes: { src: './img/heart.png' },
    // })
    // heart.append(heartImg)

    // let addNotes = createElement('div', {
    //     classes: ['button', 'button-create-note'],
    //     attributes: { type: 'button' },
    //     event: { click: () => addNotes(id) },
    // })
    // let addNotesImg = createElement('img', {
    //     attributes: { src: './img/addnote.png' },
    // })

    // addNotes.append(addNotesImg)

    let quantityWrapper = createElement('div', { id: 'quantity-wrapper' })
    let minusButton = createElement('button', {
        attributes: { type: 'button' },
        classes: ['button', 'button-minus'],
        text: '-',
        event: { click: () => updateOrder(id, 'minus') },
    })

    let quantityButton = createElement('button', {
        attributes: { type: 'button' },
        classes: ['button', 'button-quantity'],
        text: quantity,
        id: `quantity-${id}`,
    })
    let plusButton = createElement('button', {
        attributes: { type: 'button' },
        classes: ['button', 'button-plus'],
        text: '+',
        event: { click: () => updateOrder(id, 'plus') },
    })

    quantityWrapper.append(minusButton, quantityButton, plusButton)

    // ! TO BE IMPLEMENTED
    // price_qtt.append(price, heart, addNotes, quantityWrapper)
    price_qtt.append(price, quantityWrapper)

    // ! TO BE IMPLEMENTED
    // li.append(img_title, price, heart, addNotes, quantityWrapper)
    li.append(img_title, price_qtt)

    let orderList = document.querySelector('#order-list')

    orderList.append(li)
}

// getMenuDetails() : get menu item's details based on its id
function getMenuDetails(id) {
    return database.filter((item) => item.id === parseInt(id))[0]
}

updateTotalPrice()

function updateTotalPrice() {
    console.log('updating total price')
    let totalPriceEl = document.querySelector('#total-price-value')

    let totalPrice = 0

    let orders

    if (lget('orders')) {
        orders = lget('orders')
    }

    for (let item in orders) {
        for (let menu of database) {
            if (parseInt(menu.id) === parseInt(item)) {
                totalPrice += getPricePerServings(menu.id) * orders[item]
            }
        }
    }

    totalPriceEl.textContent = `$ ${Math.floor(totalPrice * 100) / 100}`
}

function getPricePerServings(id) {
    let menu = getMenuDetails(id)
    return menu.pricePerServing / 100
}

// isFavorite() : check if particular order item is already favorited
function isFavorite(id) {
    // ! TO BE IMPLEMENTED
}

// toggleFavorite() : toggle unfavorited order item into favorite, vice versa
function toggleFavorite(id) {
    // ! TO BE IMPLEMENTED
}

// addNotes() : Add notes to particular order item
function addNotes(id) {
    // ! TO BE IMPLEMENTED
}

function showCheckoutModal() {
    console.log('checkout modal')
    let modal = document.querySelector('#modal')
    let modalDiv = document.querySelector('#modal-content')

    modalDiv.innerHTML = ''

    let h1 = createElement('h1', {
        classes: ['checkout-header'],
        text: 'Today is your lucky day!',
    })

    let p = createElement('p', {
        classes: ['checkout-text'],
        html:
            "Our web developer is still developing the Checkout Page...<br>You can have all of your orders <span>for free</span>! Have a nice day!<br>Assalamu'alaikum.",
    })

    let div = createElement('div', { classes: ['modal-ceo'] })
    let ceo = createElement('div', { classes: ['ceo'] })
    let ceoName = createElement('p', {
        classes: ['ceo-name'],
        text: 'Reynaldi Riva',
    })
    let ceoTitle = createElement('p', { classes: ['ceo-title'], text: 'CEO' })

    ceo.append(ceoName, ceoTitle)

    div.append(ceo)
    modalDiv.append(h1, p, div)

    toggleModal()
}

function toggleModal() {
    let modal = document.querySelector('#modal')
    modal.classList.toggle('hidden')
}

window.addEventListener('click', function (event) {
    if (event.target === modal) {
        toggleModal()
    }
})
