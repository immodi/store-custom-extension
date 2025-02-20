const domain = "sahlstor.com";

interface Variant {
    Product: string;
    Sku: string;
    Color: string;
    ProductCost: string;
    ShippingCost: string;
    Tax: string;
    TotalCost: string;
    ProfitMargin: string;
    Price: string;
    CompareAtPrice: string;
    StockonAliExpress: string;
}

interface ReturnedProductData {
    token: string;
    title: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    description: string;
    images: string[];
    variants: Variant[];
}

interface RequestProductData extends ReturnedProductData {
    sku: string;
    price: number;
    qty: number;
    attr_code: string;
    attr_value: string;
    visibility: 0 | 1;
}

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
    attributes: any[];
}

interface UploadImageResponse {
    data: {
        files: {
            name: string;
            size: number;
            url: string;
        }[];
    };
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

interface AttributeResponse {
    data: {
        attribute_id: number;
        uuid: string;
        attribute_code: string;
        attribute_name: string;
        type: string;
        is_required: number;
        display_on_frontend: number;
        sort_order: number;
        is_filterable: number;
        links: {
            rel: string;
            href: string;
            action: string;
            types: string[];
        }[];
    };
}

interface VariantGroupResponse {
    data: {
        variant_group_id: number;
        uuid: string;
        attribute_group_id: number;
        attribute_one: number;
        attribute_two: number;
        attribute_three: number;
        attribute_four: number;
        attribute_five: number;
    };
}

interface VariantGroupItemResponse {
    data: {
        id: string;
        attributes: {
            attribute_id: number;
            attribute_code: string;
            option_id: number;
        }[];
        product: {
            product_id: number;
            uuid: string;
            variant_group_id: number;
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
        };
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

export async function createProductFromData(
    productData: RequestProductData
): Promise<ProductResponse | null> {
    try {
        const productRequest: ProductRequest = {
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
            sku: productData.sku ?? "", // Use the first variant's SKU
            // price: productData.variants[0]?.Price ?? 0, // Use first variant price
            price: productData.price ?? 0, // Use first variant price
            weight: productData.weight,
            // qty: productData.variants
            //     .map((variant) => Number(variant.StockonAliExpress) || 0)
            //     .reduce((acc, stock) => acc + stock, 0),
            qty: productData.qty,
            group_id: 1,
            visibility: productData.visibility,
            images: await Promise.all(
                productData.images.map(async (imgUrl) => {
                    const image = await uploadImage(
                        imgUrl,
                        imgUrl.split("/")[4],
                        productData.token
                    );

                    return image?.data.files[0].url ?? imgUrl;
                })
            ),
            attributes: [
                {
                    attribute_code: productData.attr_code,
                    value: productData.attr_value,
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

export async function createAttribute(
    authCookie: string,
    attributeName: string,
    attributeCode: string,
    options: string[]
): Promise<string | null> {
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
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: AttributeResponse = await response.json();

        return data.data.uuid;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

export async function createVariantGroup(
    attributeCode: string,
    cookieToken: string
): Promise<string | null> {
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
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const vairantGroup: VariantGroupResponse = await response.json();

        return vairantGroup.data.uuid;
    } catch (error) {
        console.error("Error creating variant group:", error);
        return null;
    }
}

export async function addProductToVariantGroup(
    variantGroupId: string,
    cookieToken: string,
    productId: string
): Promise<boolean> {
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
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData: VariantGroupItemResponse = await response.json();

        const isProductAdded =
            !!responseData.data.id && responseData.data.id.trim() !== "";

        return isProductAdded;
    } catch (error) {
        console.error("Error adding product to variant group:", error);
        return false;
    }
}

export async function uploadImage(
    imageUrl: string,
    imageName: string,
    cookie: string
): Promise<UploadImageResponse | null> {
    // Generate random 4-digit numbers
    const randomNum1 = Math.floor(1000 + Math.random() * 9000);
    const randomNum2 = Math.floor(1000 + Math.random() * 9000);

    // Construct the upload URL
    const uploadUrl = `https://${domain}/api/images/catalog/${randomNum1}/${randomNum2}`;

    try {
        // Fetch the image as a Blob
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error("Failed to download image.");
        const imageBlob = await imageResponse.blob();

        // Create form data
        const formData = new FormData();
        formData.append("images", imageBlob, imageName);
        formData.append("targetPath", `catalog/${randomNum1}/${randomNum2}`);

        // Send the POST request
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                Accept: "*/*",
                "X-Requested-With": "XMLHttpRequest",
                Cookie: `asid=${cookie}`,
            },
            body: formData,
        });

        if (!response.ok) throw new Error("Image upload failed.");
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
