//===========================================================//
// Uses: CRM Odata and REST-ful web services.
//
// Description: 
// 1.   Method : onSave_riskRequirements - GWS - allow to select multichoice on selection of Other field
// 2.   Method : onSave_setUSerUpdatingRiskDetails - GWS - set user who ios modifying risk details 
// 3.   Method : onChange_mainActivity - UKN - on selection of main activity field, segmentation field, Default Values
// 3.   Method : onChange_segmentation - UKN - on manual selection or auto populate based on main activity, Segmentation field, Default Values
// 4.   Method : onSave_account - Wrapper to call other onSave methods 
// Version - 6.6.0.0    29/04/2022 & Dec-2021
//===========================================================// 

if ("undefined" == typeof (BBBD365)) {
    BBBD365 = 
	{ __namespace: true};	
}

BBBD365.Account = {	

    onLoad_RiskRequirements: function(executionContext)
    {
        var formContext = executionContext.getFormContext();

         //ukn_performriskassessment selected as yes
         if(formContext.getAttribute("ukn_performriskassessment").getValue() == null)
         {
             formContext.getAttribute("ukn_covenantsset").setValue(null);
             formContext.getAttribute("ukn_buspinplace").setValue(null);
             formContext.getAttribute("ukn_spvstructureinplace").setValue(null);
         }
    },
    onLoad_ECFQuickCreateForm: function(executionContext)
    {
        var formContext = executionContext.getFormContext();

         
        formContext.getAttribute("address1_line1").setRequiredLevel("none");
        formContext.getAttribute("address1_postalcode").setRequiredLevel("none");
        formContext.getAttribute("ukn_region").setRequiredLevel("none");
         
    },
    onSave_account: function(executionContext) 
    {
        BBBD365.Account.onSave_riskRequirements(executionContext);
        BBBD365.Account.onSave_setUserUpdatingRiskDetails(executionContext);
        BBBD365.Account.onSave_setRiskDetailsModifiedDatetime(executionContext);
    },

	onSave_riskRequirements: function(executionContext) 
	{
		var formContext = executionContext.getFormContext();		
        var selectedRequirementsValues = formContext.getAttribute("ukn_requirementsfrequency").getValue();

        // Other value = 968200004
        if(selectedRequirementsValues)
        {
            if(formContext.getAttribute("ukn_performriskassessment").getValue() == 0)
            {
                formContext.getAttribute("ukn_requirementsfrequency").setValue(null);
            }

            var otherOption = selectedRequirementsValues.includes(968200004);

            if(selectedRequirementsValues.length >= 2 && !otherOption)
            {
                var alertStrings = { text: "For Risk - Requirements, multiple choice options can be only selected along with option 'Other'." };
                var alertOptions = { height: 120, width: 260 };
                //Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then( function () { }  );
                //formContext.getAttribute("ukn_requirementsfrequency").setValue(null);
            }
        }
    },

    onSave_setUserUpdatingRiskDetails: function (executionContext)
    {
        var formContext = executionContext.getFormContext();	

         //ukn_performriskassessment selected as yes
         if(formContext.getAttribute("ukn_performriskassessment").getValue() == 1)
         {
            var userSettings = Xrm.Utility.getGlobalContext().userSettings; // get userSettings 

            var riskDetailsUpdateUserlookupValue = new Array();
            riskDetailsUpdateUserlookupValue[0] = new Object();
            riskDetailsUpdateUserlookupValue[0].id = userSettings.userId; 
            riskDetailsUpdateUserlookupValue[0].name = userSettings.userName; 
            riskDetailsUpdateUserlookupValue[0].entityType = "systemuser"; 

            formContext.getAttribute("ukn_whoiscompletingriskcheck").setValue(riskDetailsUpdateUserlookupValue); 
         }
    },

    onSave_setRiskDetailsModifiedDatetime: function (executionContext)
    {   
        var formContext = executionContext.getFormContext();
        
        //ukn_performriskassessment selected as yes
        if(formContext.getAttribute("ukn_performriskassessment").getValue() == 1)
        {
            var currentDateTime = new Date();
            formContext.getAttribute("ukn_riskdetailssubmitteddate").setValue(currentDateTime);
        }
    },

    onChange_PerformRiskAssessment: function (executionContext)
    {
        var formContext = executionContext.getFormContext();
        
        //ukn_performriskassessment selected as yes
        if(formContext.getAttribute("ukn_performriskassessment").getValue() == 0 || formContext.getAttribute("ukn_performriskassessment").getValue() == null)
        {
            //Requirements multi select option set 
            formContext.getAttribute("ukn_requirementsfrequency").setRequiredLevel("none");
            formContext.getAttribute("ukn_requirementsfrequency").setValue(null); 
            formContext.getControl("ukn_requirementsfrequency").setDisabled(true);
            formContext.getControl("ukn_requirementsfrequency").setVisible(false);

            formContext.getAttribute("ukn_covenantsset").setValue(false);
            formContext.getAttribute("ukn_covenantsset").setRequiredLevel("none");
            formContext.getAttribute("ukn_buspinplace").setValue(false);
            formContext.getAttribute("ukn_buspinplace").setRequiredLevel("none");
            formContext.getAttribute("ukn_spvstructureinplace").setValue(false);
            formContext.getAttribute("ukn_spvstructureinplace").setRequiredLevel("none");
            
            formContext.getControl("ukn_detailsofcovenant").setVisible(false);
            formContext.getControl("ukn_nameofbusp").setVisible(false);
        }
        else if(formContext.getAttribute("ukn_performriskassessment").getValue() == 1)
        {
             //Requirements multi select option set 
             formContext.getAttribute("ukn_requirementsfrequency").setRequiredLevel("required");
             formContext.getControl("ukn_requirementsfrequency").setDisabled(false);
             formContext.getControl("ukn_requirementsfrequency").setVisible(true);
        }
    },

    // start CRMD-299 UKN - Segmentation field, Default Values
    onChange_mainActivity: function(executionContext) 
    {
        var formContext = executionContext.getFormContext();
        formContext.getAttribute("ukn_segmentationchangedmanually").setValue(false);
    },

    onChange_segmentation: function (executionContext) {
        var formContext = executionContext.getFormContext();
        formContext.getAttribute("ukn_segmentationchangedmanually").setValue(true);
    },
};	