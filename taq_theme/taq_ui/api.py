import frappe
from frappe.utils import cint

@frappe.whitelist()
def get_preachers_stateless(count_to_exam=30):
    limit = cint(count_to_exam or 0)
    preachers = frappe.get_all(
        "waed_info",
        filters={"workflow_state": "Scheduling an appointment"},
        fields=["name", "namee", "phoone", "office", "place"],
        limit=limit if limit > 0 else None
    )
    return preachers

@frappe.whitelist()
def get_dashboard_summary():
    total_preachers = frappe.db.count("waed_info")
    total_committees = frappe.db.count("exam_lag_data")
    total_exam_groups = frappe.db.count("exam_group_date")
    
    # Group preachers by office
    preachers_by_office = frappe.get_all(
        "waed_info",
        fields=["office", "count(name) as count"],
        group_by="office"
    )
    
    # Group preachers by workflow state
    preachers_by_status = frappe.get_all(
        "waed_info",
        fields=["workflow_state", "count(name) as count"],
        group_by="workflow_state"
    )
    
    return {
        "total_preachers": total_preachers,
        "total_committees": total_committees,
        "total_exam_groups": total_exam_groups,
        "preachers_by_office": preachers_by_office,
        "preachers_by_status": preachers_by_status
    }
