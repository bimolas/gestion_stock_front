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
    <div class="min-h-screen bg-[#F9F9F8] flex items-center justify-center p-6">
      <div class="w-full max-w-md">

        <!-- Logo -->
        <div class="flex items-center gap-3 mb-12 justify-center">
          <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <span class="material-symbols-rounded">grid_view</span>
          </div>
          <span class="text-3xl font-display font-extrabold tracking-tighter text-primary">Vanguard</span>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-[3rem] p-10 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] shadow-xl">
          <div class="mb-10">
            <h1 class="text-4xl font-display font-extrabold tracking-tighter text-primary leading-none">Create account</h1>
            <p class="text-neutral-400 font-medium text-sm mt-3 uppercase tracking-widest">Join your inventory workspace</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">

            <!-- Username -->
            <div class="group space-y-2">
              <label class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Username</label>
              <div class="relative flex items-center">
                <span class="material-symbols-rounded absolute left-5 text-neutral-300 group-focus-within:text-primary transition-colors z-10 pointer-events-none">person</span>
                <input
                  type="text"
                  formControlName="userName"
                  placeholder="Choose a username"
                  class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl pl-14 pr-5 py-4 font-bold text-primary placeholder:text-neutral-300 placeholder:font-medium focus:outline-none focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 transition-all"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="group space-y-2">
              <label class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
                Email <span class="text-neutral-300 normal-case font-medium tracking-normal">(optional)</span>
              </label>
              <div class="relative flex items-center">
                <span class="material-symbols-rounded absolute left-5 text-neutral-300 group-focus-within:text-primary transition-colors z-10 pointer-events-none">mail</span>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="your@email.com"
                  class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl pl-14 pr-5 py-4 font-bold text-primary placeholder:text-neutral-300 placeholder:font-medium focus:outline-none focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 transition-all"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="group space-y-2">
              <label class="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Password</label>
              <div class="relative flex items-center">
                <span class="material-symbols-rounded absolute left-5 text-neutral-300 group-focus-within:text-primary transition-colors z-10 pointer-events-none">lock</span>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full bg-[#F9F9F8] border border-neutral-100 rounded-2xl pl-14 pr-14 py-4 font-bold text-primary placeholder:text-neutral-300 placeholder:font-medium focus:outline-none focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 transition-all"
                />
                <button type="button" (click)="showPassword.update(v => !v)"
                  class="absolute right-5 text-neutral-300 hover:text-primary transition-colors z-10">
                  <span class="material-symbols-rounded text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                <span class="material-symbols-rounded text-sm shrink-0">error_outline</span>
                {{ error() }}
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading()"
              class="w-full py-5 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest mt-2">
              @if (isLoading()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account...
              } @else {
                <span class="material-symbols-rounded">person_add</span>
                Create Account
              }
            </button>

          </form>
        </div>

        <!-- Footer link -->
        <p class="text-center text-sm text-neutral-400 font-medium mt-8">
          Already have an account?
          <a routerLink="/auth/login" class="font-bold text-primary hover:text-accent transition-colors ml-1">Sign in</a>
        </p>

      </div>
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
    email: [''],
    password: ['', Validators.required]
  });

  isLoading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);
      const { userName, email, password } = this.registerForm.value;
      this.authService.register({ userName: userName!, email: email ?? '', password: password!, role: 'User' }).subscribe({
        next: () => this.router.navigate(['/app/dashboard']),
        error: (err) => {
          const msg = err?.error?.accessToken;
          this.error.set(msg === 'Username is already taken!' ? 'That username is already taken.' : 'Registration failed. Please try again.');
          this.isLoading.set(false);
        }
      });
    }
  }
}
