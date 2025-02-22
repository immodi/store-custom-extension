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

    const variantData = await awaitLoadAndGrab(
        document.querySelector(".ant-tabs-nav-list").childNodes[1],
        () => {
            const loadingSpinner = document.querySelector(".ant-spin-spinning");
            const table = document.querySelector("table");

            if (!loadingSpinner && table) {
                return table;
            }

            return null;
        },
        extractTableData
    );
    const description = await awaitLoadAndGrab(
        document.querySelector(".ant-tabs-nav-list").childNodes[2],
        () => {
            const loadingSpinner = document.querySelector(".ant-spin-spinning");
            const iFrame = document.querySelectorAll("iframe")[1];

            if (!loadingSpinner && iFrame) {
                return iFrame;
            }

            return null;
        },
        extractDescription
    );
    const imagesArray = await awaitLoadAndGrab(
        document.querySelector(".ant-tabs-nav-list").childNodes[3],
        () => {
            const loadingSpinner = document.querySelector(".ant-spin-spinning");
            const imagesContainer = document.querySelector(
                ".index_imgAllContainer__YIEBT"
            );

            if (!loadingSpinner && imagesContainer) {
                return imagesContainer;
            }

            return null;
        },
        extractImages
    );

    const data = {
        title:
            productTitle.textContent ??
            productTitle.innerText ??
            productTitle.value,
        weight:
            productWeight.value ??
            productWeight.innerText ??
            productWeight.textContent,
        length: packageLength.value ?? "?",
        width: packageWidth.value ?? "?",
        height: packageHeight.value ?? "?",
        description: description ?? "",
        images: imagesArray,
        variants: variantData,
    };

    return data;
}

browser.runtime.onMessage.addListener((request, sender) => {
    if (request.action === "getProductData") {
        const product = grabGeneralData();
        return Promise.resolve(
            product.then((productData) => {
                return { success: true, data: productData };
            })
        );
    }
});

function zoomOut(scaleFactor = 0.6) {
    document.body.style.transform = `scale(${scaleFactor})`;
    document.body.style.transformOrigin = "0 0"; // Ensures scaling from the top-left
    document.body.style.width = `${100 / scaleFactor}%`; // Adjust width to prevent clipping
}

/**
 * @param {HTMLElement} tabNode
 * @param {() => any} checkFunction
 * @param {(T) => void} callback
 * @returns {Promise<any>}
 */
async function awaitLoadAndGrab(tabNode, checkFunction, callback) {
    // Click the variants tab to trigger potential loading
    tabNode.click();

    return new Promise((resolve, reject) => {
        const checkInterval = 1000; // Check every 500ms
        const timeout = 50000; // 10-second timeout
        let elapsed = 0;

        const checkIntervalId = setInterval(() => {
            // Check if loading spinner exists
            const targetNode = checkFunction();

            if (targetNode) {
                clearInterval(checkIntervalId);

                resolve(callback(targetNode));
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

    zoomOut(0.5);

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
            const key = index === 2 ? "Color" : header.replaceAll(" ", "");
            rowData[key] = cell.textContent.trim();
        });

        data.push(rowData);
    }

    zoomOut(1);
    return data;
}

/**
 * @returns {string} An array of objects representing the table data.
 * @param {HTMLIFrameElement} IFrameElement
 */
function extractDescription(IFrameElement) {
    if (IFrameElement) {
        const textContent =
            IFrameElement.contentDocument.querySelector("body").innerText;

        return textContent;
    }

    return "";
}

/**
 * @returns {string[] | null}
 * @param {HTMLDivElement} imagesContainer
 */
function extractImages(imagesContainer) {
    if (imagesContainer) {
        const imagesArray = Array.from(
            imagesContainer.querySelectorAll("img")
        ).map((imgNode) => imgNode.src);

        return imagesArray;
    }

    return null;
}
