import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product, Sale, Movement, BoxReport } from '../models/caja.models';
import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root'
})
export class CajaService {
    private productsSubject = new BehaviorSubject<Product[]>([]);
    products$ = this.productsSubject.asObservable();

    private movementsSubject = new BehaviorSubject<Movement[]>([]);
    movements$ = this.movementsSubject.asObservable();

    constructor() {
        this.loadInitialData();
    }

    private loadInitialData() {
        // Mock data
        const initialProducts: Product[] = [
            { id: '1', name: 'Agua Mineral', category: 'Articulo', price: 1500, purchasePrice: 500, stock: 50, description: '500ml', isActive: true },
            { id: '2', name: 'Gatorade', category: 'Articulo', price: 2500, purchasePrice: 1000, stock: 30, description: '500ml', isActive: true },
            { id: '3', name: 'Alquiler Paleta', category: 'Concepto', price: 2000, purchasePrice: 0, stock: 10, description: 'Por hora', isActive: true },
            { id: '4', name: 'Alquiler Pelotas', category: 'Concepto', price: 1000, purchasePrice: 0, stock: 100, description: 'Tubo x3', isActive: true }
        ];
        this.productsSubject.next(initialProducts);

        const initialMovements: Movement[] = [
            { id: '1', type: 'Venta', description: 'Venta Agua Mineral x2', amount: 3000, cost: 1000, profit: 2000, date: new Date(), category: 'Venta Producto', paymentMethod: 'Efectivo' },
            { id: '2', type: 'Reserva', description: 'Reserva Cancha 1 - Fútbol 5', amount: 15000, cost: 2000, profit: 13000, date: new Date(), category: 'Reserva Cancha', paymentMethod: 'Mercado Pago' },
            { id: '3', type: 'Reserva', description: 'Reserva Cancha 2 - Padel', amount: 20000, cost: 3000, profit: 17000, date: new Date(), category: 'Reserva Cancha', paymentMethod: 'Efectivo' },
            { id: '4', type: 'Gasto', description: 'Compra de pelotas', amount: 0, cost: 5000, profit: -5000, date: new Date(Date.now() - 86400000), category: 'Insumos', paymentMethod: 'Efectivo' }
        ];
        this.movementsSubject.next(initialMovements);
    }

    // Product Management
    getProducts(): Observable<Product[]> {
        return this.products$;
    }

    addProduct(product: Product) {
        const current = this.productsSubject.value;
        const newProduct = { ...product, id: Date.now().toString() };
        this.productsSubject.next([...current, newProduct]);
    }

    updateProduct(updatedProduct: Product) {
        const current = this.productsSubject.value;
        const updated = current.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        this.productsSubject.next(updated);
    }

    deleteProduct(productId: string) {
        const current = this.productsSubject.value;
        const updated = current.filter(p => p.id !== productId);
        this.productsSubject.next(updated);
    }

