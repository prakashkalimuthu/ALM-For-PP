//===========================================================//
// Uses: CRM Odata and REST-ful web services.
//
// Description: 
// 1.   Method : onChange_existingContact - set first name, last name onchange of existingContact
// 2.   Method : onChange_existingAccount - set company name onchange of existingAccount
// 3.   Method: Not in Use - Add Warning Notification about the Topic field.
// 4.   Method : onLoad_investmentProgramme - set programme, subprogramme, subprogramme type field disabled if stateCode = 3
// 5.   Mathod : onChange_investmentProgramme - set subprogramme, subprogramme type field disabled if p[rogramme not selected, set subprogrammetype disabed if progrmme selected
// 6.   Method: Internal - filterSubProgrammes - apply custom filter on SubProgramme based on programme selected 
// 7.   Method: Internal - isNRIFProgramme   - check if selected Investment Programme is Nrif or not
// 8.   Method: Internal - setFormForNrifProgrammes   - helper method to  set form fields for Nrif programme
// 9.  Method: Internal - hideShowFormAttribtutes   - helper method to show and hide/show form fields for Nrif programme
// 10.  Method: Internal - hideShowBpfAttribtutes   - helper method to show and hide/show bpf fields for Nrif programme
// 11.  Method: Internal - setRequiedBpfAttribtutes   - helper method to set required/none to bpf fields for Nrif programme
// 12.  Method: Internal - filterVehicleTypes   - helper method to filter Vehicle types options on selection of investment Programme
// 13.  Method: Internal - filterSubAssetClass -  filter sub asset class based on custom view
// 14.  Method: Internal - filterSubAssetClassForProgramme - filter sub asset class using fetch XML for programme
// 15.  Method: onChange_subAssetClass - enable or disable fund based on sub asset class
// 16.  Method: onChange_subProgramme - filter sub asset class based on programme or sub - programme
// 17.  Method: Internal - iconForDealStage - Display icon based on deal stage
// 18.  Method: Internal - setECFProgramme - Auto populate programme with ECF for ECF BU.
// 19.  Method: Internal - hideAccountFieldsForECF - Hide fields on create account section 
// 20.  Method: Internal - hideContactFieldForECF - Hide fields on create contact section
// 21.  Method: onLoad_QuickCreate - Fill ECF as programme in quick create form

//===========================================================// 

if ("undefined" == typeof (BBBD365)) {
    BBBD365 =
        { __namespace: true };

}

