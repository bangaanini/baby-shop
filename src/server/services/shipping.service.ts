import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { productsTable, storeSettingsTable } from '@/db/schema';
import {
  CalculateShippingRatesInput,
  ShippingRateOption,
} from '@/server/validators/shipping.schema';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function isBiteshipConfigured(): boolean {
  const apiKey = process.env.BITESHIP_API_KEY;
  if (!apiKey) return false;
  if (apiKey.includes('your_biteship') || apiKey.trim() === '') return false;
  return true;
}

export async function getOriginInfo(): Promise<{ postalCode: string; city: string; province: string; address?: string }> {
  try {
    const settings = await db.query.storeSettingsTable.findFirst();
    if (settings) {
      return {
        postalCode: settings.store_postal_code || process.env.SHIPPING_ORIGIN_POSTAL_CODE || '12160',
        city: settings.store_city || process.env.SHIPPING_ORIGIN_CITY || 'Jakarta Selatan',
        province: process.env.SHIPPING_ORIGIN_PROVINCE || 'DKI Jakarta',
        address: settings.store_address || undefined,
      };
    }
  } catch (err) {
    console.warn('Could not read store origin from DB settings, falling back to env:', err);
  }

  return {
    postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE || '12160',
    city: process.env.SHIPPING_ORIGIN_CITY || 'Jakarta Selatan',
    province: process.env.SHIPPING_ORIGIN_PROVINCE || 'DKI Jakarta',
  };
}

function formatCourierName(codeOrName: string): string {
  const lower = (codeOrName || '').toLowerCase().trim();
  if (lower.includes('sicepat')) return 'SiCepat Ekspres';
  if (lower.includes('jne')) return 'JNE Express';
  if (lower.includes('jnt') || lower.includes('j&t')) return 'J&T Express';
  if (lower.includes('anteraja')) return 'Anteraja';
  if (lower.includes('pos')) return 'POS Indonesia';
  if (lower.includes('tiki')) return 'TIKI';
  if (lower.includes('ninja')) return 'Ninja Xpress';
  if (lower.includes('lion')) return 'Lion Parcel';
  if (lower.includes('wahana')) return 'Wahana Express';
  return codeOrName ? codeOrName.charAt(0).toUpperCase() + codeOrName.slice(1) : 'Kurir';
}

function detectZone(
  postalCode?: string | number | null,
  city?: string | null,
  province?: string | null
): 'jabodetabek' | 'jawa' | 'luar_jawa' {
  const pStr = postalCode !== undefined && postalCode !== null ? String(postalCode).trim() : '';
  const cStr = (city || '').toLowerCase().trim();
  const provStr = (province || '').toLowerCase().trim();

  // 1. Check Jabodetabek (Postal codes starting with 10xxx - 17xxx)
  if (
    pStr.startsWith('10') ||
    pStr.startsWith('11') ||
    pStr.startsWith('12') ||
    pStr.startsWith('13') ||
    pStr.startsWith('14') ||
    pStr.startsWith('15') ||
    pStr.startsWith('16') ||
    pStr.startsWith('17')
  ) {
    return 'jabodetabek';
  }

  if (
    cStr.includes('jakarta') ||
    cStr.includes('bogor') ||
    cStr.includes('depok') ||
    cStr.includes('tangerang') ||
    cStr.includes('bekasi') ||
    cStr.includes('tangsel') ||
    provStr.includes('jakarta') ||
    provStr.includes('dki')
  ) {
    return 'jabodetabek';
  }

  // 2. Check Pulau Jawa (Postal codes starting with 4, 5, 6)
  if (pStr.startsWith('4') || pStr.startsWith('5') || pStr.startsWith('6')) {
    return 'jawa';
  }

  const javaKeywords = [
    'jawa barat',
    'jawa tengah',
    'jawa timur',
    'yogyakarta',
    'jogja',
    'banten',
    'bandung',
    'surabaya',
    'semarang',
    'solo',
    'surakarta',
    'malang',
    'cirebon',
    'serang',
    'sukabumi',
    'tasikmalaya',
    'kediri',
    'probolinggo',
    'pasuruan',
    'madiun',
    'pekalongan',
    'tegal',
    'magelang',
    'salatiga',
    'batu',
    'garut',
    'purwokerto',
    'banyuwangi',
    'jember',
    'sidoarjo',
    'gresik',
  ];

  if (javaKeywords.some((k) => cStr.includes(k) || provStr.includes(k))) {
    return 'jawa';
  }

  return 'luar_jawa';
}

