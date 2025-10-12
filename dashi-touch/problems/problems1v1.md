DataContext.tsx:45 Uncaught Error: useData must be used within a DataProvider
    at useData (DataContext.tsx:45:11)
    at PlayerProfileView (PlayerProfileView.tsx:45:31)
DataContext.tsx:45 Uncaught Error: useData must be used within a DataProvider
    at useData (DataContext.tsx:45:11)
    at PlayerProfileView (PlayerProfileView.tsx:45:31)
chunk-T2SWDQEL.js?v=a0a4ad54:14032 The above error occurred in the <PlayerProfileView> component:

    at PlayerProfileView (http://localhost:8082/src/components/player/PlayerProfileView.tsx:37:30)
    at div
    at PlayerProfilePage (http://localhost:8082/src/pages/PlayerProfilePage.tsx?t=1760232573807:41:26)
    at RenderedRoute (http://localhost:8082/node_modules/.vite/deps/react-router-dom.js?v=a0a4ad54:4088:5)
    at Routes (http://localhost:8082/node_modules/.vite/deps/react-router-dom.js?v=a0a4ad54:4558:5)
    at div
    at div
    at div
    at ProtectedRoute (http://localhost:8082/src/components/ProtectedRoute.tsx:29:27)
    at RenderedRoute (http://localhost:8082/node_modules/.vite/deps/react-router-dom.js?v=a0a4ad54:4088:5)
    at Routes (http://localhost:8082/node_modules/.vite/deps/react-router-dom.js?v=a0a4ad54:4558:5)
    at Router (http://localhost:8082/node_modules/.vite/deps/react-router-dom.js?v=a0a4ad54:4501:15)
    at BrowserRouter (http://localhost:8082/node_modules/.vite/deps/react-router-dom.js?v=a0a4ad54:5247:5)
    at AuthProvider (http://localhost:8082/src/contexts/AuthContext.tsx:30:32)
    at Provider (http://localhost:8082/node_modules/.vite/deps/chunk-OXZDJRWN.js?v=a0a4ad54:38:15)
    at TooltipProvider (http://localhost:8082/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=a0a4ad54:63:5)
    at QueryClientProvider (http://localhost:8082/node_modules/.vite/deps/@tanstack_react-query.js?v=a0a4ad54:2934:3)
    at App
    at PlayerProvider (http://localhost:8082/src/contexts/PlayerContext.tsx:91:34)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
chunk-T2SWDQEL.js?v=a0a4ad54:19413 Uncaught Error: useData must be used within a DataProvider
    at useData (DataContext.tsx:45:11)
    at PlayerProfileView (PlayerProfileView.tsx:45:31)
PlayerProfilePage.tsx:102 
 GET http://localhost:3001/api/profiles/2 net::ERR_CONNECTION_REFUSED
﻿

