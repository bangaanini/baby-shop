import { NextRequest, NextResponse } from 'next/server';
import {
  adminProductSchema,
  adminProductUpdateSchema,
  adminProductFilterSchema,
} from '@/server/validators/admin.schema';
import { adminService } from '@/server/services/admin.service';
import { productService } from '@/server/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parseResult = adminProductFilterSchema.safeParse(searchParams);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter filter produk tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await productService.getProducts({
      ...parseResult.data,
      kategori: parseResult.data.categoryId,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memuat daftar produk admin',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = adminProductSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data produk baru tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const createdProduct = await adminService.createProduct(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Produk berhasil ditambahkan',
        data: createdProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/admin/products:', error);
    const isClientError =
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('wajib diisi') ||
      error.message?.includes('minimal');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menambahkan produk baru',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const queryId = request.nextUrl.searchParams.get('id');
    const productId = queryId || body.id;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID produk wajib disertakan dalam parameter query (?id=...) atau body',
        },
        { status: 400 }
      );
    }

    const parseResult = adminProductUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data pembaruan produk tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updatedProduct = await adminService.updateProduct(productId, parseResult.data);

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diperbarui',
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/products:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    const isClientError =
      isNotFound ||
      error.message?.includes('wajib diisi') ||
      error.message?.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui data produk',
      },
      { status: isNotFound ? 404 : isClientError ? 400 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const queryId = request.nextUrl.searchParams.get('id');
    let productId = queryId;

    if (!productId) {
      try {
        const body = await request.json();
        productId = body.id;
      } catch {
        // Body might be empty
      }
    }

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID produk wajib disertakan dalam parameter query (?id=...) atau body',
        },
        { status: 400 }
      );
    }

    const deleteResult = await adminService.deleteProduct(productId);

    return NextResponse.json({
      success: true,
      message: deleteResult.message,
      data: deleteResult,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/products:', error);
    const isNotFound = error.message?.includes('tidak ditemukan');
    const isClientError =
      isNotFound ||
      error.message?.includes('wajib diisi') ||
      error.message?.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghapus produk',
      },
      { status: isNotFound ? 404 : isClientError ? 400 : 500 }
    );
  }
}
