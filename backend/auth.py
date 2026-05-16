from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Reading
from datetime import datetime, timedelta
from tokens import add_registration_bonus
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests as http_requests
import jwt
import os
import re
import secrets
from rate_limiting import limiter

from config import get_backend_public_url, load_environment

load_environment()

auth_bp = Blueprint('auth', __name__)

# Google OAuth konfigürasyonu
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv(
    'GOOGLE_REDIRECT_URI',
    f"{get_backend_public_url()}/api/auth/google/callback"
)
APPLE_APP_ID = os.getenv('APPLE_APP_ID', 'com.cosmofinder.app')
APPLE_SERVICE_ID = os.getenv('APPLE_SERVICE_ID', '')
APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys'


def get_allowed_apple_audiences():
    audiences = {APPLE_APP_ID}
    if APPLE_SERVICE_ID:
        audiences.add(APPLE_SERVICE_ID)
    return {aud for aud in audiences if aud}


def fetch_apple_public_keys():
    response = http_requests.get(APPLE_KEYS_URL, timeout=10)
    response.raise_for_status()
    payload = response.json()
    return payload.get('keys', [])


def verify_apple_identity_token(identity_token):
    if not identity_token:
        raise ValueError('Apple identity token gereklidir')

    header = jwt.get_unverified_header(identity_token)
    key_id = header.get('kid')
    algorithm = header.get('alg', 'RS256')

    apple_keys = fetch_apple_public_keys()
    public_key = None
    for jwk in apple_keys:
        if jwk.get('kid') == key_id:
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
            break

    if public_key is None:
        raise ValueError('Apple public key bulunamadi')

    return jwt.decode(
        identity_token,
        public_key,
        algorithms=[algorithm],
        audience=list(get_allowed_apple_audiences()),
        issuer='https://appleid.apple.com',
    )

def validate_email(email):
    """Email formatını kontrol et"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Şifre güvenliğini kontrol et"""
    if len(password) < 8:
        return False, "Şifre en az 8 karakter olmalıdır"
    if not re.search(r'[A-Z]', password):
        return False, "Şifre en az bir büyük harf içermelidir"
    if not re.search(r'[a-z]', password):
        return False, "Şifre en az bir küçük harf içermelidir"
    if not re.search(r'\d', password):
        return False, "Şifre en az bir rakam içermelidir"
    return True, "Şifre güvenli"


def generate_unique_username(email, first_name=""):
    base_source = first_name.strip() or email.split('@')[0]
    normalized = re.sub(r'[^a-zA-Z0-9_]+', '_', base_source.lower()).strip('_')
    username = normalized[:24] if normalized else 'user'

    if len(username) < 3:
        username = f"user_{username}".strip('_')

    candidate = username
    counter = 1
    while User.find_by_username(candidate):
        suffix = f"_{counter}"
        candidate = f"{username[:max(3, 24 - len(suffix))]}{suffix}"
        counter += 1

    return candidate


def build_display_name(user):
    return (user.first_name or '').strip() or user.username or user.email


def create_password_reset_token(user_id, expires_minutes=30):
    token = secrets.token_urlsafe(32)
    now = datetime.now()
    db.password_reset_tokens.insert_one({
        'user_id': str(user_id),
        'token': token,
        'created_at': now,
        'expires_at': now + timedelta(minutes=expires_minutes),
        'used': False,
    })
    return token


