// Instagram OAuth Service
// Instagram Basic Display API integration

export interface InstagramUser {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

export interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
}

class InstagramOAuthService {
  private clientId: string;
  private redirectUri: string;
  private scope: string[];

  constructor() {
    this.clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '';
    this.redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || `${window.location.origin}/auth/instagram/callback`;
    this.scope = ['user_profile', 'user_media'];
  }

  // Instagram OAuth URL'ini oluştur
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope.join(','),
      response_type: 'code'
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  // Authorization code ile access token al
  async exchangeCodeForToken(code: string): Promise<InstagramAuthResponse> {
    try {
      const response = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || '',
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Instagram OAuth error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Instagram token exchange error:', error);
      throw error;
    }
  }

  // Access token ile kullanıcı bilgilerini al
  async getUserInfo(accessToken: string): Promise<InstagramUser> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Instagram user info error:', error);
      throw error;
    }
  }

  // Popup window ile Instagram OAuth başlat (gelişmiş)
  async authenticateWithPopup(): Promise<{ user: InstagramUser; accessToken: string }> {
    return new Promise((resolve, reject) => {
      if (!this.clientId) {
        reject(new Error('Instagram Client ID yapılandırılmamış. INSTAGRAM_OAUTH_SETUP.md dosyasını kontrol edin.'));
        return;
      }

      const authUrl = this.getAuthUrl();
      
      // Development için basit redirect (popup yerine)
      if (this.clientId === 'your_instagram_client_id_here' || !this.clientId) {
        reject(new Error('Instagram OAuth henüz yapılandırılmamış. Lütfen INSTAGRAM_OAUTH_SETUP.md talimatlarını takip edin.'));
        return;
      }

      // Gerçek OAuth flow
      const popup = window.open(
        authUrl,
        'instagram-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes,top=100,left=100'
      );

      if (!popup) {
        reject(new Error('Popup engellenmiş. Lütfen bu site için popup\'lara izin verin.'));
        return;
      }

      // Message listener for postMessage communication
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'INSTAGRAM_SUCCESS') {
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          
          const code = event.data.code;
          // Authorization code ile token al ve user bilgilerini çek
          this.exchangeCodeForToken(code)
            .then(tokenResponse => 
              this.getUserInfo(tokenResponse.access_token)
                .then(user => resolve({ 
                  user, 
                  accessToken: tokenResponse.access_token 
                }))
            )
            .catch(reject);
        } else if (event.data.type === 'INSTAGRAM_ERROR') {
          window.removeEventListener('message', messageListener);
          clearInterval(checkClosed);
          reject(new Error(`Instagram OAuth hatası: ${event.data.error}`));
        }
      };

      window.addEventListener('message', messageListener);

      // Popup kapanma kontrolü
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Instagram kimlik doğrulama iptal edildi'));
        }
      }, 1000);

      // 10 dakika timeout
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Instagram kimlik doğrulama zaman aşımı'));
      }, 10 * 60 * 1000);
    });
  }

  // Basit redirect authentication (development için)
  startAuthentication(): void {
    if (!this.clientId || this.clientId === 'your_instagram_client_id_here') {
      alert('Instagram OAuth yapılandırılmamış. INSTAGRAM_OAUTH_SETUP.md dosyasını kontrol edin.');
      return;
    }
    
    const authUrl = this.getAuthUrl();
    window.location.href = authUrl;
  }
}

export const instagramOAuthService = new InstagramOAuthService();