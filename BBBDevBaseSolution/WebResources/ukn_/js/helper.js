/**
 * Method: getUserBusinessUnitAndProgramme - Retrieve logged in user business unit.
 * Method: getProgrammeBasedOnBU - Retrieve list of programmes based on business unit .
 */

if ("undefined" == typeof BBBD365) {
  BBBD365 = { __namespace: true };
  ("use strict");
}

BBBD365.Helper = {
  getUserBusinessUnitAndProgramme: function () {
    var programmeList = [];
    var userId = Xrm.Utility.getGlobalContext().userSettings.userId;
    var id = userId.replace(/[{}]/g, "");

    var req = new XMLHttpRequest();
    req.open(
      "GET",
      Xrm.Page.context.getClientUrl() +
        "/api/data/v9.1/systemusers(" +
        id +
        ")?$select=_businessunitid_value",
      false
    );
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("Prefer", 'odata.include-annotations="*"');
    req.onreadystatechange = function () {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          var result = JSON.parse(this.response);
          var businessUnitId = result["_businessunitid_value"];
          programmeList = BBBD365.Helper.getProgrammeBasedOnBU(
            businessUnitId.toUpperCase()
          );
        } else {
          Xrm.Utility.alertDialog(this.statusText);
        }
      }
    };
    req.send();

    return programmeList;

    /* return new Promise(function (resolve, reject) {
            Xrm.WebApi.online.retrieveRecord("systemuser", id, "?$select=_businessunitid_value").then(
                function success(result) {
                    var businessUnitId = result["_businessunitid_value"];
                    investmentProgrammeId = BBBD365.Helper.getProgrammeBasedOnBU(businessUnitId.toUpperCase());
                    resolve(investmentProgrammeId);
                },
                function (error) {
                    Xrm.Utility.alertDialog(error.message);
                    reject(error.message);
                }
            );
        }); */
  },

  getProgrammeBasedOnBU: function (businessUnitId) {
    var programmeList = [];
    switch (businessUnitId) {
      //BBI
      case "EB83900C-E49E-E711-8102-70106FAA1531":
        programmeList.push("b3cd6714-d6d9-e711-810d-70106faa1531");
        programmeList.push("6a486a7b-87df-e711-810a-70106faa2611");
        programmeList.push("a7a6bd1c-d6d9-e711-810d-70106faa1531");
        programmeList.push("ab26c418-8724-ed11-9db2-0022481b1335");
        programmeList.push("9bd7b020-11b8-e811-a970-00224800c719");
        programmeList.push("05c43653-d6d9-e711-810d-70106faa1531");
        break;
      //GWS
      case "67D99800-E49E-E711-8102-70106FAA1531":
        programmeList.push("a95e0075-4db5-ea11-a812-000d3a86d68d");
        programmeList.push("98bcd0ef-4db5-ea11-a812-000d3a86d68d");
        programmeList.push("9ae4724e-b3ca-e711-8108-70106faa2611");
        programmeList.push("5a724b5c-df29-ed11-9db2-0022481b1335");
        programmeList.push("9be4724e-b3ca-e711-8108-70106faa2611");
        programmeList.push("4ee01107-e0b5-e811-8149-70106faa1531");
        programmeList.push("73e82b8c-6834-e911-a986-00224800cf35");
        programmeList.push("be0ff6ca-5289-eb11-a812-0022481a78b3");
        programmeList.push("c960a311-75db-ec11-bb3c-0022481acb13");
        programmeList.push("b3a69511-df29-ed11-9db2-0022481b1335");
        break;
      //BPC
      case "8CDBB22B-E49E-E711-8102-70106FAA1531":
        programmeList.push("6feead31-6834-e911-a986-00224800cf35");
        programmeList.push("b101d994-8724-ed11-9db2-0022481b1335");
        programmeList.push("b5e366a1-8724-ed11-9db2-0022481b1335");
        break;
      //SULCO
      case "2D87900C-E49E-E711-8102-70106FAA1531":
        programmeList.push("5a2a4812-11b8-e811-a970-00224800c719");
        programmeList.push("9f5d7431-4eb5-ea11-a812-000d3a86d68d");
        break;
      //Start Up Loans
      case "BCBACD45-8674-ED11-81AC-0022481B5340":
        programmeList.push("5a2a4812-11b8-e811-a970-00224800c719")
        break;
      //BBLS
      case "37ECE258-8674-ED11-81AC-0022481B5340":
        programmeList.push("9f5d7431-4eb5-ea11-a812-000d3a86d68d");
          break;
      //Venture solutions
      case "1E9DE6F9-E39E-E711-8102-70106FAA1531":
        programmeList.push("d219b3f5-6734-e911-a986-00224800cf35");
        programmeList.push("748241a7-7a24-ed11-9db2-0022481b1335");
        programmeList.push("23634a95-7a24-ed11-9db2-0022481b1335");
        programmeList.push("12fa36e3-7a24-ed11-9db2-0022481b1335");
        programmeList.push("461d4c83-7a24-ed11-9db2-0022481b1335");
        programmeList.push("16a437f5-7a24-ed11-9db2-0022481b1335");
        programmeList.push("fd831013-b3ca-e711-8108-70106faa2611");
        programmeList.push("08746465-7a24-ed11-9db2-0022481b1335");
        programmeList.push("7130b206-a41c-ed11-b83e-0022481b1a43");
        programmeList.push("22e71b98-6834-e911-a986-00224800cf35");
        programmeList.push("e7a231e9-7a24-ed11-9db2-0022481b1335");
        programmeList.push("c2926131-5289-eb11-a812-0022481a78b3");
        programmeList.push("02305977-7a24-ed11-9db2-0022481b1335");
        programmeList.push("8e8118b6-6834-e911-a986-00224800cf35");
        programmeList.push("a51217bc-6834-e911-a986-00224800cf35");
        programmeList.push("11740ec2-6834-e911-a986-00224800cf35");
        programmeList.push("d2b36d45-9c45-ed11-bba2-0022481b5340");
        programmeList.push("1723673f-9c45-ed11-bba2-0022481b5340");
        programmeList.push("e51fcf30-9c45-ed11-bba2-0022481b5340");
        programmeList.push("49458429-9c45-ed11-bba2-0022481b5340");
        programmeList.push("48ad931d-9c45-ed11-bba2-0022481b5340");
        programmeList.push("33f7280f-9c45-ed11-bba2-0022481b5340");
        break;
      //Regional funds
      case "FEAAAE25-E49E-E711-8102-70106FAA1531":
        programmeList.push("8e8118b6-6834-e911-a986-00224800cf35");
        programmeList.push("a51217bc-6834-e911-a986-00224800cf35");
        programmeList.push("11740ec2-6834-e911-a986-00224800cf35");
        programmeList.push("22e71b98-6834-e911-a986-00224800cf35");
        break;
      //Legacy (Legacy Schemes)
      case "2168B61F-E49E-E711-8102-70106FAA1531":
        programmeList.push("d219b3f5-6734-e911-a986-00224800cf35");
        programmeList.push("23634a95-7a24-ed11-9db2-0022481b1335");
        programmeList.push("461d4c83-7a24-ed11-9db2-0022481b1335");
        programmeList.push("08746465-7a24-ed11-9db2-0022481b1335");
        programmeList.push("02305977-7a24-ed11-9db2-0022481b1335");
        break;
      //Direct (NSSIF renamed)
      case "3EDBF7A5-AB8A-EB11-B1AC-0022481A6105":
        programmeList.push("748241a7-7a24-ed11-9db2-0022481b1335");
        programmeList.push("12fa36e3-7a24-ed11-9db2-0022481b1335");
        programmeList.push("16a437f5-7a24-ed11-9db2-0022481b1335");
        programmeList.push("e7a231e9-7a24-ed11-9db2-0022481b1335");
        programmeList.push("c2926131-5289-eb11-a812-0022481a78b3");
        break;
      //ECF
      case "99FD02E7-87D8-E911-A813-000D3A86D581":
        programmeList.push("fd831013-b3ca-e711-8108-70106faa2611");
        break;
      //Future Fund
      case "DCC97762-071E-ED11-B83E-0022481B1A43":
        programmeList.push("7130b206-a41c-ed11-b83e-0022481b1a43");
        break;
        //Nations and Regions Investment Fund
      case "007F76E9-9B45-ED11-BBA2-0022481B5340":
        programmeList.push("d2b36d45-9c45-ed11-bba2-0022481b5340");
        programmeList.push("1723673f-9c45-ed11-bba2-0022481b5340");
        programmeList.push("e51fcf30-9c45-ed11-bba2-0022481b5340");
        programmeList.push("49458429-9c45-ed11-bba2-0022481b5340");
        programmeList.push("48ad931d-9c45-ed11-bba2-0022481b5340");
        programmeList.push("33f7280f-9c45-ed11-bba2-0022481b5340");
        break;
      default:
        break;
    }

    return programmeList;
  },
};