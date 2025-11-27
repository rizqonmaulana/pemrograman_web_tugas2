const { createApp } = Vue;

createApp({
  data() {
    return {
      stokData: [],
      searchQuery: "",
      selectedItem: null,
      showModal: false,
      showAddModal: false,
      showInput: false,
      selectedUpbjj: "",
      selectedKategori: "",
      filterQtyBelowSafety: false,
      filterQtyZero: false,
      upbjjList: [],
      kategoriList: [],
      sortKey: "", // Key to sort by
      sortOrder: "asc", // Sorting order: 'asc' or 'desc'
      newItem: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      },
      validationErrors: {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        harga: "",
        qty: "",
        safety: "",
      },
      watcherMessage: "",
      filterMessage: "",
      searchResultCount: 0,
    };
  },
  computed: {
    filteredStok() {
      let filtered = this.stokData;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((item) => item.judul.toLowerCase().includes(query) || item.kode.toLowerCase().includes(query) || item.lokasiRak.toLowerCase().includes(query));
      }

      if (this.selectedUpbjj) {
        filtered = filtered.filter((item) => item.upbjj === this.selectedUpbjj);
      }

      if (this.selectedKategori) {
        filtered = filtered.filter((item) => item.kategori === this.selectedKategori);
      }

      if (this.filterQtyBelowSafety) {
        filtered = filtered.filter((item) => item.qty < item.safety);
      }

      if (this.filterQtyZero) {
        filtered = filtered.filter((item) => item.qty === 0);
      }

      if (this.sortKey) {
        filtered = filtered.slice().sort((a, b) => {
          const valueA = a[this.sortKey];
          const valueB = b[this.sortKey];

          if (valueA === valueB) return 0; // If values are equal, no sorting needed

          const isAscending = this.sortOrder === "asc";
          return isAscending ? (valueA > valueB ? 1 : -1) : valueA < valueB ? 1 : -1;
        });
      }

      // Update search result count when filtered results change
      this.searchResultCount = filtered.length;
      return filtered;
    },

    availableKategori() {
      if (!this.selectedUpbjj) {
        return [...new Set(this.stokData.map((item) => item.kategori))];
      }
      return [...new Set(this.stokData.filter((item) => item.upbjj === this.selectedUpbjj).map((item) => item.kategori))];
    },
  },
  methods: {
    getStockClass(qty, safety) {
      if (qty === 0) return "stock-low";
      if (qty < safety) return "stock-medium";
      return "stock-high";
    },
    showDetailModal(item) {
      this.selectedItem = item;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedItem = null;
    },
    formatRupiah(amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    },
    backToDashboard() {
      window.location.href = "index.html";
    },
    editItem() {
      if (this.selectedItem) {
        this.showInput = !this.showInput;
      }
    },
    resetFilters() {
      this.selectedUpbjj = "";
      this.selectedKategori = "";
      this.filterQtyBelowSafety = false;
      this.filterQtyZero = false;
    },
    setSort(key) {
      if (this.sortKey === key) {
        // Toggle sort order if the same key is clicked
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        // Set new sort key and default to ascending order
        this.sortKey = key;
        this.sortOrder = "asc";
      }
    },
    openAddModal() {
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
      this.resetNewItem();
    },
    resetNewItem() {
      this.newItem = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
        catatanHTML: "",
      };
      this.clearValidationErrors();
    },
    clearValidationErrors() {
      this.validationErrors = {
        kode: "",
        judul: "",
        kategori: "",
        upbjj: "",
        harga: "",
        qty: "",
        safety: "",
      };
    },
    validateNewItem() {
      this.clearValidationErrors();
      let isValid = true;

      if (!this.newItem.kode || this.newItem.kode.trim() === "") {
        this.validationErrors.kode = "Kode bahan ajar wajib diisi";
        isValid = false;
      } else if (this.newItem.kode.length < 4) {
        this.validationErrors.kode = "Kode minimal 4 karakter";
        isValid = false;
      }

      if (!this.newItem.judul || this.newItem.judul.trim() === "") {
        this.validationErrors.judul = "Judul wajib diisi";
        isValid = false;
      } else if (this.newItem.judul.length < 5) {
        this.validationErrors.judul = "Judul minimal 5 karakter";
        isValid = false;
      }

      if (!this.newItem.kategori) {
        this.validationErrors.kategori = "Kategori wajib dipilih";
        isValid = false;
      }

      if (!this.newItem.upbjj) {
        this.validationErrors.upbjj = "UPBJJ wajib dipilih";
        isValid = false;
      }

      if (this.newItem.harga < 0) {
        this.validationErrors.harga = "Harga tidak boleh negatif";
        isValid = false;
      } else if (this.newItem.harga === 0) {
        this.validationErrors.harga = "Harga harus lebih dari 0";
        isValid = false;
      }

      if (this.newItem.qty < 0) {
        this.validationErrors.qty = "Qty tidak boleh negatif";
        isValid = false;
      }

      if (this.newItem.safety < 0) {
        this.validationErrors.safety = "Safety stock tidak boleh negatif";
        isValid = false;
      }

      return isValid;
    },
    addNewItem() {
      // Validate form
      if (!this.validateNewItem()) {
        return;
      }

      const exists = this.stokData.some((item) => item.kode === this.newItem.kode);
      if (exists) {
        this.validationErrors.kode = "Kode bahan ajar sudah ada!";
        return;
      }

      this.stokData.push({ ...this.newItem });

      this.closeAddModal();
      alert("Data berhasil ditambahkan!");
    },
  },
  mounted() {
    if (typeof stokBahanAjar !== "undefined") {
      this.stokData = stokBahanAjar;
    } else {
      console.error("Data tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }

    if (typeof upbjjList !== "undefined") {
      this.upbjjList = upbjjList;
    }

    if (typeof kategoriList !== "undefined") {
      this.kategoriList = kategoriList;
    }
  },
  watch: {
    selectedUpbjj(newVal, oldVal) {
      if (newVal !== oldVal && oldVal !== "") {
        this.selectedKategori = "";
        this.watcherMessage = `UPBJJ berubah dari "${oldVal}" ke "${newVal}". Kategori filter direset.`;
        this.filterMessage = `Filter aktif: UPBJJ = ${newVal}`;
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      } else if (newVal) {
        this.filterMessage = `Filter aktif: UPBJJ = ${newVal}`;
      } else {
        this.filterMessage = "";
      }
    },

    selectedKategori(newVal, oldVal) {
      if (newVal && this.sortKey) {
        this.sortKey = "";
        this.sortOrder = "asc";
      }
      if (newVal && oldVal) {
        this.watcherMessage = `Kategori berubah dari "${oldVal}" ke "${newVal}"`;
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      }
    },

    filterQtyBelowSafety(newVal) {
      if (newVal && this.filterQtyZero) {
        this.filterQtyZero = false;
        this.watcherMessage = "Filter 'Stok Habis' dinonaktifkan karena 'Stok di bawah Safety' aktif";
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      }
    },

    filterQtyZero(newVal) {
      if (newVal && this.filterQtyBelowSafety) {
        this.filterQtyBelowSafety = false;
        this.watcherMessage = "Filter 'Stok di bawah Safety' dinonaktifkan karena 'Stok Habis' aktif";
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      }
    },

    searchQuery(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.watcherMessage = `Pencarian: "${newVal}" - Menemukan ${this.searchResultCount} hasil`;
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      }
    },

    "newItem.kode"(newVal) {
      if (newVal && this.validationErrors.kode) {
        if (newVal.length >= 4) {
          this.validationErrors.kode = "";
        }
      }
    },

    "newItem.judul"(newVal) {
      if (newVal && this.validationErrors.judul) {
        if (newVal.length >= 5) {
          this.validationErrors.judul = "";
        }
      }
    },

    "newItem.harga"(newVal) {
      if (newVal > 0 && this.validationErrors.harga) {
        this.validationErrors.harga = "";
      }
    },

    "newItem.qty"(newVal) {
      if (newVal >= 0 && this.validationErrors.qty) {
        this.validationErrors.qty = "";
      }
      if (newVal !== null && newVal !== undefined && this.newItem.safety > 0) {
        if (newVal < this.newItem.safety) {
          this.watcherMessage = `⚠️ Perhatian: Qty (${newVal}) di bawah safety stock (${this.newItem.safety})`;
        }
      }
    },

    "newItem.safety"(newVal) {
      if (newVal >= 0 && this.validationErrors.safety) {
        this.validationErrors.safety = "";
      }
    },
  },
  template: `
    <main>
      <header class="page-header">
        <button class="back-button" @click="backToDashboard">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="header-text">
          <h2>Informasi Stok Bahan Ajar</h2>
          <p>Manajemen Stok Bahan Ajar UT</p>
        </div>
      </header>

      <section class="stock-container">
        <!-- Watcher Message Notification -->
        <div v-if="watcherMessage" class="watcher-notification" style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
          <i class="fa-solid fa-info-circle" style="color: #2196F3; margin-right: 8px;"></i>
          <span v-text="watcherMessage"></span>
        </div>

        <!-- Filter Info Display -->
        <div v-if="filterMessage" class="filter-info" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
          <i class="fa-solid fa-filter" style="color: #ffc107; margin-right: 8px;"></i>
          <span v-text="filterMessage"></span>
        </div>

        <div class="search-filter">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Cari bahan ajar berdasarkan kode, judul, lokasi rak.." 
            class="search-input"
          >
          <div class="filter-container">
            <select v-model="selectedUpbjj">
              <option value="">Semua UPBJJ</option>
              <option v-for="upbjj in upbjjList" :key="upbjj" :value="upbjj">
                {{ upbjj }}
              </option>
            </select>

            <select v-model="selectedKategori" :disabled="!selectedUpbjj">
              <option value="">Semua Kategori</option>
              <option v-for="kategori in kategoriList" :key="kategori" :value="kategori">
                {{ kategori }}
              </option>
            </select>

            <label>
              <input type="checkbox" v-model="filterQtyBelowSafety">
              Stok di bawah Safety
            </label>

            <label>
              <input type="checkbox" v-model="filterQtyZero">
              Stok Habis
            </label>

            <button @click="resetFilters">Reset Filter</button>
          </div>
        </div>

        <div class="search-result-info" v-if="searchQuery || selectedUpbjj || selectedKategori || filterQtyBelowSafety || filterQtyZero" style="padding: 10px; margin-bottom: 10px; color: #666; font-size: 14px;">
          <span>Menampilkan </span>
          <strong v-text="searchResultCount"></strong>
          <span> hasil</span>
        </div>

        <div class="sort-container">
          <button @click="setSort('judul')">Sort by Judul</button>
          <button @click="setSort('qty')">Sort by Stok</button>
          <button @click="setSort('harga')">Sort by Harga</button>
          <button @click="openAddModal" class="add-button">
            <i class="fa-solid fa-plus"></i> Tambah Bahan Ajar
          </button>
        </div>

        <div class="stock-list" v-if="filteredStok.length > 0">
          <div 
            v-for="item in filteredStok" 
            :key="item.kode"
            class="stock-item"
            @click="showDetailModal(item)"
          >
            <div class="stock-item-info">
              <p class="label">Kode Bahan Ajar</p>
              <p class="value">{{ item.kode }}</p>
              
              <p class="label">Judul</p>
              <p class="value">{{ item.judul }}</p>
              
              <p class="label">Kategori</p>
              <p class="value">{{ item.kategori }}</p>
              
              <p class="label">UPBJJ</p>
              <p class="value">{{ item.upbjj }}</p>
              
              <p class="label">Lokasi Rak</p>
              <p class="value">{{ item.lokasiRak }}</p>
              
              <p class="label">Harga</p>
              <p class="value">{{ formatRupiah(item.harga) }}</p>
              
              <p class="label">Stok Tersedia</p>
              <p class="value">
                <span class="stock-badge" :class="getStockClass(item.qty, item.safety)">
                  {{ item.qty }} unit
                </span>
              </p>
              
              <p class="label">Safety Stock</p>
              <p class="value">{{ item.safety }} unit</p>
            </div>
          </div>
        </div>
        
        <div v-else style="text-align: center; color: #999; padding: 40px;">
          <p>Tidak ada data ditemukan</p>
        </div>
      </section>

      <!-- Modal Detail -->
      <dialog 
        class="modal-stock"
        :open="showModal"
        @click="closeModal"
      >
        <div class="modal-stock-content" v-if="selectedItem" @click.stop>
          <div class="modal-stock-header">
            <h2>Detail Bahan Ajar</h2>
            <button type="button" class="close-modal" @click="closeModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-stock-body">
            <div class="detail-row">
              <span class="detail-label">Kode Bahan Ajar</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.kode" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.kode }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Judul</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.judul" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.judul }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Kategori</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.kategori" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.kategori }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">UPBJJ</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.upbjj" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.upbjj }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lokasi Rak</span>
              <template v-if="showInput">
                <input class="detail-value" v-model="selectedItem.lokasiRak" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.lokasiRak }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Harga</span>
              <template v-if="showInput">
                <input class="detail-value" v-model.number="selectedItem.harga" />
              </template>
              <template v-else>
                <span class="detail-value">{{ formatRupiah(selectedItem.harga) }}</span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stok Tersedia</span>
              <template v-if="showInput">
                <input class="detail-value" v-model.number="selectedItem.qty" />
              </template>
              <template v-else>
                <span class="detail-value">
                  <span class="stock-badge" :class="getStockClass(selectedItem.qty, selectedItem.safety)">
                    {{ selectedItem.qty }} unit
                  </span>
                </span>
              </template>
            </div>
            <div class="detail-row">
              <span class="detail-label">Safety Stock</span>
              <template v-if="showInput">
                <input class="detail-value" v-model.number="selectedItem.safety" />
              </template>
              <template v-else>
                <span class="detail-value">{{ selectedItem.safety }} unit</span>
              </template>
            </div>
            <div class="detail-row" v-if="selectedItem.catatanHTML">
              <span class="detail-label">Catatan</span>
              <template v-if="showInput">
                <textarea class="detail-value" v-model="selectedItem.catatanHTML"></textarea>
              </template>
              <template v-else>
                <span class="detail-value" v-html="selectedItem.catatanHTML"></span>
              </template>
            </div>
            <button class="action-button" @click="editItem">
              <i v-if="showInput" class="fa-solid fa-check"></i>
              <i v-else class="fa-solid fa-pencil"></i>
              {{ showInput ? 'Simpan' : 'Edit' }}
            </button>
          </div>
        </div>
      </dialog>

      <!-- Modal Add New Item -->
      <dialog 
        class="modal-stock"
        :open="showAddModal"
        @click="closeAddModal"
      >
        <div class="modal-stock-content" @click.stop>
          <div class="modal-stock-header">
            <h2>Tambah Bahan Ajar Baru</h2>
            <button type="button" class="close-modal" @click="closeAddModal">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-stock-body">
            <!-- Watcher Message in Modal -->
            <div v-if="watcherMessage" class="watcher-notification" style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 10px; margin-bottom: 15px; border-radius: 4px; font-size: 13px;">
              <i class="fa-solid fa-info-circle" style="color: #2196F3; margin-right: 8px;"></i>
              <span v-text="watcherMessage"></span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Kode Bahan Ajar *</span>
              <input class="detail-value" v-model="newItem.kode" placeholder="Masukkan kode" required />
              <span v-if="validationErrors.kode" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.kode"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Judul *</span>
              <input class="detail-value" v-model="newItem.judul" placeholder="Masukkan judul" required />
              <span v-if="validationErrors.judul" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.judul"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Kategori *</span>
              <select class="detail-value" v-model="newItem.kategori" required>
                <option value="">Pilih kategori</option>
                <option v-for="kategori in kategoriList" :key="kategori" :value="kategori">
                  {{ kategori }}
                </option>
              </select>
              <span v-if="validationErrors.kategori" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.kategori"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">UPBJJ *</span>
              <select class="detail-value" v-model="newItem.upbjj" required>
                <option value="">Pilih UPBJJ</option>
                <option v-for="upbjj in upbjjList" :key="upbjj" :value="upbjj">
                  {{ upbjj }}
                </option>
              </select>
              <span v-if="validationErrors.upbjj" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.upbjj"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lokasi Rak</span>
              <input class="detail-value" v-model="newItem.lokasiRak" placeholder="Masukkan lokasi rak" />
            </div>
            <div class="detail-row">
              <span class="detail-label">Harga *</span>
              <input class="detail-value" type="number" v-model.number="newItem.harga" placeholder="Masukkan harga" />
              <span v-if="validationErrors.harga" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.harga"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Stok Tersedia</span>
              <input class="detail-value" type="number" v-model.number="newItem.qty" placeholder="Masukkan jumlah stok" />
              <span v-if="validationErrors.qty" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.qty"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Safety Stock</span>
              <input class="detail-value" type="number" v-model.number="newItem.safety" placeholder="Masukkan safety stock" />
              <span v-if="validationErrors.safety" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.safety"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Catatan (Mendukung HTML)</span>
              <textarea class="detail-value" v-model="newItem.catatanHTML" placeholder="Contoh: <strong>Penting</strong>, <em>Catatan</em>, <u>Highlight</u>"></textarea>
              <div v-if="newItem.catatanHTML" style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                <small style="color: #666;">Preview:</small>
                <div v-html="newItem.catatanHTML" style="margin-top: 5px;"></div>
              </div>
            </div>
            <button class="action-button" @click="addNewItem">
              <i class="fa-solid fa-check"></i>
              Simpan
            </button>
          </div>
        </div>
      </dialog>
    </main>
  `,
}).mount("#app");
