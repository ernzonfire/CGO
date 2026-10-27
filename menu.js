const openBag = document.querySelector(".bag_icon");
const closeBag = document.querySelector(".close");
const menu_items = document.querySelector(".menu_items");
const itemList = document.querySelector(".itemList");
const checkout = document.querySelector(".checkout");
const quantity = document.querySelector(".quantity");
const bagTab = document.querySelector(".cc-btn");
const body = document.querySelector("body");

let isBagOpen = false;
let products = [
        {
            "id": 1,
            "name": "AMERICANO",
            "image": "HAmericano.png",
            "price": 69.25,
            "category": "Hot Drinks"
        },
        {
            "id": 2,
            "name": "CAPUCCINO",
            "image":"HCapuccino.png",
            "price": 69.25,
            "category": "Hot Drinks"
        },
        {
            "id": 3,
            "name": "LATTE MACCHIATO",
            "image":"HLatte Macchiato1.png",
            "price": 69.25,
            "category": "Hot Drinks"
        },
        {
            "id": 4,
            "name": "VANILLA LATTE",
            "image":"HVanilla Latte1.png",
            "price": 69.25,
            "category": "Hot Drinks"
        },
        {
            "id": 5,
            "name": "ICED MOCHA",
            "image":"CMocha.png",
            "price": 69.25,
            "category": "Cold Drinks"
        },
        {
            "id": 6,
            "name": "ICED MACCHIATO",
            "image":"CMacchiato.png",
            "price": 69.25,
            "category": "Cold Drinks"
        },
        {
            "id": 7,
            "name": "ICED STEP BREW",
            "image":"CBrew.png",
            "price": 69.25,
            "category": "Cold Drinks"
        },
        {
            "id": 8,
            "name": "ICED TAWA-TAWA",
            "image":"CTawa.png",
            "price": 69.25,
            "category": "Cold Drinks"
        },
        {
            "id": 9,
            "name": "PISTACHIO",
            "image":"DPistachio.png",
            "price": 109.25,
            "category": "Desserts"
        },
        {
            "id": 10,
            "name": "CHOCOLATE CAKE",
            "image":"DChocoCake.png",
            "price": 109.25,
            "category": "Desserts"
        },
        {
            "id": 11,
            "name": "CHEESE CAKE",
            "image":"DCheeseCake.png",
            "price": 109.25,
            "category": "Desserts"
        },
        {
            "id": 12,
            "name": "BLUE CHEESE CAKE",
            "image":"DBlueCheeseCake.png",
            "price": 109.25,
            "category": "Desserts"
        }
    ];

    let listCards = [];

    let selectedCategory = null; // Add a variable to track the selected category

const initApp = () => {
    products.forEach((value, key) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.innerHTML = `
            <img src="img/${value.image}">
            <div class="name">${value.name}</div>
            <div class="price">₱ ${value.price.toLocaleString()}</div>
            <button onclick="addToBag(${value.id})">Add To Bag</button>
        `;
        menu_items.appendChild(newDiv);
    });
    updateMenu(products);
    document.getElementById('searchBar').addEventListener('keyup', (e) => {
        const searchData = e.target.value.toLowerCase();
        const filteredData = products.filter((item) => {
            return item.name.toLowerCase().includes(searchData);
        });
        updateMenu(filteredData);
    });
};

const resetFilter = () => {
    selectedCategory = null;
    updateMenu(products);
};

const filterByCategory = (category) => {
    selectedCategory = category.toLowerCase(); // Update the selected category in lowercase
    const filteredData = products.filter((item) => {
        return item.category.toLowerCase() === selectedCategory;
    });

    // Display the category title in menu_items
    updateMenu([{ title: category }, ...filteredData]);
};

const updateMenu = (items) => {
    const categoryTitleIndex = items.findIndex(item => item.title);
    
    if (categoryTitleIndex !== -1) {
        menu_items.innerHTML = `<div class='item-category-title'>${items[categoryTitleIndex].title}</div>`;
        items.splice(categoryTitleIndex, 1);
    } else {
        // Display product
        menu_items.innerHTML = items.map((item) => {
            var { image, name, price, category, id } = item;
            return `
                <div class='item' data-category='${category}'>
                    <img src="img/${image}">
                    <div class="name">${name}</div>
                    <div class="price">₱ ${price.toLocaleString()}</div>
                    <button onclick="addToBag(${id})">Add To Bag</button>
                </div>`;
        }).join('');
    }
};

fetch('http://localhost:3000/update-products')
.then(response => {
    if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
})
.then(data => {
    // Your data handling code here
})
.catch(error => console.error('Error fetching data:', error));

const addToBag = key => {
    if (listCards[key] == null) {
        listCards[key] = JSON.parse(JSON.stringify(products[key]));
        listCards[key].quantity = 1;
    } else {
        listCards[key].quantity += 1;
    }

    reloadCard();
};

const reloadCard = () => {
    itemList.innerHTML = "";
    let count = 0;
    let checkoutPrice = 0;

    listCards.forEach((value, key) => {
        checkoutPrice = checkoutPrice + value.price;
        count = count + value.quantity;

        if (value != null) {
            let newDiv = document.createElement("li");
            newDiv.innerHTML = `
                <div><img src="img/${value.image}"></div>
                <div class="itemName">${value.name}</div>
                <div class="itemPrice">₱${value.price.toLocaleString()}</div>

                <div>
                    <button class="bagButton" onclick="changeQuantity(${key}, ${value.quantity - 1})">-</button>
                    <div class="count">${value.quantity}</div>
                    <button class="bagButton" onclick="changeQuantity(${key}, ${value.quantity + 1})">+</button>
                </div>
            `;
            itemList.appendChild(newDiv);
        }
    });

    const totalPrice = document.querySelector(".checkout-price");
    totalPrice.innerText = checkoutPrice.toLocaleString();

    quantity.innerText = count;
};

const changeQuantity = (key, quantity) => {
    if (quantity == 0) {
        delete listCards[key];
    } else {
        listCards[key].quantity = quantity;
        listCards[key].price = quantity * products[key].price;
    }
    reloadCard();
};

openBag.addEventListener("click", () => {
    isBagOpen = !isBagOpen;
    body.classList.toggle("active", isBagOpen);
    bagTab.classList.toggle("active", isBagOpen);
});

closeBag.addEventListener("click", () => {
    isBagOpen = false;
    body.classList.remove("active");
    bagTab.classList.remove("active");
});

initApp();
