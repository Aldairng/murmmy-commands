Murmmy Comandas

I want to create a very simply and lightweight web application that will allow me to manage comandas (stands for "order kitchen" from spanish) for my ice cream shop. You will find prouct names in English or Spanish, do not try to translate them.

My plan is that this will be running in my local network and will be accessed by multiple devices. Even though, it is necessary to add a single or multiple user/password to avoid unauthorized access from customers connected to the same network.

This application will run in the shop pc, which is low in resources. In need to be lightweight and fast.
For storage, it can use the own filesystem or a simple database.

# Features:

1. It must has 4 modules:
   - Orders Creator
   - Orders Viewer
   - Settings
   - History
2. Multiple users can be connected at the same time, or we can use a single user shared in the shop.
3. The application must be able to handle multiple orders at the same time, from multiple tables.
4. Product must be configurable in the settings module.
5. Orders should accept notes from the customer.
6. Because it is running in a local network, it should be automatically updated when changes are made in the Orders creator module.
7. Modules must be accessible from the left sidebar
8. Login and logout functionality is required.
9. The Orders Creator Module should have a table selection, product selection, and order sending functionality.
10. A table can ask for multiple products, and each product is made of different ingredients that I will define in the product configuration.
11. Tables should be configurable in the settings module. Keep it simple. But if possible, allow to rearange the tables in a grid layout.
12. Orders viewer module is just Read Only.
13. In the Orders Creator, creation of a product should be simple and fast. show all the ingredients and allow them to check/uncheck the ingredients.
14. In the viewers module, orders should be grouped by table. Additionally, each order should clearly show the orderd product and the ingredient of each.
15. When an order is marked as completed, it should be removed from the viewer, but keep it in history for reference. Use the history module to view completed orders.
16. In the Order Creator, when a product is created, it should be available to be edited later, and should be updated in real time in the Viewer module.
17. In the Order Creator, be free to move from one table to another.

# Workflow

1. In the Orders creator module, the user select the table, then add the products to the order, and finally send the order to the kitchen.
2. In the Orders viewer module, the user can see the orders and mark them as completed.
3. In the History module, the user can see the completed orders.
4. In the Orders creator, when creating a product this is what should happen:

- choose a table, and open a interface for that table (keep it simple)
- select create an product
- select the type (icecream or milkshake)
- select the cereal or cereals
- select the topping or toppings (optional)
- select the syrup - just one (optional)
- add notes if needed
- save the product
- Go back if needed to the table to add another product at any moment.
- Send the order to the kitchen and go back to the home screen.
- Modify the product if needed at any moment and send the updated order.

5. Orders and product should be updated in real time in the Viewer module.

# Style

- Use a simple and clean design.
- Use a dark theme or light theme.
- Use a font that is easy to read.
- Use a consistent color scheme. Base color is a purple #703ec7, use another accent color for highlights.
- Use a consistent spacing and padding.
- Use a consistent border radius.
- Keep it simple and easy to use.
- Avoid unnecessary animations or effects.
- Use select boxes as much as possible to save space.
- Be reactive, so it can be usable in mobile devices, tablet or desktop.

# Stack:

- Use React with TypeScript. Not sure if a backend is needed for this, if so, use also TS
- Lets be lightweight and simple, no need for heavy frameworks
- I'm thinking of using docker, just to make it easier to run in different pc if the wants breaks, plus it will be developed in my personal macbook and then executed in the shop computer.

# List of Ingredients/Products:

- We sell IceCream and MilkShakes. We mix icecream with different Cereals and Toppings, and also a syrup at the end.
- We created 4 favorites products (combinations), or customers can create any combination of the ingredients.
- We should be able to add, remove or modify any ingredients in the Settings module. As starting point, I want you to add the following already in my shop.

- Cereals to choose from: Oreos Puffs, Reeses Puffs, cinnamon Toast Crunch, S'mores, Fruity Pebbles Marhsmallow, Cookie crisp, Lucky Charms, Fliips chocolate, Flips dulce leche, Kitkat, Choco Krispis, Zucaritas, Froot Loops, Milo
- Toppings to choose from: Oreos, Galletas Milo, Brownie Chocorramo, Minichips, Galleta Sultana, Chokis, Masmelos, Mamut, Quipitos, KitKat, M&Ms.
- Syrups to choose from: Chocolate, Arequipe, Nutella, Lecherita, Caramelo

# What a product is made of:

- Type: icecream or milkshake
- Cereal: choose from the list (mandatory) - multiple options allowed
- Topping: choose from the list (optional) - multiple options allowed
- Syrup: choose from the list (optional) - only one option allowed
- Topping is optional, show a "no topping" option
- Syrup is optional, show a "no syrup" option

## Favorite Products:

We have created some favorite products for our clients with predefined combinations. Customer must choose the syrup for the favorite product.

1. Canela Dulce: Cereal Cinnamon Toast Crunch + Cereal Zucaritas + Topping Brownie Chocorramo
2. Oreo Crunch: Cereal Oreo + Cereal Choco Krispis + Topping Galleta Sultana
3. Cookie Monster: Cereal Cookie crisp + Cereal Zucaritas + Topping Oreos
4. Reeses Crujiente: Cereal Reeses Puffs + Cereal Choco Krispis + Topping Quipitos

## Extras:

- Water, no related to the ice cream or milkshake

Real menu was uploaded in the folder for reference.
