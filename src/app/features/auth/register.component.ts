import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      <h2 class="text-2xl font-medium text-white mb-6">Sign Up</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <div>
          <label for="userName" class="block text-sm font-medium text-neutral-300 mb-2">Username</label>
          <input 
            id="userName"
            type="text" 
            formControlName="userName"
            class="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-neutral-300 mb-2">Password</label>
          <input 
            id="password"
            type="password" 
            formControlName="password"
            class="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            placeholder="••••••••"
          />
        </div>

        <div>
           <label for="email" class="block text-sm font-medium text-neutral-300 mb-2">Email (Optional)</label>
           <input 
             id="email"
             type="email" 
             formControlName="email"
             class="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
             placeholder="your@email.com"
           />
        </div>

        <button 
          type="submit" 
          [disabled]="registerForm.invalid || isLoading()"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading() ? 'Signing up...' : 'Sign Up' }}
        </button>

        <div class="mt-4 text-center">
            <span class="text-sm text-neutral-400">Already have an account? </span>
            <a routerLink="/auth/login" class="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</a>
        </div>

        @if (error()) {
        <div class="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {{ error() }}
        </div>
        }
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
    email: ['']
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);
      
      this.authService.register(this.registerForm.value as Record<string, string>).subscribe({
        next: () => {
          this.router.navigate(['/app/dashboard']);
        },
        error: () => {
          this.error.set('Registration failed. Please try again.');
          this.isLoading.set(false);
        }
      });
    }
  }
}
