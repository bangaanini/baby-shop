'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  ShoppingBag,
  CheckCircle2,
  Award,
  Clock,
  Star,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Layers,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Eye,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { mapDbProductToProduct, mapDbCategoryToCategoryItem } from '@/lib/mappers';
import { Product, CategoryItem } from '@/types/product';

type DateFilterKey = '7d' | '30d' | 'this_month' | 'this_year';

interface DateFilterOption {
  key: DateFilterKey;
  label: string;
  days: number;
}

const DATE_FILTERS: DateFilterOption[] = [
  { key: '7d', label: '7 Hari Terakhir', days: 7 },
  { key: '30d', label: '30 Hari Terakhir', days: 30 },
  { key: 'this_month', label: 'Bulan Ini', days: 30 },
  { key: 'this_year', label: 'Tahun Ini', days: 365 },
];

interface DailySalesPoint {
  date: string;
  label: string;
  fullDate: string;
  revenue: number;
  orders: number;
  percentage: number;
}

interface CategorySalesBreakdown {
  id: string;
  name: string;
  slug: string;
  revenue: number;
  ordersCount: number;
  percentage: number;
  productCount: number;
  color: string;
  badgeBg: string;
}

interface AnalyticsData {
  dailySales: DailySalesPoint[];
  categorySales: CategorySalesBreakdown[];
  totalPeriodRevenue: number;
  totalPeriodOrders: number;
  completedPeriodOrders: number;
  cancelledPeriodOrders: number;
  aov: number;
  completionRate: number;
}

interface DashboardStatsData {
  totalSales: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  averageRating: number;
  completedTodayCount: number;
  analytics?: AnalyticsData;
}

