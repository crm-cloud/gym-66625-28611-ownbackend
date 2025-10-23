export type OAuthProvider = 'google' | 'github' | 'facebook' | 'apple';

export interface OAuthAccount {
  id: string;
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
  avatar?: string;
  linkedAt: string;
}

export interface OAuthLinkInput {
  provider: OAuthProvider;
  accessToken: string;
}

export interface OAuthUnlinkInput {
  provider: OAuthProvider;
}

export interface OAuthCallbackParams {
  code: string;
  state?: string;
}
