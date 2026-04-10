document.addEventListener('DOMContentLoaded', () => {
    
    const categoryNav = document.getElementById('category-nav');
    const productsGrid = document.getElementById('products-grid');
    const currentCategoryTitle = document.getElementById('current-category-title');
    const resultsCount = document.getElementById('results-count');
    const searchInput = document.getElementById('search-input');
    const btnLoadMore = document.getElementById('btn-load-more');

    let currentCategoryId = 'todas';
    let searchQuery = '';
    
    // Configuración de paginación
    let currentPage = 1;
    const ITEMS_PER_PAGE = 24;
    let filteredProductsCache = [];

    // Inicializar la interfaz
    function init() {
        renderCategories();
        applyFilters();

        // Event listener botón cargar más
        btnLoadMore.addEventListener('click', () => {
            currentPage++;
            renderProducts(filteredProductsCache, true); // true = append
        });

        // Event listener búsqeuda
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            currentPage = 1;
            applyFilters();
        });
    }

    // Formatear precio a moneda ARS
    function formatMoney(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Renderizar categorías en la navegación
    function renderCategories() {
        categoryNav.innerHTML = '';
        categorias.forEach(cat => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = cat.nombre;
            a.dataset.id = cat.id;

            if (cat.id === currentCategoryId) {
                a.classList.add('active');
            }

            a.addEventListener('click', (e) => {
                e.preventDefault();
                handleCategoryClick(cat.id, cat.nombre);
                
                // Actualizar clases active
                document.querySelectorAll('.nav-links a').forEach(el => el.classList.remove('active'));
                a.classList.add('active');
            });

            li.appendChild(a);
            categoryNav.appendChild(li);
        });
    }

    // Manejar el clic en una categoría
    function handleCategoryClick(categoryId, categoryName) {
        currentCategoryId = categoryId;
        currentCategoryTitle.textContent = categoryId === 'todas' ? 'Todos los Productos' : window.innerWidth > 768 ? `Categoría: ${categoryName}` : categoryName;
        
        currentPage = 1; // resetear paginación al cambiar categoría
        applyFilters();
    }

    // Motor de filtrado principal (categoría + búsqueda)
    function applyFilters() {
        productsGrid.style.opacity = '0.5';
        
        setTimeout(() => {
            filteredProductsCache = productos.filter(p => {
                const matchCategory = currentCategoryId === 'todas' || p.categoria === currentCategoryId;
                const matchSearch = searchQuery === '' || p.nombre.toLowerCase().includes(searchQuery);
                return matchCategory && matchSearch;
            });
            
            renderProducts(filteredProductsCache, false);
            productsGrid.style.opacity = '1';
        }, 150);
    }

    // Renderizar las tarjetas de productos
    function renderProducts(productsList, isAppending = false) {
        if (!isAppending) {
            productsGrid.innerHTML = '';
        }

        if (productsList.length === 0) {
            productsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-text-muted); padding: 40px 0;">No se encontraron productos para tu búsqueda.</p>';
            resultsCount.textContent = '0 productos';
            btnLoadMore.classList.add('hidden');
            return;
        }

        resultsCount.textContent = `Mostrando ${productsList.length} producto${productsList.length !== 1 ? 's' : ''}`;

        // Determinar un slice basado en la paginación
        const startIndex = isAppending ? (currentPage - 1) * ITEMS_PER_PAGE : 0;
        const endIndex = currentPage * ITEMS_PER_PAGE;
        const productsToRender = productsList.slice(startIndex, endIndex);

        productsToRender.forEach((prod, index) => {
            // Conseguir el nombre de la categoría para mostrarlo
            const catInfo = categorias.find(c => c.id === prod.categoria);
            const catName = catInfo ? catInfo.nombre : prod.categoria;

            const card = document.createElement('div');
            card.classList.add('product-card');
            
            // Retardo de animación en cascada suave sólo del set actual
            card.style.animationDelay = `${(index % ITEMS_PER_PAGE) * 0.05}s`;

            card.innerHTML = `
                <div class="card-image">
                    <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy">
                </div>
                <div class="card-content">
                    <span class="product-category">${catName}</span>
                    <h3 class="product-title">${prod.nombre}</h3>
                    <p class="product-description">${prod.descripcion}</p>
                    <div class="card-footer">
                        <span class="product-price">${formatMoney(prod.precio)}</span>
                        <a href="${prod.linkML}" target="_blank" rel="noopener noreferrer" class="btn-ml">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.29 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
                            </svg>
                            Comprar
                        </a>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        // Mostrar / ocultar el botón cargar más
        if (endIndex >= productsList.length) {
            btnLoadMore.classList.add('hidden');
        } else {
            btnLoadMore.classList.remove('hidden');
        }
    }

    init();
});