function generateSmartFallbackRates(
  input: CalculateShippingRatesInput,
  chargeableWeightKg: number
): ShippingRateOption[] {
  const zone = detectZone(input.destinationPostalCode, input.destinationCity, input.destinationProvince);

  const options: ShippingRateOption[] = [];

  if (zone === 'jabodetabek') {
    options.push(
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 10000 * chargeableWeightKg,
        etd: '1 - 2 Hari',
        description: 'Layanan Pengiriman Reguler SiCepat Jabodetabek',
        isAvailable: true,
      },
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        serviceCode: 'GOKIL',
        serviceName: 'CARGO (GOKIL)',
        cost: Math.max(25000, 20000 + chargeableWeightKg * 2500),
        etd: '2 - 4 Hari',
        description: 'Layanan Kargo Ekonomis untuk Paket Besar / Berat',
        isAvailable: true,
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 11000 * chargeableWeightKg,
        etd: '1 - 2 Hari',
        description: 'Layanan Reguler JNE Jabodetabek',
        isAvailable: true,
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        serviceCode: 'YES',
        serviceName: 'YES (YAKIN ESOK SAMPAI)',
        cost: 22000 * chargeableWeightKg,
        etd: '1 Hari',
        description: 'Layanan Pengiriman Cepat 1 Hari Sampai',
        isAvailable: true,
      },
      {
        courierCode: 'jnt',
        courierName: 'J&T Express',
        serviceCode: 'EZ',
        serviceName: 'EZ (REGULER)',
        cost: 10000 * chargeableWeightKg,
        etd: '1 - 2 Hari',
        description: 'Layanan Pengiriman Reguler J&T',
        isAvailable: true,
      },
      {
        courierCode: 'anteraja',
        courierName: 'Anteraja',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 10000 * chargeableWeightKg,
        etd: '1 - 2 Hari',
        description: 'Layanan Pengiriman Reguler Anteraja',
        isAvailable: true,
      },
      {
        courierCode: 'anteraja',
        courierName: 'Anteraja',
        serviceCode: 'ND',
        serviceName: 'NEXT DAY',
        cost: 20000 * chargeableWeightKg,
        etd: '1 Hari',
        description: 'Layanan Pengiriman Esok Hari Anteraja',
        isAvailable: true,
      }
    );
  } else if (zone === 'jawa') {
    options.push(
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 18000 * chargeableWeightKg,
        etd: '2 - 3 Hari',
        description: 'Layanan Pengiriman Reguler SiCepat Antar Kota Pulau Jawa',
        isAvailable: true,
      },
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        serviceCode: 'GOKIL',
        serviceName: 'CARGO (GOKIL)',
        cost: Math.max(35000, 30000 + chargeableWeightKg * 3500),
        etd: '3 - 5 Hari',
        description: 'Layanan Kargo Ekonomis untuk Paket Besar / Berat',
        isAvailable: true,
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 19000 * chargeableWeightKg,
        etd: '2 - 3 Hari',
        description: 'Layanan Reguler JNE Antar Kota Pulau Jawa',
        isAvailable: true,
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        serviceCode: 'YES',
        serviceName: 'YES (YAKIN ESOK SAMPAI)',
        cost: 32000 * chargeableWeightKg,
        etd: '1 - 2 Hari',
        description: 'Layanan Pengiriman Cepat 1 Hari Sampai',
        isAvailable: true,
      },
      {
        courierCode: 'jnt',
        courierName: 'J&T Express',
        serviceCode: 'EZ',
        serviceName: 'EZ (REGULER)',
        cost: 18000 * chargeableWeightKg,
        etd: '2 - 3 Hari',
        description: 'Layanan Pengiriman Reguler J&T',
        isAvailable: true,
      },
      {
        courierCode: 'anteraja',
        courierName: 'Anteraja',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 17000 * chargeableWeightKg,
        etd: '2 - 3 Hari',
        description: 'Layanan Pengiriman Reguler Anteraja',
        isAvailable: true,
      },
      {
        courierCode: 'anteraja',
        courierName: 'Anteraja',
        serviceCode: 'ND',
        serviceName: 'NEXT DAY',
        cost: 30000 * chargeableWeightKg,
        etd: '1 - 2 Hari',
        description: 'Layanan Pengiriman Esok Hari Anteraja',
        isAvailable: true,
      }
    );
  } else {
    // Luar Jawa
    options.push(
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 32000 * chargeableWeightKg,
        etd: '3 - 5 Hari',
        description: 'Layanan Pengiriman Reguler SiCepat Luar Jawa',
        isAvailable: true,
      },
      {
        courierCode: 'sicepat',
        courierName: 'SiCepat Ekspres',
        serviceCode: 'GOKIL',
        serviceName: 'CARGO (GOKIL)',
        cost: Math.max(55000, 45000 + chargeableWeightKg * 6000),
        etd: '4 - 7 Hari',
        description: 'Layanan Kargo Ekonomis untuk Antar Pulau',
        isAvailable: true,
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 34000 * chargeableWeightKg,
        etd: '3 - 5 Hari',
        description: 'Layanan Reguler JNE Luar Jawa',
        isAvailable: true,
      },
      {
        courierCode: 'jne',
        courierName: 'JNE Express',
        serviceCode: 'YES',
        serviceName: 'YES (YAKIN ESOK SAMPAI)',
        cost: 50000 * chargeableWeightKg,
        etd: '2 - 3 Hari',
        description: 'Layanan Pengiriman Prioritas JNE',
        isAvailable: true,
      },
      {
        courierCode: 'jnt',
        courierName: 'J&T Express',
        serviceCode: 'EZ',
        serviceName: 'EZ (REGULER)',
        cost: 33000 * chargeableWeightKg,
        etd: '3 - 5 Hari',
        description: 'Layanan Pengiriman Reguler J&T Luar Jawa',
        isAvailable: true,
      },
      {
        courierCode: 'anteraja',
        courierName: 'Anteraja',
        serviceCode: 'REG',
        serviceName: 'REGULER',
        cost: 32000 * chargeableWeightKg,
        etd: '3 - 5 Hari',
        description: 'Layanan Pengiriman Reguler Anteraja Luar Jawa',
        isAvailable: true,
      },
      {
        courierCode: 'anteraja',
        courierName: 'Anteraja',
        serviceCode: 'ND',
        serviceName: 'NEXT DAY',
        cost: 48000 * chargeableWeightKg,
        etd: '2 - 3 Hari',
        description: 'Layanan Pengiriman Cepat Antar Pulau',
        isAvailable: true,
      }
    );
  }

  if (input.courierCodes && input.courierCodes.length > 0) {
    const requested = input.courierCodes.map((c) => c.toLowerCase().trim());
    return options.filter((opt) =>
      requested.some(
        (c) =>
          opt.courierCode.toLowerCase().includes(c) ||
          c.includes(opt.courierCode.toLowerCase())
      )
    );
  }

  return options;
}

