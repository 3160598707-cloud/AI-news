import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head />
      <body>
        <Main />
        <NextScript />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var o=window.fetch;window.fetch=function(u,p){if(typeof u==='string'){var i=u.indexOf('/api/');if(i>=0){var q=u.indexOf('?');var a=q>=0?u.substring(0,q):u;if(!a.match(/\.json$/)){u=a+'.json'+(q>=0?u.substring(q):'')}if(p&&p.method==='POST'){p=Object.assign({},p,{method:'GET'})}}}return o.call(window,u,p)}})()`
        }} />
      </body>
    </Html>
  )
}
