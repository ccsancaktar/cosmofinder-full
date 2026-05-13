#!/usr/bin/env python3
"""
Fal Uygulaması Backend
Yıldızname ve Rün falı için API sunucusu
"""

from app import app
from config import get_backend_public_url

if __name__ == '__main__':
    print("🚀 Fal Uygulaması Backend başlatılıyor...")
    print(f"📍 API URL: {get_backend_public_url()}")
    print("📋 Endpoint'ler:")
    print("   - POST /api/yildizname")
    print("   - POST /api/rune")
    print("   - GET  /api/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5050, debug=False) 