export interface CalculateRatesResult {
  rates: ShippingRateOption[];
  totalWeightGram: number;
  totalVolumeWeightGram: number;
  chargeableWeightKg: number;
  isLiveBiteship: boolean;
}

export async function calculateRates(
  input: CalculateShippingRatesInput
): Promise<CalculateRatesResult> {
  const origin = await getOriginInfo();

  // 1. Ambil data spesifikasi berat & dimensi produk dari database
  const productIds = (input.items || [])
    .map((item) => item.productId)
    .filter((id): id is string => Boolean(id) && isValidUUID(id!));

  let dbProducts: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    weight_gram: number;
    dimension_length: number;
    dimension_width: number;
    dimension_height: number;
  }> = [];

  if (productIds.length > 0) {
    dbProducts = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        description: productsTable.description,
        price: productsTable.price,
        weight_gram: productsTable.weight_gram,
        dimension_length: productsTable.dimension_length,
        dimension_width: productsTable.dimension_width,
        dimension_height: productsTable.dimension_height,
      })
      .from(productsTable)
      .where(inArray(productsTable.id, productIds));
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  let totalWeightGram = 0;
  let totalVolumeWeightGram = 0;

  const biteshipItems: Array<{
    name: string;
    description: string;
    value: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    quantity: number;
  }> = [];

  for (const item of input.items || []) {
    const prod = item.productId ? productMap.get(item.productId) : undefined;
    const qty = Math.max(1, item.quantity || 1);
    const weight =
      item.weightGram && item.weightGram > 0
        ? item.weightGram
        : prod?.weight_gram && prod.weight_gram > 0
        ? prod.weight_gram
        : 500;
    const length =
      item.dimensionLength && item.dimensionLength > 0
        ? item.dimensionLength
        : prod?.dimension_length && prod.dimension_length > 0
        ? prod.dimension_length
        : 10;
    const width =
      item.dimensionWidth && item.dimensionWidth > 0
        ? item.dimensionWidth
        : prod?.dimension_width && prod.dimension_width > 0
        ? prod.dimension_width
        : 10;
    const height =
      item.dimensionHeight && item.dimensionHeight > 0
        ? item.dimensionHeight
        : prod?.dimension_height && prod.dimension_height > 0
        ? prod.dimension_height
        : 10;
    const price =
      item.price && item.price > 0
        ? item.price
        : prod?.price && prod.price > 0
        ? prod.price
        : 50000;
    const name = item.name || prod?.name || 'Produk Bayi';
    const description = prod?.description || 'Kebutuhan Bayi & Anak';

    totalWeightGram += weight * qty;
    // Volumetric weight: (length * width * height) / 6000 kg -> in grams * 1000
    const volGram = ((length * width * height) / 6000) * 1000;
    totalVolumeWeightGram += volGram * qty;

    biteshipItems.push({
      name,
      description,
      value: price,
      length,
      width,
      height,
      weight,
      quantity: qty,
    });
  }

  const chargeableWeightGram = Math.max(totalWeightGram, totalVolumeWeightGram);
  const chargeableWeightKg = Math.max(1, Math.ceil(chargeableWeightGram / 1000));

  // 2. Jika Biteship API Key dikonfigurasi, panggil API resmi Biteship
  if (isBiteshipConfigured()) {
    try {
      const courierList =
        input.courierCodes && input.courierCodes.length > 0
          ? input.courierCodes.join(',')
          : 'sicepat,jne,jnt,anteraja';

      const payload: Record<string, unknown> = {
        origin_postal_code: parseInt(origin.postalCode, 10) || 12160,
        couriers: courierList,
        items: biteshipItems,
      };

      if (input.destinationPostalCode) {
        const parsedPostal = parseInt(String(input.destinationPostalCode).replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedPostal) && parsedPostal > 0) {
          payload.destination_postal_code = parsedPostal;
        }
      }

      if (input.destinationCity) {
        payload.destination_city = input.destinationCity;
      }
      if (input.destinationProvince) {
        payload.destination_province = input.destinationProvince;
      }
      if (input.destinationDistrict) {
        payload.destination_district = input.destinationDistrict;
      }

      const response = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const pricingList = data?.pricing || data?.rates;

        if (Array.isArray(pricingList) && pricingList.length > 0) {
          const rates: ShippingRateOption[] = pricingList.map((p: any) => ({
            courierCode: (p.courier_code || p.courier_name || '')
              .toLowerCase()
              .replace(/\s+/g, ''),
            courierName: formatCourierName(p.courier_name || p.courier_code),
            serviceCode: (
              p.courier_service_code ||
              p.type ||
              p.service_type ||
              'REG'
            ).toUpperCase(),
            serviceName: (
              p.courier_service_name ||
              p.service_type ||
              p.type ||
              'Reguler'
            ).toUpperCase(),
            cost: Number(p.price || p.tariff || 0),
            etd:
              p.duration ||
              (p.shipment_duration_range
                ? `${p.shipment_duration_range} ${p.shipment_duration_unit || 'hari'}`
                : '1 - 3 hari'),
            description: p.description || '',
            isAvailable: p.available !== false,
          }));

          const filteredRates =
            input.courierCodes && input.courierCodes.length > 0
              ? rates.filter((r) =>
                  input.courierCodes!.some(
                    (c) =>
                      r.courierCode.toLowerCase().includes(c.toLowerCase()) ||
                      c.toLowerCase().includes(r.courierCode.toLowerCase())
                  )
                )
              : rates;

          if (filteredRates.length > 0) {
            return {
              rates: filteredRates,
              totalWeightGram: Math.round(totalWeightGram),
              totalVolumeWeightGram: Math.round(totalVolumeWeightGram),
              chargeableWeightKg,
              isLiveBiteship: true,
            };
          }
        }
      } else {
        const errText = await response.text().catch(() => '');
        console.warn(
          `[ShippingService] Biteship API returned status ${response.status}: ${errText}. Using Smart Fallback.`
        );
      }
    } catch (err) {
      console.warn(
        '[ShippingService] Biteship API request failed or timed out. Using Smart Fallback.',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // 3. Smart Fallback jika Biteship belum diset atau terjadi error
  const fallbackRates = generateSmartFallbackRates(input, chargeableWeightKg);

  return {
    rates: fallbackRates,
    totalWeightGram: Math.round(totalWeightGram),
    totalVolumeWeightGram: Math.round(totalVolumeWeightGram),
    chargeableWeightKg,
    isLiveBiteship: false,
  };
}

export interface LiveTrackingCheckpoint {
  id: string;
  waktu: string;
  status: string;
  keterangan: string;
  lokasi?: string;
  isPassed: boolean;
}

export interface LiveTrackingResult {
  success: boolean;
  waybillId: string;
  courierCode: string;
  courierName: string;
  status: string;
  statusLabel: string;
  receiverName?: string;
  history: LiveTrackingCheckpoint[];
  isLive: boolean;
  link?: string;
}

function normalizeBiteshipCourier(courier: string): string {
  const c = courier.toLowerCase().replace(/[^a-z]/g, '');
  if (c.includes('sicepat')) return 'sicepat';
  if (c.includes('jne')) return 'jne';
  if (c.includes('jnt') || c.includes('jt')) return 'jnt';
  if (c.includes('anteraja')) return 'anteraja';
  if (c.includes('pos')) return 'pos';
  if (c.includes('tiki')) return 'tiki';
  if (c.includes('ninja')) return 'ninja';
  if (c.includes('lion')) return 'lion';
  if (c.includes('wahana')) return 'wahana';
  return c || 'sicepat';
}

function mapBiteshipStatusLabel(status: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('delivered') || s.includes('selesai') || s.includes('received')) return 'Paket Telah Diterima';
  if (s.includes('courier') || s.includes('delivery') || s.includes('antar')) return 'Sedang Diantar Kurir';
  if (s.includes('transit') || s.includes('hub') || s.includes('sorting')) return 'Dalam Perjalanan (Transit)';
  if (s.includes('picked') || s.includes('pickup') || s.includes('jemput')) return 'Paket Telah Di-pickup';
  if (s.includes('drop') || s.includes('manifest')) return 'Menunggu Pengiriman';
  return status ? status.toUpperCase() : 'Sedang Diproses';
}

