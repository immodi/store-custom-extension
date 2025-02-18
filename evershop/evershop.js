var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            );
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
            } else {
                return null;
            }
        } catch (error) {
            console.error("Login failed:", error);
            return null;
        }
    });
}
export function createProduct(product) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sid = yield login();
            if (!sid) {
                throw new Error("Login failed");
            }
            const response = yield fetch(`https://${domain}/api/products`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Cookie: `asid=${sid}`,
                },
                body: JSON.stringify(product),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            return data;
        } catch (error) {
            console.error("Error creating product:", error);
            return null;
        }
    });
}
