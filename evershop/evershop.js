var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const domain = "sahlstor.com";
export function login() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = "admin@admin.com";
        const password = "modimodi";
        try {
            const response = yield fetch(`https://${domain}/admin/user/login`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            if (data && data.data && data.data.sid) {
                return data.data.sid;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error("Login failed:", error);
            return null;
        }
    });
}
export function createProductFromData(productData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const productRequest = {
                name: productData.title,
                description: productData.description, // No description provided in ProductData
                short_description: productData.description, // No short description provided
                url_key: `${productData.title}-${(Math.random() * 1000).toFixed(0)}`
                    .replace(/\s+/g, "-")
                    .toLowerCase(), // Generate URL key
                meta_title: productData.title,
                meta_description: productData.title,
                status: 1, // Assuming product is active
                // sku: productData.variants[0]?.Sku ?? "", // Use the first variant's SKU
                sku: (_a = productData.sku) !== null && _a !== void 0 ? _a : "", // Use the first variant's SKU
                // price: productData.variants[0]?.Price ?? 0, // Use first variant price
                price: (_b = productData.price) !== null && _b !== void 0 ? _b : 0, // Use first variant price
                weight: productData.weight,
                // qty: productData.variants
                //     .map((variant) => Number(variant.StockonAliExpress) || 0)
                //     .reduce((acc, stock) => acc + stock, 0),
                qty: productData.qty,
                group_id: 1,
                visibility: productData.visibility,
                images: yield Promise.all(productData.images.map((imgUrl) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const image = yield uploadImage(imgUrl, imgUrl.split("/")[4], productData.token);
                    return (_a = image === null || image === void 0 ? void 0 : image.data.files[0].url) !== null && _a !== void 0 ? _a : imgUrl;
                }))),
                attributes: [
                    {
                        attribute_code: productData.attr_code,
                        value: productData.attr_value,
                    },
                ],
            };
            const response = yield fetch(`https://${domain}/api/products`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Cookie: `asid=${productData.token}`,
                },
                body: JSON.stringify(productRequest),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error("Error creating product:", error);
            return null;
        }
    });
}
export function createAttribute(authCookie, attributeName, attributeCode, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${domain}/api/attributes`;
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cookie: `asid=${authCookie}`,
        };
        const body = {
            attribute_name: attributeName,
            attribute_code: attributeCode,
            is_required: "0",
            display_on_frontend: "1",
            is_filterable: "1",
            sort_order: "0",
            type: "select",
            groups: ["1"],
            options: options.map((option) => {
                return { option_text: option };
            }),
        };
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            return data.data.uuid;
        }
        catch (error) {
            console.error("Error:", error);
            return null;
        }
    });
}
export function createVariantGroup(attributeCode, cookieToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${domain}/api/variantGroups`;
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cookie: `asid=${cookieToken}`,
        };
        const body = JSON.stringify({
            attribute_codes: [attributeCode],
            attribute_group_id: 1,
        });
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers: headers,
                body: body,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const vairantGroup = yield response.json();
            return vairantGroup.data.uuid;
        }
        catch (error) {
            console.error("Error creating variant group:", error);
            return null;
        }
    });
}
export function addProductToVariantGroup(variantGroupId, cookieToken, productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${domain}/api/variantGroups/${variantGroupId}/items`;
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Cookie: `asid=${cookieToken}`,
        };
        const body = JSON.stringify({
            product_id: productId,
        });
        try {
            const response = yield fetch(url, {
                method: "POST",
                headers: headers,
                body: body,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const responseData = yield response.json();
            const isProductAdded = !!responseData.data.id && responseData.data.id.trim() !== "";
            return isProductAdded;
        }
        catch (error) {
            console.error("Error adding product to variant group:", error);
            return false;
        }
    });
}
export function uploadImage(imageUrl, imageName, cookie) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate random 4-digit numbers
        const randomNum1 = Math.floor(1000 + Math.random() * 9000);
        const randomNum2 = Math.floor(1000 + Math.random() * 9000);
        // Construct the upload URL
        const uploadUrl = `https://${domain}/api/images/catalog/${randomNum1}/${randomNum2}`;
        try {
            // Fetch the image as a Blob
            const imageResponse = yield fetch(imageUrl);
            if (!imageResponse.ok)
                throw new Error("Failed to download image.");
            const imageBlob = yield imageResponse.blob();
            // Create form data
            const formData = new FormData();
            formData.append("images", imageBlob, imageName);
            formData.append("targetPath", `catalog/${randomNum1}/${randomNum2}`);
            // Send the POST request
            const response = yield fetch(uploadUrl, {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "X-Requested-With": "XMLHttpRequest",
                    Cookie: `asid=${cookie}`,
                },
                body: formData,
            });
            if (!response.ok)
                throw new Error("Image upload failed.");
            return yield response.json();
        }
        catch (error) {
            console.error("Error:", error);
            return null;
        }
    });
}
