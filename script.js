// const fetch = require('node-fetch');

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

function cartItemClickListener(event) {
  // coloque seu código aqui
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

async function getSalePriceByID(productID) {
  const product = await fetch(`https://api.mercadolibre.com/items/${productID}`)
  .then((value) => value.json());
  return product.price;
}

function addToCartEventListener() {
  const buttons = document.querySelectorAll('.item__add');
  buttons.forEach((button) => button.addEventListener('click', async () => {
    const buttonParent = button.parentNode;
    const name = buttonParent.childNodes[1].innerText;
    const sku = buttonParent.firstChild.innerText;
    const salePrice = await getSalePriceByID(sku);
    const productModel = { sku, name, salePrice };
    const cartItemElement = createCartItemElement(productModel);
    const cart = document.querySelector('.cart__items');
    cart.appendChild(cartItemElement);
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

window.onload = fetchProductsList;
