import { NextRequest, NextResponse } from 'next/server';
import { updateCartItemSchema } from '@/server/validators/cart.schema';
import { cartService } from '@/server/services/cart.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item ID keranjang wajib disertakan',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = updateCartItemSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kuantitas tidak valid',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const updatedItem = await cartService.updateQuantity(itemId, parseResult.data.quantity);

    return NextResponse.json({
      success: true,
      message: 'Jumlah produk berhasil diperbarui',
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/cart/[itemId]:', error);
    const isClientError =
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('melebihi stok') ||
      error.message?.includes('minimal') ||
      error.message?.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui jumlah produk',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;

    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item ID keranjang wajib disertakan',
        },
        { status: 400 }
      );
    }

    const result = await cartService.removeItem(itemId);

    return NextResponse.json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/cart/[itemId]:', error);
    const isClientError =
      error.message?.includes('tidak ditemukan') ||
      error.message?.includes('tidak valid');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghapus item dari keranjang',
      },
      { status: isClientError ? 400 : 500 }
    );
  }
}
