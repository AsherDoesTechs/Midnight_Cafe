export type CartItem = {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
};

// Example usage:
const cart: CartItem[] = [];

const id = 1;
const name = "Coffee";
const price = 100;
const quantity = 2;

const item: CartItem = { menu_item_id: id, name, price, quantity };
cart.push(item);
