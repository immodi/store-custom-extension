const domain = "sahlstor.com";

interface UserResponse {
    data: {
        sid: string;
    };
}

interface ProductRequest {
    name: string;
    description: string;
    short_description: string;
    url_key: string;
    meta_title: string;
    meta_description: string;
    status: 0 | 1;
    sku: string;
    price: string | number;
    weight: string | number;
    qty: string | number;
    group_id: string | number;
    visibility: 0 | 1;
    images: string[];
}

interface ProductResponse {
    data: {
        product_id: number;
        uuid: string;
        variant_group_id: number | null;
        visibility: number;
        group_id: number;
        image: string | null;
        sku: string;
        price: number;
        qty: number;
        weight: number;
        manage_stock: number;
        stock_availability: number;
        tax_class: string | null;
        status: number;
        created_at: string;
        updated_at: string;
        product_description_id: number;
        product_description_product_id: number;
        name: string;
        description: string | null;
        short_description: string | null;
        url_key: string;
        meta_title: string;
        meta_description: string | null;
        meta_keywords: string | null;
        links: {
            rel: string;
            href: string;
            action: string;
            types: string[];
        }[];
    };
}

export async function login(): Promise<string | null> {
    const email = "admin@admin.com";
    const password = "modimodi";

    try {
        const response = await fetch(`https://${domain}/admin/user/login`, {
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

        const data: UserResponse = await response.json();

        if (data && data.data && data.data.sid) {
            return data.data.sid;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Login failed:", error);
        return null;
    }
}

export async function createProduct(
    product: ProductRequest
): Promise<ProductResponse | null> {
    try {
        const sid = await login();

        if (!sid) {
            throw new Error("Login failed");
        }

        const response = await fetch(`https://${domain}/api/products`, {
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

        const data: ProductResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating product:", error);
        return null;
    }
}
