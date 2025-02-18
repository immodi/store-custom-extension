import { createProductFromData, login } from "./evershop/evershop.js";

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

    return true;
});
