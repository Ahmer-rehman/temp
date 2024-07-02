import {createClient} from 'https://esm.sh/@sanity/client'

const client = createClient({
  projectId: '9ap2mdnz',
  dataset: 'production',
  token:
    'skxupqUwYUdR0RPMB0dJJv5TxR5fHAI1M4WvdhLPux9Y2UPxUScxqFzJVTqtm8dCl5VlDF2W9ZjhhCXupbl509FxWM82KkcgxbzrYq6u7yP2mNv5T8KqVqT8kZcrENJ5iX2ewDJw85OcUyizTuK0OeqSiQtExI2q1qV8sb91goyP3JVoMGyh', // Optional if you don't have authentication enabled
  useCdn: true, // Set to true for read-only access and faster response times
  apiVersion: 'v2022-03-07',
});

//  Top ribbon
async function fetchnotification() {
  const query = `*[_type == "notification"]{
    title,
    description,
    isActive
  }`;

  try {
    const notifications = await client.fetch(query);
    console.log(notifications);
    const activeNotification = notifications.find(
      (notification) => notification.isActive
    );
    const topRibbon = document.querySelector('.top-ribbon');
    const ribbonText = document.getElementById('notification_bar');
    if (activeNotification) {
      ribbonText.textContent = activeNotification.description;
      topRibbon.classList.remove('display');
    } else {
      topRibbon.classList.add('display');
      ribbonText.textContent = 'No active notifications.';
    }
    if (activeNotification) {
      const noti = document.getElementById('notification_bar');
      noti.textContent = activeNotification.description;
    } else {
      console.log('No active notifications found.');
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}
function listenForUpdates() {
  client.listen().subscribe((update) => {
    fetchnotification();
    fetchProducts();
    getlinks();
    fetchCollection();
      });
}

async function fetchContacts() {
  const query = '*[_type == "contacts"][0]'; // Adjust the query if needed
  const data = await client.fetch(query);
  console.log(data);
  const whatsapp = document.getElementById('whatsapp');
  const phoneNumber = data.whatsapp;
  whatsapp.textContent = phoneNumber;
  whatsapp.href = `https://wa.me/${phoneNumber}`;
}
fetchContacts();
fetchnotification();
listenForUpdates();
async function fetchImages() {
  const query = `*[_type == "banner"]{
    title,
    description,
    "imageUrl": image.asset->url,
    image{
      altText
    },
    textPosition
  }`;
  try {
    const images = await client.fetch(query);
    // Listen for real-time updates
    client.listen(query).subscribe((update) => {
      console.log('Real-time update:', update);
      // Re-fetch and update the slideshow on each change
      fetchImages().then((newImages) => {
        updateSlideshow(newImages);
      });
    });

    return images;
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}
function updateTextPositionClass(textPosition) {
  const bannerTextContainer = document.querySelector('.banner-text-container');
  if (bannerTextContainer) {
    bannerTextContainer.className = 'banner-text-container'; // Reset to default
    if (textPosition === 'right') {
      bannerTextContainer.classList.add('container-right');
    } else if (textPosition === 'left') {
      bannerTextContainer.classList.add('container-left');
    } else if (textPosition === 'center') {
      bannerTextContainer.classList.add('container-center');
    }
  }
}

// Initialize slideshow with images from Sanity
async function initSlideshow() {
  const images = await fetchImages();

  if (images && images.length > 0) {
    const slideshow = document.getElementById('slideshow');

    images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      if (index === 0) slide.classList.add('active');
      slide.innerHTML = `<img src="${image.imageUrl}" alt="${
        image.image.altText || `Slide ${index + 1}`
      }">`;
      slideshow.appendChild(slide);
    });

    // Set the initial title and description
    const firstImage = images[0];
    if (firstImage) {
      document.getElementById('banner-title').textContent =
        firstImage.title || '';
      document.getElementById('banner-description').textContent =
        firstImage.description || '';
    }

    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    function showNextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');

      // Update title and description with each slide change
      const currentImage = images[currentSlide];
      if (currentImage) {
        document.getElementById('banner-title').textContent =
          currentImage.title || '';
        document.getElementById('banner-description').textContent =
          currentImage.description || '';
        setInterval(updateTextPositionClass(currentImage.textPosition), 5000);
      }
    }

    setInterval(showNextSlide, 5000);
  } else {
    console.log('No images found');
  }
}
initSlideshow();

