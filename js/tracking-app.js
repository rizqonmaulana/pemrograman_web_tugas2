const { createApp } = Vue;

createApp({
  data() {
    return {
      searchQuery: "",
      trackingData: null,
      showResult: false,
      dataTracking: {},
      paketList: [],
      ekspedisiList: [],
      showAddModal: false,
      selectedPaket: {},
      newTracking: {
        nomorDO: "",
        nim: null,
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0,
      },
      validationErrors: {
        nim: "",
        nama: "",
        ekspedisi: "",
        tanggalKirim: "",
      },
      watcherMessage: "",
      searchMessage: "",
    };
  },
  methods: {
    backToDashboard() {
      window.location.href = "index.html";
    },
    searchTracking() {
      const nomorDO = this.searchQuery.trim();

      if (!nomorDO) {
        this.searchMessage = "Mohon masukkan nomor Delivery Order";
        setTimeout(() => {
          this.searchMessage = "";
        }, 3000);
        return;
      }

      if (this.dataTracking[nomorDO]) {
        this.trackingData = this.dataTracking[nomorDO];
        this.showResult = true;
        this.searchMessage = `Data ditemukan untuk DO: ${nomorDO}`;
        setTimeout(() => {
          this.searchMessage = "";
        }, 3000);
      } else {
        this.searchMessage = `Nomor Delivery Order "${nomorDO}" tidak ditemukan!`;
        this.showResult = false;
        this.trackingData = null;
        setTimeout(() => {
          this.searchMessage = "";
        }, 4000);
      }
    },
    openAddModal() {
      const currentYear = new Date().getFullYear();
      const sequenceNumber = Object.keys(this.dataTracking).length + 1;
      const paddedSequence = String(sequenceNumber).padStart(3, "0");
      this.newTracking.nomorDO = `DO${currentYear}-${paddedSequence}`;

      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
      this.resetNewTracking();
    },
    clearValidationErrors() {
      this.validationErrors = {
        nim: "",
        nama: "",
        ekspedisi: "",
        tanggalKirim: "",
      };
    },
    resetNewTracking() {
      this.newTracking = {
        nomorDO: "",
        nim: null,
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0,
      };
      this.selectedPaket = {};
      this.clearValidationErrors();
    },
    validateNewTracking() {
      this.clearValidationErrors();
      let isValid = true;

      // Validate nama
      if (!this.newTracking.nama || this.newTracking.nama.trim() === "") {
        this.validationErrors.nama = "Nama penerima wajib diisi";
        isValid = false;
      } else if (this.newTracking.nama.length < 3) {
        this.validationErrors.nama = "Nama minimal 3 karakter";
        isValid = false;
      }

      // Validate NIM (optional but if filled, must be valid)
      if (this.newTracking.nim !== null && this.newTracking.nim !== "") {
        if (this.newTracking.nim.toString().length < 9) {
          this.validationErrors.nim = "NIM harus minimal 9 digit";
          isValid = false;
        }
      }

      // Validate ekspedisi
      if (!this.newTracking.ekspedisi) {
        this.validationErrors.ekspedisi = "Ekspedisi wajib dipilih";
        isValid = false;
      }

      // Validate tanggal kirim
      if (this.newTracking.tanggalKirim) {
        const selectedDate = new Date(this.newTracking.tanggalKirim);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          this.validationErrors.tanggalKirim = "Tanggal kirim tidak boleh di masa lalu";
          isValid = false;
        }
      }

      return isValid;
    },
    addNewTracking() {
      // Validate form
      if (!this.validateNewTracking()) {
        return;
      }

      const exists = this.dataTracking[this.newTracking.nomorDO];
      if (exists) {
        alert("Nomor Delivery Order sudah ada!");
        return;
      }

      // Add new tracking to dataTracking
      this.dataTracking[this.newTracking.nomorDO] = {
        ...this.newTracking,
        status: "Dibuat",
        perjalanan: [
          {
            waktu: new Date().toLocaleString("id-ID"),
            keterangan: "Delivery Order dibuat",
          },
        ],
      };

      this.closeAddModal();
      this.watcherMessage = `✓ Delivery Order ${this.newTracking.nomorDO} berhasil ditambahkan`;
      setTimeout(() => {
        this.watcherMessage = "";
      }, 4000);
    },
  },
  mounted() {
    if (typeof dataTracking !== "undefined") {
      this.dataTracking = dataTracking;
    } else {
      console.error("Data tracking tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }

    if (typeof paketList !== "undefined") {
      this.paketList = paketList;
    } else {
      console.error("Data paket tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }

    if (typeof pengirimanList !== "undefined") {
      this.ekspedisiList = pengirimanList;
    } else {
      console.error("Data ekspedisi tidak ditemukan. Pastikan dataBahanAjar.js sudah dimuat.");
    }
  },
  watch: {
    "newTracking.paket"(newValue) {
      if (newValue && newValue !== "") {
        this.selectedPaket = paketList.find((p) => p.kode === newValue) || {};
        this.newTracking.total = this.selectedPaket.harga || 0;
        this.watcherMessage = `Paket "${this.selectedPaket.nama}" dipilih. Total: Rp ${this.newTracking.total.toLocaleString("id-ID")}`;
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      } else if (newValue === "") {
        this.newTracking.total = 0;
        this.selectedPaket = {};
      } else {
        this.selectedPaket = {};
      }
    },

    "newTracking.nama"(newVal) {
      if (newVal && this.validationErrors.nama) {
        if (newVal.length >= 3) {
          this.validationErrors.nama = "";
        }
      }
    },

    "newTracking.nim"(newVal) {
      if (newVal && this.validationErrors.nim) {
        if (newVal.toString().length >= 9) {
          this.validationErrors.nim = "";
        }
      }
    },

    "newTracking.ekspedisi"(newVal, oldVal) {
      if (newVal && this.validationErrors.ekspedisi) {
        this.validationErrors.ekspedisi = "";
      }
      if (newVal && oldVal && newVal !== oldVal) {
        this.watcherMessage = `Ekspedisi berubah dari "${oldVal}" ke "${newVal}"`;
        setTimeout(() => {
          this.watcherMessage = "";
        }, 3000);
      }
    },

    "newTracking.tanggalKirim"(newVal) {
      if (newVal) {
        const selectedDate = new Date(newVal);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate >= today) {
          this.validationErrors.tanggalKirim = "";
          const formattedDate = selectedDate.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          this.watcherMessage = `Tanggal kirim: ${formattedDate}`;
          setTimeout(() => {
            this.watcherMessage = "";
          }, 3000);
        }
      }
    },

    searchQuery(newVal) {
      if (newVal) {
        this.searchMessage = `Mencari: "${newVal}"...`;
        setTimeout(() => {
          if (this.searchMessage === `Mencari: "${newVal}"...`) {
            this.searchMessage = "";
          }
        }, 2000);
      }
    },
  },
  template: `
    <main>
      <header class="tracking-main-header">
      <div class="page-header">
        <button class="back-button" @click="backToDashboard">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="header-text">
          <h2>Tracking Pengiriman Bahan Ajar</h2>
          <p>Manajemen Tracking Bahan Ajar UT</p>
        </div>
      </div>
      <button class="add-button" @click="openAddModal">
          <i class="fa-solid fa-plus"></i> Input Delivery Order
        </button>
      </header>

      <section class="tracking-container">
        <!-- Watcher Message Notification -->
        <div v-if="watcherMessage" class="watcher-notification" style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
          <i class="fa-solid fa-info-circle" style="color: #2196F3; margin-right: 8px;"></i>
          <span v-text="watcherMessage"></span>
        </div>

        <!-- Search Message Notification -->
        <div v-if="searchMessage" class="search-notification" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
          <i class="fa-solid fa-search" style="color: #ffc107; margin-right: 8px;"></i>
          <span v-text="searchMessage"></span>
        </div>

        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            class="search-input" 
            placeholder="Nomor Delivery Order"
            @keyup.enter="searchTracking"
          />
          <button type="button" class="btn-submit" @click="searchTracking">Cari</button>
        </div>

        <div class="placeholder-box" v-if="!showResult">
          <i class="fa-solid fa-search"></i>
          <p>Masukkan nomor delivery order untuk melihat informasi pengiriman</p>
        </div>

        <div class="result-box" v-if="showResult && trackingData">
          <div class="user-info">
            <div>
              <p id="nama">{{ trackingData.nama }}</p>
              <p id="nomorDO">{{ trackingData.nomorDO }}</p>
            </div>
            <div>
              <p id="status">{{ trackingData.status }}</p>
              <p id="tanggalKirim">{{ trackingData.tanggalKirim }}</p>
            </div>
          </div>
          <div class="timeline">
            <p class="timeline-header">Perjalanan Paket</p>
            <div 
              v-for="(item, index) in trackingData.perjalanan" 
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <p class="timeline-date">{{ item.waktu }}</p>
                <p class="timeline-description">{{ item.keterangan }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal Add New Tracking -->
      <dialog 
        class="modal-stock"
        :open="showAddModal"
        @click="closeAddModal"
      >
        <div class="modal-stock-content" @click.stop>
          <div class="modal-stock-header">
            <h2>Input Delivery Order Baru</h2>
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
              <span class="detail-label">Nomor DO *</span>
              <input class="detail-value" v-model="newTracking.nomorDO" placeholder="Masukkan nomor DO" required disabled />
            </div>
            <div class="detail-row">
              <span class="detail-label">NIM</span>
              <input class="detail-value" type="number" v-model.number="newTracking.nim" placeholder="Masukkan NIM (opsional)" />
              <span v-if="validationErrors.nim" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.nim"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Nama Penerima *</span>
              <input class="detail-value" v-model="newTracking.nama" placeholder="Masukkan nama penerima" required />
              <span v-if="validationErrors.nama" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.nama"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ekspedisi *</span>
              <select class="detail-value" v-model="newTracking.ekspedisi" required>
                <option value="">-- Pilih Ekspedisi --</option>
                <option v-for="ekspedisi in ekspedisiList" :key="ekspedisi.kode" :value="ekspedisi.nama">{{ ekspedisi.nama }}</option>
              </select>
              <span v-if="validationErrors.ekspedisi" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.ekspedisi"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Paket</span>
              <select class="detail-value" v-model="newTracking.paket">
                <option value="">-- Pilih Paket --</option>
                <option v-for="paket in paketList" :key="paket.kode" :value="paket.kode">
                  {{ paket.nama }}
                </option>
              </select>
              </div>
              <div v-if="selectedPaket.kode">
                <p>Detail Paket ({{ selectedPaket.nama }})</p>
                <p>Kode Paket: {{ selectedPaket.kode }}</p>
                <span>Isi: </span> <span v-for="(value, index) in selectedPaket.isi" :key="value">{{ value }}{{ index < selectedPaket.isi.length - 1 ? ', ' : '' }}</span>
              </div>
            <div class="detail-row">
              <span class="detail-label">Tanggal Kirim</span>
              <input class="detail-value" type="date" v-model="newTracking.tanggalKirim" />
              <span v-if="validationErrors.tanggalKirim" class="error-message" style="color: #f44336; font-size: 12px; margin-top: 5px; display: block;" v-text="validationErrors.tanggalKirim"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total</span>
              <input type="number" class="detail-value" v-model.number="newTracking.total" placeholder="Masukkan total" disabled />
            </div>
            <button class="action-button" @click="addNewTracking">
              <i class="fa-solid fa-check"></i>
              Simpan
            </button>
          </div>
        </div>
      </dialog>
    </main>
  `,
}).mount("#app");
