chunk-T2SWDQEL.js?v=7db4f822:521 Warning: React has detected a change in the order of Hooks called by PlayerProfilePage. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useContext                 useContext
2. useContext                 useContext
3. useContext                 useContext
4. useState                   useState
5. useState                   useState
6. useState                   useState
7. useState                   useState
8. useState                   useState
9. useState                   useState
10. useState                  useState
11. useEffect                 useEffect
12. useEffect                 useEffect
13. useEffect                 useEffect
14. useEffect                 useEffect
15. undefined                 useEffect
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    at PlayerProfilePage (http://localhost:8080/src/pages/PlayerProfilePage.tsx:66:26)
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
printWarning @ chunk-T2SWDQEL.js?v=7db4f822:521
2chunk-T2SWDQEL.js?v=7db4f822:11678 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-T2SWDQEL.js?v=7db4f822:11678:21)
    at updateEffectImpl (chunk-T2SWDQEL.js?v=7db4f822:12074:22)
    at updateEffect (chunk-T2SWDQEL.js?v=7db4f822:12099:18)
    at Object.useEffect (chunk-T2SWDQEL.js?v=7db4f822:12703:22)
    at useEffect (chunk-QCHXOAYK.js?v=7db4f822:1078:29)
    at PlayerProfilePage (PlayerProfilePage.tsx:165:3)
    at renderWithHooks (chunk-T2SWDQEL.js?v=7db4f822:11548:26)
    at updateFunctionComponent (chunk-T2SWDQEL.js?v=7db4f822:14582:28)
    at beginWork (chunk-T2SWDQEL.js?v=7db4f822:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-T2SWDQEL.js?v=7db4f822:3674:22)
chunk-T2SWDQEL.js?v=7db4f822:14032 The above error occurred in the <PlayerProfilePage> component:

    at PlayerProfilePage (http://localhost:8080/src/pages/PlayerProfilePage.tsx:66:26)
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
logCapturedError @ chunk-T2SWDQEL.js?v=7db4f822:14032
chunk-T2SWDQEL.js?v=7db4f822:19413 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-T2SWDQEL.js?v=7db4f822:11678:21)
    at updateEffectImpl (chunk-T2SWDQEL.js?v=7db4f822:12074:22)
    at updateEffect (chunk-T2SWDQEL.js?v=7db4f822:12099:18)
    at Object.useEffect (chunk-T2SWDQEL.js?v=7db4f822:12703:22)
    at useEffect (chunk-QCHXOAYK.js?v=7db4f822:1078:29)
    at PlayerProfilePage (PlayerProfilePage.tsx:165:3)
    at renderWithHooks (chunk-T2SWDQEL.js?v=7db4f822:11548:26)
    at updateFunctionComponent (chunk-T2SWDQEL.js?v=7db4f822:14582:28)
    at beginWork (chunk-T2SWDQEL.js?v=7db4f822:15924:22)
    at beginWork$1 (chunk-T2SWDQEL.js?v=7db4f822:19753:22)
:3001/api/profiles/1:1  Failed to load resource: net::ERR_CONNECTION_REFUSED
chunk-T2SWDQEL.js?v=7db4f822:11678 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-T2SWDQEL.js?v=7db4f822:11678:21)
    at updateEffectImpl (chunk-T2SWDQEL.js?v=7db4f822:12074:22)
    at updateEffect (chunk-T2SWDQEL.js?v=7db4f822:12099:18)
    at Object.useEffect (chunk-T2SWDQEL.js?v=7db4f822:12703:22)
    at useEffect (chunk-QCHXOAYK.js?v=7db4f822:1078:29)
    at PlayerProfilePage (PlayerProfilePage.tsx:165:3)
    at renderWithHooks (chunk-T2SWDQEL.js?v=7db4f822:11548:26)
    at updateFunctionComponent (chunk-T2SWDQEL.js?v=7db4f822:14582:28)
    at beginWork (chunk-T2SWDQEL.js?v=7db4f822:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-T2SWDQEL.js?v=7db4f822:3674:22)