export default function AdminStatistikPage() {
  const [selectedFilter, setSelectedFilter] = useState<DateFilterKey>('7d');
  const [metricView, setMetricView] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Live Data States
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFilterOption = DATE_FILTERS.find((f) => f.key === selectedFilter) || DATE_FILTERS[0];

  // Fetch all live statistics & products data
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const days = activeFilterOption.days;

        // 1. Fetch live admin stats & analytics
        const statsRes = await fetch(`/api/admin/stats?days=${days}`);
        const statsJson = await statsRes.json();
        if (!statsRes.ok || !statsJson.success) {
          throw new Error(statsJson.error || 'Gagal memuat ringkasan data statistik');
        }
        setStats(statsJson.data);
        if (statsJson.data?.analytics) {
          setAnalytics(statsJson.data.analytics);
        }

        // 2. Fetch top popular selling products
        const prodRes = await fetch('/api/admin/products?sort=terpopuler&limit=5');
        const prodJson = await prodRes.json();
        if (prodRes.ok && prodJson.success && Array.isArray(prodJson.data)) {
          setTopProducts(prodJson.data.map(mapDbProductToProduct));
        }

        // 3. Fetch categories
        const catRes = await fetch('/api/categories');
        const catJson = await catRes.json();
        if (catRes.ok && catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data.map(mapDbCategoryToCategoryItem));
        }
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data performa');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilterOption.days]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Real Key Metrics
  const totalOmzet = stats?.totalSales || 0;
  const totalOrders = stats?.totalOrders || 0;
  const completedOrders = stats?.ordersByStatus?.selesai || 0;
  const cancelledOrders = stats?.ordersByStatus?.dibatalkan || 0;
  const inProgressOrders =
    (stats?.ordersByStatus?.diproses || 0) + (stats?.ordersByStatus?.dikirim || 0);

  // Real Average Order Value (AOV)
  const aov = analytics?.aov ?? (completedOrders > 0 ? Math.round(totalOmzet / completedOrders) : 0);

  // Real Completion Rate (%)
  const completionRate =
    analytics?.completionRate ??
    (totalOrders > 0
      ? Math.min(100, Math.round(((totalOrders - cancelledOrders) / totalOrders) * 100))
      : 100);

  // Real Chart Data from Database
  const chartData = useMemo<DailySalesPoint[]>(() => {
    return analytics?.dailySales || [];
  }, [analytics?.dailySales]);

  // Chart Max Scaling
  const maxChartValue = useMemo(() => {
    if (metricView === 'revenue') {
      const maxRev = Math.max(...chartData.map((d) => d.revenue), 0);
      return maxRev > 0 ? Math.ceil(maxRev * 1.2) : 1000000;
    } else {
      const maxOrd = Math.max(...chartData.map((d) => d.orders), 0);
      return maxOrd > 0 ? Math.ceil(maxOrd * 1.25) : 5;
    }
  }, [chartData, metricView]);

  // Real Category Performance Breakdown
  const categoryPerformance = useMemo<CategorySalesBreakdown[]>(() => {
    if (analytics?.categorySales && analytics.categorySales.length > 0) {
      return analytics.categorySales;
    }

    // Fallback based on real catalog categories if analytics is loading
    return categories.map((cat, idx) => ({
      id: cat.id,
      name: cat.nama,
      slug: cat.slug,
      revenue: 0,
      ordersCount: 0,
      percentage: Math.round(100 / Math.max(1, categories.length)),
      productCount: cat.jumlahProduk || 0,
      color: idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-sky-500',
      badgeBg:
        idx === 0
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : idx === 1
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-sky-50 text-sky-700 border-sky-200',
    }));
  }, [analytics?.categorySales, categories]);

  const hasSalesInPeriod = (analytics?.totalPeriodRevenue || 0) > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-full inline-block mb-2">
              Laporan & Analitik Toko
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Statistik & Performa Toko 📈
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Pantau tren pendapatan penjualan, rata-rata transaksi belanja, dan performa kategori produk secara real-time dari database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            {/* Date Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              {DATE_FILTERS.map((f) => {
                const isSelected = selectedFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              title="Perbarui Data"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Gagal memuat data statistik lengkap</p>
            <p className="text-rose-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => loadData(true)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 2. Key Metrics Bar (4 Core Stat Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Omzet */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Omzet Penjualan
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? (
                <div className="h-8 w-36 bg-slate-200 animate-pulse rounded-md my-1" />
              ) : (
                formatRupiah(totalOmzet)
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akumulasi dari pesanan sukses</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Pesanan Selesai */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pesanan Selesai
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md my-1" />
              ) : (
                `${completedOrders} Pesanan`
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
              <span className="font-bold text-slate-700">{totalOrders}</span>
              <span>total pesanan masuk</span>
              {inProgressOrders > 0 && (
                <span className="text-amber-600 font-semibold">({inProgressOrders} diproses)</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 3: Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rata-rata Keranjang (AOV)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {loading ? (
                <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-md my-1" />
              ) : (
                formatRupiah(aov)
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Nilai belanja rata-rata per pesanan</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Tingkat Penyelesaian Pesanan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tingkat Penyelesaian
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md my-1" />
              ) : (
                <>
                  <span>{completionRate}%</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {completionRate >= 90 ? 'Optimal' : 'Normal'}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
              <span>{cancelledOrders === 0 ? '0 Pembatalan' : `${cancelledOrders} pesanan batal`}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-semibold">Toko Sehat</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Visual Interactive Bar Chart & Operational Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            {/* Chart Header & Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Grafik Tren Penjualan & Pendapatan
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi omzet aktual pada periode{' '}
                  <span className="font-semibold text-slate-700">{activeFilterOption.label}</span>
                </p>
              </div>

              {/* Chart Metric Selector */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMetricView('revenue')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    metricView === 'revenue'
                      ? 'bg-white text-rose-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Omzet (Rp)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricView('orders')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    metricView === 'orders'
                      ? 'bg-white text-rose-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Jumlah Pesanan
                </button>
              </div>
            </div>

            {/* Chart Visual Surface */}
            <div className="pt-6 pb-2">
              <div className="h-64 sm:h-72 w-full flex flex-col justify-end relative">
                {/* Horizontal Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-medium">
                  <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                    <span>
                      {metricView === 'revenue'
                        ? formatRupiah(maxChartValue)
                        : `${maxChartValue} Pesanan`}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                    <span>
                      {metricView === 'revenue'
                        ? formatRupiah(Math.round(maxChartValue * 0.66))
                        : `${Math.round(maxChartValue * 0.66)} Pesanan`}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-200 w-full flex justify-between pr-2">
                    <span>
                      {metricView === 'revenue'
                        ? formatRupiah(Math.round(maxChartValue * 0.33))
                        : `${Math.round(maxChartValue * 0.33)} Pesanan`}
                    </span>
                  </div>
                  <div className="border-b border-slate-300 w-full flex justify-between pr-2">
                    <span>{metricView === 'revenue' ? 'Rp 0' : '0'}</span>
                  </div>
                </div>

                {/* Bars Container */}
                <div className="relative z-10 h-52 sm:h-56 flex items-end justify-between gap-1 sm:gap-2 px-1 pt-4">
                  {chartData.map((d, index) => {
                    const value = metricView === 'revenue' ? d.revenue : d.orders;
                    const heightPercent =
                      maxChartValue > 0 ? Math.min(100, Math.max(0, (value / maxChartValue) * 100)) : 0;
                    const isHovered = hoveredBarIndex === index;
                    const isMax =
                      value > 0 &&
                      value === Math.max(...chartData.map((cd) => (metricView === 'revenue' ? cd.revenue : cd.orders)));

                    return (
                      <div
                        key={d.date || index}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                      >
                        {/* Interactive Tooltip Card on Hover */}
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 z-30 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs w-44 pointer-events-none transform -translate-x-1/2 left-1/2">
                            <div className="font-bold text-slate-100 text-[11px] pb-1 border-b border-slate-800">
                              {d.fullDate}
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Omzet:</span>
                                <span className="font-bold text-rose-400">
                                  {formatRupiah(d.revenue)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400">Pesanan:</span>
                                <span className="font-bold text-emerald-400">
                                  {d.orders} transaksi
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* The Visual Bar */}
                        <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md relative flex items-end overflow-hidden h-full">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              isHovered
                                ? 'bg-rose-600 shadow-md shadow-rose-500/30'
                                : isMax
                                ? 'bg-rose-500'
                                : value > 0
                                ? 'bg-rose-400/85 hover:bg-rose-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        </div>

                        {/* X-Axis Label */}
                        <span
                          className={`mt-2.5 text-[10px] sm:text-[11px] font-semibold truncate text-center ${
                            isHovered
                              ? 'text-rose-600 font-bold'
                              : isMax
                              ? 'text-slate-900 font-bold'
                              : 'text-slate-500'
                          }`}
                        >
                          {d.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Footer Statistics */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Omzet Periode Ini</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatRupiah(analytics?.totalPeriodRevenue || 0)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-slate-500 block text-[11px]">Rata-rata / Hari</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatRupiah(
                  Math.round((analytics?.totalPeriodRevenue || 0) / Math.max(1, chartData.length || 7))
                )}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-slate-500 block text-[11px]">Volume Transaksi</span>
              <span className="font-bold text-slate-900 text-sm">
                {analytics?.totalPeriodOrders || 0} Pesanan
              </span>
            </div>
          </div>
        </div>

        {/* Operational Health Score Card (1 col) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Kesehatan Toko & SLA</h2>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                Grade A+
              </span>
            </div>

            {/* Overall Score Badge */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-3 translate-y-3">
                <Award className="w-28 h-28" />
              </div>
              <div className="relative z-10">
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  Store Performance Score
                </span>
                <div className="text-3xl font-extrabold mt-1 flex items-baseline gap-1 text-white">
                  <span>{completionRate >= 90 ? '100' : `${completionRate}`}</span>
                  <span className="text-xs text-slate-300 font-normal">/ 100</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Status: <strong className="text-emerald-400">Toko Siap Beroperasi</strong>. Memenuhi standar pelayanan pembeli.
                </p>
              </div>
            </div>

            {/* Operational Health Indicators */}
            <div className="mt-5 space-y-3">
              {/* 1. Kecepatan Proses Pesanan */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Status Toko</div>
                    <div className="text-[11px] text-slate-500">Konfirmasi resi otomatis</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-slate-900">Aktif</div>
                  <div className="text-[10px] font-bold text-emerald-600">SLA 24 Jam</div>
                </div>
              </div>

              {/* 2. Kepuasan Pelanggan (Rating Toko) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-rose-600 text-rose-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Rating Toko</div>
                    <div className="text-[11px] text-slate-500">Kualitas produk terdaftar</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-slate-900 flex items-center justify-end gap-1">
                    <span>{stats?.averageRating ? stats.averageRating.toFixed(1) : '5.0'}</span>
                    <span className="text-amber-500">★</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600">Pelayanan Prima</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <Link
              href="/admin/setting"
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <span>Atur Lokasi & Logistik Toko</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Category Performance & Top Selling SKU */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Performance Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Distribusi Kategori</h2>
            </div>
            <span className="text-xs text-slate-500">{categoryPerformance.length} Kategori</span>
          </div>

          {/* Stacked Visual Bar */}
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {categoryPerformance.map((cat) => (
              <div
                key={cat.id}
                style={{ width: `${Math.max(5, cat.percentage)}%` }}
                className={`h-full ${cat.color} transition-all`}
                title={`${cat.name}: ${cat.percentage}%`}
              />
            ))}
          </div>

          {/* Category List Cards */}
          <div className="space-y-2.5 pt-1">
            {categoryPerformance.map((cat) => (
              <div
                key={cat.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${cat.color} shrink-0`} />
                  <div>
                    <strong className="text-slate-800 block text-xs">{cat.name}</strong>
                    <span className="text-[11px] text-slate-400">{cat.productCount} SKU Produk</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{formatRupiah(cat.revenue)}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Selling SKU (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">Top Produk Terlaris</h2>
            </div>
            <Link
              href="/admin/produk"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Lihat Semua SKU</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {topProducts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {topProducts.map((p, idx) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-black text-slate-400 text-sm w-4 text-center">{idx + 1}</span>
                    <img
                      src={p.gambar}
                      alt={p.nama}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate" title={p.nama}>
                        {p.nama}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-rose-600 font-semibold">{p.kategoriLabel}</span>
                        <span>•</span>
                        <span>Stok: {p.stok} pcs</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <strong className="text-slate-900 block font-bold">{formatRupiah(p.harga)}</strong>
                    <span className="text-[11px] text-slate-400 font-medium">Terjual {p.terjual}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Belum ada produk terdaftar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
