import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Global meta tags */}
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="cache-control" content="no-cache" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
