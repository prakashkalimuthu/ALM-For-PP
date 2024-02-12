/**
 * Method: getOpportunityFromFacilityOpportunity - Get first facility opportunity where type equals to initial from facility.
 * Method: openCustomPage - Display party role types from opportunity in custom page.
 */

"use strict";
var Facility;
(function (Facility) {
  function getOpportunityFromFacilityOpportunity(formContext) {
    let facilityId = formContext.data.entity.getId();
    Xrm.WebApi.online
      .retrieveMultipleRecords(
        "ukn_facilityopportunity",
        "?$select=ukn_facilityopportunityid,_ukn_opportunity_value&$filter=_ukn_facility_value eq " +
          facilityId +
          " and  ukn_type eq 968200000"
      )
      .then(
        function success(results) {
          //for (var i = 0; i < results.entities.length; i++) {
          var opportunityId = results.entities[0]["_ukn_opportunity_value"];
          openCustomPage(opportunityId);
          //}
        },
        function (error) {
            alert(error);
        }
      );
  }
  Facility.getOpportunityFromFacilityOpportunity =
    getOpportunityFromFacilityOpportunity;
  function openCustomPage(opportunityId) {
    var pageInput = {
      pageType: "custom",
      name: "ukn_partyroletypespage_1fdc5",
      entityName: "opportunity",
      recordId: opportunityId,
    };
    var navigationOptions = {
      target: 2,
      position: 1,
      height: { value: 60, unit: "%" },
      width: { value: 40, unit: "%" },
      title: "Investment Information",
    };
    Xrm.Navigation.navigateTo(pageInput, navigationOptions)
      .then(function () {
      })
      .catch(function (error) {
      });
  }
})(Facility || (Facility = {}));
