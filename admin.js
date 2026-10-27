document.getElementById('addProductForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const product = {
        image: document.getElementById('productImage').value,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value
    };

    // Fetch the existing products
    fetch('http://localhost:3000/update-products')
        .then(response => response.json())
        .then(data => {
            // Add the new product to the existing array
            data.push(product);

            // Update the products array in menu.js
            products = data;

            // Update the products.json file with the new data
            return fetch('http://localhost:3000/update-products', {
                method: 'PUT', // Use 'PUT' to update the file
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        })
        .then(() => {
            // Update the menu with the new product
            updateMenu(products);
            alert('Product added successfully!');
        })
        .catch(error => console.error('Error adding product:', error));
});

function addProduct() {
    fetch('http://localhost:3000/update-products')
        .then(response => response.json())
        .then(data => {
            // Generate a unique ID for the new product
            const newProductId = generateUniqueId(data);
            
            const newProduct = {
                id: newProductId, // Use the generated unique ID
                name: document.getElementById('productName').value,
                image: document.getElementById('productImage').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value
            };

            data.push(newProduct);

            products = data;

            // Update the products.json file with the new data
            return fetch('http://localhost:3000/update-products', {
                method: 'PUT', // Use 'PUT' to update the file
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        })
        .then(() => {
            // Update the menu with the new product
            updateMenu(products);
            alert('Product added successfully!');
        })
        .catch(error => console.error('Error adding product:', error));
}

// Function to generate a unique ID
function generateUniqueId(existingData) {
    let newProductId;

    do {
        newProductId = Math.floor(Math.random() * 1000) + 1;
    } while (existingData.some(product => product.id === newProductId));

    return newProductId;
}