import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from './service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private api = inject(ContactService);
  private fb = inject(FormBuilder);

  roles = ['Client', 'Creator', 'Both', 'Other'] as const;
  topics = ['Support', 'Safety / Report', 'Partnerships', 'Press', 'Legal', 'Other'] as const;

  submitting = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['Client', []],
    topic: ['Support', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    agree: [true, [Validators.requiredTrue]],
  });

  get f() { return this.form.controls; }

  async submit() {
    this.submitted.set(true);
    this.errorMsg.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
      this.api.submit(this.form.getRawValue() as any).subscribe();
  }
}
