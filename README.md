# Step Brew

Step Brew is a local coffee shop demo with shared login, a persistent shopping bag, product management, orders, profiles, and reviews. The current application is in `WEBDEV_FINAL PROJECT/connected`; `server.js` serves it at the repository root URL.

## Run locally

Install Node.js 18 or newer, then run these commands from the repository folder:

```sh
npm test
npm start
```

Open <http://127.0.0.1:8000>. There are no package dependencies to install. Use the Node server rather than opening HTML files directly or using a static preview server, because login, products, orders, and account carts need the API.

The first account registered on a fresh installation becomes the admin. Register a second account to demonstrate the customer flow. Admins can manage products, users, and order status from the Admin link in the shared header.

## Demo flows

- Add products on Menu, then open the same bag on Home or About.
- Register or sign in to merge the guest bag into the account's saved bag.
- Update a product in Admin and see the changes appear in other open pages.
- Place an order, view it in the account page, and update its status in Admin.
- Submit a review from the About page while signed in.

Runtime data is saved in `WEBDEV_FINAL PROJECT/connected/data`, and uploaded product images are saved in `WEBDEV_FINAL PROJECT/connected/assets/uploads`. Both folders are excluded from Git. Keep them when restarting or moving an existing installation. A fresh clone starts with the seed menu and no accounts or orders.

## Demo scope

Orders are for pickup and payment at the counter. Payment and delivery logos are visual references; online payment, delivery services, and Google or Facebook sign-in are not connected. Celebrity review cards are labeled demo reviews. Some imagery was reconstructed from the supplied project assets. Image and icon credits are available in the site's footer.

The server listens on localhost. This repository is prepared for a local classroom demo; public deployment needs a separate deployment and security review. Older files at the repository root are retained as historical sources; the connected folder is the application used by `npm start`.
