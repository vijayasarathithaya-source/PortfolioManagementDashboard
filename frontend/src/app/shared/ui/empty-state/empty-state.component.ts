import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, ButtonComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  icon = input<string>('folder_open');
  title = input<string>('No Data Available');
  description = input<string>('There are no items to show at the moment.');
  buttonText = input<string | undefined>();
  action = output<void>();

  onAction(): void {
    this.action.emit();
  }
}

