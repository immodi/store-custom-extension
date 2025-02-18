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
    options: any[];
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

interface Variant {
    Product: string;
    Sku: string;
    Color: string;
    "Product Cost": string;
    "Shipping Cost": string;
    Tax: string;
    "Total Cost": string;
    "Profit Margin": string;
    Price: string;
    "Compare At Price": string;
    "Stock on AliExpress": number;
}

interface ProductData {
    token: string;
    title: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    variants: Variant[];
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

export async function createProductFromData(
    productData: ProductData
): Promise<ProductResponse | null> {
    try {
        const productRequest: ProductRequest = {
            name: productData.title,
            description: productData.title, // No description provided in ProductData
            short_description: productData.title, // No short description provided
            url_key: productData.title.replace(/\s+/g, "-").toLowerCase(), // Generate URL key
            meta_title: productData.title,
            meta_description: productData.title, // No meta description provided
            status: 1, // Assuming product is active
            sku: productData.variants[0]?.Sku || "", // Use the first variant's SKU
            price: productData.variants[0]?.Price || 0, // Use first variant price
            weight: productData.weight,
            qty: productData.variants
                .map((variant) => Number(variant["Stock on AliExpress"]) || 0)
                .reduce((acc, stock) => acc + stock, 0),
            group_id: 1, // Default group ID (adjust as needed)
            visibility: 1, // Assuming visible
            images: productData.variants.map((variant) => variant.Product), // Extract images from variants
            options: [
                {
                    option_name: "Color",
                    option_type: "select",
                    values: [
                        {
                            value: productData.variants[0].Color,
                            extra_price: productData.variants[0]?.Price,
                        },
                    ],
                },
            ],
        };

        const response = await fetch(`https://${domain}/api/products`, {
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

        const data: ProductResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating product:", error);
        return null;
    }
}
