document.getElementById("clickButton").addEventListener("click", async () => {
    showSpinner();

    try {
        const token = await getAdminToken();
        const productData = await getProductData();

        const data = {
            token: token,
            ...productData,
        };

        localStorage.setItem("productData", JSON.stringify(data));
        const creationRequest = await createProduct(data);
    } catch (error) {
        console.log(error);
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
 *  @returns {Promise<object | null>}
 * */
async function createProduct(product) {
    const creationRequest = await browser.runtime.sendMessage({
        action: "createProduct",
        product: product,
    });

    if (creationRequest && creationRequest.success) {
        const product = creationRequest.product;
        return product;
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
