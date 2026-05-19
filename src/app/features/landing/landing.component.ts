import { Component, AfterViewInit, ElementRef, viewChild, viewChildren, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../core/services/auth.service';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <div class="min-h-screen overflow-x-hidden bg-[#F9F9F8]">
      <!-- Header -->
      <header #header class="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center glass">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl">
            <span class="material-symbols-rounded sym-md">grid_view</span>
          </div>
          <span class="text-2xl font-display font-extrabold tracking-tighter text-primary">Vanguard</span>
        </div>
        
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#features" class="hover:text-accent transition-colors">Features</a>
          <a href="#about" class="hover:text-accent transition-colors">About</a>
          <a href="#contact" class="hover:text-accent transition-colors">Contact</a>
        </nav>

        <div class="flex items-center gap-4">
          @if (authService.isAuthenticated()) {
            <a routerLink="/app/dashboard" class="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Dashboard
            </a>
          } @else {
            <a routerLink="/auth/login" class="text-sm font-bold hover:text-accent transition-colors px-4">Sign In</a>
            <a routerLink="/auth/register" class="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Get Started
            </a>
          }
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative pt-40 pb-20 px-8">
        <div class="max-w-7xl mx-auto">
          <div class="grid lg:grid-template-columns-[1.2fr_1fr] gap-16 items-center">
            <div #heroText>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Next-Gen Inventory Solutions
              </div>
              
              <h1 class="text-7xl md:text-8xl font-display font-extrabold leading-[0.9] mb-8 tracking-tighter text-primary">
                Manage your <br/>
                <span class="text-accent underline decoration-accent/20">Inventory</span> <br/>
                with Precision.
              </h1>
              
              <p class="text-xl text-neutral-500 max-w-lg mb-10 leading-relaxed font-medium">
                Vanguard provides a high-performance inventory orchestration platform to track articles, suppliers, and stock movements with real-time intelligence.
              </p>
              
              <div class="flex items-center gap-6">
                <button (click)="scrollToFeatures()" class="group flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-all shadow-2xl hover:shadow-primary/20">
                  Explore Solution
                  <span class="material-symbols-rounded sym-md group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <div class="flex -space-x-4">
                  @for (i of [1,2,3,4]; track i) {
                    <div class="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-neutral-200">
                      <img [src]="'https://i.pravatar.cc/100?u=' + i" alt="User" referrerpolicy="no-referrer">
                    </div>
                  }
                  <div class="w-12 h-12 rounded-full border-4 border-white bg-accent text-white flex items-center justify-center text-xs font-bold">
                    +500
                  </div>
                </div>
              </div>
            </div>

            <div #heroImage class="relative group">
              <div class="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div class="relative bg-white rounded-3xl p-4 shadow-2xl border border-neutral-100 transform group-hover:rotate-1 transition-transform duration-700">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop" 
                     alt="Dashboard Preview" 
                     class="rounded-2xl w-full h-[500px] object-cover shadow-inner"
                     referrerpolicy="no-referrer">
                
                <!-- Floating Mini Widgets -->
                <div class="absolute -left-10 bottom-20 bg-white p-6 rounded-2xl shadow-2xl border border-neutral-100 max-w-[200px] animate-bounce-slow">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <span class="material-symbols-rounded sym-sm">trending_up</span>
                    </div>
                    <span class="text-xs font-bold text-neutral-400 uppercase">Efficiency</span>
                  </div>
                  <div class="text-2xl font-bold text-primary">+24.5%</div>
                </div>

                <div class="absolute -right-6 top-20 bg-white p-6 rounded-2xl shadow-2xl border border-neutral-100 animate-float-slow">
                   <div class="flex items-center gap-2">
                     @for (i of [1,2,3]; track i) {
                       <div class="w-2 h-8 rounded-full bg-neutral-100 overflow-hidden">
                         <div class="w-full bg-accent rounded-full transition-all duration-1000" [style.height.%]="20 + (i * 20)"></div>
                       </div>
                     }
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-32 px-8 bg-white border-y border-neutral-100">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-20 px-4">
            <h2 class="text-5xl md:text-6xl font-display font-extrabold mb-6 tracking-tighter">Built for High-Growth Teams</h2>
            <p class="text-lg text-neutral-500 max-w-2xl mx-auto font-medium">Everything you need to scale your supply chain without the complexity.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            @for (feature of features; track feature.title) {
              <div #featureCard class="p-10 rounded-3xl bg-[#F9F9F8] border border-neutral-100 hover:border-accent/40 transition-all hover:shadow-2xl group">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent group-hover:text-white transition-all">
                  <span class="material-symbols-rounded sym-xl">{{ feature.icon }}</span>
                </div>
                <h3 class="text-2xl font-bold mb-4 font-display">{{ feature.title }}</h3>
                <p class="text-neutral-500 font-medium leading-relaxed">{{ feature.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Solutions Display -->
      <section id="about" class="py-32 px-8 overflow-hidden">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div #aboutImage class="relative">
             <div class="aspect-square bg-primary rounded-full absolute -top-20 -left-20 w-[600px] h-[600px] opacity-[0.02]"></div>
             <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop" 
                  alt="Analytics" 
                  class="relative rounded-[40px] w-full shadow-2xl z-10"
                  referrerpolicy="no-referrer">
          </div>
          <div #aboutText>
            <h2 class="text-5xl font-display font-extrabold mb-8 leading-[0.9] tracking-tighter">Actionable insights at your fingertips.</h2>
            <div class="space-y-8">
              @for (item of aboutItems; track item.title) {
                <div class="flex gap-6 items-start">
                  <div class="w-12 h-12 rounded-xl bg-accent/10 text-accent flex-shrink-0 flex items-center justify-center">
                    <span class="material-symbols-rounded sym-md">{{ item.icon }}</span>
                  </div>
                  <div>
                    <h4 class="text-xl font-bold mb-2 font-display">{{ item.title }}</h4>
                    <p class="text-neutral-500 font-medium">{{ item.desc }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="py-32 px-8 bg-primary rounded-[60px] mx-8 mb-8 text-white relative overflow-hidden text-center">
          <div class="absolute inset-0 bg-gradient-to-b from-accent/20 to-transparent opacity-20"></div>
          <div #contactContent class="relative z-10 max-w-4xl mx-auto">
            <h2 class="text-6xl md:text-7xl font-display font-extrabold mb-8 tracking-tighter">Ready to scale?</h2>
            <p class="text-xl text-white/60 mb-12 max-w-xl mx-auto">Join the premium businesses managing their inventory with Vanguard.</p>
            
            <div class="flex flex-col md:flex-row items-center justify-center gap-6">
              <a routerLink="/auth/register" class="w-full md:w-auto px-10 py-5 bg-white text-primary rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-xl">
                Get Started Now
              </a>
              <button class="w-full md:w-auto px-10 py-5 bg-white/10 text-white rounded-2xl font-bold text-xl border border-white/20 hover:bg-white/20 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
      </section>

      <!-- Footer -->
      <footer class="py-20 px-8">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div class="flex items-center gap-2 mb-6">
               <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-md">
                <span class="material-symbols-rounded sym-sm">grid_view</span>
              </div>
              <span class="text-xl font-display font-extrabold tracking-tighter text-primary">Vanguard</span>
            </div>
            <p class="text-neutral-400 font-medium max-w-xs text-sm">Empowering modern businesses with precision inventory control.</p>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h5 class="text-sm font-bold uppercase tracking-widest mb-6 opacity-40">Product</h5>
              <ul class="space-y-4 text-sm font-medium text-neutral-500">
                <li><a href="#" class="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="#" class="hover:text-primary transition-colors">Alerts</a></li>
                <li><a href="#" class="hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h5 class="text-sm font-bold uppercase tracking-widest mb-6 opacity-40">Company</h5>
              <ul class="space-y-4 text-sm font-medium text-neutral-500">
                <li><a href="#" class="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" class="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" class="hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>
            <div class="col-span-2 md:col-span-1">
              <h5 class="text-sm font-bold uppercase tracking-widest mb-6 opacity-40">Legal</h5>
              <ul class="space-y-4 text-sm font-medium text-neutral-500">
                <li><a href="#" class="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" class="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="max-w-7xl mx-auto mt-20 pt-8 border-t border-neutral-100 flex justify-between items-center text-xs font-bold text-neutral-400 uppercase tracking-widest">
          <span>&copy; 2024 Vanguard Inc. All Rights Reserved.</span>
          <div class="flex gap-6">
            <a href="#" class="hover:text-primary">Twitter</a>
            <a href="#" class="hover:text-primary">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-bounce-slow { animation: bounce 3s infinite; }
    .animate-float-slow { animation: float 6s ease-in-out infinite; }
    @keyframes bounce {
      0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
      50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    }
  `],
  host: {
    class: 'block'
  }
})
export class LandingComponent implements AfterViewInit {
  public authService = inject(AuthService);
  private header = viewChild<ElementRef>('header');
  private heroText = viewChild<ElementRef>('heroText');
  private heroImage = viewChild<ElementRef>('heroImage');
  private featureCards = viewChildren<ElementRef>('featureCard');
  private aboutText = viewChild<ElementRef>('aboutText');
  private aboutImage = viewChild<ElementRef>('aboutImage');
  private contactContent = viewChild<ElementRef>('contactContent');

  features = [
    { icon: 'bolt', title: 'Real-time Sync', desc: 'Every stock movement is tracked instantly across all your connected locations.' },
    { icon: 'notifications_active', title: 'Smart Alerts', desc: 'Get AI-driven notifications when stock levels are low or deliveries are delayed.' },
    { icon: 'bar_chart', title: 'Deep Analytics', desc: 'Powerful reporting tools to help you identify trends and optimize your inventory.' }
  ];

  aboutItems = [
    { icon: 'shield', title: 'Enterprise Security', desc: 'Your data is protected with industry-standard encryption and security protocols.' },
    { icon: 'api', title: 'Flexible API', desc: 'Integrate with your existing ERP, CRM, or POS systems with our robust OpenAPI.' },
    { icon: 'speed', title: 'High Performance', desc: 'Optimized for speed, Vanguard handles thousands of entries without breaking a sweat.' }
  ];

  ngAfterViewInit() {
    this.animateHero();
    this.animateFeatures();
    this.animateAbout();
    this.animateContact();
  }

  private animateHero() {
    const tl = gsap.timeline();
    
    tl.from(this.header()?.nativeElement, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: 'power4.out'
    });

    tl.from(this.heroText()!.nativeElement.children, {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out'
    }, "-=0.5");

    tl.from(this.heroImage()!.nativeElement, {
      x: 100,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out'
    }, "-=1.2");
  }

  private animateFeatures() {
    gsap.from(this.featureCards().map((c: ElementRef) => c.nativeElement), {
      scrollTrigger: {
        trigger: '#features',
        start: 'top 80%'
      },
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }

  private animateAbout() {
    gsap.from(this.aboutImage()!.nativeElement, {
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%'
      },
      x: -100,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out'
    });

    gsap.from(this.aboutText()!.nativeElement.children, {
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%'
      },
      x: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power3.out'
    });
  }

  private animateContact() {
    gsap.from(this.contactContent()!.nativeElement.children, {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }

  scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
