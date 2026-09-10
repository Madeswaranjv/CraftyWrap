'use client';

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError: (errorMsg: string) => void;
  buttonText?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  buttonText = 'Sign in with Google',
  text = 'signin_with',
}) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(clientId && !clientId.startsWith('your_google_client_id'));

  const googleIcon = (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );

  return (
    <div
      className="relative group w-full overflow-hidden rounded-xl border border-peach-300 dark:border-warmbrown-700 bg-white dark:bg-[#2A1D15] py-2.5 px-4 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xs hover:shadow-md active:scale-[0.98]"
      style={{ isolation: 'isolate' }}
      title={isConfigured ? buttonText : 'Sign in with Google (Configuration Required)'}
    >
      {/* Circle expanding from center on hover (Flow hover animation without altering corners or adding arrow) */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#111111] dark:bg-warmbrown-800 opacity-0 group-hover:scale-[50] group-hover:opacity-100 transition-all duration-[700ms] ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none z-0"
        style={{ borderRadius: '50%' }}
      />

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-3 font-semibold text-xs text-warmbrown-800 dark:text-peach-100 group-hover:text-white transition-colors duration-300 pointer-events-none">
        {googleIcon}
        <span className="tracking-wide text-inherit group-hover:!text-white transition-colors duration-300">{buttonText}</span>
      </div>

      {/* Click layer */}
      {isConfigured ? (
        <div className="absolute inset-0 z-20 opacity-[0.001] overflow-hidden flex items-center justify-center pointer-events-auto cursor-pointer">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                onSuccess(credentialResponse.credential);
              } else {
                onError('Did not receive a valid Google credential ID token.');
              }
            }}
            onError={() => {
              onError('Google Sign-In failed or was closed.');
            }}
            type="standard"
            shape="rectangular"
            theme="outline"
            size="large"
            width="400"
            text={text}
            logo_alignment="left"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            onError(
              'Google OAuth Client ID is not configured yet. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend/.env.local and GOOGLE_CLIENT_ID in backend/.env.'
            )
          }
          className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-pointer"
        />
      )}
    </div>
  );
};
