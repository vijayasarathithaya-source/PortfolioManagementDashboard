import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  color = input<'primary' | 'accent' | 'warn' | 'basic'>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'raised' | 'flat' | 'stroked' | 'basic' | 'icon'>('raised');
  disabled = input<boolean>(false);
  icon = input<string>('');
  loading = input<boolean>(false);

  btnClick = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.btnClick.emit(event);
    }
  }
}
