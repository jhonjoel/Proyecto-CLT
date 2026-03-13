import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '@core';
import type { CreateOrderRequest, Order } from '@shared/models/order.model';
import { getErrorMessage } from '@shared/models/api-error.model';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

export interface OrdersFormularioModalData {
  isModal?: boolean;
  /** Si se proporciona, abre en modo edición (PUT en lugar de POST). */
  order?: Order;
}

@Component({
  selector: 'app-orders-formulario',
  standalone: true,
  host: {
    '[class.nuevo-pedido-modal-host]': 'data?.isModal',
  },
  imports: [
    CommonModule,
    MatButtonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    BreadcrumbComponent,
  ],
  templateUrl: './orders-formulario.component.html',
  styleUrls: ['./orders-formulario.component.scss'],
})
export class OrdersFormularioComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    @Optional() public dialogRef: MatDialogRef<OrdersFormularioComponent> | null,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: OrdersFormularioModalData | null
  ) {
    this.form = this.fb.group({
      clienteNombre: ['', [Validators.required, Validators.minLength(2)]],
      items: this.fb.array([this.crearItemGroup()], [Validators.required, Validators.minLength(1)]),
    });
    if (data?.order) {
      this.form.patchValue({ clienteNombre: data.order.clienteNombre });
      this.items.clear();
      data.order.items.forEach((it) => {
        this.items.push(
          this.fb.group({
            descripcion: [it.descripcion, Validators.required],
            cantidad: [it.cantidad, [Validators.required, Validators.min(1)]],
            precioUnitario: [it.precioUnitario, [Validators.required, Validators.min(0)]],
          })
        );
      });
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  getSubtotal(index: number): number {
    const item = this.items.at(index)?.value;
    if (!item) return 0;
    const c = Number(item.cantidad) || 0;
    const p = Number(item.precioUnitario) || 0;
    return c * p;
  }

  get totalOrder(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.getSubtotal(i), 0);
  }

  get itemsCount(): number {
    return this.items.length;
  }

  get cantTotal(): number {
    return this.items.controls.reduce((sum, c) => sum + (Number(c.value?.cantidad) || 0), 0);
  }

  private crearItemGroup(): FormGroup {
    return this.fb.group({
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarItem(): void {
    this.items.push(this.crearItemGroup());
  }

  quitarItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    const token = this.authService.getAccessToken();
    if (!token) {
      this.errorMessage = 'Sesión expirada. Redirigiendo a login…';
      this.authService.logout();
      this.router.navigate(['/auth/login']);
      return;
    }

    const value = this.form.getRawValue();
    const body: CreateOrderRequest = {
      clienteNombre: value.clienteNombre.trim(),
      items: value.items.map((item: { descripcion: string; cantidad: number; precioUnitario: number }) => {
        const cantidad = Number(item.cantidad) || 0;
        const precioUnitario = Number(item.precioUnitario) || 0;
        return {
          id: 0,
          descripcion: item.descripcion.trim(),
          cantidad,
          precioUnitario,
          subtotal: cantidad * precioUnitario,
        };
      }),
    };

    this.loading = true;
    this.errorMessage = '';
    const isEdit = !!this.data?.order;
    const request$ = isEdit
      ? this.orderService.update(this.data!.order!.id, body)
      : this.orderService.create(body);
    request$.subscribe({
      next: (order: Order) => {
        this.loading = false;
        if (this.dialogRef && this.data?.isModal) {
          this.dialogRef.close(order);
        } else {
          this.router.navigate(['/orders', order.id]);
        }
      },
      error: (err: { status?: number; error?: unknown; message?: string }) => {
        this.loading = false;
        if (err?.status === 403 || err?.status === 401) {
          this.errorMessage = 'No autorizado. Inicie sesión de nuevo.';
        } else {
          this.errorMessage = getErrorMessage(err, isEdit ? 'Error al actualizar la orden.' : 'Error al crear la orden.');
        }
      },
    });
  }
}
