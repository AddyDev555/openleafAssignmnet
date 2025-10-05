import { createShipment } from "../services/orderService.js";

export async function createOrder(req, res) {
    try {
        const orderData = req.body;
        const savedShipment = await createShipment(orderData);
        res.status(201).json({ success: true, data: savedShipment });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}
