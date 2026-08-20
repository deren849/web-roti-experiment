     // --- DATA DEFAULT ---
        const defaultProducts = [
            { id: 1, name: 'Butter Croissant', price: 25000, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000', desc: 'Croissant autentik Prancis.', isBestSeller: true, likes: 120, isLiked: false, date: Date.now() - 100000, comments: [{user: 'Budi', text: 'Enak banget!'}] },
            { id: 2, name: 'Sourdough Bread', price: 45000, img: 'https://files.catbox.moe/36kcb5.jpeg', desc: 'Roti signature kami.', isBestSeller: true, likes: 85, isLiked: false, date: Date.now() - 200000, comments: [] },
            { id: 3, name: 'Berry Cupcake', price: 18000, img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1000', desc: 'Manisnya pas.', isBestSeller: true, likes: 200, isLiked: false, date: Date.now() - 50000, comments: [{user: 'Siti', text: 'Cute!'}] },
            { id: 4, name: 'Cinnamon Glaze', price: 30000, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000', desc: 'Roti gulung lembut.', isBestSeller: false, likes: 45, isLiked: false, date: Date.now(), comments: [] },
            { id: 5, name: 'Fruit Tart', price: 35000, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000', desc: 'Pie renyah buah segar.', isBestSeller: false, likes: 60, isLiked: false, date: Date.now() - 10000, comments: [] }
        ];

        const defaultArticles = [
            { id: 101, title: 'Sejarah Kami', text: 'Bermula dari sebuah garasi kecil pada tahun 2015...', img: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000' },
            { id: 102, title: 'Filosofi & Bahan', text: 'Kami memegang teguh prinsip Farm to Table...', img: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?q=80&w=1000' }
        ];

        // --- LOAD STATE ---
        let products = JSON.parse(localStorage.getItem('bakery_products')) || defaultProducts;
        let articles = JSON.parse(localStorage.getItem('bakery_articles')) || defaultArticles;
        let cart = JSON.parse(localStorage.getItem('bakery_cart')) || [];
        let headerBgs = JSON.parse(localStorage.getItem('bakery_headers')) || { home: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1920&auto=format&fit=crop', menu: 'https://files.catbox.moe/gjh46w.jpg', about: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=1000' };
        let editMode = false;
        let currentDetailId = null; 
        let currentOrderProduct = null; // Produk yang sedang di-setup untuk dibeli
        let currentOrderQty = 1;

        function saveData() { localStorage.setItem('bakery_products', JSON.stringify(products)); }
        function saveArticles() { localStorage.setItem('bakery_articles', JSON.stringify(articles)); }
        function saveCart() { localStorage.setItem('bakery_cart', JSON.stringify(cart)); updateCartBadge(); }
        function saveHeaders() { localStorage.setItem('bakery_headers', JSON.stringify(headerBgs)); }

        // --- RENDER ---
        function renderHero() {
            document.querySelector('.hero').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.2)), url('${headerBgs.home}')`;
            document.getElementById('menu-header').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${headerBgs.menu}')`;
            document.getElementById('about-header').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${headerBgs.about}')`;
        }

        function renderProducts(filterType = 'all', searchTerm = '') {
            const menuGrid = document.getElementById('menu-grid');
            const featuredGrid = document.getElementById('featured-grid');
            menuGrid.innerHTML = '';
            featuredGrid.innerHTML = '';

            let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

            if (filterType === 'newest') filtered.sort((a, b) => b.date - a.date);
            else if (filterType === 'popular') filtered.sort((a, b) => b.likes - a.likes);

            filtered.forEach(product => { menuGrid.innerHTML += createCardHTML(product); });
            
            // Render Featured
            const bestSellers = products.filter(p => p.isBestSeller);
            bestSellers.forEach(product => { featuredGrid.innerHTML += createCardHTML(product); });
            
            toggleAdminControls();
        }

        function createCardHTML(product) {
            const formattedPrice = "Rp " + product.price.toLocaleString('id-ID');
            return `
                <div class="product-card ${editMode ? 'shake' : ''}">
                    <div class="admin-controls">
                        <div class="btn-icon-circle btn-edit" onclick="event.stopPropagation(); openEditModal(${product.id}, 'product')" title="Edit"><i class="fas fa-pencil-alt"></i></div>
                        <div class="btn-icon-circle btn-delete" onclick="event.stopPropagation(); openDeleteModal(${product.id}, 'product')" title="Hapus"><i class="fas fa-times"></i></div>
                    </div>
                    <div class="product-img"><img src="${product.img}" alt="${product.name}"></div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <span class="product-price">${formattedPrice}</span>
                        <div class="card-stats">
                            <span class="stat-item ${product.isLiked ? 'liked' : ''}"><i class="${product.isLiked ? 'fas' : 'far'} fa-heart"></i> ${product.likes || 0}</span>
                            <span class="stat-item"><i class="fas fa-comment"></i> ${product.comments ? product.comments.length : 0}</span>
                        </div>
                        <div class="btn-card-group">
                            <button class="btn-card-solid" onclick="openOrderSetup(${product.id})">PESAN</button>
                            <button class="btn-card-outline" onclick="openDetail(${product.id})">DETAIL</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderAbout() {
            const container = document.getElementById('about-content'); container.innerHTML = '';
            articles.forEach((article, index) => {
                const reverseClass = index % 2 !== 0 ? 'style="flex-direction: row-reverse;"' : '';
                container.innerHTML += `
                    <div class="article-block" ${reverseClass}>
                        <div class="admin-controls" style="right: auto; left: 10px; top: -20px;">
                            <div class="btn-icon-circle btn-edit" onclick="openEditModal(${article.id}, 'article')"><i class="fas fa-pencil-alt"></i></div>
                            <div class="btn-icon-circle btn-delete" onclick="openDeleteModal(${article.id}, 'article')"><i class="fas fa-times"></i></div>
                        </div>
                        <div class="article-img"><img src="${article.img}"></div>
                        <div class="article-content"><h3 class="article-title">${article.title}</h3><p class="article-text">${article.text}</p></div>
                    </div>`;
            });
            toggleAdminControls();
        }

        // --- SEARCH & FILTER ---
        function searchProducts() {
            const term = document.getElementById('searchInput').value;
            renderProducts('all', term);
        }
        function filterProducts(type, btn) {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts(type, document.getElementById('searchInput').value);
        }
        function goToSearch() {
            switchPage('menu');
            setTimeout(() => {
                document.getElementById('searchInput').focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 500);
        }

        // --- DETAIL & SOCIAL ---
        function openDetail(id) {
            currentDetailId = id;
            const product = products.find(p => p.id === id);
            document.getElementById('modalTitle').innerText = product.name;
            document.getElementById('modalPrice').innerText = "Rp " + product.price.toLocaleString('id-ID');
            document.getElementById('modalImg').src = product.img;
            document.getElementById('modalDesc').innerText = product.desc;
            
            // Render Likes
            updateDetailLikeUI(product);
            
            // Render Comments
            renderComments(product);
            
            document.getElementById('productModal').style.display = 'flex';
        }

        function updateDetailLikeUI(product) {
            const icon = document.getElementById('modalLikeIcon');
            const btn = document.getElementById('modalLikeBtn');
            const count = document.getElementById('modalLikeCount');
            
            count.innerText = product.likes || 0;
            if (product.isLiked) {
                btn.classList.add('liked');
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                btn.classList.remove('liked');
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }

        function toggleLikeFromModal() {
            if(!currentDetailId) return;
            const product = products.find(p => p.id === currentDetailId);
            
            if (product.isLiked) {
                product.likes--;
                product.isLiked = false;
            } else {
                product.likes++;
                product.isLiked = true;
            }
            
            saveData();
            updateDetailLikeUI(product);
            renderProducts(); // Refresh grid likes
        }

        function renderComments(product) {
            const list = document.getElementById('commentList');
            list.innerHTML = '';
            if(!product.comments || product.comments.length === 0) {
                list.innerHTML = '<p style="font-size:0.8rem; color:#999;">Belum ada komentar.</p>';
            } else {
                product.comments.forEach(c => {
                    list.innerHTML += `<div class="comment-item"><strong>${c.user}</strong>${c.text}</div>`;
                });
            }
            document.getElementById('commentCount').innerText = product.comments ? product.comments.length : 0;
        }

        function submitComment() {
            const input = document.getElementById('newComment');
            const text = input.value;
            if(text.trim() === '') return;
            const product = products.find(p => p.id === currentDetailId);
            if(!product.comments) product.comments = [];
            product.comments.push({ user: 'Anda', text: text });
            saveData();
            renderComments(product);
            renderProducts(); 
            input.value = '';
        }

        // --- ORDER SETUP LOGIC ---
        function openOrderSetup(id = null) {
            // Jika ID null, gunakan currentDetailId (dari modal detail)
            const prodId = id || currentDetailId;
            const product = products.find(p => p.id === prodId);
            
            currentOrderProduct = product;
            currentOrderQty = 1;
            
            document.getElementById('setupImg').src = product.img;
            document.getElementById('setupName').innerText = product.name;
            document.getElementById('setupPrice').innerText = "Rp " + product.price.toLocaleString('id-ID');
            document.getElementById('qtyVal').innerText = currentOrderQty;
            document.getElementById('orderNote').value = ""; // Reset note
            updateSetupTotal();
            
            // Tutup modal detail jika terbuka
            closeModalBtn('productModal');
            document.getElementById('orderSetupModal').style.display = 'flex';
        }

        function changeQty(change) {
            if (currentOrderQty + change > 0) {
                currentOrderQty += change;
                document.getElementById('qtyVal').innerText = currentOrderQty;
                updateSetupTotal();
            }
        }

        function updateSetupTotal() {
            const total = currentOrderProduct.price * currentOrderQty;
            document.getElementById('setupTotal').innerText = "Rp " + total.toLocaleString('id-ID');
        }

        function confirmAddToCart() {
            const note = document.getElementById('orderNote').value;
            cart.push({
                ...currentOrderProduct,
                quantity: currentOrderQty,
                note: note
            });
            saveCart();
            closeModalBtn('orderSetupModal');
            showToast('Berhasil masuk keranjang!', 'success');
            toggleCart(); // Buka keranjang otomatis
        }

        // --- ADMIN & MODALS ---
        function toggleEditMode() {
            editMode = !editMode;
            const btnSettings = document.getElementById('btnSettings');
            const editBtns = document.querySelectorAll('.hero-edit-btn');
            if (editMode) { 
                btnSettings.classList.add('active'); editBtns.forEach(btn => btn.style.display = 'inline-block');
                document.querySelector('.btn-add-article').style.display = 'block'; showToast('Mode Edit Aktif', 'danger'); 
            } else { 
                btnSettings.classList.remove('active'); editBtns.forEach(btn => btn.style.display = 'none');
                document.querySelector('.btn-add-article').style.display = 'none'; showToast('Mode Edit Nonaktif'); 
            }
            renderProducts(); renderAbout();
        }
        function toggleAdminControls() {
            document.querySelectorAll('.admin-controls').forEach(div => div.style.display = editMode ? 'flex' : 'none');
        }

        function openDeleteModal(id, type) {
            const item = type === 'product' ? products.find(p => p.id === id) : articles.find(a => a.id === id);
            document.getElementById('deleteImg').src = item.img;
            document.getElementById('deleteName').innerText = type === 'product' ? item.name : item.title;
            document.getElementById('deleteId').value = id;
            document.getElementById('deleteType').value = type;
            document.getElementById('deleteModal').style.display = 'flex';
        }

        function confirmDelete() {
            const id = parseInt(document.getElementById('deleteId').value);
            const type = document.getElementById('deleteType').value;
            if (type === 'product') { products = products.filter(p => p.id !== id); saveData(); renderProducts(); } 
            else { articles = articles.filter(a => a.id !== id); saveArticles(); renderAbout(); }
            closeModalBtn('deleteModal');
            showToast('Item berhasil dihapus!', 'success');
        }

        // --- FORM & SAVE LOGIC ---
        function openAddModal() {
            document.getElementById('formTitle').innerText = "Tambah Menu Baru";
            document.getElementById('editType').value = 'product';
            document.getElementById('editId').value = "";
            document.getElementById('priceGroup').style.display = 'block';
            document.getElementById('bestSellerGroup').style.display = 'flex';
            resetForm();
            document.getElementById('addModal').style.display = 'flex';
        }
        function openAddArticleModal() {
            document.getElementById('formTitle').innerText = "Tambah Artikel Baru";
            document.getElementById('editType').value = 'article';
            document.getElementById('editId').value = "";
            document.getElementById('priceGroup').style.display = 'none';
            document.getElementById('bestSellerGroup').style.display = 'none';
            resetForm();
            document.getElementById('addModal').style.display = 'flex';
        }
        function openEditModal(id, type) {
            document.getElementById('editId').value = id;
            document.getElementById('editType').value = type;
            document.getElementById('addModal').style.display = 'flex';
            if (type === 'product') {
                const item = products.find(p => p.id === id);
                document.getElementById('formTitle').innerText = "Edit Menu";
                document.getElementById('priceGroup').style.display = 'block';
                document.getElementById('bestSellerGroup').style.display = 'flex';
                document.getElementById('newName').value = item.name;
                document.getElementById('newPrice').value = item.price;
                document.getElementById('newDesc').value = item.desc;
                document.getElementById('newImgUrl').value = item.img;
                document.getElementById('isBestSeller').checked = item.isBestSeller || false;
            } else {
                const item = articles.find(a => a.id === id);
                document.getElementById('formTitle').innerText = "Edit Artikel";
                document.getElementById('priceGroup').style.display = 'none';
                document.getElementById('bestSellerGroup').style.display = 'none';
                document.getElementById('newName').value = item.title;
                document.getElementById('newDesc').value = item.text;
                document.getElementById('newImgUrl').value = item.img;
            }
        }
        function resetForm() {
            document.getElementById('newName').value = ""; document.getElementById('newPrice').value = "";
            document.getElementById('newDesc').value = ""; document.getElementById('newImgUrl').value = "";
            document.getElementById('newImgFile').value = ""; document.getElementById('isBestSeller').checked = false;
        }
        function saveDataEntry() {
            const type = document.getElementById('editType').value;
            const id = document.getElementById('editId').value;
            const name = document.getElementById('newName').value;
            const desc = document.getElementById('newDesc').value;
            const imgFile = document.getElementById('newImgFile').files[0];
            const imgUrlInput = document.getElementById('newImgUrl').value;
            const isBestSeller = document.getElementById('isBestSeller').checked;

            if (name === '') { showToast('Nama harus diisi!', 'danger'); return; }

            const processSave = (img) => {
                if (type === 'product') {
                    const price = document.getElementById('newPrice').value;
                    if (id) {
                        const idx = products.findIndex(p => p.id == id);
                        products[idx] = { ...products[idx], name, price: parseInt(price), desc, img: img || products[idx].img, isBestSeller };
                    } else {
                        products.push({ id: Date.now(), name, price: parseInt(price), img: img || 'https://via.placeholder.com/400', desc, isBestSeller, likes: 0, comments: [], isLiked: false, date: Date.now() });
                    }
                    saveData(); renderProducts();
                } else {
                    if (id) {
                        const idx = articles.findIndex(a => a.id == id);
                        articles[idx] = { ...articles[idx], title: name, text: desc, img: img || articles[idx].img };
                    } else {
                        articles.push({ id: Date.now(), title: name, text: desc, img: img || 'https://via.placeholder.com/400' });
                    }
                    saveArticles(); renderAbout();
                }
                closeModalBtn('addModal');
                showToast('Data tersimpan!', 'success');
            };

            if (imgFile) { const reader = new FileReader(); reader.onload = function(e) { processSave(e.target.result); }; reader.readAsDataURL(imgFile); } 
            else { processSave(imgUrlInput); }
        }

        // --- CART & UTILS ---
        function orderFromModal() { openOrderSetup(); } // Helper for modal detail button
        
        function toggleCart() {
            const sidebar = document.getElementById('cartSidebar'); const overlay = document.getElementById('cartOverlay');
            if(sidebar.style.right === '0px') { sidebar.style.right = '-400px'; overlay.classList.remove('active'); }
            else { sidebar.style.right = '0px'; overlay.classList.add('active'); renderCart(); }
        }
        
        function renderCart() {
            const container = document.getElementById('cartItems'); container.innerHTML = ''; let total = 0;
            if (cart.length === 0) container.innerHTML = '<p style="text-align: center; color: #999;">Kosong</p>';
            else {
                cart.forEach((item, index) => {
                    const subtotal = item.price * item.quantity;
                    total += subtotal;
                    const noteHtml = item.note ? `<div class="cart-item-note">"${item.note}"</div>` : '';
                    
                    container.innerHTML += `
                        <div class="cart-item">
                            <img src="${item.img}">
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <span>${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</span>
                                ${noteHtml}
                            </div>
                            <div class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fas fa-trash-alt"></i></div>
                        </div>`;
                });
            }
            document.getElementById('cartTotal').innerText = "Rp " + total.toLocaleString('id-ID');
        }
        function removeFromCart(index) { cart.splice(index, 1); saveCart(); renderCart(); }
        function updateCartBadge() { const b = document.getElementById('cartCount'); b.style.display = cart.length > 0 ? 'flex' : 'none'; b.innerText = cart.length; }
        function processPayment(m) { if(cart.length===0) return; if(confirm(`Bayar via ${m}?`)) { alert('Sukses!'); cart=[]; saveCart(); renderCart(); toggleCart(); } }
        
        function changeHeaderBg(p) { const u = prompt("URL Background Baru:", headerBgs[p]); if(u) { headerBgs[p]=u; saveHeaders(); renderHero(); document.getElementById('menu-header').style.backgroundImage=`linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${headerBgs.menu}')`; document.getElementById('about-header').style.backgroundImage=`linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${headerBgs.about}')`; } }
        
        function showToast(m, t='normal') { const d=document.createElement('div'); d.className=`toast ${t}`; d.innerHTML=`<span>${m}</span>`; document.body.appendChild(d); setTimeout(()=>d.classList.add('show'),100); setTimeout(()=>{d.classList.remove('show');d.remove()},3000); }
        function closeModalBtn(id) { document.getElementById(id).style.display = 'none'; }
        function closeModal(e, id) { if(e.target == document.getElementById(id)) document.getElementById(id).style.display = 'none'; }
        
        // MOBILE MENU LOGIC
        function toggleMobileMenu() {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('active');
        }

        function switchPage(id) {
            document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
            document.getElementById(id + '-page').classList.add('active');
            document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
            document.getElementById('nav-' + id).classList.add('active');
            
            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');

            const nav = document.getElementById('navbar');
            if(id === 'home') nav.className = 'nav-transparent'; else nav.className = 'nav-solid';
            window.scrollTo(0,0);
        }
        
        window.addEventListener('scroll', () => {
            const home = document.getElementById('home-page');
            const nav = document.getElementById('navbar');
            if(home.classList.contains('active')) { if(window.scrollY > 50) nav.className='nav-solid'; else nav.className='nav-transparent'; }
        });

        // INIT
        renderHero(); renderProducts(); renderAbout(); updateCartBadge();