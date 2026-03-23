import { Request, Response, RequestHandler } from "express";
import { verifyKhaltiPayment } from "../services/khalti.services";

export const verifyKhaltiPaymentController: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { pidx } = req.body;
        if (!pidx) {
            res.status(400).json({ error: "pidx is required" });
            return;
        }

        const result = await verifyKhaltiPayment(pidx);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Khalti Verify Error:", error);
        res.status(500).json({ error: error.message || "Failed to verify Khalti payment" });
    }
};
