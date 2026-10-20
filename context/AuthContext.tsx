// external
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// internal
import {
  getErrorMessage,
  setAuthToken,
  setUnauthorizedHandler,
} from "../services/apiClient";
import {
  AuthApiResponse,
  authenticateWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from "../services/authService";

// types
export type AuthUser = {
  id: number;
  name: string | null;
  email: string;
  profilePictureUrl: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthLoaded: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEYS = {
  token: "token",
  user: "auth.user",
} as const;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // signing out never touches the habits on the device
  const signOut = useCallback(async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.token,
      STORAGE_KEYS.user,
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.token),
          AsyncStorage.getItem(STORAGE_KEYS.user),
        ]);
        if (!isMounted || !storedToken || !storedUser) {
          return;
        }
        const parsed = JSON.parse(storedUser) as AuthUser;
        if (typeof parsed?.id !== "number") {
          return;
        }
        setAuthToken(storedToken);
        setToken(storedToken);
        setUser(parsed);
      } catch {
        // unreadable session, the user simply signs in again
      } finally {
        if (isMounted) {
          setIsAuthLoaded(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // the server rejected our token (expired): drop the session
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const startSession = useCallback(async (response: AuthApiResponse) => {
    if (!response.success || !response.token || !response.details) {
      throw new Error(
        response.message || "something went wrong. please try again.",
      );
    }

    const nextUser: AuthUser = {
      id: response.details.id,
      name: response.details.name ?? null,
      email: response.details.email,
      profilePictureUrl: response.details.profilePictureUrl ?? null,
    };

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.token, response.token],
      [STORAGE_KEYS.user, JSON.stringify(nextUser)],
    ]);

    // the token has to be in place before the user is, sync starts when the user appears
    setAuthToken(response.token);
    setToken(response.token);
    setUser(nextUser);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      let response: AuthApiResponse;
      try {
        response = await loginWithEmail(email.trim(), password);
      } catch (e) {
        throw new Error(getErrorMessage(e, "could not sign in. try again."));
      }
      await startSession(response);
    },
    [startSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      let response: AuthApiResponse;
      try {
        response = await registerWithEmail(name.trim(), email.trim(), password);
      } catch (e) {
        throw new Error(
          getErrorMessage(e, "could not create the account. try again."),
        );
      }
      await startSession(response);
    },
    [startSession],
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      let response: AuthApiResponse;
      try {
        response = await authenticateWithGoogle(idToken);
      } catch (e) {
        throw new Error(
          getErrorMessage(e, "could not sign in with google. try again."),
        );
      }
      await startSession(response);
    },
    [startSession],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthLoaded,
      signInWithEmail,
      registerWithEmail: register,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      token,
      isAuthLoaded,
      signInWithEmail,
      register,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
