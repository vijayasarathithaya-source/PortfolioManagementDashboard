import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typography.component.html',
  styleUrl: './typography.component.scss',
})
export class TypographyComponent {
  variant = input<
    'display-1' | 'display-2' | 'h1' | 'h2' | 'h3' | 'subtitle-1' | 'subtitle-2' | 'body-1' | 'body-2' | 'caption'
  >('body-1');
  color = input<'primary' | 'secondary' | 'muted' | 'success' | 'danger' | 'warning'>('primary');
}
