export {};

declare global {
  interface FBInitParams {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
    status?: boolean;
  }

  interface FBLoginResponse {
    authResponse?: {
      accessToken: string;
      userID: string;
      expiresIn: number;
    };
    status?: string;
  }

  interface FBPicture {
    data: {
      url: string;
      width?: number;
      height?: number;
      is_silhouette: boolean;
    };
  }

  export interface FBUser {
    id: string;
    name?: string;
    email?: string;
    picture?: FBPicture;
  }

  interface FacebookSDK {
    init: (params: FBInitParams) => void;
    login: (
      callback: (response: FBLoginResponse) => void,
      options?: { scope: string }
    ) => void;
    api: <T>(
      path: string,
      params: Record<string, any>,
      callback: (response: T) => void
    ) => void;
    api: <T>(path: string, callback: (response: T) => void) => void;
  }

  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
    fbLoaded?: () => void;
  }

  var FB: FacebookSDK | undefined;
}
