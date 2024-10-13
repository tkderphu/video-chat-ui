import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConversationComponent } from './form-conversation.component';

describe('FormConversationComponent', () => {
  let component: FormConversationComponent;
  let fixture: ComponentFixture<FormConversationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormConversationComponent]
    });
    fixture = TestBed.createComponent(FormConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
