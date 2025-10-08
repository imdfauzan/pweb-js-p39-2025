document.addEventListener('DOMContentLoaded', () => {
    // Cek status login
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html'; // Redirect ke login jika belum login
        return; // Hentikan eksekusi skrip
    }

    // tampilkan nama user
    const firstName = localStorage.getItem('firstName');
    document.getElementById('welcome-message').textContent = `Welcome, ${firstName}!`;

    // fungsi Logout
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
    const difficultyFilter = document.getElementById('difficulty-filter');
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
            // Jika ada input pencarian tetapi tidak ditemukan resep
            if (searchInput.value) {
                recipeGallery.innerHTML = `<p class="message">Resep tidak ditemukan. Coba kata kunci lain atau ubah filter.</p>`;
            } else {
                recipeGallery.innerHTML = `<p class="message">Tidak ada resep yang sesuai dengan filter yang dipilih.</p>`;
            }
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
    const selectedDifficulty = difficultyFilter.value;

    // Validasi dan sanitasi input - OWASP Top 10 proteksi
    // XSS (Cross-site Scripting) Detection - A03:2021
    const xssPatterns = [
        /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        /<img[\s\S]*?onerror[\s\S]*?=/gi,
        /<[\s\S]*?on\w+[\s\S]*?=/gi,
        /javascript\s*:/gi,
        /data\s*:/gi,
        /vbscript\s*:/gi,
        /<[\s\S]*?style[\s\S]*?=[\s\S]*?expression[\s\S]*?\(/gi,
        /<[\s\S]*?style[\s\S]*?=[\s\S]*?behavior[\s\S]*?\(/gi,
        /<svg[\s\S]*?on\w+[\s\S]*?=/gi,
        /<iframe[\s\S]*?>/gi,
        /<embed[\s\S]*?>/gi,
        /<object[\s\S]*?>/gi,
        /<link[\s\S]*?>/gi,
        /<meta[\s\S]*?>/gi,
        /<[\s\S]*?src[\s\S]*?=/gi,
        /<form[\s\S]*?>/gi,
    ];

    // SQLi (SQL Injection) Detection - A03:2021
    const sqliPatterns = [
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi,
        /union\s+select/gi,
        /exec(\s|\+)+(s|x)p\w+/gi,
        /insert|update|delete|drop|alter|truncate/gi
    ];

    // Command Injection Detection - A03:2021
    const commandInjectionPatterns = [
        /\|\s*\w+/gi,        // pipe commands
        /`\s*\w+\s*`/gi,     // backtick commands
        /\$\(\s*\w+\s*\)/gi, // $() syntax
        /;\s*\w+/gi,         // command chaining with semicolon
        /&&\s*\w+/gi,        // command chaining with &&
        /\|\|\s*\w+/gi       // command chaining with ||
    ];

    // SSRF (Server-Side Request Forgery) Detection
    const ssrfPatterns = [
        /localhost|127\.0\.0\.1|0\.0\.0\.0|::1/gi,
        /file:\/\//gi,
        /\/etc\/passwd/gi,
        /\/windows\/win.ini/gi,
        /http:\/\/169\.254/gi
    ];

    // Insecure Deserialization Detection - A08:2021
    const deserializationPatterns = [
        /rO0/g,  // Base64 Java serialized objects marker
        /O:+/g   // PHP serialization format
    ];

    // DOM-based vulnerabilities - A03:2021
    const domPatterns = [
        /document\.write/gi,
        /document\.body\.innerHTML/gi,
        /document\.location/gi,
        /location\.href/gi,
        /window\.name/gi,
        /eval\(/gi,
        /setTimeout\(|setInterval\(/gi
    ];

    // Gabungkan semua pattern untuk deteksi komprehensif
    const allPatterns = [...xssPatterns, ...sqliPatterns, ...commandInjectionPatterns, ...ssrfPatterns, ...deserializationPatterns, ...domPatterns];

    // Deteksi jika input cocok dengan pola serangan
    const isAttackAttempt = allPatterns.some(pattern => pattern.test(searchTerm));
    
    // Deteksi kata-kata mencurigakan tambahan
    const suspiciousTerms = ['iframe', 'script', 'onerror', 'onload', 'eval', 'src=', 'href=', 'alert(', 'document.cookie', 'innerHTML', 'fromCharCode'];
    const hasSuspiciousTerm = suspiciousTerms.some(term => searchTerm.includes(term));
    
    if (isAttackAttempt || hasSuspiciousTerm) {
        // Log potensi serangan dengan detail untuk analisis keamanan
        logSecurityEvent('security_violation', { 
            input: searchTerm, 
            patterns_matched: allPatterns
                .filter(pattern => pattern.test(searchTerm))
                .map(pattern => pattern.toString()),
            terms_matched: suspiciousTerms.filter(term => searchTerm.includes(term)),
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });
        
        // Tampilkan pesan peringatan generik untuk tidak memberikan informasi terlalu banyak kepada penyerang
        recipeGallery.innerHTML = `<p class="message error">Tidak ada apa apa di sini, apakah kamu melakukan peretasan?</p>`;
        recipeCount.textContent = `Showing 0 of 0 recipes`;
        showMoreButton.style.display = 'none';
        
        // Dalam lingkungan produksi, pertimbangkan untuk membatasi akses jika terdeteksi upaya serangan berulang
        return;
    }

    // Sanitasi input untuk digunakan dalam pencarian
    const sanitizedSearchTerm = sanitizeInput(searchTerm);
    
    filteredRecipes = allRecipes.filter(recipe => {
        const matchesSearch = sanitizedSearchTerm === '' ||
            recipe.name.toLowerCase().includes(sanitizedSearchTerm) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(sanitizedSearchTerm)) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(sanitizedSearchTerm));

        const matchesCuisine = selectedCuisine === 'all' || recipe.cuisine === selectedCuisine;

        const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;

        return matchesSearch && matchesCuisine && matchesDifficulty;
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

    // Event listener untuk tombol search dengan penambahan logging keamanan
    document.getElementById('search-button').addEventListener('click', () => {
        const searchValue = searchInput.value;
        if (searchValue.length > 0) {
            logSecurityEvent('search_attempt', { term: searchValue, method: 'button_click' });
        }
        applyFilters();
    });
    
    // Event listener untuk tombol enter pada input search dengan penambahan logging keamanan
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const searchValue = searchInput.value;
            if (searchValue.length > 0) {
                logSecurityEvent('search_attempt', { term: searchValue, method: 'enter_key' });
            }
            applyFilters();
        }
    });

    cuisineFilter.addEventListener('change', applyFilters);
    difficultyFilter.addEventListener('change', applyFilters);

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

    // Fungsi untuk sanitasi input (OWASP A03:2021 - Injection prevention)
    function sanitizeInput(input) {
        if (!input || typeof input !== 'string') return '';
        
        // Hapus karakter berbahaya
        let sanitized = input
            .replace(/[<>]/g, '') // Menghapus tag brackets
            .replace(/javascript:/gi, '') // Menghapus javascript: URLs
            .replace(/on\w+=/gi, '') // Menghapus event handlers
            .replace(/'/g, '') // Menghapus single quotes (SQL injection)
            .replace(/"/g, '') // Menghapus double quotes (SQL injection)
            .replace(/;/g, '') // Menghapus semicolons (command injection)
            .replace(/--/g, '') // Menghapus SQL comments
            .replace(/\//g, '') // Menghapus slashes (path traversal)
            .trim();
            
        // Batasi panjang input untuk mencegah DoS
        return sanitized.substring(0, 50);
    }
    
    // Log akses untuk keamanan (dalam produksi, kirim ke server)
    function logSecurityEvent(event, details) {
        const timestamp = new Date().toISOString();
        console.log(`[SECURITY EVENT] ${timestamp} - ${event}:`, details);
        
        // Dalam produksi, kirim ke endpoint logging server
        // fetch('/api/security/log', {
        //     method: 'POST',
        //     body: JSON.stringify({ event, details, timestamp }),
        //     headers: { 'Content-Type': 'application/json' }
        // });
    }

    // Panggil fungsi utama
    fetchRecipes();
});