export interface CartItem {
  id: string;
  cartId?: string;
  productId: string;
  variantId?: string | null;
  nama: string;
  slug: string;
  gambar: string;
  kategoriLabel: string;
  warna: string;
  ukuran: string;
  harga: number;
  hargaCoret?: number;
  diskonPersen?: number;
  jumlah: number;
  beratGram: number;
  stok: number;
  subtotal?: number;
  totalBeratGram?: number;
}

export interface ShippingAddress {
  id: string;
  namaPenerima: string;
  telepon: string;
  labelAlamat: string; // 'Rumah' | 'Kantor' | 'Utama'
  alamatLengkap: string;
  provinsi: string;
  kotaKabupaten: string;
  kecamatan: string;
  kodePos: string;
  isUtama: boolean;
}

export interface CourierService {
  id: string;
  kodeKurir: string; // 'jne' | 'sicepat' | 'jnt' | 'anteraja'
  namaKurir: string;
  layanan: string;
  estimasiHari: string;
  ongkir: number;
  iconText: string;
}

export interface PaymentMethod {
  id: string;
  kategori: 'qris' | 'bank_transfer' | 'ewallet';
  nama: string;
  deskripsi: string;
  nomorAkun?: string;
  icon: string;
}

export interface OrderSummary {
  subtotalProduk: number;
  totalBeratGram: number;
  ongkir: number;
  diskonVoucher: number;
  biayaLayanan: number;
  totalBayar: number;
}
