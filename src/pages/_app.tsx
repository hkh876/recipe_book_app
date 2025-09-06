import "@/styles/globals.css";
import { createTheme, StyledEngineProvider, ThemeProvider, useMediaQuery } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useMemo } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: prefersDarkMode ? "dark" : "light"
      }
    })
  }, [prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={new QueryClient}>
        <StyledEngineProvider injectFirst>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <title>레시피북</title>
          </Head>
          <Component {...pageProps} />
        </StyledEngineProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
