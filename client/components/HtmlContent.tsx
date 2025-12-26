import { useWindowDimensions, Platform } from "react-native";
import WebView from "react-native-webview";
import { useTheme } from "@/hooks/useTheme";

interface HtmlContentProps {
  html: string;
  baseStyle?: string;
}

export function HtmlContent({ html, baseStyle }: HtmlContentProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const defaultStyle = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      color: ${theme.text};
      margin: 0;
      padding: 0;
      background-color: transparent;
    }
    p {
      margin-bottom: 12px;
    }
    h1 { font-size: 24px; font-weight: 700; margin: 20px 0 12px 0; }
    h2 { font-size: 20px; font-weight: 700; margin: 18px 0 10px 0; }
    h3 { font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; }
    h4 { font-size: 16px; font-weight: 600; margin: 14px 0 6px 0; }
    h5 { font-size: 15px; font-weight: 600; margin: 12px 0 4px 0; }
    h6 { font-size: 14px; font-weight: 600; margin: 10px 0 4px 0; }
    ul, ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 6px;
    }
    strong, b {
      font-weight: 700;
    }
    em, i {
      font-style: italic;
    }
    a {
      color: ${theme.primary};
      text-decoration: underline;
    }
    .ql-size-small { font-size: 13px; }
    .ql-size-large { font-size: 18px; }
    .ql-size-huge { font-size: 24px; }
    .ql-align-center { text-align: center; }
    .ql-align-right { text-align: right; }
    .ql-align-justify { text-align: justify; }
    .ql-indent-1 { padding-left: 3em; }
    .ql-indent-2 { padding-left: 6em; }
    .ql-indent-3 { padding-left: 9em; }
    u { text-decoration: underline; }
    s { text-decoration: line-through; }
  `;

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>${baseStyle || defaultStyle}</style>
    </head>
    <body>${html}</body>
    </html>
  `;

  if (Platform.OS === "web") {
    return (
      <div
        style={{ width: "100%" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <WebView
      source={{ html: fullHtml }}
      style={{ 
        width: width - 64,
        backgroundColor: "transparent",
        opacity: 0.99,
      }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      scalesPageToFit={false}
      originWhitelist={["*"]}
      injectedJavaScript={`
        (function() {
          const height = document.body.scrollHeight;
          window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
        })();
        true;
      `}
    />
  );
}
