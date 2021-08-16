// const fetch = require('node-fetch');
const cartSectionClassName = '.cart__items';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function saveAllLocalStorage(cartItemsSection) {
  localStorage.clear();
  const cartItems = cartItemsSection.children;
  const cartArray = [...cartItems].map((item) => item.innerText); // referencia: https://stackoverflow.com/questions/222841/most-efficient-way-to-convert-an-htmlcollection-to-an-array
  localStorage.setItem('cart', JSON.stringify(cartArray));
}

async function getSalePriceByID(productID) {
  const product = await fetch(`https://api.mercadolibre.com/items/${productID}`)
  .then((value) => value.json());
  return product.price;
}

function updateCartTotalPrice() {
  const cartItemsSection = document.querySelector(cartSectionClassName).children;
  const isEmpty = cartItemsSection === null;
  const totalPriceElement = document.querySelector('.total-price');
  const regex = /\$\d*.\d*/g;
  const totalPrice = [...cartItemsSection].reduce((acc, item) => {
    let price = item.innerText.match(regex)[0];
    price = +price.replace('$', '');
    return acc + price;
  }, 0);
  totalPriceElement.innerText = isEmpty ? 0 : Number(totalPrice);
}

function cartItemClickListener(param) {
  const isEvent = param instanceof Event; // testa se o parametro veio de um evento de click. referencia: https://stackoverflow.com/questions/1458894/how-to-determine-if-javascript-object-is-an-event
  const cartItem = isEvent ? param.target : param;
  const cartItemsSection = document.querySelector(cartSectionClassName);
  cartItemsSection.removeChild(cartItem);
  saveAllLocalStorage(cartItemsSection);
  updateCartTotalPrice();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

function getProductModel(product) {
  return {
    sku: product.id,
    name: product.title,
    image: product.thumbnail,
  };
}

function getCartFromLocalStorage() {
  const cart = JSON.parse(localStorage.getItem('cart'));
  const cartItemsSection = document.querySelector(cartSectionClassName);
  if (cart) {
    cart.forEach((item) => {
      const li = document.createElement('li');
      li.innerText = item;
      li.className = 'cart__item';
      li.addEventListener('click', cartItemClickListener);
      cartItemsSection.append(li);
    });
  }
}

function addToCartEventListener() {
  const buttonsAddToCart = document.querySelectorAll('.item__add');
  buttonsAddToCart.forEach((button) => button.addEventListener('click', async () => {
    const buttonParent = button.parentNode;
    const name = buttonParent.childNodes[1].innerText;
    const sku = buttonParent.firstChild.innerText;
    const salePrice = await getSalePriceByID(sku);
    const productModel = { sku, name, salePrice };
    const cartItemElement = createCartItemElement(productModel);
    const cartItemsSection = document.querySelector(cartSectionClassName);
    cartItemsSection.appendChild(cartItemElement);
    saveAllLocalStorage(cartItemsSection);
    updateCartTotalPrice();
  }));
}

async function fetchProductsList() {
  const results = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador')
  .then((value) => value.json())
  .then((json) => json.results);

  results.forEach((product) => {
    const productModel = getProductModel(product);
    const item = createProductItemElement(productModel);
    const itemsSection = document.querySelector('.items');
    itemsSection.appendChild(item); 
  });

  addToCartEventListener();
}

window.onload = () => {
  fetchProductsList();
  getCartFromLocalStorage();
  updateCartTotalPrice();

  const clearCartButton = document.querySelector('.empty-cart');

  clearCartButton.addEventListener('click', () => { 
    document.querySelector(cartSectionClassName).innerHTML = '';
    updateCartTotalPrice();
  });
};