updateWorkInProgressHook @ chunk-T2SWDQEL.js?v=7db4f822:11678
updateEffectImpl @ chunk-T2SWDQEL.js?v=7db4f822:12074
updateEffect @ chunk-T2SWDQEL.js?v=7db4f822:12099
useEffect @ chunk-T2SWDQEL.js?v=7db4f822:12703
useEffect @ chunk-QCHXOAYK.js?v=7db4f822:1078
PlayerProfilePage @ PlayerProfilePage.tsx:165
renderWithHooks @ chunk-T2SWDQEL.js?v=7db4f822:11548
updateFunctionComponent @ chunk-T2SWDQEL.js?v=7db4f822:14582
beginWork @ chunk-T2SWDQEL.js?v=7db4f822:15924
callCallback2 @ chunk-T2SWDQEL.js?v=7db4f822:3674
invokeGuardedCallbackDev @ chunk-T2SWDQEL.js?v=7db4f822:3699
invokeGuardedCallback @ chunk-T2SWDQEL.js?v=7db4f822:3733
beginWork$1 @ chunk-T2SWDQEL.js?v=7db4f822:19765
performUnitOfWork @ chunk-T2SWDQEL.js?v=7db4f822:19198
workLoopSync @ chunk-T2SWDQEL.js?v=7db4f822:19137
renderRootSync @ chunk-T2SWDQEL.js?v=7db4f822:19116
performConcurrentWorkOnRoot @ chunk-T2SWDQEL.js?v=7db4f822:18678
workLoop @ chunk-T2SWDQEL.js?v=7db4f822:197
flushWork @ chunk-T2SWDQEL.js?v=7db4f822:176
performWorkUntilDeadline @ chunk-T2SWDQEL.js?v=7db4f822:384
chunk-T2SWDQEL.js?v=7db4f822:11678 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-T2SWDQEL.js?v=7db4f822:11678:21)
    at updateEffectImpl (chunk-T2SWDQEL.js?v=7db4f822:12074:22)
    at updateEffect (chunk-T2SWDQEL.js?v=7db4f822:12099:18)
    at Object.useEffect (chunk-T2SWDQEL.js?v=7db4f822:12703:22)
    at useEffect (chunk-QCHXOAYK.js?v=7db4f822:1078:29)
    at PlayerProfilePage (PlayerProfilePage.tsx:165:3)
    at renderWithHooks (chunk-T2SWDQEL.js?v=7db4f822:11548:26)
    at updateFunctionComponent (chunk-T2SWDQEL.js?v=7db4f822:14582:28)
    at beginWork (chunk-T2SWDQEL.js?v=7db4f822:15924:22)
    at HTMLUnknownElement.callCallback2 (chunk-T2SWDQEL.js?v=7db4f822:3674:22)
