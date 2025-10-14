2
DataContext.tsx:129 Uncaught ReferenceError: Cannot access 'ensureUniqueIds' before initialization
    at DataProvider (DataContext.tsx:129:50)
chunk-T2SWDQEL.js?v=7db4f822:14032 The above error occurred in the <DataProvider> component:

    at DataProvider (http://localhost:8080/src/contexts/DataContext.tsx?t=1760445479267:88:32)
    at Settings (http://localhost:8080/src/pages/Settings.tsx?t=1760445556519:370:47)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=7db4f822:4088:5)
    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=7db4f822:4558:5)
    at div
    at div
    at div
    at ProtectedRoute (http://localhost:8080/src/components/ProtectedRoute.tsx:29:27)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=7db4f822:4088:5)
    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=7db4f822:4558:5)
    at Router (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=7db4f822:4501:15)
    at BrowserRouter (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=7db4f822:5247:5)
    at AuthProvider (http://localhost:8080/src/contexts/AuthContext.tsx:31:32)
    at Provider (http://localhost:8080/node_modules/.vite/deps/chunk-OXZDJRWN.js?v=7db4f822:38:15)
    at TooltipProvider (http://localhost:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=7db4f822:63:5)
    at QueryClientProvider (http://localhost:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=7db4f822:2934:3)
    at App
    at PlayerProvider (http://localhost:8080/src/contexts/PlayerContext.tsx:91:34)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
chunk-T2SWDQEL.js?v=7db4f822:19413 Uncaught ReferenceError: Cannot access 'ensureUniqueIds' before initialization
    at DataProvider (DataContext.tsx:129:50)