    importProductsFromExcel(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                try {
                    const bstr: string = e.target.result;
                    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
                    const wsname: string = wb.SheetNames[0];
                    const ws: XLSX.WorkSheet = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws);

                    // Map fields including new ones
                    const newProducts: Product[] = data.map((row: any, index) => ({
                        id: Date.now().toString() + index,
                        name: row.Nombre || row.name || 'Sin Nombre',
                        category: (row.Categoria === 'Concepto' || row.category === 'Concepto') ? 'Concepto' : 'Articulo',
                        price: Number(row.PrecioVenta || row.price || 0),
                        purchasePrice: Number(row.PrecioCompra || row.purchasePrice || 0),
                        stock: Number(row.Stock || row.stock || 0),
                        description: row.Descripcion || row.description || '',
                        isActive: true // Default to true on import
                    }));

                    const current = this.productsSubject.value;
                    this.productsSubject.next([...current, ...newProducts]);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsBinaryString(file);
        });
    }

    // New helper: Download Template
    downloadImportTemplate() {
        const templateData = [
            {
                Nombre: 'Ejemplo Producto',
                Categoria: 'Articulo',
                PrecioCompra: 100,
                PrecioVenta: 150,
                Stock: 50,
                Descripcion: 'Descripción opcional'
            }
        ];
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(templateData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, 'plantilla_importacion_productos.xlsx');
    }

    // Sales Registration (unchanged)
    registerSale(sale: Sale) {
        // 1. Reduce stock
        const currentProducts = this.productsSubject.value;
        const productIndex = currentProducts.findIndex(p => p.id === sale.productId);

        if (productIndex !== -1) {
            const product = currentProducts[productIndex];
            if (product.stock >= sale.quantity) {
                const updatedProduct = { ...product, stock: product.stock - sale.quantity };
                const updatedProducts = [...currentProducts];
                updatedProducts[productIndex] = updatedProduct;
                this.productsSubject.next(updatedProducts);

                // 2. Register movement
                const movement: Movement = {
                    id: Date.now().toString(),
                    type: 'Venta',
                    description: `Venta ${product.name} x${sale.quantity}`,
                    amount: sale.totalPrice,
                    cost: product.purchasePrice * sale.quantity,
                    profit: sale.totalPrice - (product.purchasePrice * sale.quantity),
                    date: sale.date,
                    category: 'Venta Producto',
                    paymentMethod: sale.paymentMethod
                };
                this.addMovement(movement);
            } else {
                throw new Error('Stock insuficiente');
            }
        } else {
            throw new Error('Producto no encontrado');
        }
    }

    addMovement(movement: Movement) {
        const current = this.movementsSubject.value;
        this.movementsSubject.next([...current, movement]);
    }

    /**
     * Register a reservation movement in the caja report
     * @param reservation - The reservation object
     * @param actionType - 'create' | 'cancel' | 'update'
     * @param previousPrice - For updates, the previous price to calculate the difference
     */
    registerReservationMovement(
        reservation: { id: string; courtName: string; userName: string; price: number; date: string; startTime: string; endTime: string },
        actionType: 'create' | 'cancel' | 'update',
        previousPrice?: number
    ) {
        const reservationDate = new Date(reservation.date + 'T' + reservation.startTime);

        if (actionType === 'create') {
            const movement: Movement = {
                id: Date.now().toString(),
                type: 'Reserva',
                description: `Reserva ${reservation.courtName} - ${reservation.userName} (${reservation.startTime}-${reservation.endTime})`,
                amount: reservation.price,
                cost: 0,
                profit: reservation.price,
                date: reservationDate,
                category: 'Reserva Cancha',
                paymentMethod: 'Pendiente',
                reservationId: reservation.id
            };
            this.addMovement(movement);
        } else if (actionType === 'cancel') {
            const movement: Movement = {
                id: Date.now().toString(),
                type: 'Cancelación',
                description: `Cancelación Reserva ${reservation.courtName} - ${reservation.userName}`,
                amount: -reservation.price,
                cost: 0,
                profit: -reservation.price,
                date: new Date(),
                category: 'Cancelación Reserva',
                reservationId: reservation.id
            };
            this.addMovement(movement);
        } else if (actionType === 'update' && previousPrice !== undefined) {
            const priceDiff = reservation.price - previousPrice;
            if (priceDiff !== 0) {
                const movement: Movement = {
                    id: Date.now().toString(),
                    type: priceDiff > 0 ? 'Reserva' : 'Cancelación',
                    description: `Ajuste Reserva ${reservation.courtName} - ${priceDiff > 0 ? 'Aumento' : 'Reducción'}`,
                    amount: priceDiff,
                    cost: 0,
                    profit: priceDiff,
                    date: new Date(),
                    category: 'Ajuste Reserva',
                    reservationId: reservation.id
                };
                this.addMovement(movement);
            }
        }
    }

    // Reporting (unchanged)
    getReport(startDate?: Date, endDate?: Date): Observable<BoxReport> {
        let movements = this.movementsSubject.value;

        // Apply filters if provided (basic implementation)
        if (startDate && endDate) {
            movements = movements.filter(m => m.date >= startDate && m.date <= endDate);
        }

        const totalSales = movements
            .filter(m => m.type === 'Venta')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalReservations = movements
            .filter(m => m.type === 'Reserva')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalRevenue = movements.reduce((acc, m) => acc + m.amount, 0);
        const totalCost = movements.reduce((acc, m) => acc + (m.cost || 0), 0);
        const netProfit = movements.reduce((acc, m) => acc + (m.profit || 0), 0);

        return of({
            totalSales,
            totalReservations,
            totalRevenue,
            totalCost,
            netProfit,
            movements: movements.sort((a, b) => b.date.getTime() - a.date.getTime()),
            generatedAt: new Date()
        });
    }

    exportReportToExcel() {
        const movements = this.movementsSubject.value;
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(movements);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reporte Caja');
        XLSX.writeFile(wb, `Reporte_Caja_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
}
