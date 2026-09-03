export type OrderStatus =
  | 'menunggu_pembayaran'
  | 'diproses'
  | 'dikirim'
  | 'selesai'
  | 'dibatalkan';

export interface TrackingStep {
  id: string;
  waktu: string;
  status: string;
  keterangan: string;
  lokasi: string;
  isPassed: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  nama: string;
  slug: string;
  gambar: string;
  warna: string;
  ukuran: string;
  harga: number;
  jumlah: number;
}

export interface Order {
  id: string;
  nomorInvoice: string;
  tanggalPesanan: string;
  status: OrderStatus;
  statusLabel: string;
  statusColor: string;
  namaPenerima: string;
  teleponPenerima: string;
  alamatLengkap: string;
  kurir: string;
  layananKurir: string;
  nomorResi?: string;
  metodePembayaran: string;
  subtotal: number;
  ongkir: number;
  diskon: number;
  biayaLayanan: number;
  totalBayar: number;
  items: OrderItem[];
  trackingTimeline: TrackingStep[];
  catatan?: string;
}
