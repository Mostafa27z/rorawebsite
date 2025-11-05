import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerLayoutComponent } from './inner-layout.component';

describe('InnerLayoutComponent', () => {
  let component: InnerLayoutComponent;
  let fixture: ComponentFixture<InnerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InnerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InnerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
