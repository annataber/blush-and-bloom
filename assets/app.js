const products = [];

async function fetchDataFromSheets() {
  // const sheetsApi = 'https://script.google.com/macros/s/AKfycbyGqpVCNN0dCBchOdZlrJ6Ap_EHG5TP_WF4i9YEXOw4vWMg5OwR5BiNrPYhFhp9dQh0/exec';

  // for faster testing
  const sheetsApi = '/assets/products.json';

  const response = await fetch(sheetsApi);
  (await response.json()).forEach((product, index) => {
    // convert any faux arrays into real arrays
    ['eye_colors', 'hair_colors', 'skin_tones', 'styles'].forEach((key) => {
      product[key] = String(product[key]).trim()
        .split(',') // split on commas to make an array
        .map((value) => value.trim()) // remove any leading/trailing whitespace
        .filter((value) => !!value); // remove any empty values
    });

    products.push(product);
  });

  console.log(products);
}

function storeData(dataType, element) {
  // remove selected from any previously chosen item
  const items = document.querySelectorAll(`#view-${dataType} li`);
  Array.from(items).forEach((item) => {
    item.classList.remove('selected')
  });

  // add selected class so the user knows what they've chosen
  element.classList.add('selected');

  // store the color in localStorage
  const choice = element.getAttribute('data-choice');
  window.localStorage.setItem(dataType, Number(choice));
}

function loadData(dataType) {
  const choice = window.localStorage.getItem(dataType);

  if (choice) {
    storeData(dataType, document.querySelector(`#view-${dataType} li[data-choice='${choice}']`));
  }
}

async function fade(element, targetOpacity) {
  // yes yes better to do with css but where's the fun in that?
  let opacity = Number(element.style.opacity) * 100;

  const step = (opacity > targetOpacity) ? -1 : 1;

  while (opacity !== targetOpacity) {
    opacity += step;
    element.style.opacity = opacity / 100;
    await new Promise(r => setTimeout(r, (100 - opacity) / 10 * 0.75)); // tween it!
  }
}

async function setView(view, button) {
  const current = document.querySelector('div.view-selected');
  const next = document.querySelector(`div#view-${view}`);

  button?.classList.add('selected');

  if (current) {
    await fade(current, 0);
    current.classList.remove('view-selected');
  }

  button?.classList.remove('selected');
  next.style.opacity = 0;
  next.classList.add('view-selected');
  await fade(next, 100);

  if (view === 'products') {
    buildProductList();
  }
}

function findMatchingProducts() {
  const eyeColor = window.localStorage.getItem('eye-color');
  const hairColor = window.localStorage.getItem('hair-color');
  const skinTone = window.localStorage.getItem('skin-tone');
  const priceRange = window.localStorage.getItem('price-range');
  const style = window.localStorage.getItem('style');

  const ranges = {
    '1': [0, 15],
    '2': [15, 25],
    '3': [25, 50],
    '4': [50, 1000],
  };

  console.log('stored data', { eyeColor, hairColor, skinTone, priceRange, style });

  // filter products based on stored data
  return products.filter((product) => {
    console.log('filtering', product);
    if (eyeColor && product.eye_colors.length && !product.eye_colors.includes(eyeColor)) {
      return false;
    }

    if (hairColor && product.hair_colors.length && !product.hair_colors.includes(hairColor)) {
      return false;
    }

    if (skinTone && product.skin_tones.length && !product.skin_tones.includes(skinTone)) {
      return false;
    }

    if (style && product.styles.length && !product.styles.includes(style)) {
      return false;
    }

    if (priceRange && product.price && !(ranges[priceRange][0] <= product.price <= ranges[priceRange][1])) {
      return false;
    }

    return true;
  });
}

function buildProductList() {
  const matchingProducts = findMatchingProducts();
  console.log('matchingProducts', matchingProducts);

  document.querySelector('#product-list').innerHTML = matchingProducts.map((product) => {
    return `
      <a href="${product.link}" target="_blank">
        <div class="product-image" style="background-image: url(${product.image})"></div>
        <div class="product-details">
          <h3>${product.product}</h3>
          <p>${product.description}</p>
          <span class="price">$${product.price}.00</span>
        </div>
      </a>
    `;
  }).join('');
}
