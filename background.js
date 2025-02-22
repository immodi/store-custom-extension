import {
    addProductToVariantGroup,
    createAttribute,
    createProductFromData,
    createVariantGroup,
    login,
} from "./evershop/evershop.js";

browser.webRequest.onHeadersReceived.addListener(
    function (details) {
        return {
            responseHeaders: details.responseHeaders.concat([
                {
                    name: "Access-Control-Allow-Origin",
                    value: "*",
                },
            ]),
        };
    },
    { urls: ["https://sahlstor.com/*"] },
    ["blocking", "responseHeaders"]
);

// Event listener for handling messages
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "login") {
        login()
            .then((token) => {
                if (token !== null) {
                    sendResponse({
                        success: true,
                        data: {
                            token: token,
                        },
                    });
                } else {
                    sendResponse({ success: false, error: "Login failed" });
                }
            })
            .catch((error) => {
                console.error("Error during login:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Ensure the response is sent asynchronously
    }

    if (request.action === "getProductData") {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => {
                if (tabs.length === 0) {
                    sendResponse({
                        success: false,
                        error: "No active tab found",
                    });
                    return;
                }

                return browser.tabs.sendMessage(tabs[0].id, request);
            })
            .then((response) => {
                sendResponse(response);
            })
            .catch((error) => {
                console.error("Error:", error);
                sendResponse({ success: false, error: error.message });
            });
    }

    if (request.action === "createProduct") {
        const { product } = request; // Extract product from request

        if (!product) {
            sendResponse({ success: false, error: "No product data provided" });
            return true;
        }

        createProductFromData(product) // Pass the product data
            .then((productData) => {
                if (productData !== null) {
                    sendResponse({
                        success: true,
                        data: {
                            product: productData,
                        },
                    });
                } else {
                    sendResponse({
                        success: false,
                        error: "Product creation failed",
                    });
                }
            })
            .catch((error) => {
                console.error("Error during product creation:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Ensure the response is sent asynchronously
    }

    if (request.action === "createAttribute") {
        const { authCookie, attributeName, attributeCode, options } = request; // Extract product from request

        if (!authCookie && !attributeName && !attributeCode && !options) {
            sendResponse({ success: false, error: "No data provided" });
            return true;
        }

        createAttribute(authCookie, attributeName, attributeCode, options)
            .then((attributeUid) => {
                if (attributeUid !== null) {
                    sendResponse({
                        success: true,
                        data: {
                            attributeUid: attributeUid,
                        },
                    });
                } else {
                    sendResponse({
                        success: false,
                        error: "Attribute creation failed",
                    });
                }
            })
            .catch((error) => {
                console.error("Error during attribute creation:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Ensure the response is sent asynchronously
    }

    if (request.action === "createVariantGroup") {
        const { attributeCode, cookieToken } = request;

        if (!cookieToken && !attributeCode) {
            sendResponse({ success: false, error: "No data provided" });
            return true;
        }

        createVariantGroup(attributeCode, cookieToken)
            .then((variantGroupUid) => {
                if (variantGroupUid !== null) {
                    sendResponse({
                        success: true,
                        data: {
                            variantGroupUid: variantGroupUid,
                        },
                    });
                } else {
                    sendResponse({
                        success: false,
                        error: "Variant Group creation failed",
                    });
                }
            })
            .catch((error) => {
                console.error("Error during variant group creation:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (request.action === "addProductToVariantGroup") {
        const { variantGroupId, cookieToken, productId } = request;

        if (!cookieToken && !variantGroupId && !productId) {
            sendResponse({ success: false, error: "No data provided" });
            return true;
        }

        addProductToVariantGroup(variantGroupId, cookieToken, productId)
            .then((isAdded) => {
                if (isAdded) {
                    sendResponse({
                        success: true,
                    });
                } else {
                    sendResponse({
                        success: false,
                        error: "Variant Group creation failed",
                    });
                }
            })
            .catch((error) => {
                console.error("Error during variant group creation:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    return true;
});
