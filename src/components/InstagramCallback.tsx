import React, { useEffect } from 'react';

const InstagramCallback: React.FC = () => {
  useEffect(() => {
    // URL'den authorization code'u al
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Instagram OAuth error:', error);
      // Parent window'a hata gönder
      if (window.opener) {
        window.opener.postMessage({ type: 'INSTAGRAM_ERROR', error }, '*');
        window.close();
      }
    } else if (code) {
      console.log('Instagram authorization code received:', code);
      // Parent window'a code'u gönder
      if (window.opener) {
        window.opener.postMessage({ type: 'INSTAGRAM_SUCCESS', code }, '*');
        window.close();
      }
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '16px'
      }}>
        📷 Instagram
      </div>
      <p style={{ color: '#666' }}>Instagram bağlantısı işleniyor...</p>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #bc1888',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InstagramCallback;