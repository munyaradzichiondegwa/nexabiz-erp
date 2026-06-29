import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import { store } from "./store"
import { queryClient } from "./lib/query-client"
import App from "./App"
import "./styles/globals.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)
