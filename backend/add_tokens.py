#!/usr/bin/env python3
"""
Token ekleme script'i - belirli bir kullanıcıya token eklemek için
Kullanım: python3 add_tokens.py
"""

import sys
from models import User, TokenTransaction, db
from datetime import datetime

def add_tokens_to_user(email, token_amount):
    """Kullanıcıya token ekle"""
    try:
        # Email ile kullanıcıyı bul
        user = User.find_by_email(email)
        
        if not user:
            print(f"❌ Hata: '{email}' email'li kullanıcı bulunamadı")
            return False
        
        print(f"✓ Kullanıcı bulundu: {user.username} ({user.email})")
        print(f"  Mevcut bakiye: {user.get_token_balance()} token")
        
        # Token transaction oluştur
        transaction = TokenTransaction(
            user_id=str(user._id),
            transaction_type='admin_bonus',
            amount=token_amount,
            description=f"Admin tarafından {token_amount} token bonus eklendi"
        )
        transaction.save()
        
        print(f"✓ Transaction kaydedildi")
        
        # Kullanıcının bakiyesini güncelle
        user.update_token_balance()
        new_balance = user.get_token_balance()
        
        print(f"✓ Token eklendi!")
        print(f"  Yeni bakiye: {new_balance} token")
        print(f"  Eklenen miktar: {token_amount} token")
        
        return True
        
    except Exception as e:
        print(f"❌ Hata oluştu: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    email = "newuser123@example.com"
    token_amount = 1000
    
    print(f"\n{'='*50}")
    print(f"Token Ekleme Script'i")
    print(f"{'='*50}\n")
    
    print(f"Email: {email}")
    print(f"Eklenecek Token: {token_amount}\n")
    
    success = add_tokens_to_user(email, token_amount)
    
    if success:
        print(f"\n✓ İşlem başarılı!")
    else:
        print(f"\n❌ İşlem başarısız!")
    
    print(f"{'='*50}\n")
