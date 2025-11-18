import { NextResponse, NextRequest } from "next/server";
import { verifyAccessToken } from "@/src/security/auth";
import { CustomPlanModel } from "@/src/lib/models/cutomPLan.model";
import { roleMiddleware } from "@/src/middleware/auth";

export async function GET(req: NextRequest) {
    const authResult = await roleMiddleware(req, ["ADMIN", "EXECUTIVE"]);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const all_custom_plans: any = await CustomPlanModel.getAllCustomPLans();
   const data_response_array = all_custom_plans.map(plan => {
    return {
        "bedrooms": plan.bedrooms,
        "bathrooms": plan.bathrooms,
        "dining_rooms": plan.dining_rooms,
        "kitchen": plan.kitchen,
        "floors": plan.floors,
        "total_area": plan.total_area,
        "category": plan.category,
        "description": plan.description,
        "created_at": plan.created_at,
        "updated_at": plan.updated_at,
        "user_data":{
            "email": plan.email,
            "names": plan.names
        }
    };
});

return NextResponse.json(data_response_array, { status: 200 });

}