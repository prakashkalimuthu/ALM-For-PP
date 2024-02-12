if ("undefined" == typeof (BBBD365)) {
    BBBD365 = { __namespace: true };
    'use strict';
}

BBBD365.ApprovalRequest =
{
    onLoad: function (executionContext) {
        var formContext = executionContext.getFormContext();
        formContext.data.process.addOnPreStageChange(BBBD365.ApprovalRequest.preStageChange);
        formContext.getControl("ukn_facility").addPreSearch(BBBD365.ApprovalRequest.listProgrammeFacilityBasedOnBU);
    },

    preStageChange: function (executionContext) {
        var direction = executionContext.getEventArgs().getDirection();
        if (direction == "Previous") 
        {
            var formContext = executionContext.getFormContext();
            var approvalStatus = formContext.getAttribute("ukn_approvalstatus").getValue();
            var operationDecision = formContext.getAttribute("ukn_operationsdecision").getValue();
            var productTeamReviewerDecision = formContext.getAttribute("ukn_productteamreviewerdecision").getValue();
            var financeApproverDecision = formContext.getAttribute("ukn_financeapproverdecision").getValue();
            var finance2ndApproverDecision = formContext.getAttribute("ukn_finance2ndapproverdecision").getValue();
            var productTeamDecision = formContext.getAttribute("ukn_productteamdecision").getValue();

            if (approvalStatus != null && 
                approvalStatus != "968200006" && 
                operationDecision != 968200001 && 
                productTeamReviewerDecision != 968200001 &&
                financeApproverDecision != 968200001 &&
                finance2ndApproverDecision != 968200001 && 
                productTeamDecision != 968200001) //Rejected status check 
            {
                var alertStrings = { confirmButtonLabel: "Ok", text: "Previous Stage is not allowed.", title: "Information" };
                var alertOptions = { height: 120, width: 260 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                executionContext.getEventArgs().preventDefault();
            }
        }
        if(direction == "Next")
        {
            var formContext = executionContext.getFormContext();
            var approvalStatus = formContext.getAttribute("ukn_approvalstatus").getValue();
            var productTeamDecision = formContext.getAttribute("ukn_productteamdecision").getValue();

            if (
                approvalStatus == "968200006" && 
                productTeamDecision == 968200001) //Rejected status check 
            {
                var alertStrings = { confirmButtonLabel: "Ok", text: "You cannot progress to next stage as Product Team Approver Decision is Reject", title: "Information" };
                var alertOptions = { height: 120, width: 260 };
                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
                executionContext.getEventArgs().preventDefault();
            }
        }
    },

    listProgrammeFacilityBasedOnBU: function (executionContext) {
        var programmeFilter = null;
        var formContext = executionContext.getFormContext();
        var programmeListIds = BBBD365.Helper.getUserBusinessUnitAndProgramme();
        if (programmeListIds.length === 1) {
            programmeFilter = "<filter type='and'><condition attribute='ukn_investmentprogramme' operator='eq' value='" + programmeListIds[0] + "'/></filter>";
        }
        else if (programmeListIds.length > 1) {
            var buWithMultipleProgrammeList = [];
            programmeListIds.forEach(programme => buWithMultipleProgrammeList.push("<value>" + programme + "</value>"));
            programmeFilter = "<filter type='and'>" +
                "<condition attribute='ukn_investmentprogramme' operator='in'>" +
                buWithMultipleProgrammeList.join('') +
                "</condition></filter>";
        }

        if (programmeFilter !== null)
            formContext.getControl("ukn_facility").addCustomFilter(programmeFilter, "ukn_facility");
    }
}