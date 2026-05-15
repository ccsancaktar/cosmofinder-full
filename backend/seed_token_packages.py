#!/usr/bin/env python3
"""
Token paketleri için seed data
"""

from models import db, TokenPackage
from config import load_environment

load_environment()

def seed_token_packages():
    """Token paketlerini veritabanına ekle"""
    
    packages = [
        {
            'name': 'Başlangıç Paketi',
            'token_amount': 40,
            'price': 79.99,
            'description': 'İlk fal paketin için ideal başlangıç'
        },
        {
            'name': 'Popüler Paket',
            'token_amount': 90,
            'price': 149.99,
            'description': 'En çok tercih edilen dengeli paket'
        },
        {
            'name': 'Avantaj Paketi',
            'token_amount': 160,
            'price': 249.99,
            'description': 'Daha fazla fal ve daha iyi token oranı'
        },
        {
            'name': 'Efsane Paket',
            'token_amount': 300,
            'price': 449.99,
            'description': 'En güçlü değer paketi, uzun kullanım için'
        }
    ]

    # Eski paketleri görünmez yap, yeni seti tekrar aktifleştir.
    db.token_packages.update_many({}, {'$set': {'is_active': False}})

    for package_data in packages:
        existing = db.token_packages.find_one({
            'name': package_data['name']
        })
        
        if existing:
            db.token_packages.update_one(
                {'_id': existing['_id']},
                {
                    '$set': {
                        'token_amount': package_data['token_amount'],
                        'price': package_data['price'],
                        'description': package_data['description'],
                        'is_active': True,
                    }
                }
            )
            print(f"Paket güncellendi: {package_data['name']}")
        else:
            package = TokenPackage(
                name=package_data['name'],
                token_amount=package_data['token_amount'],
                price=package_data['price'],
                description=package_data['description']
            )
            package.save()
            print(f"Paket eklendi: {package_data['name']}")

if __name__ == '__main__':
    print("Token paketleri ekleniyor...")
    seed_token_packages()
    print("Token paketleri eklendi!")
