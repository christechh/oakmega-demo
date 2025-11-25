export {};

declare global {
  interface GoogleCredentialResponse {
    credential: string;
  }

  interface IdConfiguration {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean; // 2025 FedCM 必備
  }

  interface GsiButtonConfiguration {
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    text?: "signin_with" | "signup_with" | "continue_with" | "signin"; // 支援按鈕文字
    shape?: "rectangular" | "pill" | "circle" | "square";
    width?: string | number;
  }

  interface GoogleAccountsID {
    initialize: (config: IdConfiguration) => void;
    renderButton: (
      element: HTMLElement,
      options?: GsiButtonConfiguration
    ) => void;
    prompt: () => void;
  }

  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsID;
      };
    };
  }
}
