export {};

declare global {
  interface GoogleCredentialResponse {
    credential: string;
  }

  interface GoogleAccountsID {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
    }) => void;
    prompt: () => void;
    renderButton: (
      element: HTMLElement,
      options?: {
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "large" | "medium" | "small";
      }
    ) => void;
  }

  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsID;
      };
    };
  }
}
