import type { ChakraProps } from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import React, { useEffect, useState } from "react";
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextPageWithLayout } from "nextjs/types";
import { Button, Text } from "@chakra-ui/react";
import config from "configs/app";
import useQueryClientConfig from "lib/api/useQueryClientConfig";
import { AppContextProvider } from "lib/contexts/app";
import { ChakraProvider } from "lib/contexts/chakra";
import { ScrollDirectionProvider } from "lib/contexts/scrollDirection";
import { SocketProvider } from "lib/socket/context";
import theme from "theme";
import AppErrorBoundary from "ui/shared/AppError/AppErrorBoundary";
import GoogleAnalytics from "ui/shared/GoogleAnalytics";
import Layout from "ui/shared/layout/Layout";
import Web3ModalProvider from "ui/shared/Web3ModalProvider";
import {
  Box,
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  Stack,
} from "@chakra-ui/react";

import "lib/setLocale";
import Login from "./login";

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const ERROR_SCREEN_STYLES: ChakraProps = {
  h: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  width: "fit-content",
  maxW: "800px",
  margin: "0 auto",
  p: { base: 4, lg: 0 },
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const queryClient = useQueryClientConfig();

  const handleError = React.useCallback((error: Error) => {
    Sentry.captureException(error);
  }, []);

  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtExpired, setJwtExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    const JwtToken = sessionStorage.getItem("JwtToken");
    console.log(JwtToken, "JwtToken");
    if (!JwtToken) {
      setIsAuthenticated(false);
    } else {
      const decodedToken = jwt.decode(JwtToken) as JwtPayload | null;
      const expiry = decodedToken?.exp;
      if (expiry === undefined) {
        console.error("Expiration time is not available in the decoded token.");
        setIsAuthenticated(false);
        setJwtExpired(true);
        return;
      }
      setIsAuthenticated(true);
      const expiresIn = expiry * 1000 - Date.now();
      setTimeout(() => {
        sessionStorage.removeItem("JwtToken");
        setIsAuthenticated(false);
        setJwtExpired(true);
      }, expiresIn);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("JwtToken");
    setIsAuthenticated(false);
    setJwtExpired(false);
  };

  useEffect(() => {
    handleLogin();
    setLoading(false);
  }, []);

  if (loading) {
    return <></>;
  }

  return (
    <ChakraProvider theme={theme} cookies={pageProps.cookies}>
      {isAuthenticated ? (
        <AppErrorBoundary {...ERROR_SCREEN_STYLES} onError={handleError}>
          <Web3ModalProvider>
            <AppContextProvider pageProps={pageProps}>
              <QueryClientProvider client={queryClient}>
                <ScrollDirectionProvider>
                  <SocketProvider
                    url={`${config.api.socket}${config.api.basePath}/socket/v2`}
                  >
                    {getLayout(<Component {...pageProps} />)}
                  </SocketProvider>
                </ScrollDirectionProvider>
                <ReactQueryDevtools
                  buttonPosition="bottom-left"
                  position="left"
                />
                <Box position="absolute" top={2} right={16} zIndex="999">
                  <Button colorScheme="blue" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
                <GoogleAnalytics />
              </QueryClientProvider>
            </AppContextProvider>
          </Web3ModalProvider>
        </AppErrorBoundary>
      ) : (
        <Login onLogin={handleLogin} expired={jwtExpired} />
      )}
    </ChakraProvider>
  );
}

export default MyApp;
