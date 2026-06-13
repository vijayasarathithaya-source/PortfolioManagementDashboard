import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  title = input.required<string>();
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');
  loading = input<boolean>(false);
  confirmDisabled = input<boolean>(false);
  showActions = input<boolean>(true);

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    if (!this.confirmDisabled() && !this.loading()) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
