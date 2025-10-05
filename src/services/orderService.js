import axios from "axios";
import { retryWithBackoff } from "../utils/retry.js";
import { saveShipment } from "../models/shipmentModel.js";

export async function createShipment(orderData) {
    const url = process.env.BASE_URL ? `${process.env.BASE_URL.replace(/\/$/, '')}/v1/waybill/` : undefined;
    const token = process.env.API_KEY;

    const headerName = process.env.API_KEY_HEADER || 'Authorization';
    const headerPrefix = process.env.API_KEY_PREFIX !== undefined ? process.env.API_KEY_PREFIX : 'Bearer';

    if (!process.env.BASE_URL) {
        throw new Error('Environment variable BASE_URL is not set. The external API URL is required.');
    }

    if (!token) {
        throw new Error('Environment variable API_KEY is not set. The external API authentication token is required.');
    }

    if (!orderData.order_id) {
        throw new Error("order_id is required");
    }

    // Send the incoming order JSON as the payload for the external API
    const payload = orderData;

    const callApi = async () => {
        try {
            // Build auth header value according to configuration
            const authHeaderValue = headerPrefix ? `${headerPrefix} ${token}` : token;
            console.log(`Using auth header: ${headerName}`);
            return await axios.post(url, payload, {
                headers: {
                    [headerName]: authHeaderValue,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                timeout: 10000,
            });
        } catch (err) {
            // If the remote server returned a response, include that info in the thrown error
            if (err.response) {
                const { status, data } = err.response;
                const e = new Error(`External API request failed with status ${status}`);
                e.status = status;
                e.remoteData = data;
                console.error('External API error response:', { status, data });
                throw e;
            }
            throw err;
        }
    };

    const response = await retryWithBackoff(callApi, 3, 1000);
    return await saveShipment(orderData.order_id, orderData.customer_name, response.data);
}
