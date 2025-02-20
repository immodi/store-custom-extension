document.getElementById("clickButton").addEventListener("click", async () => {
    showSpinner();

    try {
        const token = await getAdminToken();
        const productData = await getProductData();
        const data = {
            token: token,
            ...productData,
        };

        const attributeCode = await createAttribute(
            token,
            productData.title,
            productData.title
                .split(" ")
                .map((word) => word.toLowerCase())
                .join("-"),
            productData.variants.map((variant) => variant.Color)
        );

        const variantsUids = await createVariants(attributeCode, data);

        const variantGroupId = await createVariantGroup(attributeCode, token);
        variantsUids.forEach(async (variantsUid) => {
            await addProductToVariantGroup(variantGroupId, token, variantsUid);
        });
    } catch (error) {
        console.error(error);
    } finally {
        hideSpinner();
    }
});

/** @returns {Promise<string | null>} */
async function getAdminToken() {
    const adminToken = await browser.runtime.sendMessage({
        action: "login",
    });

    if (adminToken && adminToken.success) {
        const token = adminToken.data.token;
        return token;
    } else {
        return null;
    }
}

/** @returns {Promise<object | null>} */
async function getProductData() {
    const productData = await browser.runtime.sendMessage({
        action: "getProductData",
    });

    if (productData && productData.success) {
        const data = productData.data;
        return data;
    } else {
        return null;
    }
}

/**
 * @param {object} product
 * @returns {Promise<object | null>}
 * */
async function createProduct(product) {
    const creationRequest = await browser.runtime.sendMessage({
        action: "createProduct",
        product: product,
    });

    if (creationRequest && creationRequest.success) {
        const product = creationRequest.data.product;
        return product;
    } else {
        return null;
    }
}

/**
 * @param {object} productObject
 * @returns {Promise<string[]>}
 */
async function createVariants(attributeCode, productObject) {
    const variants = productObject.variants.map((variant, index) => {
        return {
            ...productObject,
            sku: variant.Sku ?? "",
            price: variant.TotalCost ?? 0,
            qty: variant.StockonAliExpress ?? 0,
            attr_code: attributeCode,
            attr_value: (index + 73).toString(),
            visibility: index === 0 ? "1" : "0",
        };
    });

    const variantsUids = await Promise.all(
        variants.map(async (variant) => {
            const variantObject = await createProduct(variant);
            return variantObject.data.uuid;
        })
    );

    console.log(JSON.stringify(variantsUids));

    return variantsUids;
}

/**
 * @param {string} attributeCode
 * @param {string} attributeName
 * @param {string} authCookie
 * @param {object} options
 * @returns {Promise<string | null>}
 * */
async function createAttribute(
    authCookie,
    attributeName,
    attributeCode,
    options
) {
    const creationRequest = await browser.runtime.sendMessage({
        action: "createAttribute",
        authCookie: authCookie,
        attributeName: attributeName,
        attributeCode: attributeCode,
        options: options,
    });

    if (creationRequest && creationRequest.success) {
        return attributeCode;
    } else {
        return null;
    }
}

/**
 * @param {string} attributeCode
 * @param {string} cookieToken
 * @returns {Promise<string | null>}
 * */
async function createVariantGroup(attributeCode, cookieToken) {
    const creationRequest = await browser.runtime.sendMessage({
        action: "createVariantGroup",
        attributeCode: attributeCode,
        cookieToken: cookieToken,
    });

    if (creationRequest && creationRequest.success) {
        const variantGroupUid = creationRequest.data.variantGroupUid;
        return variantGroupUid;
    } else {
        return null;
    }
}

/**
 * @param {string} productId
 * @param {string} cookieToken
 * @param {string} variantGroupId
 * @returns {Promise<boolean>}
 * */
async function addProductToVariantGroup(
    variantGroupId,
    cookieToken,
    productId
) {
    const request = await browser.runtime.sendMessage({
        action: "addProductToVariantGroup",
        variantGroupId: variantGroupId,
        cookieToken: cookieToken,
        productId: productId,
    });

    if (request && request.success) {
        const isAdded = request.success;
        return isAdded;
    } else {
        return null;
    }
}

function hideSpinner() {
    document.querySelector("#clickButton").style.display = "block";
    document.querySelector(".spinner").style.display = "none";
}

function showSpinner() {
    document.querySelector("#clickButton").style.display = "none";
    document.querySelector(".spinner").style.display = "block";
}