// For the collection images under the main bannner
async function fetchCollection() {
  const data = await client.fetch(`
    *[_type == "collection"]{
      title,
      "imageUrl": image.asset->url,
      image{
        altText
      }
    }
  `);
  renderCollection(data);
  listenForUpdates();
}

function renderCollection(collection) {
  collection.forEach((item, index) => {
    const img = document.getElementById(`img${index + 1}`);
    const textDiv = document.getElementById(`title${index + 1}`);

    if (img) {
      img.src = item.imageUrl;
      img.alt = item.image.altText;
    }

    if (textDiv) {
      textDiv.textContent = item.title;
    }
  });
}


// Initial fetch and start listening for updates
fetchCollection();
// header footer rendering methods
document.addEventListener('DOMContentLoaded', function () {
  fetch('./assets/Components/header.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('header').innerHTML = data;
    });

  fetch('./assets/Components/header.html')
    .then((response) => response.text())
    .then((data) => {
      document.getElementById('footer').innerHTML = data;
    });
});

window.onscroll = function () {
  myFunction();
};

// Get the header
var header = document.getElementById('bar-3');

// Get the offset position of the navbar
var sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
}
// selector
// Get the container element
// Get the template element
// Get the template element
// Define the query to fetch products

async function fetchProducts() {
  const products = await client.fetch(`*[_type == "product"]{
    title,
    description,
    price,
    sku,
    "slug": slug.current,
    category->{
      title
    },
    images[]{
      asset->{
        url
      }
    },
    size,
    color,
    material,
    fit,
    tag,
    published,
    stock,
    careInstructions,
    _createdAt
  }`);
  console.log(products);
  renderProducts(products);
}

// Initial fetch of products
fetchProducts();
// Function to render products
const template = document.getElementById('new-arrivals-item-template');
const container = document.querySelector('.new-arrivals-container');
const clonedTemplate = template.content.cloneNode(true);
function renderProducts(femaleClothes) {
  const template = document.getElementById('new-arrivals-item-template');
  const container = document.querySelector('.new-arrivals-container');

  if (!container) {
    console.error('Error: container element not found.');
    return;
  }

  const saleOrNewItems = femaleClothes.filter(
    (item) =>
      item.tag === 'sale' ||
      item.tag === 'Sale' ||
      item.tag === 'new' ||
      item.tag === 'New'
  );

  const otherItems = femaleClothes.filter(
    (item) =>
      !(
        item.tag === 'sale' ||
        item.tag === 'Sale' ||
        item.tag === 'new' ||
        item.tag === 'New'
      )
  );

  const sortedItems = saleOrNewItems.concat(otherItems);

  container.innerHTML = '';

  sortedItems.forEach((item) => {
    const clonedTemplate = template.content.cloneNode(true);

    const img = clonedTemplate.querySelector('.new-arrivals-img');
    img.src = item.images[0].asset.url;

    img.alt = item.title;

    const name = clonedTemplate.querySelector('.laaleh-shop-name');
    name.textContent = item.title;

    const price = clonedTemplate.querySelectorAll('.price');
    price[1].textContent = `Rs ${item.price.toFixed(2)}`;

    const ribbon = clonedTemplate.querySelector('.ribbon');
    if (
      item.tag === 'sale' ||
      item.tag === 'Sale' ||
      item.tag === 'new' ||
      item.tag === 'New'
    ) {
      ribbon.textContent = item.tag.toUpperCase();
      ribbon.style.display = 'block';
    } else {
      ribbon.style.display = 'none';
    }

    // Add event listener to show overlay
    const quickViewBtn = clonedTemplate.querySelector('.quick-view');
    quickViewBtn.addEventListener('click', () => {
      showOverlay(item);
    });

    container.appendChild(clonedTemplate);
  });
}

// overlay screen
function updateCartCount() {
  document.querySelector('.cart-count').textContent = cartItems.length;
}

