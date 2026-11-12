
const API = "https://script.google.com/macros/s/AKfycbwzcfJMXk_-g254nh0sJgpIM-BeigTpuc-eyu_D0lVzJvzyyaFe8KoPd9QjcLsNJt6B/exec";

const statusMessage = document.getElementById("status");
const menuContainer = document.getElementById("menu");
const filterContainer = document.getElementById("filters");

let allItems = [];

// LOAD MENU FROM GOOGLE SHEETS
async function loadMenu() {
    const response = await fetch(API);

    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }

    const items = await response.json();

    if (!Array.isArray(items)) {
        throw new Error("Menu data must be an array");
    }

    return items;
}

// START THE MENU
async function startMenu() {
    statusMessage.textContent = "Loading something delicious...";

    try {
        allItems = await loadMenu();

        buildFilters();
        showMenu("All");

        statusMessage.textContent = "";
    } catch (error) {
        statusMessage.textContent =
            "Sorry! We couldn't load the menu. Please try again later.";
        console.error(error);
    }
}

// GET ALL CATEGORIES
function getCategories() {
    let categories = [];

    allItems.forEach(function(item) {
        if (!categories.includes(item.category)) {
            categories.push(item.category);
        }
    });

    return categories;
}

// CREATE A MENU CARD
function makeCard(item) {
    let cardClass = "card";
    let badge = "";
    let soldText = "";
    let tagsHTML = "";

    // Popular badge
    if (item.popular === true ||
        String(item.popular).toLowerCase() === "true") {
        badge = '<span class="badge">Popular</span>';
    }

    // Sold out styling
    if (item.soldOut === true ||
        String(item.soldOut).toLowerCase() === "true") {
        cardClass += " is-sold";
        soldText = '<p class="sold">Sold Out</p>';
    }

    // Tags
    const tags = Array.isArray(item.tags) ? item.tags : [];

    tags.forEach(function(tag) {
        tagsHTML += `<li>${tag}</li>`;
    });

    // Price
    const price = Number(item.price) || 0;

    return `
        <article class="${cardClass}">
            <img
                src="${item.image}"
                alt="${item.name}"
                loading="lazy"
            >

            <div class="card-body">
                <h3>${item.name} ${badge}</h3>

                <p class="description">
                    ${item.description}
                </p>

                <ul class="tags">
                    ${tagsHTML}
                </ul>

                <p class="price">
                    $${price.toFixed(2)}
                </p>

                ${soldText}
            </div>
        </article>
    `;
}

// DISPLAY MENU BY CATEGORY
function showMenu(chosen) {
    let menuHTML = "";

    getCategories().forEach(function(category) {
        if (chosen === "All" || chosen === category) {
            let cardsHTML = "";

            allItems.forEach(function(item) {
                if (item.category === category) {
                    cardsHTML += makeCard(item);
                }
            });

            menuHTML += `
                <h2>${category}</h2>
                <div class="grid">
                    ${cardsHTML}
                </div>
            `;
        }
    });

    menuContainer.innerHTML = menuHTML;
}

// BUILD CATEGORY FILTER BUTTONS
function buildFilters() {
    let buttonsHTML = `
        <button class="active" type="button">All</button>
    `;

    getCategories().forEach(function(category) {
        buttonsHTML += `
            <button type="button">${category}</button>
        `;
    });

    filterContainer.innerHTML = buttonsHTML;

    const buttons = filterContainer.querySelectorAll("button");

    buttons.forEach(function(button) {
        button.addEventListener("click", function() {

            buttons.forEach(function(otherButton) {
                otherButton.classList.remove("active");
            });

            button.classList.add("active");

            showMenu(button.textContent.trim());
        });
    });
}

// RUN WHEN PAGE OPENS
startMenu();
