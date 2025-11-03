import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  submitted = false;

  contactInfo = [
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      content: 'hello@rorastore.com',
      link: 'mailto:hello@rorastore.com'
    },
    {
      icon: 'fa-phone',
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    // {
    //   icon: 'fa-map-marker-alt',
    //   title: 'Visit Us',
    //   content: '123 Beauty Lane, Style City',
    //   link: '#'
    // }
  ];

  socialMedia = [
    { icon: 'fa-brands fa-instagram', link: '#', color: '#E4405F' },
    { icon: 'fa-brands fa-facebook', link: '#', color: '#1877F2' },
    { icon: 'fa-brands fa-tiktok', link: '#', color: '#000000' },
    { icon: 'fa-brands fa-pinterest', link: '#', color: '#E60023' }
  ];

  onSubmit() {
    if (this.formData.name && this.formData.email && this.formData.message) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
        this.formData = { name: '', email: '', subject: '', message: '' };
      }, 3000);
    }
  }
}