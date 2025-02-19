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
                url_key: productData.title.replace(/\s+/g, "-").toLowerCase(), // Generate URL key
                meta_title: productData.title,
                meta_description: productData.title,
                status: 1, // Assuming product is active
                sku: ((_a = productData.variants[0]) === null || _a === void 0 ? void 0 : _a.Sku) || "", // Use the first variant's SKU
                price: ((_b = productData.variants[0]) === null || _b === void 0 ? void 0 : _b.Price) || 0, // Use first variant price
                weight: productData.weight,
                qty: productData.variants
                    .map((variant) => Number(variant.StockonAliExpress) || 0)
                    .reduce((acc, stock) => acc + stock, 0),
                group_id: (Math.random() * 10000).toFixed(0),
                visibility: 1, // Assuming visible
                images: productData.variants.map((variant) => variant.Product), // Extract images from variants
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
            options: options,
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
