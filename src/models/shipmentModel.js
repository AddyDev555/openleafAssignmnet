import pool from "../config/db.js";

export async function saveShipment(orderId, customerName, response) {
    const query = `
    INSERT INTO shipments (order_id, customer_name, waybill, courier_name, status, response)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (order_id) DO UPDATE SET response = $6, waybill = $3, courier_name = $4, status = $5
    RETURNING *;
    `;
    const values = [
        orderId,
        customerName,
        response.waybill || null,
        response.courierName || null,
        response.status || null,
        response,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
}
