//===========================================================//
// Uses: Investment Sub-Programme, Sub Programme Type field lock, un-lock, look=up dat filter based on Type or sub-type.
//
// Description: 
// 1.   Method: onLoad_investmentProgramme - set programme, subprogramme, subprogramme type field disabled if stateCode = 3. 
//		Form Tabs and fields hide show based on IS This a TopUp? field if Originating Lead is not present (Deal starts from Opportunity)
// 2.	Method: Internal - onChange_OfBPFStage - to handle hide Topup tab when BPF is moved to next stage since OnLoad method is not getting invoked 	
// 3.   Mathod: onChange_investmentProgramme - set subprogramme, subprogramme type field disabled if p[rogramme not selected, set subprogrammetype disabed if progrmme selected
// 4.   Method: Internal - filterSubProgrammes - apply custom filter on SubProgramme based on programme selected 
// 5.   Method: Internal - callHelper - Call helper class method to get BU wise Programmes
// 6.	Method: onChange_ICApprovalOrIsThisTopup - To Hide show tabs, sections, BPF Fields based on Is this TopUp Yes/No & || IC Board Approval Yes/No 
// 7.   Method: Internal - toggleTabDisplayState - Generic - To Hide show tabs
// 8.   Method: Internal - toggleSectionDisplayState - Generic - To Hide show section
// 9.   Method: Internal - toggleBPFFieldsDisplayState - Generic - To Hide show and make mandatory or non-mandatory BPF Fields
// 10.  Method: Internal - isNRIFProgramme - check if selected Investment Programme is Nrif or not
// 11.  Method: Internal - setFormForNrifProgrammes - helper method to  set form fields for Nrif programme
// 12.  Method: Internal - hidePartyRoleTypeTab - Hide Party Role Type tab if it is topup
// 13.  Method: Internal - filterVehicleTypes   - helper method to filter Vehicle types options on selection of investment Programme
// 14.  Method: Internal - filterSubAssetClass -  filter sub asset class based on custom view
// 15.  Method: Internal - filterSubAssetClassForProgramme - filter sub asset class using fetch XML for programme
// 16.  Method: onChange_subAssetClass - enable or disable fund based on sub asset class
// 17.  Method: onChange_subProgramme - filter sub asset class based on programme or sub - programme
// 18.  Method: Internal - iconForDealStage - Display icon for deal stage

//===========================================================// 

if ("undefined" == typeof (BBBD365)) {
    BBBD365 = { __namespace: true };
    'use strict';
}

