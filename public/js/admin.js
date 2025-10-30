let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  console.log('🚀 Initializing Admin Panel...');
  allProducts = document.querySelectorAll('.product-card');
  if (allProducts.length > 0) {
    populateCategories();
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterProducts, 300));
  }
  console.log('✅ Admin Panel Initialized');
  console.log('📦 Total Products:', allProducts.length);
}

function switchTab(tabName) {
  console.log('🔄 Switching to tab:', tabName);
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(function(content) {
    content.classList.remove('active');
  });
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(function(button) {
    button.classList.remove('active');
  });
  const selectedTab = document.getElementById('tab-' + tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  if (event && event.target) {
    event.target.classList.add('active');
  }
  console.log('✅ Tab switched successfully');
}

function showAlert(message, type) {
  const alert = document.getElementById('alert');
  if (!alert) return;
  alert.textContent = message;
  alert.className = 'alert alert-' + type;
  alert.style.display = 'block';
  setTimeout(function() { hideAlert(); }, 3000);
}

function hideAlert() {
  const alert = document.getElementById('alert');
  if (alert) alert.style.display = 'none';
}

function populateCategories() {
  const categories = new Set();
  allProducts.forEach(function(card) {
    const kategori = card.dataset.kategori;
    if (kategori && kategori.trim() !== '') {
      categories.add(kategori.toLowerCase());
    }
  });
  const filterKategori = document.getElementById('filterKategori');
  if (filterKategori) {
    categories.forEach(function(cat) {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = capitalizeFirst(cat);
      filterKategori.appendChild(option);
    });
  }
}

function filterProducts() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  const kategoriFilter = document.getElementById('filterKategori').value.toLowerCase();
  const stockFilter = document.getElementById('filterStock').value;
  const sortBy = document.getElementById('sortBy').value;
  let visibleProducts = [];
  allProducts.forEach(function(card) {
    const nama = card.dataset.nama || '';
    const kategori = card.dataset.kategori || '';
    const stock = parseInt(card.dataset.stock) || 0;
    const matchSearch = nama.includes(searchTerm);
    const matchKategori = !kategoriFilter || kategori === kategoriFilter;
    let matchStock = true;
    if (stockFilter === 'tersedia') matchStock = stock > 10;
    else if (stockFilter === 'rendah') matchStock = stock > 0 && stock <= 10;
    else if (stockFilter === 'habis') matchStock = stock === 0;
    if (matchSearch && matchKategori && matchStock) {
      card.style.display = 'block';
      visibleProducts.push(card);
    } else card.style.display = 'none';
  });
  if (visibleProducts.length > 0) sortProducts(visibleProducts, sortBy);
  toggleNoResultsMessage(visibleProducts.length);
}

function sortProducts(products, sortBy) {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;
  const sortedProducts = Array.from(products);
  sortedProducts.sort(function(a, b) {
    switch(sortBy) {
      case 'nama-asc': return a.dataset.nama.localeCompare(b.dataset.nama);
      case 'nama-desc': return b.dataset.nama.localeCompare(a.dataset.nama);
      case 'harga-asc': return parseFloat(a.dataset.harga || 0) - parseFloat(b.dataset.harga || 0);
      case 'harga-desc': return parseFloat(b.dataset.harga || 0) - parseFloat(a.dataset.harga || 0);
      case 'stock-asc': return parseInt(a.dataset.stock || 0) - parseInt(b.dataset.stock || 0);
      case 'stock-desc': return parseInt(b.dataset.stock || 0) - parseInt(a.dataset.stock || 0);
      default: return 0;
    }
  });
  sortedProducts.forEach(function(product) {
    productGrid.appendChild(product);
  });
}

function toggleNoResultsMessage(visibleCount) {
  const noResults = document.getElementById('noResults');
  if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

function resetFilters() {
  const searchInput = document.getElementById('searchInput');
  const filterKategori = document.getElementById('filterKategori');
  const filterStock = document.getElementById('filterStock');
  const sortBy = document.getElementById('sortBy');
  if (searchInput) searchInput.value = '';
  if (filterKategori) filterKategori.value = '';
  if (filterStock) filterStock.value = '';
  if (sortBy) sortBy.value = 'nama-asc';
  filterProducts();
  showAlert('🔄 Filter telah direset', 'success');
}

async function submitPembelian(event, produkId) {
  event.preventDefault();
  const form = event.target;
  const jumlahInput = form.jumlah;
  const jumlah = jumlahInput.value;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!jumlah || jumlah <= 0) {
    showAlert('❌ Jumlah harus lebih dari 0', 'error');
    return;
  }
  const maxStock = parseInt(jumlahInput.max);
  if (jumlah > maxStock) {
    showAlert('❌ Jumlah melebihi stock tersedia', 'error');
    return;
  }
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Memproses...';
  submitBtn.classList.add('loading');
  try {
    const response = await fetch('/admin/pembelian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ produk_id: parseInt(produkId), jumlah: parseInt(jumlah) })
    });
    if (!response.ok) throw new Error('Server response was not ok: ' + response.status);
    const result = await response.json();
    if (result.success) {
      showAlert('✅ ' + result.message, 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showAlert('❌ ' + (result.message || 'Terjadi kesalahan'), 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('loading');
    }
  } catch (error) {
    showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.classList.remove('loading');
  }
}

async function cancelPembelian(id) {
  if (!confirm('❓ Apakah Anda yakin ingin membatalkan pembelian ini?')) return;
  try {
    const response = await fetch('/admin/pembelian/cancel/' + id, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('Server response was not ok: ' + response.status);
    const result = await response.json();
    if (result.success) {
      showAlert('✅ ' + result.message, 'success');
      setTimeout(() => location.reload(), 1000);
    } else {
      showAlert('❌ ' + (result.message || 'Terjadi kesalahan'), 'error');
    }
  } catch (error) {
    showAlert('❌ Terjadi kesalahan: ' + error.message, 'error');
  }
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatCurrency(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

function getStockStatus(stock) {
  if (stock === 0) return { emoji: '❌', text: 'Habis', class: 'stock-low' };
  else if (stock <= 10) return { emoji: '⚠️', text: 'Rendah', class: 'stock-medium' };
  else return { emoji: '✅', text: 'Tersedia', class: 'stock' };
}

document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  if (e.key === 'Escape') {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput === document.activeElement) {
      resetFilters();
      searchInput.blur();
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === '1') {
    e.preventDefault();
    const produkBtn = document.querySelector('.tab-button:first-child');
    if (produkBtn) produkBtn.click();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === '2') {
    e.preventDefault();
    const riwayatBtn = document.querySelector('.tab-button:last-child');
    if (riwayatBtn) riwayatBtn.click();
  }
});

window.addEventListener('load', function() {
  if (window.performance && window.performance.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    console.log('⚡ Page load time:', (loadTime / 1000).toFixed(2), 'seconds');
  }
});

window.addEventListener('error', function(e) {
  console.error('❌ JavaScript Error:', e.message);
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('❌ Unhandled Promise Rejection:', e.reason);
});

window.adminDebug = {
  filterProducts,
  resetFilters,
  showAlert,
  switchTab,
  allProducts,
  formatCurrency,
  formatDate,
  formatTime,
  version: '1.0.0'
};

console.log('%c✅ Admin.js loaded successfully!', 'color: #27ae60; font-weight: bold; font-size: 14px;');
