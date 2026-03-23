import type {
  OAuthClientMetadata,
  OAuthClientInformationMixed,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { prisma } from "./prisma";

const NOTION_MCP_URL = "https://mcp.notion.com/mcp";

function getBaseUrl(): string {
  return process.env.SHOPIFY_APP_URL ?? "http://localhost:3000";
}

function getRedirectUrl(): string {
  return `${getBaseUrl()}/api/mcp/auth/callback`;
}

const CLIENT_METADATA: OAuthClientMetadata = {
  client_name: "Shop Pilot",
  redirect_uris: [getRedirectUrl()],
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  token_endpoint_auth_method: "none",
};

/**
 * OAuth client provider for Notion MCP that persists tokens and client info in the database.
 * Uses sessionId (from cookie) to key all data.
 */
export class NotionMcpOAuthProvider {
  private _sessionId: string;
  private _redirectUrl: URL;
  private _authUrlToRedirect?: URL;
  private _codeVerifierOverride?: string;

  constructor(sessionId: string, options?: { codeVerifier?: string }) {
    this._sessionId = sessionId;
    this._redirectUrl = new URL(getRedirectUrl());
    this._codeVerifierOverride = options?.codeVerifier;
  }

  get redirectUrl(): URL {
    return this._redirectUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      ...CLIENT_METADATA,
      redirect_uris: [getRedirectUrl()],
    };
  }

  async state(): Promise<string> {
    const state = `s_${crypto.randomUUID().replace(/-/g, "")}`;
    await prisma.notionMcpPendingAuth.create({
      data: {
        state,
        sessionId: this._sessionId,
        codeVerifier: "", // filled in by saveCodeVerifier
      },
    });
    return state;
  }

  async clientInformation(): Promise<OAuthClientInformationMixed | undefined> {
    const config = await prisma.notionMcpConfig.findFirst();
    if (!config) return undefined;
    return {
      client_id: config.clientId,
      client_secret: config.clientSecret ?? undefined,
      redirect_uris: JSON.parse(config.redirectUris) as string[],
    };
  }

  async saveClientInformation(
    clientInformation: OAuthClientInformationMixed
  ): Promise<void> {
    const redirectUris = "redirect_uris" in clientInformation
      ? (clientInformation.redirect_uris ?? [getRedirectUrl()])
      : [getRedirectUrl()];
    await prisma.notionMcpConfig.upsert({
      where: { clientId: clientInformation.client_id },
      create: {
        clientId: clientInformation.client_id,
        clientSecret:
          "client_secret" in clientInformation
            ? clientInformation.client_secret ?? null
            : null,
        redirectUris: JSON.stringify(redirectUris),
      },
      update: {
        clientSecret:
          "client_secret" in clientInformation
            ? clientInformation.client_secret ?? null
            : undefined,
        redirectUris: JSON.stringify(redirectUris),
      },
    });
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const session = await prisma.notionMcpSession.findUnique({
      where: { sessionId: this._sessionId },
    });
    if (!session) return undefined;
    const expiresAt = session.expiresAt.getTime();
    const now = Date.now();
    if (expiresAt <= now + 60_000) {
      return undefined;
    }
    return {
      access_token: session.accessToken,
      token_type: "Bearer",
      expires_in: Math.floor((expiresAt - now) / 1000),
      refresh_token: session.refreshToken ?? undefined,
    };
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    const expiresIn = tokens.expires_in ?? 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    await prisma.notionMcpSession.upsert({
      where: { sessionId: this._sessionId },
      create: {
        sessionId: this._sessionId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt,
      },
    });
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this._authUrlToRedirect = authorizationUrl;
  }

  get authUrlToRedirect(): URL | undefined {
    return this._authUrlToRedirect;
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    const pending = await prisma.notionMcpPendingAuth.findFirst({
      where: { sessionId: this._sessionId },
      orderBy: { createdAt: "desc" },
    });
    if (pending) {
      await prisma.notionMcpPendingAuth.update({
        where: { id: pending.id },
        data: { codeVerifier },
      });
    }
  }

  async codeVerifier(): Promise<string> {
    if (this._codeVerifierOverride) return this._codeVerifierOverride;
    const pending = await prisma.notionMcpPendingAuth.findFirst({
      where: { sessionId: this._sessionId },
      orderBy: { createdAt: "desc" },
    });
    if (!pending?.codeVerifier) {
      throw new Error("No code verifier saved");
    }
    return pending.codeVerifier;
  }

  /** Get pending auth by state (used in callback) */
  static async getPendingByState(state: string) {
    return prisma.notionMcpPendingAuth.findUnique({
      where: { state },
    });
  }

  /** Create provider for callback - has codeVerifier from state */
  static createForCallback(sessionId: string, codeVerifier: string): NotionMcpOAuthProvider {
    return new NotionMcpOAuthProvider(sessionId, { codeVerifier });
  }
}