updateWorkInProgressHook @ chunk-T2SWDQEL.js?v=7db4f822:11678
updateEffectImpl @ chunk-T2SWDQEL.js?v=7db4f822:12074
updateEffect @ chunk-T2SWDQEL.js?v=7db4f822:12099
useEffect @ chunk-T2SWDQEL.js?v=7db4f822:12703
useEffect @ chunk-QCHXOAYK.js?v=7db4f822:1078
PlayerProfilePage @ PlayerProfilePage.tsx:165
renderWithHooks @ chunk-T2SWDQEL.js?v=7db4f822:11548
updateFunctionComponent @ chunk-T2SWDQEL.js?v=7db4f822:14582
beginWork @ chunk-T2SWDQEL.js?v=7db4f822:15924
callCallback2 @ chunk-T2SWDQEL.js?v=7db4f822:3674
invokeGuardedCallbackDev @ chunk-T2SWDQEL.js?v=7db4f822:3699
invokeGuardedCallback @ chunk-T2SWDQEL.js?v=7db4f822:3733
beginWork$1 @ chunk-T2SWDQEL.js?v=7db4f822:19765
performUnitOfWork @ chunk-T2SWDQEL.js?v=7db4f822:19198
workLoopSync @ chunk-T2SWDQEL.js?v=7db4f822:19137
renderRootSync @ chunk-T2SWDQEL.js?v=7db4f822:19116
recoverFromConcurrentError @ chunk-T2SWDQEL.js?v=7db4f822:18736
performConcurrentWorkOnRoot @ chunk-T2SWDQEL.js?v=7db4f822:18684
workLoop @ chunk-T2SWDQEL.js?v=7db4f822:197
flushWork @ chunk-T2SWDQEL.js?v=7db4f822:176
performWorkUntilDeadline @ chunk-T2SWDQEL.js?v=7db4f822:384
chunk-T2SWDQEL.js?v=7db4f822:14032 The above error occurred in the <PlayerProfilePage> component:

    at PlayerProfilePage (http://localhost:8080/src/pages/PlayerProfilePage.tsx:66:26)
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
logCapturedError @ chunk-T2SWDQEL.js?v=7db4f822:14032
update.callback @ chunk-T2SWDQEL.js?v=7db4f822:14052
callCallback @ chunk-T2SWDQEL.js?v=7db4f822:11248
commitUpdateQueue @ chunk-T2SWDQEL.js?v=7db4f822:11265
commitLayoutEffectOnFiber @ chunk-T2SWDQEL.js?v=7db4f822:17093
commitLayoutMountEffects_complete @ chunk-T2SWDQEL.js?v=7db4f822:17980
commitLayoutEffects_begin @ chunk-T2SWDQEL.js?v=7db4f822:17969
commitLayoutEffects @ chunk-T2SWDQEL.js?v=7db4f822:17920
commitRootImpl @ chunk-T2SWDQEL.js?v=7db4f822:19353
commitRoot @ chunk-T2SWDQEL.js?v=7db4f822:19277
finishConcurrentRender @ chunk-T2SWDQEL.js?v=7db4f822:18760
performConcurrentWorkOnRoot @ chunk-T2SWDQEL.js?v=7db4f822:18718
workLoop @ chunk-T2SWDQEL.js?v=7db4f822:197
flushWork @ chunk-T2SWDQEL.js?v=7db4f822:176
performWorkUntilDeadline @ chunk-T2SWDQEL.js?v=7db4f822:384
chunk-T2SWDQEL.js?v=7db4f822:11678 Uncaught Error: Rendered more hooks than during the previous render.
    at updateWorkInProgressHook (chunk-T2SWDQEL.js?v=7db4f822:11678:21)
    at updateEffectImpl (chunk-T2SWDQEL.js?v=7db4f822:12074:22)
    at updateEffect (chunk-T2SWDQEL.js?v=7db4f822:12099:18)
    at Object.useEffect (chunk-T2SWDQEL.js?v=7db4f822:12703:22)
    at useEffect (chunk-QCHXOAYK.js?v=7db4f822:1078:29)
    at PlayerProfilePage (PlayerProfilePage.tsx:165:3)
    at renderWithHooks (chunk-T2SWDQEL.js?v=7db4f822:11548:26)
    at updateFunctionComponent (chunk-T2SWDQEL.js?v=7db4f822:14582:28)
    at beginWork (chunk-T2SWDQEL.js?v=7db4f822:15924:22)
    at beginWork$1 (chunk-T2SWDQEL.js?v=7db4f822:19753:22)
updateWorkInProgressHook @ chunk-T2SWDQEL.js?v=7db4f822:11678
updateEffectImpl @ chunk-T2SWDQEL.js?v=7db4f822:12074
updateEffect @ chunk-T2SWDQEL.js?v=7db4f822:12099
useEffect @ chunk-T2SWDQEL.js?v=7db4f822:12703
useEffect @ chunk-QCHXOAYK.js?v=7db4f822:1078
PlayerProfilePage @ PlayerProfilePage.tsx:165
renderWithHooks @ chunk-T2SWDQEL.js?v=7db4f822:11548
updateFunctionComponent @ chunk-T2SWDQEL.js?v=7db4f822:14582
beginWork @ chunk-T2SWDQEL.js?v=7db4f822:15924
beginWork$1 @ chunk-T2SWDQEL.js?v=7db4f822:19753
performUnitOfWork @ chunk-T2SWDQEL.js?v=7db4f822:19198
workLoopSync @ chunk-T2SWDQEL.js?v=7db4f822:19137
renderRootSync @ chunk-T2SWDQEL.js?v=7db4f822:19116
recoverFromConcurrentError @ chunk-T2SWDQEL.js?v=7db4f822:18736
performConcurrentWorkOnRoot @ chunk-T2SWDQEL.js?v=7db4f822:18684
workLoop @ chunk-T2SWDQEL.js?v=7db4f822:197
flushWork @ chunk-T2SWDQEL.js?v=7db4f822:176
performWorkUntilDeadline @ chunk-T2SWDQEL.js?v=7db4f822:384
PlayerProfilePage.tsx:102  GET http://localhost:3001/api/profiles/1 net::ERR_CONNECTION_REFUSED