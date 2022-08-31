import NextAuth, { CallbacksOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { scopes, spotifyApi } from "../../../config/spotify";
import { ExtendedToken, TokenError } from "../../../types";

const refreshAccessToken = async (
  token: ExtendedToken
): Promise<ExtendedToken> => {
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const { body: refreshedTokens } = await spotifyApi.refreshAccessToken();
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token || token.refreshToken,
      accTokenExpiresAt: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: TokenError.RefreshAccessTokenError,
    };
  }
};

const jwtCallback: CallbacksOptions["jwt"] = async ({
  token,
  account,
  user,
}) => {
  let extendedToken: ExtendedToken;

  if (account && user) {
    extendedToken = {
      ...token,
      user,
      accessToken: account.access_token as string,
      refreshToken: account.refresh_token as string,
      accTokenExpiresAt: (account.expires_at as number) * 1000,
    };
    return extendedToken;
  }

  if (Date.now() + 5000 < (token as ExtendedToken).accTokenExpiresAt) {
    return token;
  }

  return await refreshAccessToken(token as ExtendedToken);
};

const sessionCallback: CallbacksOptions["session"] = async ({
  session,
  token,
}) => {
  session.accessToken = (token as ExtendedToken).accessToken;
  session.error = (token as ExtendedToken).error;

  return session;
};

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLINET_ID as string,
      clientSecret: process.env.SPOTIFY_CLINET_SECRET as string,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
  },
});
