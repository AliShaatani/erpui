import frappe
from frappe.utils import cint

@frappe.whitelist()
def check_workflow_state():
    return {
        "has_workflow": frappe.db.has_column("waed_info", "workflow_state")
    }

@frappe.whitelist()
def get_workflow_state_details(doctype, docname):
    # Check if doctype has workflow_state column
    has_column = frappe.db.has_column(doctype, "workflow_state")
    if not has_column:
        return {"has_workflow": False}
        
    from frappe.model.workflow import get_workflow_name, get_transitions
    workflow_name = get_workflow_name(doctype)
    if not workflow_name:
        return {"has_workflow": False}
        
    doc = frappe.get_doc(doctype, docname)
    transitions = get_transitions(doc)
    
    workflow = frappe.get_doc("Workflow", workflow_name)
    state_field = workflow.workflow_state_field
    current_state = doc.get(state_field)
    
    return {
        "has_workflow": True,
        "workflow_name": workflow_name,
        "current_state": current_state,
        "state_field": state_field,
        "transitions": transitions
    }

@frappe.whitelist()
def apply_workflow_action(doctype, docname, action):
    doc = frappe.get_doc(doctype, docname)
    from frappe.model.workflow import apply_workflow
    apply_workflow(doc, action)
    doc.save()
    frappe.db.commit()
    return {"status": "success", "workflow_state": doc.workflow_state}

@frappe.whitelist()
def get_preachers_stateless(count_to_exam=30):
    limit = cint(count_to_exam or 0)
    has_workflow = frappe.db.has_column("waed_info", "workflow_state")
    if has_workflow:
        filters = {"workflow_state": "Scheduling an appointment"}
    else:
        filters = {}
    preachers = frappe.get_all(
        "waed_info",
        filters=filters,
        fields=["name", "namee", "phoone", "office", "place"],
        limit=limit if limit > 0 else None
    )
    return preachers

@frappe.whitelist()
def get_preachers_list(search_text=None, office=None, status=None, gender=None, limit=100):
    filters = {}
    if search_text:
        filters["namee"] = ["like", f"%{search_text}%"]
    if office:
        filters["office"] = office
    if gender:
        filters["gender"] = gender
    
    has_workflow = frappe.db.has_column("waed_info", "workflow_state")
    if has_workflow and status:
        filters["workflow_state"] = status
    
    fields = ["name", "namee", "num_w", "phoone", "office", "gender", "creation"]
    if has_workflow:
        fields.append("workflow_state")
        
    preachers = frappe.get_all(
        "waed_info",
        filters=filters,
        fields=fields,
        order_by="creation desc",
        limit=limit
    )
    
    # If workflow_state is not in fields, assign "Draft"
    for p in preachers:
        if "workflow_state" not in p:
            p["workflow_state"] = "Draft"
            
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
    
    has_workflow = frappe.db.has_column("waed_info", "workflow_state")
    
    # Group preachers by workflow state
    if has_workflow:
        preachers_by_status = frappe.get_all(
            "waed_info",
            fields=["workflow_state", "count(name) as count"],
            group_by="workflow_state"
        )
    else:
        preachers_by_status = [{"workflow_state": "Draft", "count": total_preachers}]
    
    return {
        "total_preachers": total_preachers,
        "total_committees": total_committees,
        "total_exam_groups": total_exam_groups,
        "preachers_by_office": preachers_by_office,
        "preachers_by_status": preachers_by_status,
        "has_workflow": has_workflow
    }
