export interface Product {
    id: string;
    name: string;
    category: 'Concepto' | 'Articulo';
    purchasePrice: number; // Cost price
    price: number; // Sale price
    stock: number;
    description?: string;
    isActive: boolean;
}

export interface Sale {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Mercado Pago';
    date: Date;
}

export interface Movement {
    id: string;
    type: 'Venta' | 'Reserva' | 'Gasto' | 'Cancelación';
    description: string;
    amount: number; // Total Revenue for this item
    cost?: number;  // Total Cost for this item (for profit calculation)
    profit?: number; // amount - cost
    date: Date;
    category: string; // e.g., 'Producto', 'Cancha', 'General'
    paymentMethod?: string;
    reservationId?: string; // For linking to original reservation
}

export interface BoxReport {
    totalSales: number;
    totalReservations: number;
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    movements: Movement[];
    generatedAt: Date;
}