export async function getLiveTracking(
  waybillId: string,
  courierCode: string
): Promise<LiveTrackingResult> {
  const cleanWaybill = waybillId.trim();
  const cleanCourier = normalizeBiteshipCourier(courierCode);
  const courierName = formatCourierName(cleanCourier);

  if (isBiteshipConfigured() && cleanWaybill) {
    try {
      const response = await fetch(
        `https://api.biteship.com/v1/trackings/${encodeURIComponent(cleanWaybill)}/couriers/${encodeURIComponent(cleanCourier)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const historyList: any[] = Array.isArray(data?.history) ? data.history : [];

        const checkpoints: LiveTrackingCheckpoint[] = historyList.map((h: any, idx: number) => {
          let waktuFormatted = 'Hari ini';
          if (h.updated_at || h.date || h.occurred_at) {
            try {
              const dt = new Date(h.updated_at || h.date || h.occurred_at);
              waktuFormatted = dt.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            } catch {
              waktuFormatted = String(h.updated_at || '');
            }
          }

          return {
            id: `chk-${idx}-${Date.now()}`,
            waktu: waktuFormatted,
            status: mapBiteshipStatusLabel(h.status || h.service_type || ''),
            keterangan: h.note || h.description || h.message || 'Informasi kurir telah diperbarui.',
            lokasi: h.location || h.city || undefined,
            isPassed: true,
          };
        });

        return {
          success: true,
          waybillId: cleanWaybill,
          courierCode: cleanCourier,
          courierName,
          status: data?.status || 'in_transit',
          statusLabel: mapBiteshipStatusLabel(data?.status || 'in_transit'),
          receiverName: data?.destination?.contact_name || undefined,
          history: checkpoints,
          isLive: true,
          link: data?.link || undefined,
        };
      } else {
        const errText = await response.text().catch(() => '');
        console.warn(`[ShippingService] Biteship Tracking API status ${response.status}: ${errText}`);
      }
    } catch (err: any) {
      console.warn('[ShippingService] Error fetching Biteship live tracking:', err?.message || err);
    }
  }

  // Fallback tracking simulation jika Biteship API offline atau nomor resi lokal
  return {
    success: true,
    waybillId: cleanWaybill,
    courierCode: cleanCourier,
    courierName,
    status: 'in_transit',
    statusLabel: 'Dalam Perjalanan Pengiriman',
    history: [
      {
        id: 'fb-1',
        waktu: 'Hari ini',
        status: 'Paket Sedang Dalam Pengiriman',
        keterangan: `Paket dengan nomor resi ${cleanWaybill} sedang diproses oleh armada ${courierName}.`,
        lokasi: 'Pusat Logistik Kurir',
        isPassed: true,
      },
      {
        id: 'fb-2',
        waktu: 'Kemarin',
        status: 'Paket Telah Diserahkan ke Kurir',
        keterangan: 'Paket telah di-pickup dari gudang toko dan siap diberangkatkan.',
        lokasi: 'Gudang Utama NBusiness',
        isPassed: true,
      },
    ],
    isLive: false,
  };
}

export const shippingService = {
  isBiteshipConfigured,
  getOriginInfo,
  calculateRates,
  getLiveTracking,
};
