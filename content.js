async function clickButton() {
    const product = await grabGeneralData();

    return product;
}

/**
 * Grabs product data from the DOM and returns it as an object.
 * @returns {object} Product object containing product details.
 * @property {string} title - The title of the product.
 * @property {string} weight - The weight of the product.
 * @property {string} length - The length of the package.
 * @property {string} width - The width of the package.
 * @property {string} height - The height of the package.
 */
async function grabGeneralData() {
    const productTitle = document.querySelector("#title");
    const productWeight = document.querySelector("#package_weight");
    const packageLength = document.querySelector("#package_length");
    const packageWidth = document.querySelector("#package_width");
    const packageHeight = document.querySelector("#package_height");

    const variantData = await grabVariantData();

    return {
        title: productTitle.textContent ?? productTitle.innerText,
        weight: productWeight.value ?? productWeight.innerText,
        length: packageLength.value ?? "?",
        width: packageWidth.value ?? "?",
        height: packageHeight.value ?? "?",
        variants: variantData,
    };
}

/**
 * Extracts all data from an HTML table and returns it as an array of objects.
 * Each object represents a row, with keys as column headers and values as cell content.
 * @returns {Promise<object[]>} An array of objects representing the table data.
 */
async function grabVariantData() {
    // Click the variants tab to trigger potential loading
    document.querySelector("#rc-tabs-0-tab-Variants").click();

    return new Promise((resolve, reject) => {
        const checkInterval = 1000; // Check every 500ms
        const timeout = 50000; // 10-second timeout
        let elapsed = 0;

        const checkIntervalId = setInterval(() => {
            // Check if loading spinner exists
            const loadingSpinner = document.querySelector(".ant-spin-spinning");

            if (!loadingSpinner) {
                clearInterval(checkIntervalId);
                // Now that loading is complete, get the table data
                const table = document.querySelector("table");

                if (!table) {
                    reject(new Error("Table not found after loading"));
                    return;
                }
                resolve(extractTableData(table));
            }

            // Handle timeout
            elapsed += checkInterval;
            if (elapsed >= timeout) {
                clearInterval(checkIntervalId);
                reject(new Error("Timeout waiting for data to load"));
            }
        }, checkInterval);
    });
}

/**
 * Grabs data from an HTML table and returns it as an array of objects.
 * Each object represents a row, with keys as column headers and values as cell content.
 * @returns {object[]} An array of objects representing the table data.
 * @param {HTMLTableElement} tableNode - The table element to extract data from.
 */
function extractTableData(table) {
    if (!table) {
        console.error("Table not found!");
        return [];
    }

    const rows = table.querySelectorAll("tr");
    const headers = Array.from(rows[0].querySelectorAll("th")).map((header) =>
        header.textContent.trim()
    );
    const data = [];

    // Start from the second row (index 1) to skip the header row
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll("td");
        const rowData = {};

        cells.forEach((cell, index) => {
            const header = headers[index];
            rowData[header] = cell.textContent.trim();
        });

        data.push(rowData);
    }

    localStorage.setItem("productData", JSON.stringify(data));
    return data;
}

browser.runtime.onMessage.addListener((request, sender) => {
    if (request.action === "getProductData") {
        return Promise.resolve(
            clickButton().then((productData) => {
                return { success: true, data: productData };
            })
        );
    }
});
