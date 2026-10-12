import type { AppProps } from "next/app"
import Head from "next/head"
import Layout from "src/components/Layout"
import "src/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
