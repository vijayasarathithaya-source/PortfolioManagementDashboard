import { Component, input, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements ControlValueAccessor, OnInit {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  errorMsg = input<string>('');
  icon = input<string>('');
  hint = input<string>('');
  control = input<FormControl>(new FormControl());

  value: any = '';
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.control().statusChanges.subscribe(() => {
      if (this.control().touched) {
        this.onTouched();
      }
    });
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
    if (this.control()) {
      this.control().setValue(val, { emitEvent: false });
    }
  }

  writeValue(value: any): void {
    this.value = value;
    if (this.control() && this.control().value !== value) {
      this.control().setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.control()) {
      if (isDisabled) {
        this.control().disable({ emitEvent: false });
      } else {
        this.control().enable({ emitEvent: false });
      }
    }
  }
}