BBBD365.Opportunity =
{
    onLoad_investmentProgramme: function (executionContext) {
        var formContext = executionContext.getFormContext();
        let subAssetClassCount = 0;

        // Nrif change start
        var currentFormId = formContext.ui.formSelector.getCurrentItem().getId();
        switch (currentFormId) {
            case "e92a2f4e-fc87-ec11-93b0-002248006601": // Venture solutions
                if (this.isNRIFProgramme(formContext)) {
                    this.setFormForNrifProgrammes(formContext, true);
                }
                else {
                    this.setFormForNrifProgrammes(formContext, false);
                }
                break;
            }
        //end of code NRIF

        var isProgrammePopulated = formContext.getControl("bbb_investmentprogramme").getAttribute().getValue();
        formContext.getControl("bbb_investmentprogramme").addPreSearch(BBBD365.Opportunity.callHelper);
        if (formContext.getControl("header_process_bbb_investmentprogramme") !== null)
            formContext.getControl("header_process_bbb_investmentprogramme").addPreSearch(BBBD365.Opportunity.callHelper);
        if (isProgrammePopulated == null) {
            //DMO 
            formContext.getControl("ukn_fundingvehicletype").setDisabled(true);
            formContext.getControl("ukn_fundingvehicletype").getAttribute().setValue(null);
            //DMO end

            formContext.getControl("bbb_investmentsubprogramme").setDisabled(true);
            formContext.getControl("ukn_subassetclass").setDisabled(true);
        }
        else {
            // DMO changes start
            BBBD365.Opportunity.filterVehicleTypes(formContext, isProgrammePopulated);
            //DMO changes end

            formContext.getControl("ukn_subassetclass").setDisabled(false);
            subAssetClassCount = BBBD365.Opportunity.filterSubAssetClassForProgramme(isProgrammePopulated);
        }

        //Form Tabs and fields hide show based on IS This a TopUp? field if Originating Lead is not present (Deal starts from Opportunity)
        if (formContext.getAttribute("originatingleadid").getValue() !== null) {
            formContext.ui.tabs.get("Summary").sections.get("Summary_topup").setVisible(false); //Summary_topup	
        }
        else {
            BBBD365.Opportunity.onChange_ICApprovalOrIsThisTopup(executionContext);
        }

        formContext.data.process.addOnPreStageChange(BBBD365.Opportunity.onChange_OfBPFStage);

        BBBD365.Opportunity.hidePartyRoleTypeTab(formContext, formContext.getAttribute("ukn_topupexistingfacility").getValue());

        let subProg = formContext.getControl("bbb_investmentsubprogramme").getAttribute().getValue();
        if(subProg !== null && subAssetClassCount === 0) {
            BBBD365.Opportunity.filterSubAssetClass(formContext, "bbb_investmentsubprog", "bbb_investmentsubprogramme", subProg);
        }
        else if(isProgrammePopulated !== null)
            BBBD365.Opportunity.filterSubAssetClass(formContext, "bbb_investmentprogram", "bbb_investmentprogramme", isProgrammePopulated);

        let subAssetClass = formContext.getAttribute("ukn_subassetclass").getValue();
        if(subAssetClass !== null)
            formContext.getControl("ukn_fundid").setDisabled(false);
        else
            formContext.getControl("ukn_fundid").setDisabled(true);
    },

    onChange_OfBPFStage: function (ex) {
        'use strict';
        var formContext = ex.getFormContext();
        var bpfArgs = ex.getEventArgs();

        if (bpfArgs.getDirection() === "Next") {
            if (formContext.getAttribute("originatingleadid").getValue() !== null) {
                formContext.ui.tabs.get("Summary").sections.get("Summary_topup").setVisible(false); //Summary_topup	
            }
        }
    },

    onChange_investmentProgramme: function (executionContext) {
        'use strict';
        var formContext = executionContext.getFormContext();

        //investment Programme Change 
        var investmentProgramme = formContext.getControl("bbb_investmentprogramme").getAttribute().getValue();

        if (investmentProgramme == null) {
            //dmo
            if (formContext.getControl("ukn_fundingvehicletype")) {
                formContext.getControl("ukn_fundingvehicletype").setDisabled(true);
                formContext.getControl("ukn_fundingvehicletype").getAttribute().setValue(null);
            }
            //dmo end

            formContext.getControl("bbb_investmentsubprogramme").setDisabled(true);
            formContext.getControl("bbb_investmentsubprogramme").getAttribute().setValue(null);

            formContext.getControl("ukn_subassetclass").setDisabled(true);
            formContext.getAttribute("ukn_subassetclass").setValue(null);
            formContext.getControl("ukn_fundid").setDisabled(true);
            formContext.getAttribute("ukn_fundid").setValue(null);

            return;
        }
        else {
            //formContext.getControl("bbb_investmentsubprogramme").addPreSearch(BBBD365.Opportunity.filterSubProgrammes);
            formContext.getControl("bbb_investmentsubprogramme").setDisabled(false);

            // DMO changes start
            BBBD365.Opportunity.filterVehicleTypes(formContext, investmentProgramme);
            //DMO changes end

            formContext.getControl("ukn_subassetclass").setDisabled(false);
            BBBD365.Opportunity.filterSubAssetClass(formContext, "bbb_investmentprogram", "bbb_investmentprogramme", investmentProgramme);
        }
    },

    onChange_DDQIssuedDate: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var ddiChange = formContext.getAttribute("ukn_ddqsentdate").getValue();
        if (ddiChange != null) {
            formContext.getAttribute("bbb_completionexpected").setValue(new Date(ddiChange.setDate(ddiChange.getDate() + 2 * 7)));
        }
        else {
            formContext.getAttribute("bbb_completionexpected").setValue(null);
        }
    },

    onChange_OfferLetterIssuedDate: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var offerletterissueddate = formContext.getAttribute("ukn_offerlettersentdate").getValue();
        if (offerletterissueddate != null) {
            formContext.getAttribute("ukn_offerletterdeadline").setValue(new Date(offerletterissueddate.setDate(offerletterissueddate.getDate() + 4 * 7)));
        }
        else {
            formContext.getAttribute("ukn_offerletterdeadline").setValue(null);
        }
    },


    onChange_subProgramme: function (executionContext) {
        var formContext = executionContext.getFormContext();
        let subProg = formContext.getControl("bbb_investmentsubprogramme").getAttribute().getValue();
        let prog = formContext.getControl("bbb_investmentprogramme").getAttribute().getValue();
        let subAssetClassCount = BBBD365.Opportunity.filterSubAssetClassForProgramme(prog);
        if(subProg !== null && subAssetClassCount === 0)
            BBBD365.Opportunity.filterSubAssetClass(formContext, "bbb_investmentsubprog", "bbb_investmentsubprogramme", subProg);
        else if (prog !== null)
            BBBD365.Opportunity.filterSubAssetClass(formContext, "bbb_investmentprogram", "bbb_investmentprogramme", prog);
    },

    filterSubProgrammes: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var investmentprogramme = formContext.getControl("bbb_investmentprogramme").getAttribute().getValue();
        var subProgrammeFilter = "<filter type='and'><condition attribute='bbb_programmeid' operator='eq' value='" + investmentprogramme[0].id + "'/></filter>";

        formContext.getControl("bbb_investmentsubprogramme").addCustomFilter(subProgrammeFilter, "bbb_investmentsubprogramme");

        formContext.getControl("bbb_investmentsubprogramme").setDisabled(false);
        formContext.getControl("bbb_investmentsubprogramme").getAttribute().setValue(null);
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
            formContext.getControl("bbb_investmentprogramme").addCustomFilter(programmeFilter, "bbb_investmentprogramme");
            if (formContext.getControl("header_process_bbb_investmentprogramme") !== null)
                formContext.getControl("header_process_bbb_investmentprogramme").addCustomFilter(programmeFilter, "bbb_investmentprogramme");
        }
    },

    onChange_ICApprovalOrIsThisTopup: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var originatingLead = formContext.getAttribute("originatingleadid").getValue();

        if (originatingLead != null) {
            return;
        }

        var tabsToHideShow = [];
        var sectonsToHideShow = [];
        var topUpYesBpfStageFieldsToHide = [];
        var currentFormId = formContext.ui.formSelector.getCurrentItem().getId();
        var isThisTopup = formContext.getAttribute("ukn_topupexistingfacility").getValue();
        var iCApprovalStatus = formContext.getAttribute("ukn_icboardapprovalrequiredyesno").getValue();
        var iCApprovalCheckConsider = false;
        var tabAndFieldHideShow = true;
        var fieldRequired = "required";

        var topUpYesBpfStageFieldToShow = [];
        var topUpYesBpfStageFieldShowFlag = false;
        var topUpYesBpfStageFieldShowRequired = "none";

        switch (currentFormId) {
            case "ee822630-7e90-ea11-a811-0022480076d0": //BBI
                tabsToHideShow = ["tab_investmentcommittee", "tab_7"];
                sectonsToHideShow = ["Summary_proposal", "Summary_section_dd", "tab_3_section_1", "Social_pane"];
                topUpYesBpfStageFieldsToHide = ["ukn_formalproposalreceiveddate", "ukn_expectedicboardapprovaldate", "ukn_sltmeetingdiscussion", "ukn_proposalreviewed", "ukn_applicantmeetingheldtodiscussfp", "ukn_movetoddpapercompleted", "ukn_iircirculatedtobbiteamdate", "ukn_proposalragrated", "ukn_bbiteamiirdiscussiondate", "ukn_mddecisionmade", "ukn_mddecisiondate"];
                topUpYesBpfStageFieldToShow = ["ukn_bpffinished"]; //when other fields are hidden
                iCApprovalCheckConsider = true;

                //IC Board Approval - 968200000 - Yes
                if (iCApprovalStatus !== null || iCApprovalStatus !== "") {
                    if (iCApprovalStatus === 968200001) {
                        fieldRequired = "none";
                    }
                }
                break;

            case "370cd7be-5bc4-4195-92ae-978acb3b93e8": //BPC
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_5", "Summary_section_dd", "tab_3_section_1", "Social_pane"];
                topUpYesBpfStageFieldsToHide = ["bbb_eoireceived", "ukn_targetfundsize", "ukn_wipdiscussion", "ukn_funddomicile", "ukn_receivedcompletedquestionnaire", "ukn_datequestionnairereceived"];
                iCApprovalCheckConsider = true;
                break;

            case "69734599-be96-4661-8275-a9b135bbfc31": //Direct (No bpf)
                tabsToHideShow = ["tab_investmentcommittee", "tab_7"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                break;

            case "52c97bd9-a2ac-ea11-a812-0022480076d0": //ECF
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                topUpYesBpfStageFieldsToHide = ["bbb_eoireceived", "ukn_initialmeetingdate", "ukn_sightingpaperattached", "ukn_feedbackprovided"];
                topUpYesBpfStageFieldToShow = ["ukn_bpffinished"]; //when other fields are hidden
                break;

            case "c6802b10-b366-4f50-9bc9-2fa0dba1099d": //Legacy Schemes (No bpf)
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                break;

            case "31745649-844e-4173-a9a8-4f3cc1d1bbc8": //NSSIF 
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                topUpYesBpfStageFieldsToHide = ["ukn_initialmeetingdate", "ukn_investmentsummarynote", "bbb_completionexpected", "ukn_btiinitialapproval", "ukn_btiboardapprovaldate", "ukn_handoverbriefingnotecompleted", "ukn_expressionofinterestnotes"];
                topUpYesBpfStageFieldToShow = ["ukn_bpffinished"]; //when other fields are hidden
                break;

            case "5190f0dc-f7a1-47fa-bb7c-87b33a2f2dcc": //GWS 
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                topUpYesBpfStageFieldsToHide = ["bbb_eoireceived", "ukn_initialmeetingdate", "bbb_fprepquested"];
                topUpYesBpfStageFieldToShow = []; //Removing ukn_bpffinished from the list as it moved to different BPF stage
                break;

            case "1119d901-15ac-4aaf-b490-e96adca1f2bf": //Regional Funds 
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                //topUpYesBpfStageFieldsToHide    = ["ukn_initialmeetingdate", "ukn_investmentsummarynote", "bbb_completionexpected", "ukn_btiinitialapproval", "ukn_btiboardapprovaldate", "ukn_handoverbriefingnotecompleted", "ukn_expressionofinterestnotes"];
                break;

            case "e92a2f4e-fc87-ec11-93b0-002248006601": //Venture Solutions 
                tabsToHideShow = ["tab_investmentcommittee"];
                sectonsToHideShow = ["Summary_section_4", "Summary_section_dd", "Summary_section_5", "tab_3_section_1", "Social_pane"];
                topUpYesBpfStageFieldsToHide = ["bbb_eoireceived", "ukn_intromeetingdate", "ukn_sightingpaperattached", "ukn_feedbackprovided", "bbb_investmentprogramme", "ukn_investmentsummarynote", "bbb_completionexpected", "ukn_btiinitialapproval", "ukn_btiboardapprovaldate", "ukn_handoverbriefingnotecompleted"];
                topUpYesBpfStageFieldToShow = []; //Removing ukn_bpffinished from the list as it moved to different BPF stage
                break;
            //default:
            // code block
        }

        //IC - 968,200,000 = No, Topup - 968200000 = Yes 
        if ((isThisTopup === 968200000 && iCApprovalCheckConsider === true && (iCApprovalStatus === null || iCApprovalStatus === "")) || (isThisTopup === 968200000 && iCApprovalCheckConsider === true && iCApprovalStatus === 968200000) || (isThisTopup === 968200000 && iCApprovalCheckConsider === false)) {
            tabAndFieldHideShow = false;
            fieldRequired = "none";

            //for showing field in BPF
            topUpYesBpfStageFieldShowFlag = true;
            topUpYesBpfStageFieldShowRequired = "required";
        }

        BBBD365.Opportunity.toggleTabDisplayState(formContext, tabsToHideShow, tabAndFieldHideShow);
        BBBD365.Opportunity.toggleSectionDisplayState(formContext, "Summary", sectonsToHideShow, tabAndFieldHideShow);

        if (topUpYesBpfStageFieldsToHide.length > 0) {
            BBBD365.Opportunity.toggleBPFFieldsDisplayState(formContext, topUpYesBpfStageFieldsToHide, "header_process_", tabAndFieldHideShow, fieldRequired); //for BPF fields
        }

        if (topUpYesBpfStageFieldToShow.length > 0) {
            BBBD365.Opportunity.toggleBPFFieldsDisplayState(formContext, topUpYesBpfStageFieldToShow, "header_process_", topUpYesBpfStageFieldShowFlag, topUpYesBpfStageFieldShowRequired); //for BPF fields
        }

        BBBD365.Opportunity.hidePartyRoleTypeTab(formContext, isThisTopup);
    },

    toggleTabDisplayState: function (formContext, tabsToHideShow, hideShow) {
        //Hide or Show Tabs 
        for (var iterator in tabsToHideShow) {
            formContext.ui.tabs.get(tabsToHideShow[iterator]).setVisible(hideShow);
        }
    },

    toggleSectionDisplayState: function (formContext, tabName, sectionsToHideShow, hideShow) {
        var tabInForm = formContext.ui.tabs.get(tabName);

        //Hide or Show Sections 
        for (var iterator in sectionsToHideShow) {
            tabInForm.sections.get(sectionsToHideShow[iterator]).setVisible(hideShow);
        }
    },

    toggleBPFFieldsDisplayState: function (formContext, bpfStageFields, ifBPFFields, hideShow, requiredLevel) {
        let isThisTopUp = formContext.getAttribute("ukn_topupexistingfacility").getValue();
        let icBoardApprovalRequired = formContext.getAttribute("ukn_icboardapprovalrequiredyesno")?.getValue();

        //BPF Fields Hide or Show & Make Fields Mandatory or Non-mandatory 
        for (var iterator in bpfStageFields) {
            if ((formContext.getControl(ifBPFFields + bpfStageFields[iterator]) !== null && formContext.getControl(ifBPFFields + bpfStageFields[iterator]) !== undefined)) {
                formContext.getControl(ifBPFFields + bpfStageFields[iterator]).getAttribute().setRequiredLevel(requiredLevel);
                formContext.getControl(ifBPFFields + bpfStageFields[iterator]).setVisible(hideShow);
                //CRMD-728: BBI Opportunity set all the fields in proposal section to non-mandatory
                if (formContext.ui.tabs.get("Summary").sections.get("Summary_proposal")?.controls.get(bpfStageFields[iterator]) !== null && formContext.ui.formSelector.getCurrentItem().getId() === "ee822630-7e90-ea11-a811-0022480076d0"
                    && (isThisTopUp === 968200001 || (isThisTopUp === 968200000 && icBoardApprovalRequired !== null && icBoardApprovalRequired === 968200001)))
                    formContext.getAttribute(bpfStageFields[iterator]).setRequiredLevel("none");
            }
        }
    },

    //#region NRIF_functions
    isNRIFProgramme: function (formContext) {
        var isNrif = false;
        var programee = formContext.getAttribute("bbb_investmentprogramme").getValue();
        var programeeList = ["d2b36d45-9c45-ed11-bba2-0022481b5340", "1723673f-9c45-ed11-bba2-0022481b5340", "e51fcf30-9c45-ed11-bba2-0022481b5340", "49458429-9c45-ed11-bba2-0022481b5340", "48ad931d-9c45-ed11-bba2-0022481b5340", "33f7280f-9c45-ed11-bba2-0022481b5340"];
        if (programee != null && programee.length > 0 && programee[0].id != "" && programeeList.indexOf(programee[0].id.toLowerCase().replace("{", "").replace("}", "")) != -1) {

            isNrif = true;
        }

        return isNrif;
    },

    setFormForNrifProgrammes: function (formContext, isNrif) {
        if (isNrif) {
            formContext.ui.tabs.get("Summary").setVisible(false);
            formContext.ui.tabs.get("summary_nrif").setVisible(true);
        }
        else {
            formContext.ui.tabs.get("Summary").setVisible(true);
            formContext.ui.tabs.get("summary_nrif").setVisible(false);
        }
    },
    //#endregion NRIF_functions

    //#region  DMO_functions
    filterVehicleTypes: function (formContext, investmentProgramme) {
        let vehicleTypesOptions = formContext.getAttribute("ukn_fundingvehicletype").getOptions();
        Xrm.WebApi.retrieveRecord(
            "bbb_investmentprogramme",
            investmentProgramme[0].id.replace("{", "").replace("}", "").trim(),
            "?$select=bbb_name, ukn_fundingvehicletype"
        ).then(
            function success(result) {
                if (result) {
                    var selectedOptions = result.ukn_fundingvehicletype;
                    var optionSet = formContext.getControl("ukn_fundingvehicletype");
                    if (selectedOptions) {
                        let selectedOptionsArray = [];
                        selectedOptionsArray = selectedOptions.split(",");
                        if (formContext.getAttribute("ukn_fundingvehicletype")) {
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
                        formContext.getAttribute("ukn_fundingvehicletype").controls.forEach(c=> {c.setDisabled(true); c.getAttribute().setValue(null)});
                    }
                }
            },
            function (error) {}
        );
    },
    //#endregion DMO_functions

    hidePartyRoleTypeTab: function (formContext, isThisTopup) {
        if (isThisTopup === 968200000)
            formContext.ui.tabs.get("tab_partyroletype").setVisible(false);
        else
            formContext.ui.tabs.get("tab_partyroletype").setVisible(true);
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
    }
};