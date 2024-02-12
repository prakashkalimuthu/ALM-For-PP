//===========================================================//
// Uses: CRM Odata and REST-ful web services.
//
// Description: 
// 1.   Method : onLoad_investmentProgramme - set programme, 


// Version - 1.0.0.0    30/05/2023
//===========================================================// 

if ("undefined" == typeof (BBBD365)) {
    BBBD365 =
        { __namespace: true };
}

BBBD365.RelationshipLead = {
    onLoad_investmentProgramme: function (executionContext) {
        var formContext = executionContext.getFormContext();
      
        formContext.getControl("ukn_programmeid").addPreSearch(BBBD365.RelationshipLead.callHelper);
    },

    callHelper: function (executionContext) {
        var programmeFilter = null;
        var formContext = executionContext.getFormContext();
        var programmeListIds = BBBD365.Helper.getUserBusinessUnitAndProgramme();
        if (programmeListIds.length === 1) {
            programmeFilter = "<filter type='and'><condition attribute='bbb_investmentprogrammeid' operator='eq' value='" + programmeListIds[0] + "'/></filter>";
        }
        else if (programmeListIds.length > 1) {
            var buWithMultipleProgrammeList = [];
            programmeListIds.forEach(programme => buWithMultipleProgrammeList.push("<value>" + programme + "</value>"));
            programmeFilter = "<filter type='and'>" +
                "<condition attribute='bbb_investmentprogrammeid' operator='in'>" +
                buWithMultipleProgrammeList.join('') +
                "</condition></filter>";
        }

        if (programmeFilter !== null) {
            formContext.getControl("ukn_programmeid").addCustomFilter(programmeFilter, "bbb_investmentprogramme");
        }
    }
};