function updateCartData() {
  const cartDataDiv = document.querySelector('.cart-data');
  cartDataDiv.innerHTML = ''; // Clear existing data

  if (cartItems.length === 0) {
    cartDataDiv.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    const ul = document.createElement('ul');
    cartItems.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-img">
          <div class="cart-item-details">
            <p class="cart-item-title">${item.title}</p>
            <p class="cart-item-price">Rs ${item.price.toFixed(2)}</p>
            <p class="cart-item-quantity">
              Quantity: 
              <button class="quantity-decrease">-</button>
              ${item.quantity}
              <button class="quantity-increase">+</button>
            </p>
            <button class="remove-item">Remove</button>
          </div>
        </div>
      `;
      ul.appendChild(li);
    });
    cartDataDiv.appendChild(ul);

    // Add event listeners for quantity buttons and remove button
    document.querySelectorAll('.quantity-increase').forEach(button => {
      button.addEventListener('click', increaseQuantity);
    });
    document.querySelectorAll('.quantity-decrease').forEach(button => {
      button.addEventListener('click', decreaseQuantity);
    });
    document.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', removeItem);
    });
  }
}

function addItemToCart(item, quantity) {
  const existingItem = cartItems.find(cartItem => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    const cartItem = {
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: parseInt(quantity),
      imageUrl: item.images[0].asset.url,
    };

    cartItems.push(cartItem);
  }

  console.log('Cart items:', cartItems); // Debug log

  // Update the cart UI
  updateCartCount();
  updateCartData();
}

function increaseQuantity(event) {
  const cartItemDiv = event.target.closest('.cart-item');
  const itemId = cartItemDiv.getAttribute('data-id');
  const item = cartItems.find(cartItem => cartItem.id === itemId);
  item.quantity++;
  updateCartData();
}

function decreaseQuantity(event) {
  const cartItemDiv = event.target.closest('.cart-item');
  const itemId = cartItemDiv.getAttribute('data-id');
  const item = cartItems.find(cartItem => cartItem.id === itemId);
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cartItems = cartItems.filter(cartItem => cartItem.id !== itemId);
  }
  updateCartData();
  updateCartCount();
}

function removeItem(event) {
  const cartItemDiv = event.target.closest('.cart-item');
  const itemId = cartItemDiv.getAttribute('data-id');
  cartItems = cartItems.filter(cartItem => cartItem.id !== itemId);
  updateCartData();
  updateCartCount();
}

function showOverlay(item) {
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayDescription = document.getElementById('overlay-description');
  const overlayPrice = document.getElementById('overlay-price');
  const overlaySizes = document.getElementById('overlay-sizes');
  const overlayColors = document.getElementById('overlay-colors');
  const overlayMainImage = document.getElementById('overlay-main-image');
  const overlayThumbnails = document.getElementById('overlay-thumbnails');
  const overlayQuantity = document.getElementById('overlay-quantity');
  const overlayLink = document.getElementById('overlay-link');
  const sizeGuideLink = document.getElementById('size-guide-link');
  const addToCartButton = document.getElementById('add-to-cart-btn');

  overlayTitle.textContent = item.title;
  overlayDescription.textContent = item.description;
  overlayPrice.textContent = `Price: Rs ${item.price.toFixed(2)}`;

  // Clear existing sizes and append size buttons
  overlaySizes.innerHTML = 'Sizes: ';
  item.size.forEach((size) => {
    const sizeButton = document.createElement('button');
    sizeButton.classList.add('size-button');
    sizeButton.textContent = size;
    overlaySizes.appendChild(sizeButton);
  });

  // Clear existing colors and append color text
  overlayColors.textContent = 'Colors: ' + item.color.join(', ');

  // Clear existing images and append new images
  overlayThumbnails.innerHTML = '';
  item.images.forEach((image, index) => {
    const img = document.createElement('img');
    img.src = image.asset.url;
    img.alt = item.title;
    img.classList.add('thumbnail');
    img.addEventListener('mouseenter', () => {
      overlayMainImage.src = image.asset.url;
    });
    overlayThumbnails.appendChild(img);
  });

  // Set the first image as the main image
  overlayMainImage.src = item.images[0].asset.url;

  // Set up quantity box
  overlayQuantity.value = 0;

  // Set the link for the product
  overlayLink.href = `/product/${item.slug}`;
  overlayLink.textContent = 'View More Details';

  // Set the size guide link
  sizeGuideLink.href = 'size-guide.html';

  overlay.style.display = 'block';

  // Add zoom effect
  overlayMainImage.addEventListener('mousemove', handleZoom);
  overlayMainImage.addEventListener('mouseleave', resetZoom);

  // Add event listener for "Add to Cart" button
  addToCartButton.onclick = () => {
    addItemToCart(item, overlayQuantity.value);
  };
}

// Zoom effect
function handleZoom(e) {
  const { offsetX, offsetY, target } = e;
  const { offsetWidth: width, offsetHeight: height } = target;

  const x = (offsetX / width) * 100;
  const y = (offsetY / height) * 100;

  target.style.transformOrigin = `${x}% ${y}%`;
  target.style.transform = 'scale(2)';
}

function resetZoom(e) {
  e.target.style.transformOrigin = 'center center';
  e.target.style.transform = 'scale(1)';
}

// Add event listener to close button
document.querySelector('.close-btn').addEventListener('click', () => {
  document.getElementById('overlay').style.display = 'none';
});

// Add event listeners for quantity buttons
document.getElementById('quantity-increase').addEventListener('click', () => {
  const quantityInput = document.getElementById('overlay-quantity');
  quantityInput.value = parseInt(quantityInput.value) + 1;
});

document.getElementById('quantity-decrease').addEventListener('click', () => {
  const quantityInput = document.getElementById('overlay-quantity');
  if (quantityInput.value > 0) {
    quantityInput.value = parseInt(quantityInput.value) - 1;
  }
});


// PRice Slider
// Script.js
const rangevalue = document.querySelector('.slider-container .price-slider');
const rangeInputvalue = document.querySelectorAll('.range-input input');

// Set the price gap
let priceGap = 500;

// Adding event listners to price input elements
const priceInputvalue = document.querySelectorAll('.price-input input');
for (let i = 0; i < priceInputvalue.length; i++) {
  priceInputvalue[i].addEventListener('input', (e) => {
    // Parse min and max values of the range input
    let minp = parseInt(priceInputvalue[0].value);
    let maxp = parseInt(priceInputvalue[1].value);
    let diff = maxp - minp;

    if (minp < 0) {
      alert('minimum price cannot be less than 0');
      priceInputvalue[0].value = 0;
      minp = 0;
    }

    // Validate the input values
    if (maxp > 10000) {
      alert('maximum price cannot be greater than 10000');
      priceInputvalue[1].value = 10000;
      maxp = 10000;
    }

    if (minp > maxp - priceGap) {
      priceInputvalue[0].value = maxp - priceGap;
      minp = maxp - priceGap;

      if (minp < 0) {
        priceInputvalue[0].value = 0;
        minp = 0;
      }
    }

    // Check if the price gap is met
    // and max price is within the range
    if (diff >= priceGap && maxp <= rangeInputvalue[1].max) {
      if (e.target.className === 'min-input') {
        rangeInputvalue[0].value = minp;
        let value1 = rangeInputvalue[0].max;
        rangevalue.style.left = `${(minp / value1) * 100}%`;
      } else {
        rangeInputvalue[1].value = maxp;
        let value2 = rangeInputvalue[1].max;
        rangevalue.style.right = `${100 - (maxp / value2) * 100}%`;
      }
    }
  });

  // Add event listeners to range input elements
  for (let i = 0; i < rangeInputvalue.length; i++) {
    rangeInputvalue[i].addEventListener('input', (e) => {
      let minVal = parseInt(rangeInputvalue[0].value);
      let maxVal = parseInt(rangeInputvalue[1].value);

      let diff = maxVal - minVal;

      // Check if the price gap is exceeded
      if (diff < priceGap) {
        // Check if the input is the min range input
        if (e.target.className === 'min-range') {
          rangeInputvalue[0].value = maxVal - priceGap;
        } else {
          rangeInputvalue[1].value = minVal + priceGap;
        }
      } else {
        // Update price inputs and range progress
        priceInputvalue[0].value = minVal;
        priceInputvalue[1].value = maxVal;
        rangevalue.style.left = `${(minVal / rangeInputvalue[0].max) * 100}%`;
        rangevalue.style.right = `${
          100 - (maxVal / rangeInputvalue[1].max) * 100
        }%`;
      }
    });
  }
}
//foooter links
async function fetchSocialMediaLinks() {
  const query = '*[_type == "socialMediaLinks"][0]'; // Adjust the query if needed
  const data = await client.fetch(query);
  return data;
}
async function getlinks() {
  const links = await fetchSocialMediaLinks();
  console.log(links);
  if (links) {
    document.getElementById('facebook-link').href = links.facebook || '#';
    document.getElementById('pinterest-link').href = links.pinterest || '#';
    document.getElementById('youtube-link').href = links.youtube || '#';
    document.getElementById('instagram-link').href = links.instagram || '#';
  }
}
getlinks();