BBBD365.Lead = {
    onChange_existingContact: function (executionContext) {
        'use strict';
        var formContext = executionContext.getFormContext();
        var contact = formContext.getAttribute("parentcontactid").getValue();

        if (contact) {
            Xrm.WebApi.retrieveRecord("contact", contact[0].id.replace('{', '').replace('}', '').trim(), 
            "?$select=firstname,lastname,fullname").then(
                function success(result) {
                    if (result) {
                        if (formContext.getAttribute("fullname")) {
                            var fullname = (result.firstname).concat(" ", result.lastname);
                            formContext.getAttribute("fullname").setValue(fullname);
                        }

                        formContext.getAttribute("firstname").setValue(result.firstname);
                        formContext.getAttribute("lastname").setValue(result.lastname);
                    }
                },
                function (error) {
                }
            );

            return;
        }

        if (formContext.getAttribute("firstname")) {
            formContext.getAttribute("firstname").setValue(null);
        }

        if (formContext.getAttribute("lastname")) {
            formContext.getAttribute("lastname").setValue(null);
        }

        if (formContext.getAttribute("fullname")) {
            formContext.getAttribute("fullname").setValue(null);
        }
    },

    onChange_existingAccount: function (executionContext) {
        'use strict';
        var formContext = executionContext.getFormContext();
        var account = formContext.getAttribute("parentaccountid").getValue();

        if (account != null) {
            Xrm.WebApi.retrieveRecord("account", account[0].id.replace('{', '').replace('}', '').trim(), 
            "?$select=address1_line1,address1_line2,address1_line3,address1_city,address1_stateorprovince,address1_postalcode,address1_country").then(
                function success(result) {
                    if (result) {
                        formContext.getAttribute("ukn_street1").setValue(result.address1_line1);
                        formContext.getAttribute("ukn_street2").setValue(result.address1_line2);
                        formContext.getAttribute("ukn_street3").setValue(result.address1_line3);
                        formContext.getAttribute("ukn_towncity").setValue(result.address1_city);
                        formContext.getAttribute("ukn_countystateprovince").setValue(result.address1_stateorprovince);
                        formContext.getAttribute("ukn_zippostalcode").setValue(result.address1_postalcode);
                        formContext.getAttribute("ukn_countryregion").setValue(result.address1_country);
                    }
                },
                function (error) {
                });
            formContext.getAttribute("companyname").setValue(account["0"].name);
            return;
        }

        formContext.getAttribute("companyname").setValue(null);
    },

 onChange_existingAccountQuickCreate: function (executionContext) {
        'use strict';
        var formContext = executionContext.getFormContext();
        var account = formContext.getAttribute("parentaccountid").getValue();

        if (account != null) {
           
            formContext.getAttribute("companyname").setValue(account["0"].name);
            return;
        }

        formContext.getAttribute("companyname").setValue(null);
    },

    // FUNCTION: Topic Notification
    // Display a notification warning for the Topic field.
    topic_notification: function () {
        executionContext.getFormContext().ui.setFormNotification("The Project Name field is public information. ", "WARNING");
    },

    onLoad_investmentProgramme: function (executionContext) {
        var formContext = executionContext.getFormContext();
        let subAssetClassCount = 0;
        formContext.getControl("bbb_investmentprogramme").addPreSearch(BBBD365.Lead.callHelper);
        if (formContext.getControl("header_process_bbb_investmentprogramme") !== null)
            formContext.getControl("header_process_bbb_investmentprogramme").addPreSearch(BBBD365.Lead.callHelper);
        if (formContext.getAttribute("statuscode")) {
            var stateCode = formContext.getAttribute("statuscode").getValue();

            if (stateCode == 3) {
                formContext.getControl("bbb_investmentsubprogramme")?.setDisabled(true);
                formContext.getControl("bbb_investmentprogramme").setDisabled(true);

                if (formContext.getControl("header_process_bbb_investmentprogramme")) {
                    formContext.getControl("header_process_bbb_investmentprogramme").setDisabled(true);
                }

                if (formContext.getControl("header_process_bbb_investmentsubprogramme")) {
                    formContext.getControl("header_process_bbb_investmentsubprogramme").setDisabled(true);
                }

                return;
            }
        }

        if(formContext.ui.formSelector.getCurrentItem().getId() === "953b0d89-7ae9-4dbc-b66b-22a61f4bc841" 
        && formContext.getAttribute("bbb_investmentprogramme").getValue() === null 
        && formContext.getAttribute("parentaccountid").getValue() === null)// ECF form
        {
            BBBD365.Lead.setECFProgramme(formContext);
            BBBD365.Lead.hideAccountFieldsForECF(formContext);
        }

        if(formContext.getAttribute("bbb_investmentprogramme").getValue()!==null&&formContext.getAttribute("bbb_investmentprogramme").getValue()[0].id == "{FD831013-B3CA-E711-8108-70106FAA2611}"){
            let hideFields = ["bbb_investmentsubprogramme", "ukn_category", "ukn_expectedcompletiondate", "ukn_fundlocation", "ukn_fundsize", "ukn_managercommitment", "ukn_dateofinterestsubmission"];
            hideFields.forEach(function(field){
                    formContext.getControl(`header_process_${field}`)?.setVisible(false);
            });
            formContext.getAttribute("ukn_initialcontactdate").setRequiredLevel("required");
            formContext.ui.clearFormNotification("ECFAlertToQualify");
            formContext.ui.setFormNotification("Qualify lead to opportunity by pressing Proceed to EOI in top ribbon. Before qualifying fill all the required values in form and BPF fields", "INFO", "ECFAlertToQualify");
        }

        if(formContext.ui.formSelector.getCurrentItem().getId() === "953b0d89-7ae9-4dbc-b66b-22a61f4bc841" && formContext.getAttribute("parentcontactid").getValue() === null)// ECF form
            BBBD365.Lead.hideContactFieldForECF(formContext);

        if(formContext.ui.formSelector.getCurrentItem().getId() === "953b0d89-7ae9-4dbc-b66b-22a61f4bc841")
           formContext.getControl("header_process_ukn_expectedbbbcommitment").getAttribute().setRequiredLevel("required");

        var isProgrammePopulated = formContext.getControl("bbb_investmentprogramme").getAttribute().getValue();

        if (isProgrammePopulated == null) {
            //DMO 
            formContext.getControl("ukn_vehicletypes").setDisabled(true);
            formContext.getControl("ukn_vehicletypes").getAttribute().setValue(null);
            //DMO end

            formContext.getControl("bbb_investmentsubprogramme").setDisabled(true);
            formContext.getControl("ukn_subassetclass").setDisabled(true);

            if (formContext.getControl("header_process_bbb_investmentsubprogramme")) {
                formContext.getControl("header_process_bbb_investmentsubprogramme").setDisabled(true);
            }
        }
        else {
            var currentFormId = formContext.ui.formSelector.getCurrentItem().getId();
            switch (currentFormId) {
                case "2f63feef-fb87-ec11-93b0-002248006ea9": //vs-lead
                    BBBD365.Lead.setFormForNrifProgrammes(formContext, isProgrammePopulated);
                    break;
            }

            // DMO changes start
            BBBD365.Lead.filterVehicleTypes(formContext, isProgrammePopulated);
            //DMO changes end

            formContext.getControl("ukn_subassetclass").setDisabled(false);
            subAssetClassCount = BBBD365.Lead.filterSubAssetClassForProgramme(isProgrammePopulated);
        }

        let subProg = formContext.getControl("bbb_investmentsubprogramme")?.getAttribute().getValue();
        if(subProg !== null && subAssetClassCount === 0) {
            BBBD365.Lead.filterSubAssetClass(formContext, "bbb_investmentsubprog", "bbb_investmentsubprogramme", subProg);
        }
        else if(isProgrammePopulated !== null)
            BBBD365.Lead.filterSubAssetClass(formContext, "bbb_investmentprogram", "bbb_investmentprogramme", isProgrammePopulated);

        let subAssetClass = formContext.getAttribute("ukn_subassetclass").getValue();
        if(subAssetClass !== null)
            formContext.getControl("ukn_fundid").setDisabled(false);
        else
            formContext.getControl("ukn_fundid").setDisabled(true);
    },

    onChange_investmentProgramme: function (executionContext) {
        'use strict';
        var formContext = executionContext.getFormContext();

        //investment Programme Change 
        var investmentProgramme = formContext.getControl("header_process_bbb_investmentprogramme").getAttribute().getValue();

        if (investmentProgramme == null) {


            //dmo
            if (formContext.getControl("ukn_vehicletypes")) {
                formContext.getControl("ukn_vehicletypes").setDisabled(true);
                formContext.getControl("ukn_vehicletypes").getAttribute().setValue(null);
            }
            //dmo end

            if (formContext.getControl("header_process_bbb_investmentsubprogramme")) {
                formContext.getControl("header_process_bbb_investmentsubprogramme").setDisabled(true);
                formContext.getControl("header_process_bbb_investmentsubprogramme").getAttribute().setValue(null);
            }

            formContext.getControl("bbb_investmentsubprogramme").setDisabled(true);
            formContext.getControl("bbb_investmentsubprogramme").getAttribute().setValue(null);

            formContext.getControl("ukn_subassetclass").setDisabled(true);
            formContext.getAttribute("ukn_subassetclass").setValue(null);
            formContext.getControl("ukn_fundid").setDisabled(true);
            formContext.getAttribute("ukn_fundid").setValue(null);

            return;
        }
        else {
            if (formContext.getControl("header_process_bbb_investmentsubprogramme")) {
                formContext.getControl("header_process_bbb_investmentsubprogramme").addPreSearch(BBBD365.Lead.filterSubProgrammes);
                formContext.getControl("header_process_bbb_investmentsubprogramme").setDisabled(false);
            }
            //formContext.getControl("bbb_investmentsubprogramme").addPreSearch(BBBD365.Lead.filterSubProgrammes);
            formContext.getControl("bbb_investmentsubprogramme").setDisabled(false);

            //Nrif
            var currentFormId = formContext.ui.formSelector.getCurrentItem().getId();
            switch (currentFormId) {
                case "2f63feef-fb87-ec11-93b0-002248006ea9": //vs-lead
                    BBBD365.Lead.setFormForNrifProgrammes(formContext, investmentProgramme);
                    break;
            }
            // end nrif

            formContext.getControl("ukn_subassetclass").setDisabled(false);
            BBBD365.Lead.filterSubAssetClass(formContext, "bbb_investmentprogram", "bbb_investmentprogramme", investmentProgramme);
        }

        /// DMO changes

        if (investmentProgramme !== null) {
            BBBD365.Lead.filterVehicleTypes(formContext, investmentProgramme);
        }

        // DMO End Changes
    },

    onChange_subProgramme: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let subProg = formContext.getControl("bbb_investmentsubprogramme").getAttribute().getValue();
        let prog = formContext.getControl("bbb_investmentprogramme").getAttribute().getValue();
        let subAssetClassCount = BBBD365.Lead.filterSubAssetClassForProgramme(prog);
        if(subProg !== null && subAssetClassCount === 0)
            BBBD365.Lead.filterSubAssetClass(formContext, "bbb_investmentsubprog", "bbb_investmentsubprogramme", subProg);
        else if (prog !== null)
            BBBD365.Lead.filterSubAssetClass(formContext, "bbb_investmentprogram", "bbb_investmentprogramme", prog);
    },

    filterSubProgrammes: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var investmentprogramme = formContext.getControl("header_process_bbb_investmentprogramme").getAttribute().getValue();
        var subProgrammeFilter = "<filter type='and'><condition attribute='bbb_programmeid' operator='eq' value='" + investmentprogramme[0].id + "'/></filter>";

        formContext.getControl("header_process_bbb_investmentsubprogramme").addCustomFilter(subProgrammeFilter, "bbb_investmentsubprogramme");
        formContext.getControl("bbb_investmentsubprogramme").addCustomFilter(subProgrammeFilter, "bbb_investmentsubprogramme");

        formContext.getControl("header_process_bbb_investmentsubprogramme").setDisabled(false);
        formContext.getControl("header_process_bbb_investmentsubprogramme").getAttribute().setValue(null);

        formContext.getControl("bbb_investmentsubprogramme").setDisabled(false);
        formContext.getControl("bbb_investmentsubprogramme").getAttribute().setValue(null);
    },

    //#region  NRIF_functions

    isNRIFProgramme: function (investmentProgramme) {
        var isNrif = false;
        var southWestInvestmentFund = "{d2b36d45-9c45-ed11-bba2-0022481b5340}";
        var ivestmentFundForScotland = "{48ad931d-9c45-ed11-bba2-0022481b5340}";
        var investmentFundForNorthernIreland = "{33f7280f-9c45-ed11-bba2-0022481b5340}";
        var investmentFundForWales = "{49458429-9c45-ed11-bba2-0022481b5340}";
        var northernPowerhouseInvestmentFundII = "{e51fcf30-9c45-ed11-bba2-0022481b5340}";
        var midlandsEngineInvestmentFundII = "{1723673f-9c45-ed11-bba2-0022481b5340}";

        var programmeId = investmentProgramme[0].id;
        if (programmeId.toLowerCase() === southWestInvestmentFund || programmeId.toLowerCase() === ivestmentFundForScotland || programmeId.toLowerCase() === investmentFundForNorthernIreland || programmeId.toLowerCase() === investmentFundForWales || programmeId.toLowerCase() === northernPowerhouseInvestmentFundII || programmeId.toLowerCase() === midlandsEngineInvestmentFundII) {
            isNrif = true;
        }

        return isNrif;
    },

    setFormForNrifProgrammes: function (formContext, investmentProgramme) {
        var hideNrifBpfAttributes = ["bbb_dealname", "bbb_investmentsubprogramme", "ukn_sector", "ukn_accountlead", "ukn_expectedcompletiondate", "ukn_category"];
        var showNrifBpfAttributes = ["ukn_fundsize", "ukn_fundlocation", "ukn_managercommitment", "ukn_dateofinterestsubmission"];
        var requiredAttributes = ["bbb_dealname", "ukn_sector", "ukn_accountlead"];
        var formAttributes = ["bbb_dealname", "bbb_investmentsubprogramme", "ukn_sector", "ukn_accountlead", "ukn_expectedcompletiondate"]

        if (this.isNRIFProgramme(investmentProgramme)) {

            formContext.getControl('companyname').setLabel('FM Entity');
            var subjectControl = formContext.getControl('subject');
            subjectControl.setLabel('Deal Name');
            subjectControl.setDisabled(true);
            formContext.getAttribute('subject').setValue(investmentProgramme[0].name);

            formContext.getControl('ukn_initialcontactdate').setLabel('RFP Received Date');
            formContext.getControl('ukn_expectedbbbcommitment').setLabel('Sub Fund Amount');

            formContext.getControl('header_process_subject').setLabel('Deal Name');
            formContext.getControl('header_process_ukn_initialcontactdate').setLabel('RFP Received Date');
            formContext.getControl('header_process_ukn_expectedbbbcommitment').setLabel('Sub Fund Amount');

            //hiding section nrif
            formContext.ui.tabs.get("Summary").sections.get("Summary_nrif").setVisible(true);

            this.setRequiedFormAttribtutes(formContext, requiredAttributes, "none");
            this.hideShowFormAttribtutes(formContext, formAttributes, false)
            this.setRequiedBpfAttribtutes(formContext, requiredAttributes, "none");
            this.hideShowBpfAttribtutes(formContext, hideNrifBpfAttributes, false);
            this.hideShowBpfAttribtutes(formContext, showNrifBpfAttributes, true);

        }
        else {
            formContext.getControl('companyname').setLabel('Company');
            var subjectControl = formContext.getControl('subject');
            subjectControl.setLabel('Deal Name');
            subjectControl.setDisabled(false);

            formContext.getControl('ukn_initialcontactdate').setLabel('Initial Contact Date');
            formContext.getControl('ukn_expectedbbbcommitment').setLabel('Expected BBB Commitment');

            formContext.getControl('header_process_subject').setLabel('Deal Name');
            formContext.getControl('header_process_ukn_initialcontactdate').setLabel('Initial Contact Date');
            formContext.getControl('header_process_ukn_expectedbbbcommitment').setLabel('Expected BBB Commitment');

            //unhide Nrif section
            formContext.ui.tabs.get("Summary").sections.get("Summary_nrif").setVisible(false);

            this.hideShowFormAttribtutes(formContext, formAttributes, true)
            this.setRequiedBpfAttribtutes(formContext, requiredAttributes, "required");
            this.setRequiedFormAttribtutes(formContext, requiredAttributes, "required");
            this.hideShowBpfAttribtutes(formContext, hideNrifBpfAttributes, true);
            this.hideShowBpfAttribtutes(formContext, showNrifBpfAttributes, false);
        }
    },

    hideShowFormAttribtutes: function (formContext, attributeNames, visible) {
        for (i = 0; i < attributeNames.length; i++) {
            //First check if the header process first appearance    of the attribute is there
            if (formContext.getControl(attributeNames[i]) !== null) {
                formContext.getControl(attributeNames[i]).setVisible(visible);
            }
        }
    },

    hideShowBpfAttribtutes: function (formContext, attributeNames, visible) {
        for (i = 0; i < attributeNames.length; i++) {
            //First check if the header process first appearance    of the attribute is there
            if (formContext.getControl("header_process_" + attributeNames[i]) !== null) {
                formContext.getControl("header_process_" + attributeNames[i]).setVisible(visible);
            }
        }
    },

    setRequiedBpfAttribtutes: function (formContext, attributeNames, requiredLevel) {
        for (i = 0; i < attributeNames.length; i++) {
            //First check if the header process first appearance    of the attribute is there
            if (formContext.getControl("header_process_" + attributeNames[i]) !== null) {
                formContext.getControl("header_process_" + attributeNames[i]).getAttribute().setRequiredLevel(requiredLevel);
            }

            for (j = 1; j < 10; j++) {
                //Then check if the header process with an index is there, there could be multiple	
                if (formContext.getControl("header_process_" + attributeNames[i] + "_" + j) !== null) {
                    formContext.getControl("header_process_" + attributeNames[i] + "_" + j).getAttribute().setRequiredLevel(requiredLevel);
                }
            }
        }
    },


    setRequiedFormAttribtutes: function (formContext, attributeNames, requiredLevel) {
        for (i = 0; i < attributeNames.length; i++) {
            //First check if the header process first appearance    of the attribute is there
            if (formContext.getControl(attributeNames[i]) !== null) {
                formContext.getControl(attributeNames[i]).getAttribute().setRequiredLevel(requiredLevel);
            }
        }
    },

    //#region  DMO_functions

    filterVehicleTypes: function (formContext, investmentProgramme) {
       let vehicleTypesOptions = formContext.getAttribute("ukn_vehicletypes").getOptions();
        Xrm.WebApi.retrieveRecord(
            "bbb_investmentprogramme",
            investmentProgramme[0].id.replace("{", "").replace("}", "").trim(),
            "?$select=bbb_name, ukn_fundingvehicletype"
        ).then(
            function success(result) {
                if (result) {
                    var selectedOptions = result.ukn_fundingvehicletype;
                    var optionSet = formContext.getControl("ukn_vehicletypes");
                    if (selectedOptions) {
                        let selectedOptionsArray = [];
                        selectedOptionsArray = selectedOptions.split(",");
                        if (formContext.getAttribute("ukn_vehicletypes")) {
                            optionSet.setDisabled(false);
                            optionSet.clearOptions();
                            for (let i of selectedOptionsArray) {
                                for (var j = 0; j < vehicleTypesOptions.length; j++) {
                                    if (parseInt(i) === vehicleTypesOptions[j].value) {
                                        optionSet.addOption(vehicleTypesOptions[j]);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        optionSet.setDisabled(true);
                        optionSet.getAttribute().setValue(null);
                    }
                }
            },
            function (error) {}
        );
    },

    //#endregion DMO_functions

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
            formContext.getControl("bbb_investmentprogramme").addCustomFilter(programmeFilter, "bbb_investmentprogramme");
            if (formContext.getControl("header_process_bbb_investmentprogramme") !== null)
                formContext.getControl("header_process_bbb_investmentprogramme").addCustomFilter(programmeFilter, "bbb_investmentprogramme");
        }
    },

    filterSubAssetClass(formContext, linkName, linkEntityName,  programme){
        let subAssetClassFetchXml = `<fetch mapping="logical"> <entity name="ukn_subassetclass"> <attribute name="ukn_subassetclassid" /> <attribute name="ukn_name" /> <attribute name="createdon" /> <order attribute="ukn_name" descending="false" /> <link-entity name="ukn_subassetclass_${linkName}" from="ukn_subassetclassid" to="ukn_subassetclassid" visible="false" intersect="true"> <link-entity name="${linkEntityName}" from="${linkEntityName}id" to="${linkEntityName}id" alias="ab"> <filter type="and"> <condition attribute="${linkEntityName}id" operator="eq" value="${programme[0].id}" /> </filter> </link-entity> </link-entity> </entity> </fetch>`;
        let subAssetClassViewLayout = `<grid name="ukn_subassetclasses" jump="ukn_name" select="1" icon="1" preview="0"> <row name="ukn_subassetclass" id="ukn_subassetclassid"> <cell name="ukn_name" width="300" /> <cell name="createdon" width="125" /> </row> </grid>`;
        let viewId = "0924f989-7f8d-445f-bbe7-1242073aa67a";
        let viewName = "Filtered Sub Asset Class";
        let entityName = "ukn_subassetclass";
        formContext.getControl("ukn_subassetclass").addCustomView(viewId, entityName, viewName, subAssetClassFetchXml, subAssetClassViewLayout, true);
    },

    filterSubAssetClassForProgramme(programme) {
        let responseList;
        let fetchXml = `<fetch mapping="logical"> <entity name="ukn_subassetclass"> <attribute name="ukn_subassetclassid" /> <attribute name="ukn_name" /> <attribute name="createdon" /> <order attribute="ukn_name" descending="false" /> <link-entity name="ukn_subassetclass_bbb_investmentprogram" from="ukn_subassetclassid" to="ukn_subassetclassid" visible="false" intersect="true"> <link-entity name="bbb_investmentprogramme" from="bbb_investmentprogrammeid" to="bbb_investmentprogrammeid" alias="ab"> <filter type="and"> <condition attribute="bbb_investmentprogrammeid" operator="eq" value="${programme[0].id}" /> </filter> </link-entity> </link-entity> </entity> </fetch>`;
        let encURI = encodeURIComponent(fetchXml);
        let req = new XMLHttpRequest();
        req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + `/api/data/v9.1/ukn_subassetclasses?fetchXml=${encURI}`, false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function() {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    responseList = JSON.parse(this.response);
                } else {}
            }
        };
        req.send();

        return responseList.value.length;
    },

    onChange_subAssetClass: function(executionContext) {
        let formContext = executionContext.getFormContext();
        let subAssetClass = formContext.getAttribute("ukn_subassetclass").getValue();
        if(subAssetClass !== null)
            formContext.getControl("ukn_fundid").setDisabled(false);
        else{
            formContext.getAttribute("ukn_fundid").setValue(null);
            formContext.getControl("ukn_fundid").setDisabled(true);
        }
    },

    iconForDealStage: function(rowData){
        let data = JSON.parse(rowData);
        let dealStage = data.ukn_dealstage_Value;
        let imageName="";
        let toolTip="";
        dealStage = dealStage.substring(dealStage.length-1);
        switch(dealStage){
            case "0":
                imageName = "ukn_greyme";
                toolTip = "Lead is in market engagement stage";
                break;
            case "1":
                imageName = "ukn_orangeeoi";
                toolTip = "Opportunity is in expression of interest stage";
                break; 
            case "2":
                imageName = "ukn_lightgreenfp";
                toolTip = "Opportunity is in formal proposal stage";
                break; 
            case "3":
                imageName = "ukn_mediumgreendd";
                toolTip = "Opportunity is in due diligence stage";
                break;    
            case "4":
                imageName = "ukn_greenexecution";
                toolTip = "Opportunity is in execution stage";
                break;
        }

        let resultArray = [imageName, toolTip];
        return resultArray;
    },

    onLoad_QuickCreate: function(executionContext){
        BBBD365.Lead.setECFProgramme(executionContext.getFormContext());
    },

    setECFProgramme: function(formContext)
    {
        var lookupValue = new Array();
        lookupValue[0] = new Object();
        lookupValue[0].id = "fd831013-b3ca-e711-8108-70106faa2611";
        lookupValue[0].name = "Enterprise Capital Funds";
        lookupValue[0].entityType = "bbb_investmentprogramme";
        formContext.getAttribute("bbb_investmentprogramme").setValue(lookupValue);
        formContext.getAttribute("companyname")?.setRequiredLevel("required");
    },

    hideAccountFieldsForECF: function(formContext){
        formContext.getAttribute("ukn_relationshiplead").setRequiredLevel("required");
        let accountAndContactFieldsToHide = ["address1_line2", "address1_line3", "address1_city", "address1_stateorprovince", "address1_country", "telephone1"];
        accountAndContactFieldsToHide.forEach((field)=>{
            formContext.getControl(field).setVisible(false);
        });
    },

    hideContactFieldForECF : function(formContext){
        formContext.getControl("jobtitle").setVisible(false);
    }
};