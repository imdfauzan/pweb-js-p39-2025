document.addEventListener('DOMContentLoaded', () => {
    // Cek status login
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html'; // Redirect ke login jika belum login
        return; // Hentikan eksekusi skrip
    }

    // Tampilkan nama user
    const firstName = localStorage.getItem('firstName');
    document.getElementById('welcome-message').textContent = `Welcome, ${firstName}!`;

    // Fungsionalitas Logout
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('firstName');
        window.location.href = 'index.html';
    });

    // Variabel global
    let allRecipes = [];
    let filteredRecipes = [];
    let displayedRecipesCount = 9;
    const RECIPES_PER_PAGE = 9;

    const recipeGallery = document.getElementById('recipe-gallery');
    const searchInput = document.getElementById('search-input');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const recipeCount = document.getElementById('recipe-count');
    const showMoreButton = document.getElementById('show-more-button');
    const loader = document.getElementById('loader');
    const modal = document.getElementById('recipe-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModalButton = document.querySelector('.modal-close-button');

    // Fungsi untuk mengambil dan memproses data resep
    async function fetchRecipes() {
        showLoader(true);
        try {
            const response = await fetch('https://dummyjson.com/recipes?limit=50'); // Ambil 50 resep
            if (!response.ok) throw new Error('Failed to fetch recipes.');
            const data = await response.json();
            allRecipes = data.recipes;
            filteredRecipes = allRecipes;
            populateCuisineFilter();
            displayRecipes();
        } catch (error) {
            recipeGallery.innerHTML = `<p class="message error">Could not load recipes. Please try again later.</p>`;
        } finally {
            showLoader(false);
        }
    }

    // Fungsi untuk menampilkan resep
    function displayRecipes() {
        recipeGallery.innerHTML = '';
        const recipesToDisplay = filteredRecipes.slice(0, displayedRecipesCount);

        if (recipesToDisplay.length === 0) {
            recipeGallery.innerHTML = `<p class="message">No recipes found. Try a different search or filter.</p>`;
        } else {
            recipesToDisplay.forEach(recipe => {
                const card = createRecipeCard(recipe);
                recipeGallery.appendChild(card);
            });
        }
        
        updateRecipeCount();
        toggleShowMoreButton();
    }
    
    // Fungsi untuk membuat kartu resep
    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="recipe-card-content">
                <h3>${recipe.name}</h3>
                <div class="recipe-details">
                    <span>🕒 ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
                    <span>🔥 ${recipe.difficulty}</span>
                    <span>🍽️ ${recipe.cuisine}</span>
                </div>
                <p class="recipe-ingredients">
                    <strong>Ingredients:</strong> ${recipe.ingredients.slice(0, 4).join(', ')}...
                </p>
                <div class="recipe-rating">
                    <div class="stars">${'⭐'.repeat(Math.round(recipe.rating))}</div>
                    <span>(${recipe.rating.toFixed(1)})</span>
                </div>
            </div>
            <div class="recipe-card-footer">
                <button class="view-recipe-btn" data-id="${recipe.id}">View Full Recipe</button>
            </div>
        `;
        card.querySelector('.view-recipe-btn').addEventListener('click', () => openRecipeModal(recipe.id));
        return card;
    }

    // Fungsi untuk mengisi filter cuisine
    function populateCuisineFilter() {
        const cuisines = [...new Set(allRecipes.map(recipe => recipe.cuisine))];
        cuisines.sort().forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = cuisine;
            cuisineFilter.appendChild(option);
        });
    }

    // Fungsi untuk filter dan search
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCuisine = cuisineFilter.value;

        filteredRecipes = allRecipes.filter(recipe => {
            const matchesSearch = searchTerm === '' ||
                recipe.name.toLowerCase().includes(searchTerm) ||
                recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)) ||
                recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            const matchesCuisine = selectedCuisine === 'all' || recipe.cuisine === selectedCuisine;

            return matchesSearch && matchesCuisine;
        });

        displayedRecipesCount = RECIPES_PER_PAGE;
        displayRecipes();
    }

    // Debouncing untuk search input
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 300);
    });

    cuisineFilter.addEventListener('change', applyFilters);

    // Fungsi untuk tombol "Show More"
    showMoreButton.addEventListener('click', () => {
        displayedRecipesCount += RECIPES_PER_PAGE;
        displayRecipes();
    });

    function toggleShowMoreButton() {
        showMoreButton.style.display = displayedRecipesCount < filteredRecipes.length ? 'block' : 'none';
    }

    function updateRecipeCount() {
        recipeCount.textContent = `Showing ${Math.min(displayedRecipesCount, filteredRecipes.length)} of ${filteredRecipes.length} recipes`;
    }

    function showLoader(isLoading) {
        loader.style.display = isLoading ? 'block' : 'none';
    }

    // --- Modal Logic ---
    async function openRecipeModal(recipeId) {
        showLoader(true);
        try {
            // Kita bisa fetch detail jika ada endpoint terpisah, atau cari dari data yang sudah ada
            const recipe = allRecipes.find(r => r.id === recipeId);
            if (!recipe) throw new Error('Recipe not found.');

            modalBody.innerHTML = createModalContent(recipe);
            modal.style.display = 'flex';
        } catch (error) {
            alert(error.message);
        } finally {
            showLoader(false);
        }
    }

    function createModalContent(recipe) {
        return `
            <h2>${recipe.name}</h2>
            <img src="${recipe.image}" alt="${recipe.name}">
            <div class="modal-details-grid">
                <div class="modal-detail-item"><strong>Prep Time</strong><span>${recipe.prepTimeMinutes} mins</span></div>
                <div class="modal-detail-item"><strong>Cook Time</strong><span>${recipe.cookTimeMinutes} mins</span></div>
                <div class="modal-detail-item"><strong>Servings</strong><span>${recipe.servings}</span></div>
                <div class="modal-detail-item"><strong>Difficulty</strong><span>${recipe.difficulty}</span></div>
                <div class="modal-detail-item"><strong>Cuisine</strong><span>${recipe.cuisine}</span></div>
                <div class="modal-detail-item"><strong>Calories</strong><span>${recipe.caloriesPerServing}/serving</span></div>
            </div>
            <div class="modal-section">
                <h3>Ingredients</h3>
                <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
            </div>
            <div class="modal-section">
                <h3>Instructions</h3>
                <ol>${recipe.instructions.map(step => `<li>${step}</li>`).join('')}</ol>
            </div>
            <div class="modal-tags">
                ${recipe.tags.map(tag => `<span>${tag}</span>`).join('')}
            </div>
        `;
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    closeModalButton.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(); // Tutup modal jika klik di luar konten
    });

    // Panggil fungsi utama
    fetchRecipes();
});