def consume_password_reset_token(token):
    reset_doc = db.password_reset_tokens.find_one({
        'token': token,
        'used': False,
    })

    if not reset_doc:
        return None, 'Geçersiz veya kullanılmış sıfırlama bağlantısı'

    expires_at = reset_doc.get('expires_at')
    if not expires_at or expires_at < datetime.now():
        return None, 'Şifre sıfırlama bağlantısının süresi dolmuş'

    db.password_reset_tokens.update_one(
        {'_id': reset_doc['_id']},
        {'$set': {'used': True, 'used_at': datetime.now()}}
    )
    return reset_doc, None

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Gerekli alanları kontrol et
        required_fields = ['email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} alanı gereklidir'}), 400
        
        # Email formatını kontrol et
        if not validate_email(data['email']):
            return jsonify({'error': 'Geçersiz email formatı'}), 400
        
        if User.find_by_email(data['email']):
            return jsonify({'error': 'Bu email adresi zaten kayıtlı'}), 400

        valid_password, password_message = validate_password(data['password'])
        if not valid_password:
            return jsonify({'error': password_message}), 400

        username = generate_unique_username(data['email'], data.get('first_name', ''))
        
        # Yeni kullanıcı oluştur
        user = User(
            username=username,
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            birth_date=datetime.strptime(data['birth_date'], '%Y-%m-%d').date() if data.get('birth_date') else None,
            birth_time=datetime.strptime(data['birth_time'], '%H:%M').time() if data.get('birth_time') else None,
            birth_place=data.get('birth_place'),
            stripe_customer_id=None,  # Yeni kullanıcılar için None olarak başlat
            onboarding_completed=False,
        )
        user.set_password(data['password'])
        
        # Burç hesapla
        if data.get('birth_date'):
            user.zodiac_sign = calculate_zodiac_sign(data['birth_date'])
        
        # Çin elementi hesapla (sadece doğum tarihi ile)
        if data.get('birth_date'):
            user.chinese_element = calculate_chinese_element(data['birth_date'], None)
        
        user.save()
        
        # Kayıt bonusu ver
        add_registration_bonus(str(user._id))
        
        # JWT token oluştur
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=timedelta(days=30)
        )
        
        user_dict = user.to_dict()
        # Frontend için 'name' field'ı ekle
        user_dict['name'] = build_display_name(user)
        
        return jsonify({
            'message': 'Kullanıcı başarıyla oluşturuldu',
            'user': user_dict,
            'token': access_token
        }), 201
        
    except Exception as e:
        # MongoDB'de session rollback yok, sadece log yazalım
        current_app.logger.error(f'Kayıt hatası: {str(e)}')
        return jsonify({'error': f'Kayıt hatası: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Kullanıcı adı ve şifre gereklidir'}), 400
        
        # Kullanıcıyı bul (username veya email ile)
        user = User.find_by_username(data['username'])
        if not user:
            user = User.find_by_email(data['username'])
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Geçersiz kullanıcı adı veya şifre'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Hesabınız aktif değil'}), 401
        
        # JWT token oluştur
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=timedelta(days=30)
        )
        
        user_dict = user.to_dict()
        # Frontend için 'name' field'ı ekle
        user_dict['name'] = build_display_name(user)
        
        return jsonify({
            'message': 'Giriş başarılı',
            'user': user_dict,
            'token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Giriş hatası: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
@limiter.exempt
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
        
        # Fal geçmişi sayısını al
        readings = Reading.find_by_user_id(str(user._id))
        total_readings = len(readings)
        
        user_dict = user.to_dict()
        # Frontend için 'name' field'ı ekle
        user_dict['name'] = build_display_name(user)
        
        return jsonify({
            'user': user_dict,
            'statistics': {
                'total_readings': total_readings,
                'days_registered': (datetime.now() - user.created_at).days if user.created_at else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Profil hatası: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
        
        data = request.get_json()
        
        # Güncellenebilir alanlar
        updatable_fields = [
            'first_name', 'profile_image',
            'birth_date', 'birth_time', 'birth_place',
            'theme', 'language', 'notifications_enabled', 'privacy_level',
            'onboarding_completed',
        ]
        
        for field in updatable_fields:
            if field in data:
                if field == 'birth_date' and data[field]:
                    user.birth_date = datetime.strptime(data[field], '%Y-%m-%d').date()
                elif field == 'birth_time' and data[field]:
                    user.birth_time = datetime.strptime(data[field], '%H:%M').time()
                else:
                    setattr(user, field, data[field])
        
        # Burç ve element yeniden hesapla
        if data.get('birth_date'):
            user.zodiac_sign = calculate_zodiac_sign(data['birth_date'])
            user.chinese_element = calculate_chinese_element(data['birth_date'], None)
        
        user.save()
        
        user_dict = user.to_dict()
        # Frontend için 'name' field'ı ekle
        user_dict['name'] = build_display_name(user)
        
        return jsonify({
            'message': 'Profil güncellendi',
            'user': user_dict
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Güncelleme hatası: {str(e)}'}), 500

@auth_bp.route('/upload-profile-image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

        data = request.get_json() or {}
        profile_image = data.get('profile_image')

        if not profile_image:
            return jsonify({'error': 'Profil resmi gereklidir'}), 400

        user.profile_image = profile_image
        user.save()

        user_dict = user.to_dict()
        user_dict['name'] = build_display_name(user)

        return jsonify({
            'success': True,
            'message': 'Profil resmi güncellendi',
            'profile_image': profile_image,
            'user': user_dict
        }), 200
    except Exception as e:
        return jsonify({'error': f'Profil resmi yükleme hatası: {str(e)}'}), 500

@auth_bp.route('/delete-profile-image', methods=['DELETE'])
@jwt_required()
def delete_profile_image():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)

        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

        user.profile_image = None
        user.save()

        user_dict = user.to_dict()
        user_dict['name'] = build_display_name(user)

        return jsonify({
            'success': True,
            'message': 'Profil resmi silindi',
            'user': user_dict
        }), 200
    except Exception as e:
        return jsonify({'error': f'Profil resmi silme hatası: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
        
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Mevcut şifre ve yeni şifre gereklidir'}), 400
        
        # Mevcut şifreyi kontrol et
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Mevcut şifre yanlış'}), 400
        
        # Yeni şifre güvenliğini kontrol et
        is_valid, message = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Şifreyi güncelle
        user.set_password(data['new_password'])
        user.save()
        
        return jsonify({'message': 'Şifre başarıyla değiştirildi'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Şifre değiştirme hatası: {str(e)}'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()

        if not email:
            return jsonify({'error': 'E-posta adresi gereklidir'}), 400

        if not validate_email(email):
            return jsonify({'error': 'Geçersiz email formatı'}), 400

        user = User.find_by_email(email)
        response_payload = {
            'message': 'Eğer bu e-posta adresiyle bir hesap varsa, şifre sıfırlama bağlantısı gönderilecektir.'
        }

        if not user:
            return jsonify(response_payload), 200

        token = create_password_reset_token(user._id)
        reset_link = f"{get_backend_public_url()}/reset-password?token={token}"

        current_app.logger.info(
            'Password reset requested for %s. Reset link: %s',
            email,
            reset_link,
        )

        if current_app.debug or os.getenv('FLASK_ENV') == 'development':
            response_payload['debug_reset_token'] = token
            response_payload['debug_reset_link'] = reset_link

        return jsonify(response_payload), 200
    except Exception as e:
        current_app.logger.error(f'Şifre sıfırlama isteği hatası: {str(e)}')
        return jsonify({'error': f'Şifre sıfırlama isteği hatası: {str(e)}'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json() or {}
        token = (data.get('token') or '').strip()
        new_password = data.get('new_password') or ''

        if not token or not new_password:
            return jsonify({'error': 'Token ve yeni şifre gereklidir'}), 400

        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': message}), 400

        reset_doc, token_error = consume_password_reset_token(token)
        if token_error:
            return jsonify({'error': token_error}), 400

        user = User.find_by_id(reset_doc['user_id'])
        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

        user.set_password(new_password)
        user.save()

        return jsonify({'message': 'Şifren başarıyla sıfırlandı'}), 200
    except Exception as e:
        current_app.logger.error(f'Şifre sıfırlama hatası: {str(e)}')
        return jsonify({'error': f'Şifre sıfırlama hatası: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        # JWT token'ı blacklist'e eklenebilir (opsiyonel)
        return jsonify({'message': 'Başarıyla çıkış yapıldı'}), 200
    except Exception as e:
        return jsonify({'error': f'Çıkış hatası: {str(e)}'}), 500

def calculate_zodiac_sign(birth_date_str):
    """Doğum tarihine göre burç hesapla"""
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        month = birth_date.month
        day = birth_date.day
        
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return 'Koç'
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return 'Boğa'
        elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
            return 'İkizler'
        elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
            return 'Yengeç'
        elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
            return 'Aslan'
        elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
            return 'Başak'
        elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
            return 'Terazi'
        elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
            return 'Akrep'
        elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
            return 'Yay'
        elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
            return 'Oğlak'
        elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
            return 'Kova'
        else:
            return 'Balık'
    except:
        return None

def calculate_chinese_element(birth_date_str, birth_time_str):
    """Doğum tarihi ve saatine göre Çin elementi hesapla"""
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
        
        # Çin takvimine göre element hesaplama (yıl elementine göre)
        year = birth_date.year
        
        # 5 element döngüsü: Metal, Su, Ağaç, Ateş, Toprak
        # Çin takviminde elementler 2 yıllık döngüler halinde değişir
        if year % 10 == 0 or year % 10 == 1:
            return 'Metal'
        elif year % 10 == 2 or year % 10 == 3:
            return 'Su'
        elif year % 10 == 4 or year % 10 == 5:
            return 'Ağaç'
        elif year % 10 == 6 or year % 10 == 7:
            return 'Ateş'
        else:  # year % 10 == 8 or year % 10 == 9
            return 'Toprak'
    except:
        return None 

# Google OAuth endpoint'leri
@auth_bp.route('/google/login', methods=['GET'])
def google_login():
    """Google OAuth ile giriş başlat"""
    try:
        # Google OAuth flow oluştur
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=['openid', 'email', 'profile']
        )
        
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        # Authorization URL oluştur
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        return jsonify({
            'authorization_url': authorization_url,
            'state': state
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Google login hatası: {str(e)}'}), 500

@auth_bp.route('/google/callback', methods=['GET'])
def google_callback():
    """Google OAuth callback"""
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        
        if not code:
            return jsonify({'error': 'Authorization code bulunamadı'}), 400
        
        # Google OAuth flow ile token al
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=['openid', 'email', 'profile']
        )
        
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        # Authorization code ile token al
        flow.fetch_token(code=code)
        
        # ID token'dan kullanıcı bilgilerini al
        id_info = id_token.verify_oauth2_token(
            flow.credentials.id_token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Kullanıcı bilgilerini al
        google_id = id_info['sub']
        email = id_info['email']
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        picture = id_info.get('picture', '')
        
        # Kullanıcı zaten var mı kontrol et
        user = User.find_by_email(email)
        
        if not user:
            # Yeni kullanıcı oluştur
            username = f"google_{google_id[:8]}"
            
            # Username benzersiz olana kadar dene
            counter = 1
            original_username = username
            while User.find_by_username(username):
                username = f"{original_username}_{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                google_id=google_id,
                profile_picture=picture,
                onboarding_completed=False,
            )
            user.save()
            
            # Kayıt bonusu ver
            add_registration_bonus(str(user._id))
        
        # JWT token oluştur
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=timedelta(days=30)
        )
        
        user_dict = user.to_dict()
        # Frontend için 'name' field'ı ekle
        user_dict['name'] = build_display_name(user)
        
        return jsonify({
            'message': 'Google ile giriş başarılı',
            'user': user_dict,
            'token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Google callback hatası: {str(e)}'}), 500

@auth_bp.route('/google/verify', methods=['POST'])
def google_verify():
    """Google ID token'ı doğrula ve giriş yap"""
    try:
        data = request.get_json()
        id_token_str = data.get('id_token')
        
        if not id_token_str:
            return jsonify({'error': 'ID token gereklidir'}), 400
        
        # ID token'ı doğrula
        id_info = id_token.verify_oauth2_token(
            id_token_str, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Kullanıcı bilgilerini al
        google_id = id_info['sub']
        email = id_info['email']
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        picture = id_info.get('picture', '')
        
        # Kullanıcı zaten var mı kontrol et
        user = User.find_by_email(email)
        
        if not user:
            # Yeni kullanıcı oluştur
            username = f"google_{google_id[:8]}"
            
            # Username benzersiz olana kadar dene
            counter = 1
            original_username = username
            while User.find_by_username(username):
                username = f"{original_username}_{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                google_id=google_id,
                profile_picture=picture,
                onboarding_completed=False,
            )
            user.save()
            
            # Kayıt bonusu ver
            add_registration_bonus(str(user._id))
        
        # JWT token oluştur
        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=timedelta(days=30)
        )
        
        user_dict = user.to_dict()
        # Frontend için 'name' field'ı ekle
        user_dict['name'] = build_display_name(user)
        
        return jsonify({
            'message': 'Google ile giriş başarılı',
            'user': user_dict,
            'token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Google verify hatası: {str(e)}'}), 500 


@auth_bp.route('/apple/verify', methods=['POST'])
def apple_verify():
    """Apple identity token'ı doğrula ve giriş yap"""
    try:
        data = request.get_json() or {}
        identity_token = data.get('identity_token')
        provided_email = (data.get('email') or '').strip().lower()
        apple_user = data.get('apple_user')
        first_name = (data.get('first_name') or '').strip()
        last_name = (data.get('last_name') or '').strip()

        claims = verify_apple_identity_token(identity_token)
        apple_id = claims.get('sub') or apple_user
        email = (claims.get('email') or provided_email).strip().lower()
        email_verified = str(claims.get('email_verified', '')).lower() == 'true'

        if not apple_id:
            return jsonify({'error': 'Apple kullanıcı kimliği doğrulanamadı'}), 400

        user = User.find_by_apple_id(apple_id)

        if not user and email:
            user = User.find_by_email(email)
            if user:
                user.apple_id = apple_id
                if not user.email_verified and email_verified:
                    user.email_verified = True
                if first_name and not user.first_name:
                    user.first_name = first_name
                if last_name and not user.last_name:
                    user.last_name = last_name
                user.updated_at = datetime.now()
                user.save()

        if not user:
            if not email:
                return jsonify({
                    'error': 'Apple hesabından email alınamadı. İlk girişte email paylaşımına izin vererek tekrar deneyin.'
                }), 400

            username = generate_unique_username(email, first_name)
            user = User(
                username=username,
                email=email,
                first_name=first_name or None,
                last_name=last_name or None,
                apple_id=apple_id,
                email_verified=email_verified or bool(email),
                onboarding_completed=False,
            )
            user.save()
            add_registration_bonus(str(user._id))
        else:
            changed = False
            if not getattr(user, 'apple_id', None):
                user.apple_id = apple_id
                changed = True
            if email and not user.email:
                user.email = email
                changed = True
            if email_verified and not user.email_verified:
                user.email_verified = True
                changed = True
            if first_name and not user.first_name:
                user.first_name = first_name
                changed = True
            if last_name and not user.last_name:
                user.last_name = last_name
                changed = True
            if changed:
                user.updated_at = datetime.now()
                user.save()

        access_token = create_access_token(
            identity=str(user._id),
            expires_delta=timedelta(days=30)
        )

        user_dict = user.to_dict()
        user_dict['name'] = build_display_name(user)

        return jsonify({
            'message': 'Apple ile giriş başarılı',
            'user': user_dict,
            'token': access_token
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Apple oturum doğrulaması zaman aşımına uğradı'}), 400
    except jwt.InvalidTokenError as exc:
        return jsonify({'error': f'Apple identity token geçersiz: {str(exc)}'}), 400
    except ValueError as exc:
        return jsonify({'error': str(exc)}), 400
    except Exception as e:
        return jsonify({'error': f'Apple verify hatası: {str(e)}'}), 500
